/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {UserService} from 'app/business/services/users/user.service';
import {
    Card,
    CardCreationReportData,
    CardData,
    fromCardToCardForPublishing,
    fromCardToLightCard,
    TimeSpan
} from '@ofModel/card.model';
import {UserCard} from '@ofModel/processes.model';
import {CardAction, Severity} from '@ofModel/light-card.model';
import {Guid} from 'guid-typescript';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {EntitiesService} from 'app/business/services/users/entities.service';
import {ProcessesService} from 'app/business/services/businessconfig/processes.service';
import {HandlebarsService} from '../../business/services/card/handlebars.service';
import {DetailContext} from '@ofModel/detail-context.model';
import {map} from 'rxjs/operators';
import {MessageLevel} from '@ofModel/message.model';
import {ConfigService} from 'app/business/services/config.service';
import {DisplayContext} from '@ofModel/template.model';
import {SoundNotificationService} from 'app/business/services/notifications/sound-notification.service';
import {UserCardDatesFormComponent} from './datesForm/usercard-dates-form.component';
import {DateField, DatesForm} from './datesForm/dates-form.model';
import {UserCardRecipientsFormComponent} from './recipientForm/usercard-recipients-form.component';
import {UserPermissionsService} from 'app/business/services/user-permissions.service';
import {Utilities} from '../../business/common/utilities';
import {UsercardSelectCardEmitterFormComponent} from './selectCardEmitterForm/usercard-select-card-emitter-form.component';
import {LogOption, LoggerService as logger} from 'app/business/services/logs/logger.service';
import {PermissionEnum} from '@ofModel/permission.model';
import {AlertMessageService} from 'app/business/services/alert-message.service';
import {CardService} from 'app/business/services/card/card.service';
import {ServerResponseStatus} from 'app/business/server/serverResponse';
import {SystemNotificationService} from '../../business/services/notifications/system-notification.service';
import {Observable} from 'rxjs';
import {OpfabAPIService} from 'app/business/services/opfabAPI.service';
import {RolesEnum} from '@ofModel/roles.model';

@Component({
    selector: 'of-usercard',
    templateUrl: './usercard.component.html',
    styleUrls: ['./usercard.component.scss']
})
export class UserCardComponent implements OnInit, OnDestroy {
    @Input() userCardModal;

    public pageLoading = true;

    // Process and state choice
    private selectedProcessId: string;
    private selectedStateId: string;
    private emptyProcessList = false;
    public userCardConfiguration: UserCard;

    // Severity
    private severityForm: FormGroup<{
        severity: FormControl<string | null>;
    }>;
    public severityVisible = false;

    // Dates
    @ViewChild('datesForm') datesForm: UserCardDatesFormComponent;
    public datesFormValue: DatesForm;
    private usePublishDateForStartDate = true;
    readonly defaultEndDate = new Date().valueOf() + 60000 * 60 * 24;
    readonly defaultLttdDate = this.defaultEndDate - 60000;
    readonly defaultExpirationDate = null;
    private startDateVisible = false;
    private endDateVisible = false;
    private lttdVisible = false;
    private expirationDateVisible = false;
    private currentStartDate = new Date().valueOf() + 60000;
    private currentEndDate = new Date().valueOf() + 60000 * 60 * 24;
    private currentLttd = this.defaultEndDate - 60000;
    private currentExpirationDate = null;

    public userEntitiesAllowedToSendCardOptions = [];

    // Card emitter
    @ViewChild('cardEmitterForm') cardEmitterForm: UsercardSelectCardEmitterFormComponent;

    // For recipients component
    public recipients = [];
    private connectedRecipients = new Set();
    public recipientVisible = true;
    @ViewChild('recipientsForm') recipientsForm: UserCardRecipientsFormComponent;
    public initialSelectedRecipients = [];

    // For recipients for information component
    public recipientForInformationVisible = false;
    public initialSelectedRecipientsForInformation = [];

    private intervalForConnectedUsersUpdate;

    // For edition mode
    @Input() cardIdToEdit: string = null;
    private editCardMode = false;
    private cardToEdit: CardData;
    public editCardProcessId: string;
    public editCardStateId: string;

    @Input() cardIdToCopy: string = null;
    private cardToCopy: CardData;
    public copyCardProcessId: string;
    public copyCardStateId: string;

    private datesFromCardToEdit: boolean;
    private datesFromTemplate: boolean;
    isLoadingCardTemplate = false;
    isPreparingCard = false;
    isReadOnlyUser: boolean;

    // Preview and send card
    readonly displayContext = DisplayContext.PREVIEW;
    private publisherForCreatingUsercard: string;
    public card: Card;
    public displayPreview = false;
    public displaySendingCardInProgress = false;
    private useDescriptionFieldForEntityList = false;
    private specificInformation = null;

