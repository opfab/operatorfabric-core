/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {CardService} from '@ofServices/card.service';
import {UserService} from '@ofServices/user.service';
import {Card, CardData, fromCardToCardForPublishing, TimeSpan} from '@ofModel/card.model';
import {I18n} from '@ofModel/i18n.model';
import {Subject} from 'rxjs';
import {Recipient} from '@ofModel/processes.model';
import {Severity} from '@ofModel/light-card.model';
import {Guid} from 'guid-typescript';
import {NgbModalRef} from '@ng-bootstrap/ng-bootstrap/modal/modal-ref';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {UserWithPerimeters} from '@ofModel/userWithPerimeters.model';
import {EntitiesService} from '@ofServices/entities.service';
import {ProcessesService} from '@ofServices/processes.service';
import {HandlebarsService} from '../cards/services/handlebars.service';
import {DetailContext} from '@ofModel/detail-context.model';
import {map} from 'rxjs/operators';
import {TranslateService} from '@ngx-translate/core';
import {MessageLevel} from '@ofModel/message.model';
import {AlertMessage} from '@ofStore/actions/alert.actions';
import {Entity} from '@ofModel/entity.model';
import {ConfigService} from '@ofServices/config.service';
import {DisplayContext} from '@ofModel/templateGateway.model';
import {SoundNotificationService} from '@ofServices/sound-notification.service';
import {UserCardDatesFormComponent} from './datesForm/usercard-dates-form.component';
import {DateField, DatesForm} from './datesForm/dates-form.model';

declare const templateGateway: any;

@Component({
    selector: 'of-usercard',
    templateUrl: './usercard.component.html',
    styleUrls: ['./usercard.component.scss']
})
export class UserCardComponent implements OnDestroy, OnInit {

    @Input() modal;
    @Input() cardIdToEdit = null;

    @ViewChild('datesForm') datesForm: UserCardDatesFormComponent;
    public datesFormValue: DatesForm;

    displayContext = DisplayContext.PREVIEW;

    severityForm: FormGroup;
    recipientForm: FormGroup;

    currentUserWithPerimeters: UserWithPerimeters;

    entities: Entity[];
    recipientsOptions = [];
    selectedRecipients = [];
    dropdownSettings = {};

    selectedProcessId: string;
    selectedState: string;
    userCardTemplate: SafeHtml;
    editCardMode = false;
    cardToEdit: CardData;
    publisherForCreatingUsercard: string;
   
    public card: Card;

    readonly defaultStartDate = new Date().valueOf() + 60000;
    readonly defaultEndDate = new Date().valueOf() + 60000 * 60 * 24;
    readonly defaultLttdDate = this.defaultEndDate - 60000;

    unsubscribe$: Subject<void> = new Subject<void>();

    public displayPreview = false;
    public displaySendingCardInProgress = false;

    modalRef: NgbModalRef;

    severityOptions = Object.keys(Severity).map(severity => {
        return {
            value: severity,
            label: new I18n('shared.severity.' + severity)
        };
    });
    severityVisible = true ;
    startDateVisible = true ;
    endDateVisible = true ;
    lttdVisible = true ;
    recipientVisible = true; // if recipientVisible == false, then selectedRecipients = recipientList

    pageLoading = true;
    useDescriptionFieldForEntityList = false;

    editCardProcess;
    editCardState;

    emptyProcessList = false;

    displayForm()  {
         return !!this.publisherForCreatingUsercard && !this.emptyProcessList;
       // return !!this.publisherForCreatingUsercard && !!this.processOptions && this.processOptions.length > 0;
    }



    constructor(private store: Store<AppState>,
        private cardService: CardService,
        private userService: UserService,
        private entitiesService: EntitiesService,
        private sanitizer: DomSanitizer,
        private element: ElementRef,
        private processesService: ProcessesService,
        protected configService: ConfigService,
        private handlebars: HandlebarsService,
        protected translate: TranslateService,
        protected soundNotificationService: SoundNotificationService,
    ) {
        this.setDateFormValues();
    }

