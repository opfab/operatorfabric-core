/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import { Component, OnDestroy, TemplateRef, ElementRef, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AppState } from '@ofStore/index';
import { CardService } from '@ofServices/card.service';
import { UserService } from '@ofServices/user.service';
import { Card, CardData,fromCardToCardForPublishing, TimeSpan} from '@ofModel/card.model';
import { I18n } from '@ofModel/i18n.model';
import {  Subject } from 'rxjs';
import { Process } from '@ofModel/processes.model';
import { TimeService } from '@ofServices/time.service';
import { Severity } from '@ofModel/light-card.model';
import { Guid } from 'guid-typescript';
import { NgbModal, NgbModalOptions} from '@ng-bootstrap/ng-bootstrap';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap/modal/modal-ref';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { UserWithPerimeters, RightsEnum, ComputedPerimeter } from '@ofModel/userWithPerimeters.model';
import { EntitiesService } from '@ofServices/entities.service';
import { transformToTimestamp } from '../archives/components/archive-filters/archive-filters.component';
import { ProcessesService } from '@ofServices/processes.service';
import { ActivatedRoute} from '@angular/router';
import { getDateTimeNgbFromMoment } from '@ofModel/datetime-ngb.model';
import * as moment from 'moment-timezone';
import { HandlebarsService } from '../cards/services/handlebars.service';
import { DetailContext } from '@ofModel/detail-context.model';
import { map } from 'rxjs/operators';

declare const templateGateway: any;

class Message {
    text: string;
    display: boolean;
}


@Component({
    selector: 'of-usercard',
    templateUrl: './usercard.component.html',
    styleUrls: ['./usercard.component.scss']
})
export class UserCardComponent implements OnDestroy, OnInit {

    messageForm: FormGroup;
    recipientForm: FormGroup;
    messageAfterSendingCard: string;


    processesDefinition: Process[];
    currentUserWithPerimeters: UserWithPerimeters;

    severityOptions = Object.keys(Severity).map(severity => {
        return {
            value: severity,
            label: new I18n('userCard.options.severity.' + severity)
        };
    });

    stateOptions: any[];
    recipientsOptions = new Array();
    selectedRecipients = [];
    dropdownSettings = {};
    processOptions = new Array();

    selectedProcess: Process;
    selectedState: string;
    statesPerProcesses = new Map();
    userCardTemplate: SafeHtml;
    editCardMode = false;
    cardToEdit: CardData;

    public card: Card;

    readonly defaultStartDate = new Date().valueOf() + 60000;
    readonly defaultEndDate = new Date().valueOf() + 60000 * 60;

    unsubscribe$: Subject<void> = new Subject<void>();


    public displaySendResult = false;
    errorMessage: Message = { display: false, text: undefined };

    modalRef: NgbModalRef;

    displayForm() {
        return !this.displaySendResult;
    }

    constructor(private store: Store<AppState>,
        private cardService: CardService,
        private userService: UserService,
        private timeService: TimeService,
        private entitiesService: EntitiesService,
        private modalService: NgbModal,
        private sanitizer: DomSanitizer,
        private element: ElementRef,
        private processesService: ProcessesService,
        private route: ActivatedRoute,
        private handlebars: HandlebarsService
    ) {
    }

    ngOnInit() {

        this.currentUserWithPerimeters = this.userService.getCurrentUserWithPerimeters();
        this.loadAllEntities();
        this.loadAllProcessAndStateInUserPerimeter();

        this.messageForm = new FormGroup({
            severity: new FormControl(''),
            process: new FormControl(''),
            state: new FormControl(''),
            startDate: new FormControl(''),
            endDate: new FormControl(''),
            comment: new FormControl('')
        });

        this.recipientForm = new FormGroup({
            recipients: new FormControl([])
        });


        this.changeSeverityToDefaultValue();
        this.changeStatesWhenSelectProcess();
        this.loadTemplateWhenStateChange();

        this.dropdownSettings = {
            text: 'Select a recipîent',
            selectAllText: 'Select All',
            unSelectAllText: 'UnSelect All',
            enableSearchFilter: true,
            classes: 'custom-class-example'
        };
        this.loadCardForEdition();
    }



    loadCardForEdition() {
        this.route.paramMap.subscribe(
            paramMap => {
                const cardId = paramMap.get('cardId');
                if (!!cardId) {
                    this.editCardMode = true;
                    this.cardService.loadCard(cardId).subscribe(card => {
                        this.cardToEdit = card;
                        this.messageForm.get('severity').setValue(this.cardToEdit.card.severity);
                        this.messageForm.get('process').setValue(this.cardToEdit.card.process);
                        this.messageForm.get('state').setValue(this.cardToEdit.card.state);
                        this.messageForm.get('startDate').setValue(getDateTimeNgbFromMoment(moment(this.cardToEdit.card.startDate)));
                        this.messageForm.get('endDate').setValue(getDateTimeNgbFromMoment(moment(this.cardToEdit.card.endDate)));
                        this.selectedRecipients = this.cardToEdit.card.entityRecipients;
                    });
                }
            }
        );
    }



