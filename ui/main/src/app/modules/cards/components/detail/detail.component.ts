/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {
    Component,
    DoCheck,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    SimpleChanges,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {Card, CardForPublishing} from '@ofModel/card.model';
import {ProcessesService} from '@ofServices/processes.service';
import {SafeHtml} from '@angular/platform-browser';
import {AcknowledgmentAllowedEnum, State} from '@ofModel/processes.model';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {map, takeUntil} from 'rxjs/operators';
import {CardService} from '@ofServices/card.service';
import {Subject} from 'rxjs';
import {Severity} from '@ofModel/light-card.model';
import {AppService, PageType} from '@ofServices/app.service';
import {User} from '@ofModel/user.model';
import {ClearLightCardSelectionAction} from '@ofStore/actions/light-card.actions';
import {UserService} from '@ofServices/user.service';
import {EntitiesService} from '@ofServices/entities.service';
import {NgbModal,NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {AlertMessageAction} from '@ofStore/actions/alert.actions';
import {MessageLevel} from '@ofModel/message.model';
import {AcknowledgeService} from '@ofServices/acknowledge.service';
import {UserPermissionsService} from '@ofServices/user-permissions.service';
import {DisplayContext} from '@ofModel/templateGateway.model';
import {LightCardsStoreService} from '@ofServices/lightcards/lightcards-store.service';
import {FormControl, FormGroup} from '@angular/forms';
import {Utilities} from '../../../../common/utilities';
import {CardDetailsComponent} from '../card-details/card-details.component';
import {MultiSelectConfig} from '@ofModel/multiselect.model';

declare const templateGateway: any;


class FormResult {
    valid: boolean;
    errorMsg: string;
    responseCardData: any;
    responseState?: string;
}

const enum ResponseI18nKeys {
    FORM_ERROR_MSG = 'response.error.form',
    SUBMIT_ERROR_MSG = 'response.error.submit',
    SUBMIT_SUCCESS_MSG = 'response.submitSuccess'
}

const enum AckI18nKeys {
    BUTTON_TEXT_ACK = 'cardAcknowledgment.button.ack',
    BUTTON_TEXT_ACK_AND_CLOSE = 'cardAcknowledgment.button.ackAndClose',
    BUTTON_TEXT_UNACK = 'cardAcknowledgment.button.unack',
    ERROR_MSG = 'response.error.ack'
}


@Component({
    selector: 'of-detail',
    templateUrl: './detail.component.html',
    styleUrls: ['./detail.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DetailComponent implements OnChanges, OnInit, OnDestroy, DoCheck {
    @Input() cardState: State;
    @Input() card: Card;
    @Input() childCards: Card[];

    @Input() currentPath: string;
    @Input() parentModalRef: NgbModalRef;
    @Input() screenSize: string;
    @Input() displayContext: DisplayContext = DisplayContext.REALTIME;
    @Input() parentComponent: CardDetailsComponent;

    @ViewChild('chooseEntitiesForResponsePopup') chooseEntitiesForResponsePopupRef: TemplateRef<any>;

    private selectEntitiesForm: FormGroup<{
        entities: FormControl<[] | null>;
    }>;

    public isUserEnabledToRespond = false;
    public lttdExpiredIsTrue: boolean;
    public isResponseLocked = false;
    public sendingResponse: boolean;
    public fullscreen = false;
    public showButtons = false;
    public showCloseButton = false;
    public showMaxAndReduceButton = false;
    public showAckButton = false;
    public showActionButton = false;
    public showDetailCardHeader = false;
    public htmlTemplateContent: SafeHtml;
    public isCardAQuestionCard = false;
    public btnValidateLabel = 'response.btnValidate';
    public btnUnlockLabel = 'response.btnUnlock';
    public isCardProcessing = false;
    public templateOffset = 15;

    private lastCardSetToReadButNotYetOnFeed;
    private entityIdsAllowedOrRequiredToRespondAndAllowedToSendCards = [];
    private userEntityIdsPossibleForResponse = [];
    private userEntityOptionsDropdownList = [];
    private userEntityIdToUseForResponse = '';
    private userMemberOfAnEntityRequiredToRespondAndAllowedToSendCards = false;
    private unsubscribe$: Subject<void> = new Subject<void>();
    private modalRef: NgbModalRef;
    public ackOrUnackInProgress = false;

    public user: User;
    public multiSelectConfig: MultiSelectConfig = {
        labelKey: 'shared.entity',
        multiple: true,
        search: true
    };

    constructor(
        private businessconfigService: ProcessesService,
        private store: Store<AppState>,
        private cardService: CardService,
        private _appService: AppService,
        private userService: UserService,
        private entitiesService: EntitiesService,
        private modalService: NgbModal,
        private acknowledgeService: AcknowledgeService,
        private userPermissionsService: UserPermissionsService,
        private lightCardsStoreService: LightCardsStoreService
    ) {
        const userWithPerimeters = this.userService.getCurrentUserWithPerimeters();
        if (!!userWithPerimeters) this.user = userWithPerimeters.userData;
    }

    // START - ANGULAR COMPONENT LIFECYCLE

    ngOnInit() {
        if (this._appService.pageType !== PageType.ARCHIVE) this.integrateChildCardsInRealTime();

        this.selectEntitiesForm = new FormGroup({
            entities: new FormControl([])
        });


        if (this._appService.pageType === PageType.MONITORING || this._appService.pageType === PageType.CALENDAR) this.templateOffset = 35;
    }

    ngDoCheck() {
        if (templateGateway.setLttdExpired) {
            const previous = this.lttdExpiredIsTrue;
            this.checkLttdExpired();
            if (previous !== this.lttdExpiredIsTrue) {
                templateGateway.setLttdExpired(this.lttdExpiredIsTrue);
                this.setButtonsVisibility();
            }
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.isCardProcessing = false;

        if (this.cardState.response != null && this.cardState.response !== undefined) {
            this.isCardAQuestionCard = true;
            this.computeEntitiesForResponses();
            this.isUserEnabledToRespond = this.userPermissionsService.isUserEnabledToRespond(
                this.userService.getCurrentUserWithPerimeters(),
                this.card,
                this.businessconfigService.getProcess(this.card.process)
            );
            this.computeEntityOptionsDropdownListForResponse();
        } else this.isCardAQuestionCard = false;

        this.checkIfHasAlreadyResponded();


        this.markAsReadIfNecessary();
        this.showDetailCardHeader =
            !this.cardState.showDetailCardHeader || this.cardState.showDetailCardHeader === true;
        
        this.btnValidateLabel = !!this.cardState.validateAnswerButtonLabel
            ? this.cardState.validateAnswerButtonLabel
            : 'response.btnValidate';
        this.btnUnlockLabel = !!this.cardState.modifyAnswerButtonLabel
            ? this.cardState.modifyAnswerButtonLabel
            : 'response.btnUnlock';
    }

    public displayCardAcknowledgedFooter(): boolean {
        return (
            this.cardState.acknowledgmentAllowed !== AcknowledgmentAllowedEnum.NEVER &&
            !!this.card.entityRecipients && this.card.entityRecipients.length > 0 && this.isCardPublishedByUserEntity()
        );
    }

    private isCardPublishedByUserEntity(): boolean {
        return this.card.publisherType === 'ENTITY' && this.user.entities.includes(this.card.publisher);
    }


    ngOnDestroy() {
        this.updateLastReadCardStatusOnFeedIfNeeded();
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    // END  - ANGULAR COMPONENT LIFECYCLE

    public beforeTemplateRendering() {
        this.setTemplateGatewayVariables();
    }
    private setTemplateGatewayVariables() {
        templateGateway.childCards = this.childCards;
        templateGateway.isLocked = this.isResponseLocked;
        templateGateway.userAllowedToRespond = this.isUserEnabledToRespond;
        templateGateway.entitiesAllowedToRespond = this.entityIdsAllowedOrRequiredToRespondAndAllowedToSendCards;
        templateGateway.userMemberOfAnEntityRequiredToRespond =
            this.userMemberOfAnEntityRequiredToRespondAndAllowedToSendCards;
        templateGateway.entityUsedForUserResponse = this.userEntityIdToUseForResponse;
    }

    public afterTemplateRendering() {
        if (this.isResponseLocked) templateGateway.lockAnswer();
        if (this.card.lttd && this.lttdExpiredIsTrue) {
            templateGateway.setLttdExpired(true);
        }
        this.setButtonsVisibility();
    }

    private integrateChildCardsInRealTime() {
        this.lightCardsStoreService
            .getNewLightChildCards()
            .pipe(
                takeUntil(this.unsubscribe$),
                map((lastCardLoaded) => {
                    if (!!lastCardLoaded) {
                        if (
                            lastCardLoaded.parentCardId === this.card.id &&
                            !this.childCards.map((childCard) => childCard.uid).includes(lastCardLoaded.uid)
                        ) {
                            this.integrateOneChildCard(lastCardLoaded);
                        }
                    }
                })
            )
            .subscribe();

        this.lightCardsStoreService
            .getDeletedChildCardsIds()
            .pipe(
                takeUntil(this.unsubscribe$),
                map((lastCardDeleted) => {
                    if (
                        !!lastCardDeleted &&
                        lastCardDeleted.parentCardId === this.card.id &&
                        this.childCards.map((childCard) => childCard.id).includes(lastCardDeleted.cardId)
                    ) {
                        this.removeChildCard(lastCardDeleted.cardId);
                    }
                })
            )
            .subscribe();
    }

    private integrateOneChildCard(newChildCard: Card) {
        this.cardService.loadCard(newChildCard.id).subscribe((cardData) => {
            const newChildArray = this.childCards.filter((childCard) => childCard.id !== cardData.card.id);
            newChildArray.push(cardData.card);
            this.childCards = newChildArray;
            templateGateway.childCards = this.childCards;
            this.computeEntitiesForResponses();
            templateGateway.applyChildCards();
            this.checkIfHasAlreadyResponded();
            if (this.isResponseLocked) templateGateway.lockAnswer();

        });
    }

    private removeChildCard(deletedChildCardId: string) {
        const newChildArray = this.childCards.filter((childCard) => childCard.id !== deletedChildCardId);
        this.childCards = newChildArray;
        this.checkIfHasAlreadyResponded();
        templateGateway.isLocked = this.isResponseLocked;
        if (!this.isResponseLocked) templateGateway.unlockAnswer();
        templateGateway.childCards = this.childCards;
        this.computeEntitiesForResponses();
        templateGateway.applyChildCards();

    }

    private computeEntitiesForResponses() {
        const entityIdsRequiredToRespondAndAllowedToSendCards =
            this.getEntityIdsRequiredToRespondAndAllowedToSendCards();
        this.entityIdsAllowedOrRequiredToRespondAndAllowedToSendCards =
            this.getEntityIdsAllowedOrRequiredToRespondAndAllowedToSendCards();
        console.log(
            new Date().toISOString(),
            ' Detail card - entities allowed to respond = ',
            this.entityIdsAllowedOrRequiredToRespondAndAllowedToSendCards
        );

        this.setUserEntityIdsPossibleForResponse();
        const userEntitiesRequiredToRespondAndAllowedToSendCards =
            entityIdsRequiredToRespondAndAllowedToSendCards.filter((entityId) => this.user.entities.includes(entityId));
        this.userMemberOfAnEntityRequiredToRespondAndAllowedToSendCards =
            userEntitiesRequiredToRespondAndAllowedToSendCards.length > 0;
    }

    private getEntityIdsRequiredToRespondAndAllowedToSendCards() {
        if (!this.card.entitiesRequiredToRespond) return [];
        const entitiesAllowedToRespond = this.entitiesService.getEntitiesFromIds(this.card.entitiesRequiredToRespond);
        return this.entitiesService
            .resolveEntitiesAllowedToSendCards(entitiesAllowedToRespond)
            .map((entity) => entity.id);
    }

    private getEntityIdsAllowedOrRequiredToRespondAndAllowedToSendCards() {
        let entityIdsAllowedOrRequiredToRespond = [];
        if (this.card.entitiesAllowedToRespond)
            entityIdsAllowedOrRequiredToRespond = entityIdsAllowedOrRequiredToRespond.concat(
                this.card.entitiesAllowedToRespond
            );
        if (this.card.entitiesRequiredToRespond)
            entityIdsAllowedOrRequiredToRespond = entityIdsAllowedOrRequiredToRespond.concat(
                this.card.entitiesRequiredToRespond
            );

        const entitiesAllowedOrRequiredToRespond = this.entitiesService.getEntitiesFromIds(
            entityIdsAllowedOrRequiredToRespond
        );
        return this.entitiesService
            .resolveEntitiesAllowedToSendCards(entitiesAllowedOrRequiredToRespond)
            .map((entity) => entity.id);
    }


    private setUserEntityIdsPossibleForResponse() {
        this.userEntityIdsPossibleForResponse = this.entityIdsAllowedOrRequiredToRespondAndAllowedToSendCards.filter(
            (x) => this.user.entities.includes(x)
        );
        console.log(
            new Date().toISOString(),
            ' Detail card - users entities allowed to respond = ',
            this.userEntityIdsPossibleForResponse
        );
        if (this.userEntityIdsPossibleForResponse.length === 1)
            this.userEntityIdToUseForResponse = this.userEntityIdsPossibleForResponse[0];
    }


    private checkLttdExpired(): void {
        this.lttdExpiredIsTrue = this.card.lttd != null && this.card.lttd - new Date().getTime() <= 0;
    }



    private setButtonsVisibility() {
        this.showButtons = this._appService.pageType !== PageType.ARCHIVE;
        if (this._appService.pageType !== PageType.CALENDAR && this._appService.pageType !== PageType.MONITORING) {
            this.showMaxAndReduceButton = true;
        }
        this.showCloseButton = true;
        this.setAcknowledgeButtonVisibility();
        this.showActionButton = !!this.cardState.response;
    }

    private setAcknowledgeButtonVisibility() {
        this.showAckButton = this.isAcknowledgmentAllowed() && this._appService.pageType !== PageType.CALENDAR;
    }



    private isAcknowledgmentAllowed(): boolean {
        if (this.card.hasBeenAcknowledged && !this.cardState.cancelAcknowledgmentAllowed) return false;
        // default is true
        if (!this.cardState.acknowledgmentAllowed) return true;

        return (
            this.cardState.acknowledgmentAllowed === AcknowledgmentAllowedEnum.ALWAYS ||
            (this.cardState.acknowledgmentAllowed === AcknowledgmentAllowedEnum.ONLY_WHEN_RESPONSE_DISABLED_FOR_USER &&
                (!this.isUserEnabledToRespond || (this.isUserEnabledToRespond && this.lttdExpiredIsTrue)))
        );
    }

    private shouldCloseCardWhenUserAcknowledges(): boolean {
        return this.cardState.closeCardWhenUserAcknowledges;
    }

    private checkIfHasAlreadyResponded() {
        this.isResponseLocked = false;
        for (const e of this.childCards.map((c) => c.publisher)) {
            if (this.user.entities.includes(e)) {
                this.isResponseLocked = true;
                break;
            }
        }
    }

    private markAsReadIfNecessary() {
        if (this.card.hasBeenRead === false) {
            // we do not set now the card as read in the store, as we want to keep
            // the card as unread in the feed
            // we will set it read in the feed when
            //  - we close the card
            //  - we exit the feed (i.e destroy the card)
            //  - we change card

            if (this.lastCardSetToReadButNotYetOnFeed) {
                // if the user has changed selected card in feed, set the previous read card as read in the feed
                if (this.card.id !== this.lastCardSetToReadButNotYetOnFeed.id)
                    this.updateLastReadCardStatusOnFeedIfNeeded();
            }
            this.lastCardSetToReadButNotYetOnFeed = this.card;
            this.cardService.postUserCardRead(this.card.uid).subscribe();
        } else this.updateLastReadCardStatusOnFeedIfNeeded();
    }

    private updateLastReadCardStatusOnFeedIfNeeded() {
        if (this.lastCardSetToReadButNotYetOnFeed) {
            this.lightCardsStoreService.setLightCardRead(this.lastCardSetToReadButNotYetOnFeed.id, true);
            this.lastCardSetToReadButNotYetOnFeed = null;
        }
    }

    private displayMessage(i18nKey: string, msg: string, severity: MessageLevel = MessageLevel.ERROR) {
        this.store.dispatch(
            new AlertMessageAction({alertMessage: {message: msg, level: severity, i18n: {key: i18nKey}}})
        );
    }


    // START - METHODS CALLED ONLY FROM HTML COMPONENT

    get i18nPrefix() {
        return `${this.card.process}.${this.card.processVersion}.`;
    }

    get btnAckText(): string {
        if (this.card.hasBeenAcknowledged) return AckI18nKeys.BUTTON_TEXT_UNACK
        else if (this.shouldCloseCardWhenUserAcknowledges()) return AckI18nKeys.BUTTON_TEXT_ACK_AND_CLOSE
        else return AckI18nKeys.BUTTON_TEXT_ACK;
    }


    public isSmallscreen() {
        return window.innerWidth < 1000;
    }

    public openModal(content) {
        const modalOptions = {centered: true};
        this.modalRef = this.modalService.open(content, modalOptions);
    }

    public setFullScreen(active) {
        this.fullscreen = active;
        if (!!this.parentComponent) this.parentComponent.screenSize = active ? 'lg' : 'md';
    }

    public acknowledgeCard() {
        this.ackOrUnackInProgress = true;

        if (this.card.hasBeenAcknowledged) {
            this.cancelAcknowledgement();
        } else {
            const entitiesAcks = [];
            const entities = this.entitiesService.getEntitiesFromIds(this.user.entities);
            entities.forEach((entity) => {
                if (entity.entityAllowedToSendCard)
                    // this avoids to display entities used only for grouping
                    entitiesAcks.push(entity.id);
            });
            this.acknowledgeService.postUserAcknowledgement(this.card.uid, entitiesAcks).subscribe((resp) => {
                this.ackOrUnackInProgress = false;
                if (resp.status === 201 || resp.status === 200) {
                    this.acknowledgeService.updateAcknowledgementOnLightCard(this.card.id, true);
                    this.card = {...this.card, hasBeenAcknowledged: true};
                    this.setAcknowledgeButtonVisibility();
                    if (this.shouldCloseCardWhenUserAcknowledges()) this.closeDetails();
                } else {
                    console.error('the remote acknowledgement endpoint returned an error status(%d)', resp.status);
                    this.displayMessage(AckI18nKeys.ERROR_MSG, null, MessageLevel.ERROR);
                }
            });
        }
    }

    private cancelAcknowledgement() {
        this.acknowledgeService.deleteUserAcknowledgement(this.card.uid).subscribe((resp) => {
            this.ackOrUnackInProgress = false;
            if (resp.status === 200 || resp.status === 204) {
                this.card = {...this.card, hasBeenAcknowledged: false};
                this.acknowledgeService.updateAcknowledgementOnLightCard(this.card.id, false);
            } else {
                console.error('the remote acknowledgement endpoint returned an error status(%d)', resp.status);
                this.displayMessage(AckI18nKeys.ERROR_MSG, null, MessageLevel.ERROR);
            }
        });
    }

    public closeDetails() {
        this.updateLastReadCardStatusOnFeedIfNeeded();
        if (this.parentModalRef) {
            this.parentModalRef.close();
            this.store.dispatch(new ClearLightCardSelectionAction());
        } else this._appService.closeDetails();
    }



    public unlockAnswer() {
        this.isResponseLocked = false;
        templateGateway.unlockAnswer();
    }

    public cancelEntitiesChoice(): void {
        this.modalRef.dismiss();
    }

    private computeEntityOptionsDropdownListForResponse(): void {
        this.userEntityOptionsDropdownList = [];
        this.userEntityIdsPossibleForResponse.forEach((entityId) => {
            const entity = this.entitiesService.getEntities().find((e) => e.id === entityId);
            this.userEntityOptionsDropdownList.push({value: entity.id, label: entity.name});
        });
        this.userEntityOptionsDropdownList.sort((a, b) => Utilities.compareObj(a.label, b.label));
    }
    
    private displayEntitiesChoicePopup() {
        this.userEntityIdToUseForResponse = '';
        this.selectEntitiesForm.get('entities').setValue(this.userEntityOptionsDropdownList[0].value);
        this.openModal(this.chooseEntitiesForResponsePopupRef);
    }

    public submitResponse() {
        if (this.userEntityIdsPossibleForResponse.length > 1) this.displayEntitiesChoicePopup();
        else this.submitResponse0();
    }

    public getSelectedEntities() {
        return this.selectEntitiesForm.value['entities'];
    }

    public submitEntitiesChoice() {
        this.modalRef.dismiss();

        this.getSelectedEntities().forEach(selectedEntity => {
            this.userEntityIdToUseForResponse = selectedEntity;
            this.submitResponse0();
        });
    }

    public submitResponse0() {
        const responseData: FormResult = templateGateway.getUserResponse();

        if (responseData.valid) {
            const card: CardForPublishing = {
                publisher: this.userEntityIdToUseForResponse,
                publisherType: 'ENTITY',
                processVersion: this.card.processVersion,
                process: this.card.process,
                processInstanceId: `${this.card.processInstanceId}_${this.userEntityIdToUseForResponse}`,
                state: responseData.responseState ? responseData.responseState : this.cardState.response.state,
                startDate: this.card.startDate,
                endDate: this.card.endDate,
                severity: Severity.INFORMATION,
                entityRecipients: this.card.entityRecipients,
                userRecipients: this.card.userRecipients,
                groupRecipients: this.card.groupRecipients,
                externalRecipients: this.cardState.response.externalRecipients,
                title: this.card.title,
                summary: this.card.summary,
                data: responseData.responseCardData,
                parentCardId: this.card.id,
                initialParentCardUid: this.card.uid
            };
            this.sendingResponse = true;
            this.cardService.postCard(card).subscribe(
                (rep) => {
                    this.sendingResponse = false;
                    if (rep.status !== 201) {
                        this.displayMessage(ResponseI18nKeys.SUBMIT_ERROR_MSG, null, MessageLevel.ERROR);
                        console.error(rep);
                    } else {
                        this.isResponseLocked = true;
                        templateGateway.lockAnswer();
                        this.displayMessage(ResponseI18nKeys.SUBMIT_SUCCESS_MSG, null, MessageLevel.INFO);
                    }
                },
                (err) => {
                    this.sendingResponse = false;
                    this.displayMessage(ResponseI18nKeys.SUBMIT_ERROR_MSG, null, MessageLevel.ERROR);
                    console.error(err);
                }
            );
        } else {
            responseData.errorMsg && responseData.errorMsg !== ''
                ? this.displayMessage(responseData.errorMsg, null, MessageLevel.ERROR)
                : this.displayMessage(ResponseI18nKeys.FORM_ERROR_MSG, null, MessageLevel.ERROR);
        }
    }

    // END - METHODS CALLED ONLY FROM HTML COMPONENT
}