    ngOnInit() {
        this.pageLoading = true;

        this.useDescriptionFieldForEntityList = this.configService.getConfigValue('usercard.useDescriptionFieldForEntityList',false);

        this.currentUserWithPerimeters = this.userService.getCurrentUserWithPerimeters();
        this.loadAllEntities();
        this.loadRecipentsOptions();


        this.severityForm = new FormGroup({
            severity: new FormControl('')
        });

        this.changeSeverityToDefaultValue();


        this.recipientForm = new FormGroup({
            recipients: new FormControl([])
        });


        
        this.dropdownSettings = {
            text: '',
            badgeShowLimit: 30,
            enableSearchFilter: true
        };
        if (!!this.cardIdToEdit)
            this.loadCardForEdition();
        else {
            this.pageLoading = false;
        }

        this.publisherForCreatingUsercard = this.findPublisherForCreatingUsercard();

       
    }

    private setDateFormValues():void {

        const startDate = new DateField(this.startDateVisible,this.defaultStartDate);
        const endDate = new DateField(this.endDateVisible,this.defaultEndDate);
        const lttd = new DateField(this.lttdVisible,this.defaultLttdDate);
        if (!!this.cardToEdit) {
            if (!!this.cardToEdit.card.startDate) startDate.initialEpochDate = this.cardToEdit.card.startDate;
            if (!!this.cardToEdit.card.endDate) endDate.initialEpochDate = this.cardToEdit.card.endDate;
            if (!!this.cardToEdit.card.lttd) lttd.initialEpochDate = this.cardToEdit.card.lttd;
        }
       
        this.datesFormValue = new DatesForm(startDate,endDate,lttd);
    }
 


    loadCardForEdition() {
            this.editCardMode = true;
            this.cardService.loadCard(this.cardIdToEdit).subscribe(card => {
                        this.cardToEdit = card;
                        this.editCardProcess = this.cardToEdit.card.process;
                        this.editCardState = this.cardToEdit.card.state;
                        this.severityForm.get('severity').setValue(this.cardToEdit.card.severity);
                        this.selectedRecipients = this.cardToEdit.card.entityRecipients;
                        this.pageLoading = false;
                        this.setDateFormValues();
            });
    }


    loadAllEntities(): void {
        this.entities = this.entitiesService.getEntities();
    }

    loadRecipentsOptions() {
        this.recipientsOptions = [];
        this.entities.forEach(entity =>
            this.recipientsOptions.push({ id: entity.id, itemName: this.getEntityLabel(entity) }));

        this.recipientsOptions.sort(( a, b ) => a.itemName.localeCompare(b.itemName));
    }

    changeSeverityToDefaultValue(): void {
        this.severityForm.get('severity').valueChanges.subscribe((severity) => {
            if (!severity) this.severityForm.get('severity').setValue(this.severityOptions[0].value);
        });
        this.severityForm.get('severity').setValue(this.severityOptions[0].value);

    }

    setEmptyProcessList(): void {
        this.emptyProcessList = true;
    }

    stateChanged(event: any) {
        this.selectedState = event.state;
        this.selectedProcessId = event.selectedProcessId;
        this.loadRecipentsOptions();
        this.loadTemplate();
    }

