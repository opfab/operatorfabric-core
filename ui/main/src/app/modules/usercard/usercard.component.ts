/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, ElementRef, Input, OnDestroy, OnInit, TemplateRef} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {CardService} from '@ofServices/card.service';
import {UserService} from '@ofServices/user.service';
import {Card, CardData, fromCardToCardForPublishing, TimeSpan} from '@ofModel/card.model';
import {I18n} from '@ofModel/i18n.model';
import {Subject} from 'rxjs';
import {Process} from '@ofModel/processes.model';
import {TimeService} from '@ofServices/time.service';
import {Severity} from '@ofModel/light-card.model';
import {Guid} from 'guid-typescript';
import {NgbDateStruct, NgbTimeStruct} from '@ng-bootstrap/ng-bootstrap';
import {NgbModalRef} from '@ng-bootstrap/ng-bootstrap/modal/modal-ref';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {ComputedPerimeter, UserWithPerimeters} from '@ofModel/userWithPerimeters.model';
import {EntitiesService} from '@ofServices/entities.service';
import {ProcessesService} from '@ofServices/processes.service';
import {ActivatedRoute} from '@angular/router';
import {DateTimeNgb, getDateTimeNgbFromMoment} from '@ofModel/datetime-ngb.model';
import * as moment from 'moment-timezone';
import {HandlebarsService} from '../cards/services/handlebars.service';
import {DetailContext} from '@ofModel/detail-context.model';
import {map} from 'rxjs/operators';
import {TranslateService} from '@ngx-translate/core';
import {MessageLevel} from '@ofModel/message.model';
import {AlertMessage} from '@ofStore/actions/alert.actions';
import {RightsEnum} from '@ofModel/perimeter.model';
import {Utilities} from '../../common/utilities';

declare const templateGateway: any;


@Component({
    selector: 'of-usercard',
    templateUrl: './usercard.component.html',
    styleUrls: ['./usercard.component.scss']
})
export class UserCardComponent implements OnDestroy, OnInit {

    @Input() modal;

    messageForm: FormGroup;
    recipientForm: FormGroup;

    processesDefinition: Process[];
    currentUserWithPerimeters: UserWithPerimeters;
    processGroups: {id: string, processes: string[]}[];

    severityOptions = Object.keys(Severity).map(severity => {
        return {
            value: severity,
            label: new I18n('userCard.options.severity.' + severity)
        };
    });

    stateOptions: any[];
    recipientsOptions = [];
    selectedRecipients = [];
    dropdownSettings = {};
    processOptions = [];
    processOptionsWhenSelectedService = [];
    serviceOptions = [];

    selectedProcess: Process;
    selectedState: string;
    processesPerServices = new Map();
    servicePerProcesses = new Map();
    processesWithoutService = [];
    statesPerProcesses = new Map();
    userCardTemplate: SafeHtml;
    editCardMode = false;
    cardToEdit: CardData;

    @Input() cardIdToEdit = null;
    public card: Card;

    readonly defaultStartDate = new Date().valueOf() + 60000;
    readonly defaultEndDate = new Date().valueOf() + 60000 * 60 * 24;

    unsubscribe$: Subject<void> = new Subject<void>();

    public displayPreview = false;
    public displaySendingCardInProgress = false;

    modalRef: NgbModalRef;
    severityVisible = true;
    startDateVisible = true;
    endDateVisible = true;

    displayForm() {
        return !!this.processOptions && this.processOptions.length > 0;
    }

    displayServiceFilter() {
        return !!this.serviceOptions && this.serviceOptions.length > 1 ;
    }

    constructor(private store: Store<AppState>,
        private cardService: CardService,
        private userService: UserService,
        private timeService: TimeService,
        private entitiesService: EntitiesService,
        private sanitizer: DomSanitizer,
        private element: ElementRef,
        private processesService: ProcessesService,
        private route: ActivatedRoute,
        private handlebars: HandlebarsService,
        protected translate: TranslateService,
    ) {
    }