    protected childCards: Card[] = [];

    public userCardTemplate: SafeHtml;

    constructor(
        private sanitizer: DomSanitizer,
        private element: ElementRef
    ) {
        this.setDefaultDateFormValues();
    }

    ngOnInit() {
        this.pageLoading = true;
        this.datesFromTemplate = true;
        OpfabAPIService.initUserCardTemplateInterface();
        OpfabAPIService.initCurrentUserCard();
        this.severityForm = new FormGroup({
            severity: new FormControl('')
        });
        this.severityForm.get('severity').setValue(Severity.ALARM);

        this.setPublisherForCreatingUsercard();

        if (this.cardIdToEdit) {
            OpfabAPIService.currentUserCard.editionMode = 'EDITION';
            this.loadCardForEdition();
        } else {
            OpfabAPIService.currentUserCard.editionMode = 'CREATE';
            if (this.userEntitiesAllowedToSendCardOptions.length > 0) {
                this.publisherForCreatingUsercard = this.userEntitiesAllowedToSendCardOptions[0].value;
            }

            if (this.cardIdToCopy) {
                OpfabAPIService.currentUserCard.editionMode = 'COPY';
                this.loadCardForCopy();
            } else {
                this.pageLoading = false;
            }
        }

        this.useDescriptionFieldForEntityList = ConfigService.getConfigValue(
            'usercard.useDescriptionFieldForEntityList',
            false
        );

        this.isReadOnlyUser = UserService.hasCurrentUserAnyPermission([PermissionEnum.READONLY]);
    }

    ngOnDestroy() {
        if (this.intervalForConnectedUsersUpdate) {
            this.stopUpdateRegularlyConnectedUser();
        }
    }

    private loadCardForEdition() {
        this.editCardMode = true;
        CardService.loadCard(this.cardIdToEdit).subscribe((card) => {
            this.cardToEdit = card;
            this.editCardProcessId = this.cardToEdit.card.process;
            this.editCardStateId = this.cardToEdit.card.state;
            this.severityForm.get('severity').setValue(this.cardToEdit.card.severity);
            this.initialSelectedRecipients = Utilities.removeElementsFromArray(
                this.cardToEdit.card.entityRecipients,
                this.cardToEdit.card.entityRecipientsForInformation
            );
            this.initialSelectedRecipientsForInformation = this.cardToEdit.card.entityRecipientsForInformation;
            this.pageLoading = false;
            this.datesFromCardToEdit = true;
            OpfabAPIService.currentUserCard.startDate = this.cardToEdit.card.startDate;
            OpfabAPIService.currentUserCard.endDate = this.cardToEdit.card.endDate;
            OpfabAPIService.currentUserCard.lttd = this.cardToEdit.card.lttd;
            OpfabAPIService.currentUserCard.expirationDate = this.cardToEdit.card.expirationDate;

            this.setPublisherForCreatingUsercardForCardToEdit();

            if (this.cardToEdit.childCards) {
                const userResponse = this.cardToEdit.childCards.find(
                    (child) => child.publisher === this.publisherForCreatingUsercard
                );
                OpfabAPIService.currentUserCard.userEntityChildCard = userResponse;
            }
        });
    }

    private loadCardForCopy() {
        CardService.loadCard(this.cardIdToCopy).subscribe((card) => {
            this.cardToCopy = card;
            this.copyCardProcessId = this.cardToCopy.card.process;
            this.copyCardStateId = this.cardToCopy.card.state;
            this.severityForm.get('severity').setValue(this.cardToCopy.card.severity);
            this.initialSelectedRecipients = Utilities.removeElementsFromArray(
                this.cardToCopy.card.entityRecipients,
                this.cardToCopy.card.entityRecipientsForInformation
            );
            this.initialSelectedRecipientsForInformation = this.cardToCopy.card.entityRecipientsForInformation;
            this.pageLoading = false;
            this.datesFromCardToEdit = false;
        });
    }

    private setPublisherForCreatingUsercard() {
        this.userEntitiesAllowedToSendCardOptions = this.findUserEntitiesAllowedToSendCard();
        this.userEntitiesAllowedToSendCardOptions.sort((a, b) => Utilities.compareObj(a.label, b.label));
        if (this.userEntitiesAllowedToSendCardOptions.length > 0) {
            this.publisherForCreatingUsercard = this.userEntitiesAllowedToSendCardOptions[0].value;
        }
    }

    private setPublisherForCreatingUsercardForCardToEdit() {
        this.userEntitiesAllowedToSendCardOptions.forEach((entityOption) => {
            if (entityOption.value === this.cardToEdit.card.publisher)
                this.publisherForCreatingUsercard = this.cardToEdit.card.publisher;
        });
    }