    loadTemplate() {

        let card;
        if  (!!this.cardToEdit) card = this.cardToEdit.card ;
        const selected = this.processesService.getProcess(this.selectedProcessId);
        const userCard = selected.states[this.selectedState].userCard;
        if (!!userCard && !!userCard.template) {
            const templateName = userCard.template;

            this.handlebars.queryTemplate(this.selectedProcessId, selected.version, templateName)
                .pipe(map(t => t(new DetailContext(card, null, null))))
                .subscribe({
                    next: (template) => {
                        this.userCardTemplate = this.sanitizer.bypassSecurityTrustHtml(template);
                        setTimeout(() => { // wait for DOM rendering
                            this.reinsertScripts();
                        }, 10);},
                    error:(error) =>  {
                        console.log('WARNING impossible to load template ', templateName , ', error = ' , error);
                        this.userCardTemplate = this.sanitizer.bypassSecurityTrustHtml('');
                    }
                });
        } else this.userCardTemplate = this.sanitizer.bypassSecurityTrustHtml('');

        if (!!userCard) {
            this.severityVisible = (userCard.severityVisible === undefined) ? true : userCard.severityVisible;
            this.startDateVisible = (userCard.startDateVisible === undefined) ? true : userCard.startDateVisible;
            this.endDateVisible = (userCard.endDateVisible === undefined) ? true : userCard.endDateVisible;
            this.lttdVisible = (userCard.lttdVisible === undefined) ? true : userCard.lttdVisible;
            this.recipientVisible = (userCard.recipientVisible === undefined) ? true : userCard.recipientVisible;
            this.setDateFormValues();
            if (!!userCard.recipientList) {
                this.loadRecipientListForState(userCard.recipientList);
            }
        } else {
            this.severityVisible = true;
            this.startDateVisible = true;
            this.endDateVisible = true;
            this.lttdVisible = true;
            this.recipientVisible = true;
        }

    }