    loadAllEntities(): void {
        this.entitiesService.getEntities().forEach(entity =>
            this.recipientsOptions.push({ id: entity.id, itemName: entity.name }));
    }


    loadAllProcessAndStateInUserPerimeter(): void {
        this.processesDefinition = this.processesService.getAllProcesses();
        const processesInPerimeter: Set<string> = new Set();
        this.currentUserWithPerimeters.computedPerimeters.forEach(perimeter => {
                    if (this.userCanSendCard(perimeter)) processesInPerimeter.add(perimeter.process);
                });

        this.processesDefinition.forEach(process => {
                    if (processesInPerimeter.has(process.id)) {
                        const _i18nPrefix = process.id + '.' + process.version + '.';
                        const label = process.name ? (_i18nPrefix + process.name) : process.id;
                        const processToShow = { value: process.id, label: label };
                        this.processOptions.push(processToShow);
                        this.loadStatesForProcess(process);
                    }
                });
    }


    private userCanSendCard(perimeter: ComputedPerimeter): boolean {
        return ((perimeter.rights === RightsEnum.ReceiveAndWrite)
            || (perimeter.rights === RightsEnum.Write));
    }

    loadStatesForProcess(process: Process): void {
        const statesList = [];
        this.currentUserWithPerimeters.computedPerimeters.forEach(
            perimeter => {
                if ((perimeter.process === process.id) && this.userCanSendCard(perimeter)) {
                    const state = process.states[perimeter.state];
                    if (!!state) {
                        const label = !!state.name ? (new I18n(this.getI18nPrefixFromProcess(process)
                            + state.name)) : perimeter.state;
                        const stateEntry = { value: perimeter.state, label: label };
                        statesList.push(stateEntry);
                    } else console.log('WARNING : state', perimeter.state , 'is present in perimeter for process'
                                    , process.id , 'but not in process definition');

                }
            });
        this.statesPerProcesses.set(process.id, statesList);
    }


    changeSeverityToDefaultValue(): void {
        this.messageForm.get('severity').valueChanges.subscribe((severity) => {
            if (!severity) this.messageForm.get('severity').setValue(this.severityOptions[0].value);
        });
        this.messageForm.get('severity').setValue(this.severityOptions[0].value);

    }

    changeStatesWhenSelectProcess(): void {
        this.messageForm.get('process').valueChanges.subscribe((process) => {
            if (!!process) {
                this.stateOptions = this.statesPerProcesses.get(process);
                this.selectedState = this.stateOptions[0].value;
                this.selectedProcess = this.processesDefinition.find(processDefinition => {
                    return processDefinition.id === process;
                });
                this.messageForm.get('state').setValue(this.selectedState);
            }
        });
    }

    loadTemplateWhenStateChange(): void {
        this.messageForm.get('state').valueChanges.subscribe((state) => {
            if (!!state) {
                this.selectedState = state;
                this.loadTemplate();
            }
        });
    }

    loadTemplate() {
        this.errorMessage.display = false;
        let card;
        if  (!!this.cardToEdit) card = this.cardToEdit.card ;
        const templateName = this.selectedProcess.states[this.selectedState].userCardTemplate;
        if (!!templateName) {
            this.handlebars.queryTemplate(this.selectedProcess.id, this.selectedProcess.version, templateName)
                .pipe(map(t => t(new DetailContext(card, null, null)))).subscribe((template) => {
                    this.userCardTemplate = this.sanitizer.bypassSecurityTrustHtml(template);
                    setTimeout(() => { // wait for DOM rendering
                        this.reinsertScripts();
                    }, 10);
                }, (error) =>  {
                    console.log('WARNING impossible to load template ', templateName , ', error = ' , error);
                    this.userCardTemplate = this.sanitizer.bypassSecurityTrustHtml('');
                }
                );
        } else this.userCardTemplate = this.sanitizer.bypassSecurityTrustHtml('');

    }

    reinsertScripts(): void {
        const scripts = <HTMLScriptElement[]>this.element.nativeElement.getElementsByTagName('script');
        Array.prototype.forEach.call(scripts, script => {   //scripts.foreach does not work ... 
            const scriptCopy = document.createElement('script');
            scriptCopy.type = script.type ? script.type : 'text/javascript';
            if (!!script.innerHTML) {
                scriptCopy.innerHTML = script.innerHTML;
            }
            scriptCopy.async = false;
            script.parentNode.replaceChild(scriptCopy, script);

        });
    }