    private setDefaultDateFormValues(): void {
        const startDate = new DateField(this.startDateVisible, new Date().valueOf());
        const endDate = new DateField(this.endDateVisible, this.defaultEndDate);
        const lttd = new DateField(this.lttdVisible, this.defaultLttdDate);
        const expirationDate = new DateField(this.expirationDateVisible, this.defaultExpirationDate);
        this.datesFormValue = new DatesForm(startDate, endDate, lttd, expirationDate);
        this.datesFromTemplate = true;
        this.currentStartDate = startDate.initialEpochDate;
        OpfabAPIService.currentUserCard.startDate = null;
        this.currentEndDate = endDate.initialEpochDate;
        OpfabAPIService.currentUserCard.endDate = null;
        this.currentLttd = lttd.initialEpochDate;
        OpfabAPIService.currentUserCard.lttd = null;
        this.currentExpirationDate = expirationDate.initialEpochDate;
        OpfabAPIService.currentUserCard.expirationDate = null;
    }

    private setInitialDateFormValues(): void {
        const startDate = new DateField(
            this.startDateVisible,
            this.datesFromTemplate && OpfabAPIService.currentUserCard.startDate
                ? OpfabAPIService.currentUserCard.startDate
                : this.getStartDate()
        );
        const endDate = new DateField(
            this.endDateVisible,
            this.datesFromTemplate && OpfabAPIService.currentUserCard.endDate
                ? OpfabAPIService.currentUserCard.endDate
                : this.getEndDate()
        );
        const lttd = new DateField(
            this.lttdVisible,
            this.datesFromTemplate && OpfabAPIService.currentUserCard.lttd
                ? OpfabAPIService.currentUserCard.lttd
                : this.getLttd()
        );
        const expirationDate = new DateField(
            this.expirationDateVisible,
            this.datesFromTemplate && OpfabAPIService.currentUserCard.expirationDate
                ? OpfabAPIService.currentUserCard.expirationDate
                : this.getExpirationDate()
        );

        if (
            OpfabAPIService.currentUserCard.startDate ||
            OpfabAPIService.currentUserCard.endDate ||
            OpfabAPIService.currentUserCard.lttd ||
            OpfabAPIService.currentUserCard.expirationDate
        ) {
            this.datesFromTemplate = false;
        }

        this.datesFormValue = this.datesFromCardToEdit
            ? this.setDatesFromCardToEdit(startDate, endDate, lttd, expirationDate)
            : new DatesForm(startDate, endDate, lttd, expirationDate);

        this.currentStartDate = this.datesFormValue.startDate.initialEpochDate;
        this.currentEndDate = this.datesFormValue.endDate.initialEpochDate;
        this.currentLttd = this.datesFormValue.lttd.initialEpochDate;
        this.currentExpirationDate = this.datesFormValue.expirationDate.initialEpochDate;
    }

    private setDatesFromCardToEdit(
        startDate: DateField,
        endDate: DateField,
        lttd: DateField,
        expirationDate: DateField
    ): DatesForm {
        if (this.cardToEdit.card.startDate) startDate.initialEpochDate = this.cardToEdit.card.startDate;
        if (this.cardToEdit.card.endDate) endDate.initialEpochDate = this.cardToEdit.card.endDate;
        if (this.cardToEdit.card.lttd) lttd.initialEpochDate = this.cardToEdit.card.lttd;
        if (this.cardToEdit.card.expirationDate) expirationDate.initialEpochDate = this.cardToEdit.card.expirationDate;
        this.datesFromCardToEdit = false;
        return new DatesForm(startDate, endDate, lttd, expirationDate);
    }

    private findUserEntitiesAllowedToSendCard(): Array<any> {
        const entitiesList = [];

        let allowedUserEntities = UserService.getCurrentUserWithPerimeters().userData.entities;
        if (this.userCardConfiguration?.publisherList?.length > 0) {
            const configuredPublisherList = [];
            EntitiesService.resolveEntities(this.userCardConfiguration.publisherList).forEach((e) =>
                configuredPublisherList.push(e.id)
            );

            allowedUserEntities = allowedUserEntities.filter((entity) => configuredPublisherList.includes(entity));
        }

        allowedUserEntities.forEach((userEntityId) => {
            const entity = EntitiesService.getEntities().find((e) => e.id === userEntityId);
            if (entity.roles?.includes(RolesEnum.CARD_SENDER))
                entitiesList.push({value: entity.id, label: entity.name});
        });
        return entitiesList;
    }

    private findPublisherForCreatingUsercard(): string {
        if (this.userEntitiesAllowedToSendCardOptions && this.userEntitiesAllowedToSendCardOptions.length === 1)
            return this.userEntitiesAllowedToSendCardOptions[0].value;
        return this.cardEmitterForm.getSelectedCardEmitter();
    }

