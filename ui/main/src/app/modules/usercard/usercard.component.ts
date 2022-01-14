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
import {Recipient} from '@ofModel/processes.model';
import {Severity} from '@ofModel/light-card.model';
import {Guid} from 'guid-typescript';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
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
export class UserCardComponent implements OnInit {

    @Input() userCardModal;
    public pageLoading = true;

    // Process and state choice
    private selectedProcessId: string;
    private selectedStateId: string;
    private emptyProcessList = false;

    // Severity
    private severityForm: FormGroup;
    public severityVisible = true;


    // Dates
    @ViewChild('datesForm') datesForm: UserCardDatesFormComponent;
    public datesFormValue: DatesForm;
    readonly defaultStartDate = new Date().valueOf() + 60000;
    readonly defaultEndDate = new Date().valueOf() + 60000 * 60 * 24;
    readonly defaultLttdDate = this.defaultEndDate - 60000;
    private startDateVisible = true;
    private endDateVisible = true;
    private lttdVisible = true;


    // For recipient components
    private recipientForm: FormGroup;
    private useDescriptionFieldForEntityList = false;
    public recipientVisible = true;
    public recipientsOptions = [];
    public selectedRecipients = [];
    public dropdownSettings = {
        text: '',
        badgeShowLimit: 30,
        enableSearchFilter: true
    };

    // For edition mode
    @Input() cardIdToEdit: string = null;
    private editCardMode = false;
    private cardToEdit: CardData;
    public editCardProcessId: string;
    public editCardStateId: string;

    // Preview and send card
    readonly displayContext = DisplayContext.PREVIEW;
    private publisherForCreatingUsercard: string;
    public card: Card;
    public displayPreview = false;
    public displaySendingCardInProgress = false;

    public userCardTemplate: SafeHtml;

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
        this.useDescriptionFieldForEntityList = this.configService.getConfigValue('usercard.useDescriptionFieldForEntityList', false);
        this.severityForm = new FormGroup({
            severity: new FormControl('')
        });
        this.severityForm.get('severity').setValue(Severity.ALARM);
        this.recipientForm = new FormGroup({
            recipients: new FormControl([])
        });
        if (!!this.cardIdToEdit)this.loadCardForEdition();
        else  this.pageLoading = false;