    onSubmitForm(template: TemplateRef<any>) {
        const formValue = this.messageForm.value;

        const selectedProcess = this.processesDefinition.find(process => {
            return process.id === formValue['process'];
        });
        const processVersion = selectedProcess.version;
        const state = formValue['state'];

        if (!templateGateway.getSpecificCardInformation) {
            console.log('No getSpecificCardInformationMethod() in template can not send card');
            this.errorMessage.display = true;
            this.errorMessage.text = 'userCard.error.templateError';
            return;
        }

        const specificInformation = templateGateway.getSpecificCardInformation();
        if (!specificInformation) {
            console.log('getSpecificCardInformationMethod() in template return no information');
            this.errorMessage.display = true;
            this.errorMessage.text = 'userCard.error.templateError';
            return;
        }

        if (!specificInformation.valid) {
            this.errorMessage.display = true;
            this.errorMessage.text = specificInformation.errorMsg;
            return;
        }

        const selectedRecipients = this.recipientForm.value['recipients'];
        const recipients = new Array();
        if (selectedRecipients.length < 1) {
            this.errorMessage.display = true;
            this.errorMessage.text = 'userCard.error.noRecipientSelected';
            return;
        } else selectedRecipients.forEach(entity => recipients.push(entity.id));


        const entitiesAllowedToRespond = [];
        if (selectedProcess.states[state].response) {
                recipients.forEach(entity => {
                    if (!this.currentUserWithPerimeters.userData.entities.includes(entity)) entitiesAllowedToRespond.push(entity);
                });
        }

        let startDate = this.messageForm.get('startDate').value;
        if (!startDate) startDate = this.defaultStartDate;
        else startDate = this.createTimestampFromValue(startDate);

        let endDate = this.messageForm.get('endDate').value;
        if (!endDate)  endDate = this.defaultEndDate;
        else endDate = this.createTimestampFromValue(endDate);

        const title = (!!specificInformation.card.title) ? specificInformation.card.title : 'UNDEFINED';
        const summary = (!!specificInformation.card.summary) ? specificInformation.card.summary : 'UNDEFINED';

        let timeSpans = [];
        if  (!!specificInformation.viewCardInAgenda) {
            if (!!specificInformation.recurrence) timeSpans = [new TimeSpan(startDate , endDate , specificInformation.recurrence )];
            else timeSpans = [new TimeSpan(startDate , endDate )];
        }


        let processInstanceId ;
        if (this.editCardMode) processInstanceId = this.cardToEdit.card.processInstanceId;
        else processInstanceId  = Guid.create().toString();

        this.card = {
            id: 'dummyId',
            publishDate: null,
            publisher: this.currentUserWithPerimeters.userData.entities[0],
            processVersion: processVersion,
            process: selectedProcess.id,
            processInstanceId: processInstanceId,
            state: state,
            startDate: startDate,
            endDate: endDate,
            severity: formValue['severity'],
            hasBeenAcknowledged: false,
            hasBeenRead: false,
            entityRecipients: recipients,
            entitiesAllowedToRespond: entitiesAllowedToRespond,
            externalRecipients: null,
            title: title,
            summary: summary,
            timeSpans : timeSpans,
            data: specificInformation.card.data,
        } as Card;


        const options: NgbModalOptions = {
            size: 'fullscreen'
        };
        this.errorMessage.display = false;
        this.modalRef = this.modalService.open(template, options);
    }


    createTimestampFromValue = (value: any): number => {
        const { date, time } = value;
        if (date) {
            return this.timeService.toNgBNumberTimestamp(transformToTimestamp(date, time));
            // TODO Why do we need 2 transformations? What is an NgBTimestamp vs a plain Timestamp?
        } else {
            return null;
        }
    }


    getI18nPrefixFromProcess = (process: Process): string => {
        return process.id + '.' + process.version + '.';
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    confirm(): void {
        this.cardService.postCard(fromCardToCardForPublishing(this.card))
            .subscribe(
                resp => {
                    this.messageAfterSendingCard = '';
                    const msg = resp.message;
                    // TODO better way to handle perimeter errors
                    if (!!msg && msg.includes('unable')) {
                        console.log('Impossible to send card , error message from service : ', msg);
                        this.messageAfterSendingCard = 'userCard.error.impossibleToSendCard';
                    } else {
                        this.messageAfterSendingCard = 'userCard.cardSendWithNoError';
                    }
                    this.modalRef.close();
                    this.displaySendResult = true;
                    this.messageForm.reset();
                },
                err => {
                    console.error('Error when sending card :', err);
                    this.modalRef.close();
                    this.displaySendResult = true;
                    this.messageForm.reset();
                }
            );
    }


    decline(): void {
        this.modalRef.dismiss(this.messageAfterSendingCard);
    }

    sendAnotherUserCard() {
        this.userCardTemplate = '';
        this.card = null;
        this.displaySendResult = false;
        this.editCardMode = false;
        this.cardToEdit = null;
        this.selectedRecipients = [];
    }

}