    public displayForm() {
        return this.publisherForCreatingUsercard && !this.emptyProcessList && !this.isReadOnlyUser;
    }

    public setEmptyProcessList(): void {
        this.emptyProcessList = true;
    }

    public onStartDateChange() {
        const startDate = this.datesForm.getStartDateAsEpoch();
        this.currentStartDate = startDate;
        OpfabAPIService.currentUserCard.startDate = startDate;
    }

    public onEndDateChange() {
        const endDate = this.datesForm.getEndDateAsEpoch();
        this.currentEndDate = endDate;
        OpfabAPIService.currentUserCard.endDate = endDate;
    }

    public onLttdChange() {
        const lttd = this.datesForm.getLttdAsEpoch();
        this.currentLttd = lttd;
        OpfabAPIService.currentUserCard.lttd = lttd;
    }

    public onExpirationDateChange() {
        const expirationDate = this.datesForm.getExpirationDateAsEpoch();
        this.currentExpirationDate = expirationDate;
        OpfabAPIService.currentUserCard.expirationDate = expirationDate;
    }

    public stateChanged(event: any) {
        this.selectedStateId = event.state;
        this.selectedProcessId = event.selectedProcessId;
        OpfabAPIService.currentUserCard.state = event.state;
        OpfabAPIService.currentUserCard.processId = event.selectedProcessId;
        OpfabAPIService.currentUserCard.startDate = null;
        OpfabAPIService.currentUserCard.endDate = null;
        OpfabAPIService.currentUserCard.lttd = null;
        OpfabAPIService.currentUserCard.expirationDate = null;
        OpfabAPIService.currentUserCard.initialSeverity = null;

        this.userCardConfiguration = ProcessesService.getProcess(this.selectedProcessId).states.get(
            this.selectedStateId
        ).userCard;
        this.setFieldsVisibility();
        if (!this.cardToEdit && !this.cardToCopy) {
            this.initialSelectedRecipients = [];
            this.initialSelectedRecipientsForInformation = [];
        }

        this.setPublisherForCreatingUsercard();
        if (this.cardIdToEdit) this.setPublisherForCreatingUsercardForCardToEdit();

        this.loadTemplate();
    }

    public cardEmitterChanged(event: any) {
        OpfabAPIService.userCardTemplateInterface.setEntityUsedForSendingCard(event.emitter);
    }

    private setFieldsVisibility() {
        if (this.userCardConfiguration) {
            this.severityVisible = this.userCardConfiguration.severityVisible ?? true;
            this.startDateVisible = this.userCardConfiguration.startDateVisible ?? true;
            this.endDateVisible = this.userCardConfiguration.endDateVisible ?? true;
            this.lttdVisible = this.userCardConfiguration.lttdVisible ?? false;
            this.expirationDateVisible = this.userCardConfiguration.expirationDateVisible ?? false;
            this.recipientVisible = this.userCardConfiguration.recipientVisible ?? true;
            this.recipientForInformationVisible = this.userCardConfiguration.recipientForInformationVisible ?? false;
        } else {
            this.severityVisible = true;
            this.startDateVisible = true;
            this.endDateVisible = true;
            this.lttdVisible = true;
            this.expirationDateVisible = true;
            this.recipientVisible = true;
            this.recipientForInformationVisible = false;
        }
    }

    private loadTemplate() {
        let card;
        if (this.cardToEdit) {
            card = this.cardToEdit.card;
        } else if (this.cardToCopy) {
            card = this.cardToCopy.card;
        }

        const selected = ProcessesService.getProcess(this.selectedProcessId);

        if (this.userCardConfiguration?.template) {
            const templateName = this.userCardConfiguration.template;
            OpfabAPIService.initUserCardTemplateInterface();

            if (!this.cardToEdit) this.setDefaultDateFormValues();

            this.isLoadingCardTemplate = true;

            HandlebarsService.queryTemplate(this.selectedProcessId, selected.version, templateName)
                .pipe(map((t) => t(new DetailContext(card, null, null))))
                .subscribe({
                    next: (template) => {
                        this.isLoadingCardTemplate = false;
                        this.userCardTemplate = this.sanitizer.bypassSecurityTrustHtml(template);
                        setTimeout(() => {
                            // wait for DOM rendering
                            this.reinsertScripts();
                            this.setInitialDateFormValues();
                            if (this.severityVisible && !this.cardToEdit && !this.cardToCopy)
                                this.setInitialSeverityValue();
                            OpfabAPIService.userCardTemplateInterface.setEntityUsedForSendingCard(
                                this.findPublisherForCreatingUsercard()
                            );
                        }, 10);
                    },
                    error: (error) => {
                        this.isLoadingCardTemplate = false;

                        logger.error('WARNING impossible to load template ' + templateName + ', error = ' + error);
                        this.userCardTemplate = this.sanitizer.bypassSecurityTrustHtml('');
                    }
                });
        } else this.userCardTemplate = this.sanitizer.bypassSecurityTrustHtml('');
    }