        this.publisherForCreatingUsercard = this.findPublisherForCreatingUsercard();
    }

    private loadCardForEdition() {
        this.editCardMode = true;
        this.cardService.loadCard(this.cardIdToEdit).subscribe(card => {
            this.cardToEdit = card;
            this.editCardProcessId = this.cardToEdit.card.process;
            this.editCardStateId = this.cardToEdit.card.state;
            this.severityForm.get('severity').setValue(this.cardToEdit.card.severity);
            this.selectedRecipients = this.cardToEdit.card.entityRecipients;
            this.pageLoading = false;
            this.setDateFormValues();
        });
    }


    private setDateFormValues(): void {
        const startDate = new DateField(this.startDateVisible, this.defaultStartDate);
        const endDate = new DateField(this.endDateVisible, this.defaultEndDate);
        const lttd = new DateField(this.lttdVisible, this.defaultLttdDate);
        if (!!this.cardToEdit) {
            if (!!this.cardToEdit.card.startDate) startDate.initialEpochDate = this.cardToEdit.card.startDate;
            if (!!this.cardToEdit.card.endDate) endDate.initialEpochDate = this.cardToEdit.card.endDate;
            if (!!this.cardToEdit.card.lttd) lttd.initialEpochDate = this.cardToEdit.card.lttd;
        }
        this.datesFormValue = new DatesForm(startDate, endDate, lttd);
    }


    private findPublisherForCreatingUsercard(): string {
        return this.userService.getCurrentUserWithPerimeters().userData.entities.find(userEntity => {
            const entity = this.entitiesService.getEntities().find(e => e.id === userEntity);
            return entity.entityAllowedToSendCard;
        });
    }

    public displayForm() {
        return !!this.publisherForCreatingUsercard && !this.emptyProcessList;
    }

    public setEmptyProcessList(): void {
        this.emptyProcessList = true;
    }

    public stateChanged(event: any) {
        this.selectedStateId = event.state;
        this.selectedProcessId = event.selectedProcessId;
        const userCardConfiguration = this.processesService.getProcess(this.selectedProcessId).states[this.selectedStateId].userCard;
        this.loadRecipientsOptions(userCardConfiguration);
        this.setFieldsVisibility(userCardConfiguration);
        this.setDateFormValues();
        this.loadTemplate(userCardConfiguration);
    }


    private loadRecipientsOptions(userCardConfiguration) {
        if (!!userCardConfiguration.recipientList) {
            this.loadRestrictedRecipientListForState(userCardConfiguration.recipientList);
        } else {
            this.recipientsOptions = [];
            this.entitiesService.getEntities().forEach(entity =>
                this.recipientsOptions.push({id: entity.id, itemName: this.getEntityLabel(entity)}));
            this.recipientsOptions.sort((a, b) => a.itemName.localeCompare(b.itemName));
        }
    }

    private loadRestrictedRecipientListForState(recipients: Recipient[]): void {
        this.recipientsOptions = [];
        recipients.forEach(r => {
            if (!!r.levels) {
                r.levels.forEach(l => {
                    this.entitiesService.resolveChildEntitiesByLevel(r.id, l).forEach(entity => {
                        if (!this.recipientsOptions.find(o => o.id === entity.id)) {
                            this.recipientsOptions.push({id: entity.id, itemName: this.getEntityLabel(entity)});
                        }
                    });
                });
            } else {
                if (!this.recipientsOptions.find(o => o.id === r.id)) {
                    const entity = this.entitiesService.getEntities().find(e => e.id === r.id);
                    if (!!entity)
                        this.recipientsOptions.push({id: entity.id, itemName: this.getEntityLabel(entity)});
                    else
                        console.log(new Date().toISOString(), 'Recipient entity not found : ', r.id);
                }
            }
        });

        this.recipientsOptions.sort((a, b) => a.itemName.localeCompare(b.itemName));
    }

    private getEntityLabel(entity: Entity) {
        return this.useDescriptionFieldForEntityList ? entity.description : entity.name;
    }

    private setFieldsVisibility(userCardConfiguration) {
        if (!!userCardConfiguration) {
            this.severityVisible = (userCardConfiguration.severityVisible === undefined) ? true : userCardConfiguration.severityVisible;
            this.startDateVisible = (userCardConfiguration.startDateVisible === undefined) ? true : userCardConfiguration.startDateVisible;
            this.endDateVisible = (userCardConfiguration.endDateVisible === undefined) ? true : userCardConfiguration.endDateVisible;
            this.lttdVisible = (userCardConfiguration.lttdVisible === undefined) ? true : userCardConfiguration.lttdVisible;
            this.recipientVisible = (userCardConfiguration.recipientVisible === undefined) ? true : userCardConfiguration.recipientVisible;
        } else {
            this.severityVisible = true;
            this.startDateVisible = true;
            this.endDateVisible = true;
            this.lttdVisible = true;
            this.recipientVisible = true;
        }

    }

    private loadTemplate(userCardConfiguration) {
        let card;
        if (!!this.cardToEdit) card = this.cardToEdit.card;
        const selected = this.processesService.getProcess(this.selectedProcessId);
        if (!!userCardConfiguration && !!userCardConfiguration.template) {
            const templateName = userCardConfiguration.template;

            this.handlebars.queryTemplate(this.selectedProcessId, selected.version, templateName)
                .pipe(map(t => t(new DetailContext(card, null, null))))
                .subscribe({
                    next: (template) => {
                        this.userCardTemplate = this.sanitizer.bypassSecurityTrustHtml(template);
                        setTimeout(() => { // wait for DOM rendering
                            this.reinsertScripts();
                        }, 10);
                    },
                    error: (error) => {
                        console.log('WARNING impossible to load template ', templateName, ', error = ', error);
                        this.userCardTemplate = this.sanitizer.bypassSecurityTrustHtml('');
                    }
                });
        } else this.userCardTemplate = this.sanitizer.bypassSecurityTrustHtml('');
    }


    private reinsertScripts(): void {
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

    public prepareCard() {
        const selectedProcess = this.processesService.getProcess(this.selectedProcessId);
        const processVersion = selectedProcess.version;
        const state = this.selectedStateId;

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
        allRecipientOptions = allRecipientOptions !== undefined ? allRecipientOptions : [];
        const selectedRecipients = this.recipientVisible ? this.recipientForm.value['recipients'] : allRecipientOptions;
        const recipients = [];
        selectedRecipients.forEach(entity => recipients.push(entity.id));

        let entitiesAllowedToRespond = [];
        let entitiesRequiredToRespond = [];
        if (selectedProcess.states[state].response) {
            const defaultEntityAllowedToRespond = [];
            recipients.forEach(entity => defaultEntityAllowedToRespond.push(entity));

            entitiesAllowedToRespond = (!!specificInformation.card.entitiesAllowedToRespond) ? specificInformation.card.entitiesAllowedToRespond : defaultEntityAllowedToRespond;
            entitiesRequiredToRespond = (!!specificInformation.card.entitiesRequiredToRespond) ? specificInformation.card.entitiesRequiredToRespond : [];
        }

        let startDate = this.datesForm.getStartDateAsEpoch();
        if (!startDate) startDate = this.defaultStartDate;


        let lttd = null;
        if (this.lttdVisible) lttd = this.datesForm.getLttdAsEpoch();
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
        if (!!specificInformation.viewCardInAgenda) {
            if (!!specificInformation.recurrence) timeSpans = [new TimeSpan(startDate, endDate, specificInformation.recurrence)];
            else timeSpans = [new TimeSpan(startDate, endDate)];
        }

        let processInstanceId;
        if (this.editCardMode) processInstanceId = this.cardToEdit.card.processInstanceId;
        else processInstanceId = Guid.create().toString();

        this.cardService.postTranslateCardField(selectedProcess.id, processVersion, title)
            .subscribe(response => {
                const titleTranslated = response.body.translatedField;
                this.card = {
                    id: 'dummyId',
                    publishDate: null,
                    publisher: this.publisherForCreatingUsercard,
                    publisherType: 'ENTITY',
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
                    userRecipients: [this.userService.getCurrentUserWithPerimeters().userData.login],
                    entityRecipients: recipients,
                    entitiesAllowedToRespond: entitiesAllowedToRespond,
                    entitiesRequiredToRespond: entitiesRequiredToRespond,
                    entitiesAllowedToEdit: entitiesAllowedToEdit,
                    externalRecipients: externalRecipients,
                    title: title,
                    titleTranslated: titleTranslated,
                    summary: summary,
                    secondsBeforeTimeSpanForReminder: secondsBeforeTimeSpanForReminder,
                    timeSpans: timeSpans,
                    keepChildCards: keepChildCards,
                    data: specificInformation.card.data,
                } as Card;

                this.displayPreview = true;
            });
    }

    private displayMessage(i18nKey: string, msg: string, severity: MessageLevel = MessageLevel.ERROR) {
        this.store.dispatch(new AlertMessage({alertMessage: {message: msg, level: severity, i18n: {key: i18nKey}}}));
    }

    public getEntityName(id: string): string {
        const entityOption = this.recipientsOptions.find(entity => entity.id === id);
        return entityOption.itemName;
    }

    public confirm(): void {
        this.displayPreview = false;
        this.displaySendingCardInProgress = true;

        // Exclude card from sound notifications before publishing to avoid synchronization problems
        this.soundNotificationService.lastSentCard(this.card.process + '.' + this.card.processInstanceId);

        this.cardService.postCard(fromCardToCardForPublishing(this.card))
            .subscribe(
                resp => {
                    if (resp.status !== 201) {
                        const msg = (!!resp.message ? resp.message : '');
                        const error = (!!resp.error ? resp.error : '');
                        console.log('Impossible to send card , message from service : ', msg, '. Error message : ', error);
                        this.displayMessage('userCard.error.impossibleToSendCard', null, MessageLevel.ERROR);
                    } else {
                        this.displayMessage('userCard.cardSendWithNoError', null, MessageLevel.INFO);
                    }

                    this.userCardModal.dismiss('Close');
                },
                err => {
                    console.error('Error when sending card :', err);
                    this.displayMessage('userCard.error.impossibleToSendCard', null, MessageLevel.ERROR);
                    this.displaySendingCardInProgress = false;
                }
            );
    }

    cancel(): void {
        this.userCardModal.close();
    }

    decline(): void {
        this.displayPreview = false;
    }


}