    ngOnInit() {

        this.currentUserWithPerimeters = this.userService.getCurrentUserWithPerimeters();
        this.processGroups = this.processesService.getProcessGroups();
        this.loadAllEntities();
        this.loadAllProcessAndStateInUserPerimeter();
        this.loadAllServicesRelatingToUserPerimeter();

        this.messageForm = new FormGroup({
            severity: new FormControl(''),
            service: new FormControl(''),
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
        this.changeProcessesWhenSelectService();
        this.loadTemplateWhenStateChange();

        this.dropdownSettings = {
            text: '',
            badgeShowLimit: 30,
            enableSearchFilter: true
        };

        this.loadCardForEdition();
    }

    loadCardForEdition() {
        if (!!this.cardIdToEdit) {
                    this.editCardMode = true;
            this.cardService.loadCard(this.cardIdToEdit).subscribe(card => {
                        this.cardToEdit = card;
                        this.messageForm.get('severity').setValue(this.cardToEdit.card.severity);

                        const serviceForCardToEdit = this.servicePerProcesses.get(this.cardToEdit.card.process);
                        if (serviceForCardToEdit)
                            this.messageForm.get('service').setValue(serviceForCardToEdit);
                        else
                            this.messageForm.get('service').setValue('--');

                        this.messageForm.get('process').setValue(this.cardToEdit.card.process);
                        this.messageForm.get('state').setValue(this.cardToEdit.card.state);
                        this.messageForm.get('startDate').setValue(getDateTimeNgbFromMoment(moment(this.cardToEdit.card.startDate)));
                        this.messageForm.get('endDate').setValue(getDateTimeNgbFromMoment(moment(this.cardToEdit.card.endDate)));
                        this.selectedRecipients = this.cardToEdit.card.entityRecipients;
            });
        }
    }


    loadAllEntities(): void {
        this.entitiesService.getEntities().forEach(entity =>
            this.recipientsOptions.push({ id: entity.id, itemName: entity.name }));

        this.recipientsOptions.sort(( a, b ) => a.itemName.localeCompare(b.itemName));
    }


    loadAllProcessAndStateInUserPerimeter(): void {
        this.processesDefinition = this.processesService.getAllProcesses();
        const processesInPerimeter: Set<string> = new Set();
        this.currentUserWithPerimeters.computedPerimeters.forEach(perimeter => {
                    if (UserCardComponent.userCanSendCard(perimeter)) processesInPerimeter.add(perimeter.process);
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

    isProcessInProcessesGroup(idProcess: string, processesGroup: {id: string, processes: string[]}): boolean {
        return !!processesGroup.processes.find(process => process === idProcess);
    }

    loadAllServicesRelatingToUserPerimeter(): void {
        let numberOfProcessesAttachedToAService = 0;

        this.processGroups.forEach(group => {

            const processOptions = [];
            this.processOptions.forEach(processOption => {
                if (this.isProcessInProcessesGroup(processOption.value, group)) {
                    processOptions.push(processOption);
                    numberOfProcessesAttachedToAService++;

                    this.servicePerProcesses.set(processOption.value, group.id);
                }
            });

            if (processOptions.length > 0)
                this.processesPerServices.set(group.id, processOptions);
        });

        if (this.processOptions.length > numberOfProcessesAttachedToAService) {
            this.loadProcessesWithoutService();
            this.serviceOptions.push({value: '--', label: 'service.defaultLabel'});
        }
        for (const serviceId of this.processesPerServices.keys())
            this.serviceOptions.push({value: serviceId, label: serviceId});
    }

    loadProcessesWithoutService(): void {
        const processesWithService = Array.from(this.servicePerProcesses.keys());
        this.processesWithoutService = this.processOptions.filter(processOption => processesWithService.indexOf(processOption.value) < 0);
    }

    private static userCanSendCard(perimeter: ComputedPerimeter): boolean {
        return ((perimeter.rights === RightsEnum.ReceiveAndWrite)
            || (perimeter.rights === RightsEnum.Write));
    }

    loadStatesForProcess(process: Process): void {
        const statesList = [];
        this.currentUserWithPerimeters.computedPerimeters.forEach(
            perimeter => {
                if ((perimeter.process === process.id) && UserCardComponent.userCanSendCard(perimeter)) {
                    const state = process.states[perimeter.state];
                    if (!!state) {
                        if (!!state.userCard) {
                            const label = !!state.name ? (new I18n(Utilities.getI18nPrefixFromProcess(process)
                                + state.name)) : perimeter.state;
                            const stateEntry = { value: perimeter.state, label: label };
                            statesList.push(stateEntry);
                        }
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

    changeProcessesWhenSelectService(): void {
        this.messageForm.get('service').valueChanges.subscribe((service) => {
            if (!!service) {
                if (service === '--')
                    this.processOptionsWhenSelectedService = this.processesWithoutService;
                else
                    this.processOptionsWhenSelectedService = this.processesPerServices.get(service);

                this.selectedProcess = this.processOptionsWhenSelectedService[0].value;
                this.messageForm.get('process').setValue(this.selectedProcess);
            }
        });
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

        let card;
        if  (!!this.cardToEdit) card = this.cardToEdit.card ;
        const userCard = this.selectedProcess.states[this.selectedState].userCard;
        if (!!userCard && !!userCard.template) {
            const templateName = userCard.template;

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

        if (!!userCard) {
            this.severityVisible = (userCard.severityVisible === undefined) ? true : userCard.severityVisible;
            this.startDateVisible = (userCard.startDateVisible === undefined) ? true : userCard.startDateVisible;
            this.endDateVisible = (userCard.endDateVisible === undefined) ? true : userCard.endDateVisible;
        } else {
            this.severityVisible = true;
            this.startDateVisible = true;
            this.endDateVisible = true;
        }

    }

    reinsertScripts(): void {
        const scripts = <HTMLScriptElement[]>this.element.nativeElement.getElementsByTagName('script');
        Array.prototype.forEach.call(scripts, script => {   // scripts.foreach does not work ...
            const scriptCopy = document.createElement('script');
            scriptCopy.type = script.type ? script.type : 'text/javascript';
            if (!!script.innerHTML) {
                scriptCopy.innerHTML = script.innerHTML;
            }
            scriptCopy.async = false;
            script.parentNode.replaceChild(scriptCopy, script);

        });
    }

    private displayMessage(i18nKey: string, msg: string, severity: MessageLevel = MessageLevel.ERROR) {
        this.store.dispatch(new AlertMessage({alertMessage: {message: msg, level: severity, i18n: {key: i18nKey}}}));
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
            this.displayMessage('userCard.error.templateError', null, MessageLevel.ERROR);
            return;
        }

        const specificInformation = templateGateway.getSpecificCardInformation();
        if (!specificInformation) {
            console.log('getSpecificCardInformationMethod() in template return no information');
            this.displayMessage('userCard.error.templateError', null, MessageLevel.ERROR);
            return;
        }

        if (!specificInformation.valid) {
            this.displayMessage(specificInformation.errorMsg, null, MessageLevel.ERROR);
            return;
        }

        const selectedRecipients = this.recipientForm.value['recipients'];
        const recipients = [];
        if (selectedRecipients.length < 1) {
            this.displayMessage('userCard.error.noRecipientSelected', null, MessageLevel.ERROR);
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
        if (!endDate)  endDate = this.endDateVisible ? this.defaultEndDate : null;
        else endDate = this.createTimestampFromValue(endDate);

        const title = (!!specificInformation.card.title) ? specificInformation.card.title : 'UNDEFINED';
        const summary = (!!specificInformation.card.summary) ? specificInformation.card.summary : 'UNDEFINED';
        const keepChildCards = (!!specificInformation.card.keepChildCards) ? specificInformation.card.keepChildCards : false;
        const secondsBeforeTimeSpanForReminder = (!!specificInformation.card.secondsBeforeTimeSpanForReminder) ? specificInformation.card.secondsBeforeTimeSpanForReminder : null;

        let severity;
        if (this.severityVisible) {
            severity = formValue['severity'];
        } else {
            severity = (!!specificInformation.card.severity) ? specificInformation.card.severity : Severity.INFORMATION;
        }

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
            severity: severity,
            hasBeenAcknowledged: false,
            hasBeenRead: false,
            entityRecipients: recipients,
            entitiesAllowedToRespond: entitiesAllowedToRespond,
            externalRecipients: null,
            title: title,
            summary: summary,
            secondsBeforeTimeSpanForReminder: secondsBeforeTimeSpanForReminder,
            timeSpans : timeSpans,
            keepChildCards: keepChildCards,
            data: specificInformation.card.data,
        } as Card;

        this.displayPreview = true;
    }


    createTimestampFromValue = (value: any): number => {
        const { date, time } = value;
        if (date) {
            return this.timeService.toNgBNumberTimestamp(this.transformToTimestamp(date, time));
        } else {
            return null;
        }
    };

    transformToTimestamp(date: NgbDateStruct, time: NgbTimeStruct): string {
        return new DateTimeNgb(date, time).formatDateTime();
    }

    getEntityName(id: string): string {
        const entityOption = this.recipientsOptions.find(entity => entity.id === id);
        return entityOption.itemName;
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    confirm(): void {
        this.displayPreview = false;
        this.displaySendingCardInProgress = true;
        this.cardService.postCard(fromCardToCardForPublishing(this.card))
            .subscribe(
                resp => {
                    const msg = resp.message;
                    // TODO better way to handle perimeter errors
                    if (!!msg && msg.includes('unable')) {
                        console.log('Impossible to send card , error message from service : ', msg);
                        this.displayMessage('userCard.error.impossibleToSendCard', null, MessageLevel.ERROR);
                    } else {
                        this.displayMessage('userCard.cardSendWithNoError', null, MessageLevel.INFO);
                    }

                    this.modal.dismiss('Close');
                },
                err => {
                    console.error('Error when sending card :', err);
                    this.displayMessage('userCard.error.impossibleToSendCard', null, MessageLevel.ERROR);
                }
            );
    }

    cancel(): void {
        this.modal.close();
    }

    decline(): void {
       this.displayPreview = false;
    }

    sendAnotherUserCard() {
        this.userCardTemplate = '';
        this.card = null;
        this.editCardMode = false;
        this.cardToEdit = null;
        this.selectedRecipients = [];
    }

}