    setInitialSeverityValue() {
        let initialSeverity;

        switch (OpfabAPIService.currentUserCard.initialSeverity) {
            case 'ALARM':
                initialSeverity = Severity.ALARM;
                break;
            case 'ACTION':
                initialSeverity = Severity.ACTION;
                break;
            case 'INFORMATION':
                initialSeverity = Severity.INFORMATION;
                break;
            case 'COMPLIANT':
                initialSeverity = Severity.COMPLIANT;
                break;
            default:
                initialSeverity = Severity.ALARM;
        }
        this.severityForm.get('severity').setValue(initialSeverity);
    }

    private reinsertScripts(): void {
        //bug eslint/prettier
        const scripts = <HTMLCollection>this.element.nativeElement.getElementsByTagName('script'); //eslint-disable-line
        Array.from(scripts).forEach((script) => {
            const scriptCopy = document.createElement('script');
            scriptCopy.type = (<HTMLScriptElement>script).type ? (<HTMLScriptElement>script).type : 'text/javascript';
            if (script.innerHTML) {
                scriptCopy.innerHTML = script.innerHTML;
            }
            scriptCopy.async = false;
            script.parentNode.replaceChild(scriptCopy, script);
        });
    }

    public prepareCard() {
        if (!this.isSpecificInformationValid()) return;
        this.specificInformation = OpfabAPIService.userCardTemplateInterface.getSpecificCardInformation();
        const startDate = this.getStartDate();
        const endDate = this.getEndDate();
        const lttd = this.getLttd();
        const expirationDate = this.getExpirationDate();
        let tags = this.getTags();
        let wktGeometry = this.getWktGeometry();
        let wktProjection = this.getWktProjection();
        if (!this.areDatesValid(startDate, endDate, lttd, expirationDate)) return;

        OpfabAPIService.currentUserCard.startDate = startDate;
        OpfabAPIService.currentUserCard.endDate = endDate;
        OpfabAPIService.currentUserCard.lttd = lttd;
        OpfabAPIService.currentUserCard.expirationDate = expirationDate;
        OpfabAPIService.currentUserCard.wktGeometry = wktGeometry;
        OpfabAPIService.currentUserCard.wktProjection = wktProjection;

        const title = this.specificInformation.card.title ? this.specificInformation.card.title : 'UNDEFINED';
        const selectedProcess = ProcessesService.getProcess(this.selectedProcessId);
        const cardEmitter = this.findPublisherForCreatingUsercard();
        this.recipients = this.getRecipients();
        let recipientsForInformation = this.getRecipientsForInformation();

        recipientsForInformation = this.removeEntityRecipientForInformationIfPresentInEntityRecipient(
            recipientsForInformation,
            this.recipients
        );

        this.isPreparingCard = true;

        CardService.postTranslateCardField(selectedProcess.id, selectedProcess.version, title).subscribe((response) => {
            this.isPreparingCard = false;
            const titleTranslated = response.body.translatedField;

            if (!tags) {
                tags = this.cardToEdit?.card.tags ? this.cardToEdit?.card.tags : null;
            }
            if (!wktGeometry) {
                wktGeometry = this.cardToEdit?.card.wktGeometry ? this.cardToEdit?.card.wktGeometry : null;
            }
            if (!wktProjection) {
                wktProjection = this.cardToEdit?.card.wktProjection ? this.cardToEdit?.card.wktProjection : null;
            }

            this.card = {
                id: 'dummyId',
                publishDate: null,
                publisher: cardEmitter,
                publisherType: 'ENTITY',
                processVersion: selectedProcess.version,
                process: selectedProcess.id,
                processInstanceId: this.getProcessInstanceId(),
                state: this.selectedStateId,
                startDate: startDate,
                endDate: endDate,
                expirationDate: expirationDate,
                lttd: lttd,
                severity: this.getSeverity(),
                hasBeenAcknowledged: false,
                hasBeenRead: false,
                userRecipients: [],
                entityRecipients: this.recipients.concat(recipientsForInformation),
                entityRecipientsForInformation: recipientsForInformation,
                entitiesAllowedToRespond: this.getEntitiesAllowedTorespond(this.recipients),
                entitiesRequiredToRespond: this.specificInformation.card.entitiesRequiredToRespond
                    ? this.specificInformation.card.entitiesRequiredToRespond
                    : [],
                entitiesAllowedToEdit: this.getValueOrNull(this.specificInformation.card.entitiesAllowedToEdit),
                externalRecipients: this.getValueOrNull(this.specificInformation.card.externalRecipients),
                title: title,
                titleTranslated: titleTranslated,
                summary: this.specificInformation.card.summary ? this.specificInformation.card.summary : 'UNDEFINED',
                secondsBeforeTimeSpanForReminder: this.getValueOrNull(
                    this.specificInformation.card.secondsBeforeTimeSpanForReminder
                ),
                timeSpans: this.getTimeSpans(this.specificInformation, startDate, endDate),
                keepChildCards: this.specificInformation.card.keepChildCards
                    ? this.specificInformation.card.keepChildCards
                    : false,
                actions: this.specificInformation.card.actions ? this.specificInformation.card.actions : [],
                data: this.specificInformation.card.data,
                rRule: this.specificInformation.card.rRule ? this.specificInformation.card.rRule : null,
                wktGeometry: wktGeometry,
                wktProjection: wktProjection,
                tags: tags
            } as Card;
            if (this.cardToEdit?.card.keepChildCards)
                logger.warn(
                    "Using deprecated field 'keepChildCards'. Use 'actions' field including 'KEEP_CHILD_CARDS' action instead"
                );

            this.childCards =
                this.cardToEdit?.card.keepChildCards ||
                this.cardToEdit?.card.actions?.includes(CardAction.KEEP_CHILD_CARDS)
                    ? this.cardToEdit.childCards
                    : [];
            if (
                this.specificInformation.childCard &&
                UserPermissionsService.isUserEnabledToRespond(
                    UserService.getCurrentUserWithPerimeters(),
                    this.card,
                    selectedProcess
                )
            ) {
                const userChildCard = this.getChildCard(this.specificInformation.childCard);
                this.childCards = this.childCards.filter((c) => c.publisher !== userChildCard.publisher);
                this.childCards.push(userChildCard);

                this.card = {...this.card, hasChildCardFromCurrentUserEntity: true};
            }
            this.displayPreview = true;

            this.updateRegularlyConnectedUsers();
        });
    }