    loadRecipientListForState(recipients: Recipient[]): void {
        this.recipientsOptions = [];
        recipients.forEach(r => {
            if (!!r.levels) {
                r.levels.forEach(l => {
                    this.entitiesService.resolveChildEntitiesByLevel(r.id, l).forEach(entity => {
                        if (!this.recipientsOptions.find(o => o.id === entity.id)) {
                            this.recipientsOptions.push({ id: entity.id, itemName: this.getEntityLabel(entity) });
                        }
                    });
                });
            } else {
                if (!this.recipientsOptions.find(o => o.id === r.id)) {
                    const entity = this.entities.find(e => e.id === r.id);
                    if (!!entity)
                        this.recipientsOptions.push({ id: entity.id, itemName: this.getEntityLabel(entity)});
                    else 
                        console.log(new Date().toISOString(), 'Recipient entity not found : ', r.id )
                }
            }
        });

        this.recipientsOptions.sort(( a, b ) => a.itemName.localeCompare(b.itemName));
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

    findPublisherForCreatingUsercard(): string {
        return this.currentUserWithPerimeters.userData.entities.find(userEntity => {
            const entity = this.entities.find(e => e.id === userEntity);
            return entity.entityAllowedToSendCard;
        });
    }

    prepareCard() {

        const selectedProcess = this.processesService.getProcess(this.selectedProcessId);
        const processVersion = selectedProcess.version;
        const state = this.selectedState;

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

        let allRecipientOptions = selectedProcess.states[state].userCard.recipientList;
        allRecipientOptions = allRecipientOptions != undefined ? allRecipientOptions : [];
        const selectedRecipients = this.recipientVisible ? this.recipientForm.value['recipients'] : allRecipientOptions;
        const recipients = [];
        selectedRecipients.forEach(entity => recipients.push(entity.id));


        // load entitiesAllowedToRespond and entitiesRequiredToRespond if the card asks a a response
        let entitiesAllowedToRespond = [];
        let entitiesRequiredToRespond = [];
        if (selectedProcess.states[state].response) {

            let defaultEntityAllowedToRespond = [];
            recipients.forEach(entity =>  defaultEntityAllowedToRespond.push(entity));

            entitiesAllowedToRespond = (!!specificInformation.card.entitiesAllowedToRespond) ? specificInformation.card.entitiesAllowedToRespond : defaultEntityAllowedToRespond;
            entitiesRequiredToRespond = (!!specificInformation.card.entitiesRequiredToRespond) ? specificInformation.card.entitiesRequiredToRespond : [];
        }

        let startDate = this.datesForm.getStartDateAsEpoch();
        if (!startDate) startDate = this.defaultStartDate;


        let lttd = null;
        if (this.lttdVisible)  lttd = this.datesForm.getLttdAsEpoch();
        else {
            if (specificInformation.card.lttd) lttd = specificInformation.card.lttd;
        }

        let endDate = null;
        if (this.endDateVisible) endDate = this.datesForm.getEndDateAsEpoch();
        else {
            if (specificInformation.card.endDate) endDate = specificInformation.card.endDate;
        }

        if (!!endDate && endDate < startDate) {
            this.displayMessage('shared.endDateBeforeStartDate', '', MessageLevel.ERROR);
            return;
        }

        if (!!lttd && lttd < startDate) {
            this.displayMessage('userCard.error.lttdBeforeStartDate', '', MessageLevel.ERROR);
            return;
        }

        if (!!lttd && !!endDate && lttd > endDate) {
            this.displayMessage('userCard.error.lttdAfterEndDate', '', MessageLevel.ERROR);
            return;
        }

        const title = (!!specificInformation.card.title) ? specificInformation.card.title : 'UNDEFINED';
        const summary = (!!specificInformation.card.summary) ? specificInformation.card.summary : 'UNDEFINED';
        const keepChildCards = (!!specificInformation.card.keepChildCards) ? specificInformation.card.keepChildCards : false;
        const secondsBeforeTimeSpanForReminder = (specificInformation.card.secondsBeforeTimeSpanForReminder !== undefined) ? specificInformation.card.secondsBeforeTimeSpanForReminder : null;
        const externalRecipients = (!!specificInformation.card.externalRecipients) ? specificInformation.card.externalRecipients : null;
        const entitiesAllowedToEdit = (!!specificInformation.card.entitiesAllowedToEdit) ? specificInformation.card.entitiesAllowedToEdit : null;

        let severity;
        if (this.severityVisible) {
            severity = this.severityForm.value['severity'];
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

        this.cardService.postTranslateCardField(selectedProcess.id, processVersion, title)
            .subscribe(response => {
                const titleTranslated = response.body.translatedField;
                this.card = {
                    id: 'dummyId',
                    publishDate: null,
                    publisher: this.publisherForCreatingUsercard,
                    publisherType : 'ENTITY',
                    processVersion: processVersion,
                    process: selectedProcess.id,
                    processInstanceId: processInstanceId,
                    state: state,
                    startDate: startDate,
                    endDate: endDate,
                    lttd: lttd,
                    severity: severity,
                    hasBeenAcknowledged: false,
                    hasBeenRead: false,
                    userRecipients : [this.currentUserWithPerimeters.userData.login],
                    entityRecipients: recipients,
                    entitiesAllowedToRespond: entitiesAllowedToRespond,
                    entitiesRequiredToRespond: entitiesRequiredToRespond,
                    entitiesAllowedToEdit: entitiesAllowedToEdit,
                    externalRecipients: externalRecipients,
                    title: title,
                    titleTranslated: titleTranslated,
                    summary: summary,
                    secondsBeforeTimeSpanForReminder: secondsBeforeTimeSpanForReminder,
                    timeSpans : timeSpans,
                    keepChildCards: keepChildCards,
                    data: specificInformation.card.data,
                } as Card;

                this.displayPreview = true;
            });
    }

    getEntityLabel(entity: Entity) {
        return this.useDescriptionFieldForEntityList ? entity.description : entity.name 
    }

    getEntityName(id: string): string {
        const entityOption = this.recipientsOptions.find(entity => entity.id === id);
        return entityOption.itemName;
    }


    confirm(): void {
        this.displayPreview = false;
        this.displaySendingCardInProgress = true;

        // Exclude card from sound notifications before publishing to avoid synchronization problems
        this.soundNotificationService.lastSentCard(this.card.process + '.' + this.card.processInstanceId);

        this.cardService.postCard(fromCardToCardForPublishing(this.card))
            .subscribe(
                resp => {
                    if (resp.status !== 201) {
                        const msg = (!! resp.message ? resp.message : '');
                        const error = (!! resp.error ? resp.error : '');
                        console.log('Impossible to send card , message from service : ', msg, '. Error message : ', error);
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

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