    private updateRegularlyConnectedUsers() {
        this.getConnectedRecipients().subscribe();
        this.intervalForConnectedUsersUpdate = setInterval(() => {
            this.getConnectedRecipients().subscribe();
        }, 2000);
    }

    private getConnectedRecipients(): Observable<void> {
        return CardService.fetchConnectedRecipients(fromCardToLightCard(this.card)).pipe(
            map((connectedRecipients) => {
                this.connectedRecipients.clear();
                connectedRecipients.forEach((recipient) => {
                    this.connectedRecipients.add(recipient);
                });
            })
        );
    }

    private stopUpdateRegularlyConnectedUser() {
        this.connectedRecipients = new Set();
        clearInterval(this.intervalForConnectedUsersUpdate);
    }

    private removeEntityRecipientForInformationIfPresentInEntityRecipient(
        recipientsForInformation: string[],
        recipients
    ): string[] {
        if (recipientsForInformation) {
            recipientsForInformation = recipientsForInformation.filter(function (val) {
                return recipients.indexOf(val) === -1;
            });
        }
        return recipientsForInformation;
    }

    private isSpecificInformationValid(): boolean {
        const specificInformation = OpfabAPIService.userCardTemplateInterface.getSpecificCardInformation();
        if (!specificInformation) {
            logger.error(
                'ERROR : registered method getSpecificCardInformation in template return no information, card cannot be sent'
            );
            this.displayMessage('userCard.error.templateError', null, MessageLevel.ERROR);
            return false;
        }

        if (!specificInformation.valid) {
            this.displayMessage(specificInformation.errorMsg, null, MessageLevel.ERROR);
            return false;
        }

        if (!specificInformation.card) {
            logger.error(
                'ERROR : registered method getSpecificCardInformation in template return specificInformation with no card field, card cannot be sent'
            );
            this.displayMessage('userCard.error.templateError', null, MessageLevel.ERROR);
            return false;
        }

        return true;
    }

    private getStartDate(): number {
        let startDate = new Date().valueOf();
        this.usePublishDateForStartDate = true;
        if (this.startDateVisible) {
            startDate = this.currentStartDate;
            this.usePublishDateForStartDate = false;
        } else if (this.specificInformation?.card.startDate) {
            startDate = this.specificInformation.card.startDate;
            this.usePublishDateForStartDate = false;
        }
        return startDate;
    }

    private getEndDate(): number {
        let endDate = null;
        if (this.endDateVisible) endDate = this.currentEndDate;
        else {
            if (this.specificInformation?.card.endDate) endDate = this.specificInformation.card.endDate;
        }
        return endDate;
    }

    private getLttd(): number {
        let lttd = null;
        if (this.lttdVisible) lttd = this.currentLttd;
        else {
            if (this.specificInformation?.card.lttd) lttd = this.specificInformation.card.lttd;
        }
        return lttd;
    }

    private getTags(): Array<string> {
        let tags = null;
        if (this.specificInformation?.card.tags) {
            tags = this.specificInformation.card.tags;
        }
        return tags;
    }

    private getWktGeometry(): string {
        let wktGeometry = null;
        if (this.specificInformation?.card.wktGeometry) {
            wktGeometry = this.specificInformation.card.wktGeometry;
        }
        return wktGeometry;
    }

    private getWktProjection(): string {
        let wktProjection = null;
        if (this.specificInformation?.card.wktProjection) {
            wktProjection = this.specificInformation.card.wktProjection;
        }
        return wktProjection;
    }

    private getExpirationDate(): number {
        let expirationDate = null;
        if (this.expirationDateVisible) expirationDate = this.currentExpirationDate;
        else {
            if (this.specificInformation?.card.expirationDate)
                expirationDate = this.specificInformation.card.expirationDate;
        }
        return expirationDate;
    }

    private areDatesValid(startDate, endDate, lttd, expirationDate): boolean {
        if (endDate && endDate < startDate) {
            this.displayMessage('shared.endDateBeforeStartDate', '', MessageLevel.ERROR);
            return false;
        }

        const currentDateTime = new Date().valueOf();
        if (lttd && (lttd < startDate || lttd <= currentDateTime)) {
            this.displayMessage('userCard.error.lttdBeforeStartDate', '', MessageLevel.ERROR);
            return false;
        }

        if (lttd && endDate && lttd > endDate) {
            this.displayMessage('userCard.error.lttdAfterEndDate', '', MessageLevel.ERROR);
            return false;
        }
        if (expirationDate && expirationDate < startDate) {
            this.displayMessage('userCard.error.expirationDateBeforeStartDate', '', MessageLevel.ERROR);
            return false;
        }
        return true;
    }

    private getRecipients(): string[] {
        const recipients = [];
        if (this.recipientVisible) {
            this.recipientsForm.getSelectedRecipients().forEach((entity) => recipients.push(entity));
        }
        if (this.specificInformation.card.entityRecipients) {
            this.specificInformation.card.entityRecipients.forEach((entity) => {
                if (!recipients.includes(entity)) recipients.push(entity);
            });
        }

        return recipients;
    }

    private getRecipientsForInformation(): string[] {
        const recipientsForInformation = [];

        if (this.recipientForInformationVisible) {
            this.recipientsForm
                .getSelectedRecipientsForInformation()
                .forEach((entity) => recipientsForInformation.push(entity));
        }
        if (this.specificInformation.card.entityRecipientsForInformation) {
            this.specificInformation.card.entityRecipientsForInformation.forEach((entity) => {
                if (!recipientsForInformation.includes(entity)) {
                    recipientsForInformation.push(entity);
                }
            });
        }
        return recipientsForInformation;
    }

    private getEntitiesAllowedTorespond(recipients): string[] {
        let entitiesAllowedToRespond = [];
        if (ProcessesService.getProcess(this.selectedProcessId).states.get(this.selectedStateId).response) {
            const defaultEntityAllowedToRespond = [];
            recipients.forEach((entity) => defaultEntityAllowedToRespond.push(entity));

            entitiesAllowedToRespond = this.specificInformation.card.entitiesAllowedToRespond
                ? this.specificInformation.card.entitiesAllowedToRespond
                : defaultEntityAllowedToRespond;
        }
        return entitiesAllowedToRespond;
    }

    private getProcessInstanceId(): string {
        let processInstanceId;
        if (this.editCardMode) {
            processInstanceId = this.cardToEdit.card.processInstanceId;
        } else {
            processInstanceId = Guid.create().toString();
        }
        return processInstanceId;
    }

    private getSeverity() {
        let severity;
        if (this.severityVisible) {
            severity = this.severityForm.value['severity'];
        } else {
            severity =
                this.specificInformation.card.severity !== undefined
                    ? this.specificInformation.card.severity
                    : Severity.INFORMATION;
        }
        return severity;
    }

    private getValueOrNull(value) {
        return value !== undefined ? value : null;
    }

    private getTimeSpans(specificInformation, startDate, endDate): TimeSpan[] {
        let timeSpans = [];

        if (specificInformation.recurrence)
            logger.warn(
                "Using deprecated field 'specificInformation.recurrence'. Use 'specificInformation.timeSpan' field instead to configure timespans",
                LogOption.LOCAL
            );

        if (specificInformation.timeSpans) {
            specificInformation.timeSpans.forEach((ts) => {
                timeSpans.push(new TimeSpan(ts.startDate, ts.endDate, ts.recurrence));
            });
        } else if (specificInformation.viewCardInCalendar) {
            timeSpans = specificInformation.recurrence
                ? [new TimeSpan(startDate, endDate, specificInformation.recurrence)]
                : [new TimeSpan(startDate, endDate)];
        }
        return timeSpans;
    }

    private displayMessage(i18nKey: string, msg: string, severity: MessageLevel = MessageLevel.ERROR) {
        AlertMessageService.sendAlertMessage({message: msg, level: severity, i18n: {key: i18nKey}});
    }

    public getEntityName(id: string): string {
        if (this.useDescriptionFieldForEntityList)
            return EntitiesService.getEntities().find((entity) => entity.id === id).description;
        else return EntitiesService.getEntities().find((entity) => entity.id === id).name;
    }

    public getChildCard(childCard) {
        const cardState = ProcessesService.getProcess(this.selectedProcessId).states.get(this.selectedStateId);
        const publisher = childCard.publisher ?? this.card.publisher;
        return {
            id: null,
            uid: null,
            publisher: publisher,
            publisherType: this.card.publisherType,
            processVersion: this.card.processVersion,
            process: this.card.process,
            processInstanceId: `${this.card.processInstanceId}_${publisher}`,
            publishDate: this.card.publishDate,
            state: childCard.responseState ? childCard.responseState : cardState.response.state,
            startDate: this.card.startDate,
            endDate: this.card.endDate,
            expirationDate: this.card.expirationDate,
            severity: Severity.INFORMATION,
            entityRecipients: this.card.entityRecipients,
            userRecipients: this.card.userRecipients,
            groupRecipients: this.card.groupRecipients,
            externalRecipients: cardState.response.externalRecipients,
            title: childCard.title,
            summary: childCard.summary,
            data: childCard.data,
            parentCardId: this.card.id,
            initialParentCardUid: this.card.uid,
            hasBeenRead: false,
            hasBeenAcknowledged: false,
            hasChildCardFromCurrentUserEntity: false
        };
    }

    public confirm(): void {
        this.displayPreview = false;
        this.displaySendingCardInProgress = true;

        // If start date is set to publish date
        // we need to set again the start date to current time
        // because the user can stay on the preview for a long time
        // and start date is then too much in the past regarding the publish date
        if (this.usePublishDateForStartDate) this.card.startDate = new Date().valueOf();

        // Exclude card from sound and system notifications before publishing to avoid synchronization problems
        SoundNotificationService.lastSentCard(this.card.process + '.' + this.card.processInstanceId);
        SystemNotificationService.lastSentCard(this.card.process + '.' + this.card.processInstanceId);
        const selectedProcess = ProcessesService.getProcess(this.selectedProcessId);

        let childCard = null;

        if (
            this.specificInformation.childCard &&
            UserPermissionsService.isUserEnabledToRespond(
                UserService.getCurrentUserWithPerimeters(),
                this.card,
                selectedProcess
            )
        ) {
            childCard = this.specificInformation.childCard;
        }
        this.postCardAndChildCard(childCard);
    }

    private postCardAndChildCard(childCard: any) {
        CardService.postCard(fromCardToCardForPublishing(this.card)).subscribe((resp) => {
            if (resp.status !== ServerResponseStatus.OK) {
                const msg = resp.statusMessage ? resp.statusMessage : '';
                const error = resp.status ? resp.status : '';
                logger.error('Impossible to send card , message from service : ' + msg + '. Error message : ' + error);
                this.displayMessage('userCard.error.impossibleToSendCard', null, MessageLevel.ERROR);
                this.displaySendingCardInProgress = false;
            } else {
                if (childCard) {
                    this.sendAutomatedResponse(this.getChildCard(childCard), resp.data);
                } else this.displayMessage('userCard.cardSendWithNoError', null, MessageLevel.INFO);
            }

            this.userCardModal.dismiss('Close');
        });
    }

    sendAutomatedResponse(responseCard, cardCreationReport: CardCreationReportData) {
        const automatedResponseCard = {
            ...fromCardToCardForPublishing(responseCard),
            parentCardId: cardCreationReport.id,
            initialParentCardUid: cardCreationReport.uid
        };
        CardService.postCard(automatedResponseCard).subscribe((resp) => {
            if (resp.status !== ServerResponseStatus.OK) {
                const msg = resp.statusMessage ? resp.statusMessage : '';
                const error = resp.status ? resp.status : '';
                logger.error(
                    'Impossible to send child card , message from service : ' + msg + '. Error message : ' + error
                );
                this.displayMessage('userCard.error.impossibleToSendCard', null, MessageLevel.ERROR);
                this.displaySendingCardInProgress = false;
            } else {
                this.displayMessage('userCard.cardSendWithNoError', null, MessageLevel.INFO);
            }

            this.userCardModal.dismiss('Close');
        });
    }

    public cancel(): void {
        this.userCardModal.close();
    }

    public decline(): void {
        this.stopUpdateRegularlyConnectedUser();
        this.displayPreview = false;
    }
}
