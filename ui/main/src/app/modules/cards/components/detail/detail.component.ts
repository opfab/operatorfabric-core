/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {
    AfterViewChecked,
    Component,
    DoCheck,
    ElementRef,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {Card, CardForPublishing} from '@ofModel/card.model';
import {ProcessesService} from '@ofServices/processes.service';
import {HandlebarsService} from '../../services/handlebars.service';
import {DomSanitizer, SafeHtml, SafeResourceUrl} from '@angular/platform-browser';
import {AcknowledgmentAllowedEnum, State, TypeOfStateEnum} from '@ofModel/processes.model';
import {DetailContext} from '@ofModel/detail-context.model';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {selectAuthenticationState} from '@ofSelectors/authentication.selectors';
import {selectGlobalStyleState} from '@ofSelectors/global-style.selectors';
import {UserContext} from '@ofModel/user-context.model';
import {map, skip, takeUntil} from 'rxjs/operators';
import {CardService} from '@ofServices/card.service';
import {Subject} from 'rxjs';
import {Severity} from '@ofModel/light-card.model';
import {AppService, PageType} from '@ofServices/app.service';
import {User} from '@ofModel/user.model';
import {ClearLightCardSelection} from '@ofStore/actions/light-card.actions';
import {UserService} from '@ofServices/user.service';
import {EntitiesService} from '@ofServices/entities.service';
import {NgbModal, NgbModalOptions, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {TimeService} from '@ofServices/time.service';
import {AlertMessage} from '@ofStore/actions/alert.actions';
import {MessageLevel} from '@ofModel/message.model';
import {AcknowledgeService} from '@ofServices/acknowledge.service';
import {UserPermissionsService} from '@ofServices/user-permissions.service';
import {DisplayContext} from '@ofModel/templateGateway.model';
import {LightCardsStoreService} from '@ofServices/lightcards/lightcards-store.service';
import {FormControl, FormGroup} from '@angular/forms';
import {Utilities} from '../../../../common/utilities';

declare const templateGateway: any;

class EntityForCardHeader {
    id: string;
    name: string;
    color: string;
}
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
    BUTTON_TEXT_UNACK = 'cardAcknowledgment.button.unack',
    ERROR_MSG = 'response.error.ack'
}

const maxVisibleEntitiesForCardHeader = 3;

@Component({
    selector: 'of-detail',
    templateUrl: './detail.component.html',
    styleUrls: ['./detail.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DetailComponent implements OnChanges, OnInit, OnDestroy, AfterViewChecked, DoCheck {

    @Input() cardState: State;
    @Input() card: Card;
    @Input() childCards: Card[];

    @Input() currentPath: string;
    @Input() parentModalRef: NgbModalRef;
    @Input() screenSize: string;
    @Input() displayContext: any = DisplayContext.REALTIME;

    @ViewChild('cardDeletedWithNoErrorPopup') cardDeletedWithNoErrorPopupRef: TemplateRef<any>;
    @ViewChild('impossibleToDeleteCardPopup') impossibleToDeleteCardPopupRef: TemplateRef<any>;
    @ViewChild('userCard') userCardTemplate: TemplateRef<any>;
    @ViewChild('chooseEntityForResponsePopup') chooseEntityForResponsePopupRef: TemplateRef<any>;

    private selectEntityForm: FormGroup;

    public isUserEnabledToRespond = false;
    public lttdExpiredIsTrue: boolean;
    public isResponseLocked = false;
    public hrefsOfCssLink = new Array<SafeResourceUrl>();
    public fullscreen = false;
    public showButtons = false;
    public showCloseButton = false;
    public showMaxAndReduceButton = false;
    public showAckButton = false;
    public showActionButton = false;
    public showEditButton = false;
    public showDeleteButton = false;
    public showDetailCardHeader = false;
    public fromEntityOrRepresentative = null;
    public formattedPublishDate = '';
    public formattedPublishTime = '';
    public htmlTemplateContent: SafeHtml;
    public listVisibleEntitiesToRespond = [];
    public listDropdownEntitiesToRespond = [];
    public isCardAQuestionCard = false;
    public showExpiredIcon = true;
    public showExpiredLabel = true;
    public expiredLabel = 'feed.lttdFinished';
    public btnValidateLabel = 'response.btnValidate';
    public btnUnlockLabel = 'response.btnUnlock';
    public listEntitiesToAck = [];
    public lastResponse: Card;

    private lastCardSetToReadButNotYetOnFeed;
    private entityIdsAllowedOrRequiredToRespondAndAllowedToSendCards = [];
    private userEntityIdsPossibleForResponse = [];
    private userEntityOptionsDropdownList = [];
    private userEntityIdToUseForResponse = '';
    private userMemberOfAnEntityRequiredToRespondAndAllowedToSendCards = false;
    private userContext: UserContext;
    private unsubscribe$: Subject<void> = new Subject<void>();
    private modalRef: NgbModalRef;
    private user: User;

    constructor(private element: ElementRef,
        private businessconfigService: ProcessesService,
        private handlebars: HandlebarsService,
        private sanitizer: DomSanitizer,
        private store: Store<AppState>,
        private cardService: CardService,
        private _appService: AppService,
        private userService: UserService,
        private entitiesService: EntitiesService,
        private modalService: NgbModal,
        private time: TimeService,
        private acknowledgeService: AcknowledgeService,
        private userPermissionsService: UserPermissionsService,
        private lightCardsStoreService: LightCardsStoreService) {

            const userWithPerimeters = this.userService.getCurrentUserWithPerimeters();
            if (!!userWithPerimeters)
                this.user = userWithPerimeters.userData;
    }


    // START - ANGULAR COMPONENT LIFECYCLE

    ngOnInit() {
        this.reloadTemplateWhenGlobalStyleChange();
        if (this._appService.pageType !== PageType.ARCHIVE)
            this.integrateChildCardsInRealTime();

        this.selectEntityForm = new FormGroup({
            entity: new FormControl('')
        });

        this.cardService.getReceivedAcks().pipe(takeUntil(this.unsubscribe$)).subscribe(receivedAck => {
            if (receivedAck.cardUid === this.card.uid)
                this.addAckFromSubscription(receivedAck.entitiesAcks);
            });
    }

    ngAfterViewChecked() {
        this.adaptTemplateSize();
    }

    ngDoCheck() {
        const previous = this.lttdExpiredIsTrue;
        this.checkLttdExpired();
        if (previous !== this.lttdExpiredIsTrue) {
            templateGateway.setLttdExpired(this.lttdExpiredIsTrue);
            this.setButtonsVisibility();
        }
    }

    ngOnChanges(): void {
        templateGateway.initTemplateGateway();

        templateGateway.displayContext = this.displayContext;
        if (this.cardState.response != null && this.cardState.response !== undefined) {
            this.isCardAQuestionCard = true;
            this.computeEntitiesForResponses();
            this.isUserEnabledToRespond = this.userPermissionsService.isUserEnabledToRespond(this.userService.getCurrentUserWithPerimeters(),
                this.card, this.businessconfigService.getProcess(this.card.process));
            this.computeEntityOptionsDropdownListForResponse();
        } else this.isCardAQuestionCard = false;

        this.checkIfHasAlreadyResponded();
        this.lastResponse = this.getLastResponse();

        this.listEntitiesToAck = [];
        if (this.isCardPublishedByUserEntity() && !! this.card.entityRecipients)
            this.computeListEntitiesToAck();

        // this call is necessary done after computeEntitiesForResponses() and checkIfHasAlreadyResponded()
        // to have the variables for templateGateway set
        this.setTemplateGatewayVariables();

        this.initializeHrefsOfCssLink();
        this.initializeHandlebarsTemplates();
        this.markAsReadIfNecessary();
        this.setButtonsVisibility();
        this.showDetailCardHeader = (this.cardState.showDetailCardHeader === null) || (this.cardState.showDetailCardHeader === true);
        this.computeFromEntityOrRepresentative();
        this.formattedPublishDate = this.formatDate(this.card.publishDate);
        this.formattedPublishTime = this.formatTime(this.card.publishDate);
        this.computeLttdParams();

        this.btnValidateLabel = (!! this.cardState.validateAnswerButtonLabel) ? this.cardState.validateAnswerButtonLabel : 'response.btnValidate';
        this.btnUnlockLabel = (!! this.cardState.modifyAnswerButtonLabel) ? this.cardState.modifyAnswerButtonLabel : 'response.btnUnlock';
    }

    public displayCardAcknowledgedFooter(): boolean {
        return (this.cardState.acknowledgmentAllowed !== AcknowledgmentAllowedEnum.NEVER && this.listEntitiesToAck.length > 0);
    }

    private addAckFromSubscription(entitiesAcksToAdd: string[]) {
        if (!!this.listEntitiesToAck && this.listEntitiesToAck.length > 0) {
            entitiesAcksToAdd.forEach(entityAckToAdd => {
                const indexToUpdate = this.listEntitiesToAck.findIndex(entityToAck => entityToAck.id === entityAckToAdd);
                if (indexToUpdate !== -1)
                    this.listEntitiesToAck[indexToUpdate].color = 'green';
            });
        }
    }

    private computeListEntitiesToAck() {
        const resolved = new Set<string>();
        this.card.entityRecipients.forEach(entityRecipient => {
            const entity = this.entitiesService.getEntitiesFromIds([entityRecipient])[0];
            if (entity.entityAllowedToSendCard)
                resolved.add(entityRecipient);

            this.entitiesService.resolveChildEntities(entityRecipient).filter(c => c.entityAllowedToSendCard).forEach(c => resolved.add(c.id));
        });

        resolved.forEach(entityToAck => this.listEntitiesToAck.push({
            id: entityToAck,
            name: this.entitiesService.getEntityName(entityToAck),
            color: this.checkEntityAcknowledged(entityToAck) ? 'green' : '#ff6600'
        }));

    }

    private isCardPublishedByUserEntity(): boolean {
        return (this.card.publisherType === 'ENTITY') && (this.user.entities.includes(this.card.publisher));
    }

    ngOnDestroy() {
        this.updateLastReadCardStatusOnFeedIfNeeded();
        templateGateway.initTemplateGateway();
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    // END  - ANGULAR COMPONENT LIFECYCLE

    // For certain types of template , we need to reload it to take into account
    // the new css style (for example with chart done with chart.js)
    private reloadTemplateWhenGlobalStyleChange() {
        this.store.select(selectGlobalStyleState)
            .pipe(takeUntil(this.unsubscribe$), skip(1))
            .subscribe(() => this.initializeHandlebarsTemplates());
    }

    private initializeHandlebarsTemplates() {
        if (!this.userContext) {
            this.store.select(selectAuthenticationState).subscribe(authState => {
                this.userContext = new UserContext(
                    authState.identifier,
                    authState.token,
                    authState.firstName,
                    authState.lastName,
                    this.user.groups,
                    this.user.entities
                );
                this.initializeHandlebarsTemplatesProcess();
            });
        } else {
            this.initializeHandlebarsTemplatesProcess();
        }
    }

    private initializeHandlebarsTemplatesProcess() {
        const templateName = this.cardState.templateName;
        if (!!templateName) {
            this.handlebars.executeTemplate(templateName,
                new DetailContext(this.card, this.userContext, this.cardState.response))
                .subscribe({
                    next: (html) => {
                        this.htmlTemplateContent = this.sanitizer.bypassSecurityTrustHtml(html);
                        setTimeout(() => { // wait for DOM rendering
                            this.reinsertScripts();
                            setTimeout(() => { // wait for script loading before calling them in template
                                templateGateway.applyChildCards();
                                if (this.isResponseLocked) templateGateway.lockAnswer();
                                if (this.card.lttd && this.lttdExpiredIsTrue) {
                                    templateGateway.setLttdExpired(true);
                                }
                                templateGateway.setScreenSize(this.screenSize);
                                setTimeout(() => templateGateway.onTemplateRenderingComplete(), 10);
                            }, 10);
                        }, 10);
                    },
                    error: (error) => {
                        console.log(new Date().toISOString(), 'WARNING impossible to process template ', templateName , ":  ", error ) ;
                        this.htmlTemplateContent = this.sanitizer.bypassSecurityTrustHtml('');
                    }
                });
        } else {
            this.htmlTemplateContent = " TECHNICAL ERROR - NO TEMPLATE AVAILABLE";
            console.log(new Date().toISOString(), `WARNING No template for process ${this.card.process} version ${this.card.processVersion} with state ${this.card.state}`);
        }
    }

    private reinsertScripts(): void {
        const scripts = <HTMLScriptElement[]>this.element.nativeElement.getElementsByTagName('script');
        const scriptsInitialLength = scripts.length;
        for (let i = 0; i < scriptsInitialLength; i++) {
            const script = scripts[i];
            const scriptCopy = document.createElement('script');
            scriptCopy.type = script.type ? script.type : 'text/javascript';
            if (script.innerHTML) {
                scriptCopy.innerHTML = script.innerHTML;
            }
            scriptCopy.async = false;
            script.parentNode.replaceChild(scriptCopy, script);
        }
    }

    private integrateChildCardsInRealTime() {
       this.lightCardsStoreService.getNewLightChildCards()
            .pipe(
                takeUntil(this.unsubscribe$),
                map(lastCardLoaded => {
                    if (!!lastCardLoaded) {
                        if (lastCardLoaded.parentCardId === this.card.id &&
                            !this.childCards.map(childCard => childCard.uid).includes(lastCardLoaded.uid)) {
                            this.integrateOneChildCard(lastCardLoaded);
                        }
                    }
                })).subscribe();

        this.lightCardsStoreService.getDeletedChildCardsIds()
            .pipe(
                takeUntil(this.unsubscribe$),
                map(lastCardDeleted => {
                    if (!!lastCardDeleted && lastCardDeleted.parentCardId === this.card.id
                            && this.childCards.map(childCard => childCard.id).includes(lastCardDeleted.cardId)) {

                        this.removeChildCard(lastCardDeleted.cardId);

                    }
                })).subscribe();

    }

    private integrateOneChildCard(newChildCard: Card) {
        this.cardService.loadCard(newChildCard.id).subscribe(
            cardData => {
                const newChildArray = this.childCards.filter(childCard => childCard.id !== cardData.card.id);
                newChildArray.push(cardData.card);
                this.childCards = newChildArray;
                templateGateway.childCards = this.childCards;
                this.computeEntitiesForResponses();
                templateGateway.applyChildCards();
                this.checkIfHasAlreadyResponded();
                if (this.isResponseLocked)
                    templateGateway.lockAnswer();

                this.lastResponse = this.getLastResponse();
            }
        );
    }

    private removeChildCard(deletedChildCardId: string) {
        const newChildArray = this.childCards.filter(childCard => childCard.id !== deletedChildCardId);
        this.childCards = newChildArray;
        this.checkIfHasAlreadyResponded();
        templateGateway.isLocked = this.isResponseLocked;
        if (!this.isResponseLocked)
            templateGateway.unlockAnswer();
        templateGateway.childCards = this.childCards;
        this.computeEntitiesForResponses();
        templateGateway.applyChildCards();

        this.lastResponse = this.getLastResponse();
    }

    private computeEntitiesForResponses() {

        const entityIdsRequiredToRespondAndAllowedToSendCards = this.getEntityIdsRequiredToRespondAndAllowedToSendCards();
        this.entityIdsAllowedOrRequiredToRespondAndAllowedToSendCards = this.getEntityIdsAllowedOrRequiredToRespondAndAllowedToSendCards();
        console.log(new Date().toISOString(), ' Detail card - entities allowed to respond = ', this.entityIdsAllowedOrRequiredToRespondAndAllowedToSendCards);

        this.setEntitiesToRespondForCardHeader(entityIdsRequiredToRespondAndAllowedToSendCards);
        this.setUserEntityIdsPossibleForResponse();
        const userEntitiesRequiredToRespondAndAllowedToSendCards = entityIdsRequiredToRespondAndAllowedToSendCards.filter(entityId => this.user.entities.includes(entityId));
        this.userMemberOfAnEntityRequiredToRespondAndAllowedToSendCards = userEntitiesRequiredToRespondAndAllowedToSendCards.length > 0;
    }

    private getEntityIdsRequiredToRespondAndAllowedToSendCards() {
        if (!this.card.entitiesRequiredToRespond) return [];
        const entitiesAllowedToRespond = this.entitiesService.getEntitiesFromIds(this.card.entitiesRequiredToRespond);
        return this.entitiesService.resolveEntitiesAllowedToSendCards(entitiesAllowedToRespond).map(entity => entity.id);
    }

    private getEntityIdsAllowedOrRequiredToRespondAndAllowedToSendCards() {
        let entityIdsAllowedOrRequiredToRespond = [];
        if (this.card.entitiesAllowedToRespond)
            entityIdsAllowedOrRequiredToRespond = entityIdsAllowedOrRequiredToRespond.concat(this.card.entitiesAllowedToRespond);
        if (this.card.entitiesRequiredToRespond)
            entityIdsAllowedOrRequiredToRespond = entityIdsAllowedOrRequiredToRespond.concat(this.card.entitiesRequiredToRespond);

        const entitiesAllowedOrRequiredToRespond = this.entitiesService.getEntitiesFromIds(entityIdsAllowedOrRequiredToRespond);
        return this.entitiesService.resolveEntitiesAllowedToSendCards(entitiesAllowedOrRequiredToRespond).map(entity => entity.id);
    }


    private setEntitiesToRespondForCardHeader(entityIdsRequiredToRespondAndAllowedToSendCards) {
        if (this.entityIdsAllowedOrRequiredToRespondAndAllowedToSendCards) {

            // Entities for card header
            let listEntitiesToRespondForHeader;
            if (entityIdsRequiredToRespondAndAllowedToSendCards.length > 0)
                listEntitiesToRespondForHeader = this.createEntityHeaderFromList(entityIdsRequiredToRespondAndAllowedToSendCards);
            else
                listEntitiesToRespondForHeader = this.createEntityHeaderFromList(this.entityIdsAllowedOrRequiredToRespondAndAllowedToSendCards);

            listEntitiesToRespondForHeader.sort((a, b) => a.name?.localeCompare(b.name));

            this.listVisibleEntitiesToRespond = listEntitiesToRespondForHeader.length > maxVisibleEntitiesForCardHeader ?
                                                    listEntitiesToRespondForHeader.slice(0, maxVisibleEntitiesForCardHeader) :
                                                    listEntitiesToRespondForHeader;

            this.listDropdownEntitiesToRespond = listEntitiesToRespondForHeader.length > maxVisibleEntitiesForCardHeader ?
                                                    listEntitiesToRespondForHeader.slice(maxVisibleEntitiesForCardHeader) :
                                                    [];
        } else {
            this.listVisibleEntitiesToRespond = [];
            this.listDropdownEntitiesToRespond = [];
        }
    }

    private createEntityHeaderFromList(entities: string[]) {
        const entityHeader = new Array<EntityForCardHeader>();
        entities.forEach(entity => {
            const entityName = this.entitiesService.getEntityName(entity);
            if (entityName) {
                entityHeader.push(
                    {
                        id: entity,
                        name: entityName,
                        color: this.checkEntityAnswered(entity) ? "green" : "#ff6600"
                    });
            }
        });
        return entityHeader;
    }

    private setUserEntityIdsPossibleForResponse() {
        this.userEntityIdsPossibleForResponse = this.entityIdsAllowedOrRequiredToRespondAndAllowedToSendCards.filter(x => this.user.entities.includes(x));
        console.log(new Date().toISOString(), ' Detail card - users entities allowed to respond = ', this.userEntityIdsPossibleForResponse);
        if (this.userEntityIdsPossibleForResponse.length === 1)
            this.userEntityIdToUseForResponse = this.userEntityIdsPossibleForResponse[0];
    }

    private checkEntityAnswered(entity: string): boolean {
        return this.childCards.some(childCard => childCard.publisher === entity );
    }

    private checkEntityAcknowledged(entityId: string): boolean {
        return (!! this.card.entitiesAcks) && (this.card.entitiesAcks.includes(entityId));
    }

    private adaptTemplateSize() {
        const cardTemplate = document.getElementById('opfab-div-card-template');
        if (!!cardTemplate) {
            const diffWindow = cardTemplate.getBoundingClientRect();
            const divBtn = document.getElementById('div-detail-btn');

            let cardTemplateHeight = window.innerHeight - diffWindow.top;
            if (this._appService.pageType !== PageType.FEED) cardTemplateHeight -= 20;

            if (divBtn) {
                cardTemplateHeight -= divBtn.scrollHeight + 15;
            }

            cardTemplate.style.height = `${cardTemplateHeight}px`;
            cardTemplate.style.overflowX = 'hidden';
        }
    }

    private checkLttdExpired(): void {
        this.lttdExpiredIsTrue = (this.card.lttd != null && (this.card.lttd - new Date().getTime()) <= 0);
    }

    private computeLttdParams() {
        this.businessconfigService.queryProcess(this.card.process, this.card.processVersion).subscribe( process => {
            const state = process.extractState(this.card.state);
            if (state.type === TypeOfStateEnum.FINISHED) {
                this.showExpiredIcon = false;
                this.showExpiredLabel = false;
            } else if (this.isCardAQuestionCard) {
                this.showExpiredIcon = false;
                this.showExpiredLabel = true;
                this.expiredLabel = 'feed.responsesClosed';
            } else {
                this.showExpiredIcon = true;
                this.showExpiredLabel = true;
            }
        });
    }


    private setButtonsVisibility() {
        this.showButtons = this._appService.pageType !== PageType.ARCHIVE;
        if ((this._appService.pageType !== PageType.CALENDAR) && (this._appService.pageType !== PageType.MONITORING)) {
            this.showMaxAndReduceButton = true;
        }
        this.showCloseButton = true;
        this.showEditButton = this.doesTheUserHavePermissionToEditCard();
        this.showDeleteButton = this.doesTheUserHavePermissionToDeleteCard();
        this.showAckButton = this.isAcknowledgmentAllowed() && (this._appService.pageType !== PageType.CALENDAR);
        this.showActionButton = (!!this.cardState.response);
    }

    private doesTheUserHavePermissionToEditCard(): boolean {
        return this.userPermissionsService.doesTheUserHavePermissionToEditCard(this.userService.getCurrentUserWithPerimeters(), this.card);
    }

    private doesTheUserHavePermissionToDeleteCard(): boolean {
        return this.userPermissionsService.doesTheUserHavePermissionToDeleteCard(this.userService.getCurrentUserWithPerimeters(), this.card);
    }

    private isAcknowledgmentAllowed(): boolean {
        // default value is true
        if (!this.cardState.acknowledgmentAllowed) return true;

        return (this.cardState.acknowledgmentAllowed === AcknowledgmentAllowedEnum.ALWAYS ||
            (this.cardState.acknowledgmentAllowed === AcknowledgmentAllowedEnum.ONLY_WHEN_RESPONSE_DISABLED_FOR_USER &&
                (!this.isUserEnabledToRespond || (this.isUserEnabledToRespond && this.lttdExpiredIsTrue))));
    }

    private checkIfHasAlreadyResponded() {
        this.isResponseLocked = false;
        for (const e of this.childCards.map(c => c.publisher)) {
            if (this.user.entities.includes(e)) {
                this.isResponseLocked = true;
                break;
            }
        }
    }

    private getLastResponse(): Card {
        if (!!this.childCards && this.childCards.length > 0) {
            return [...this.childCards].sort( (a, b) => a.publishDate < b.publishDate ? 1 : -1)[0];
        }
        return null;
    }

    private setTemplateGatewayVariables() {
        templateGateway.childCards = this.childCards;
        templateGateway.isLocked = this.isResponseLocked;
        templateGateway.userAllowedToRespond = this.isUserEnabledToRespond;
        templateGateway.entitiesAllowedToRespond = this.entityIdsAllowedOrRequiredToRespondAndAllowedToSendCards;
        templateGateway.userMemberOfAnEntityRequiredToRespond = this.userMemberOfAnEntityRequiredToRespondAndAllowedToSendCards;
        templateGateway.entityUsedForUserResponse = this.userEntityIdToUseForResponse;
    }

    private initializeHrefsOfCssLink() {
        const styles = this.cardState.styles;
        this.hrefsOfCssLink = new Array<SafeResourceUrl>();
        if (!!styles) {
            const process = this.card.process;
            const processVersion = this.card.processVersion;
            styles.forEach(style => {
                const cssUrl = this.businessconfigService.computeBusinessconfigCssUrl(process, style, processVersion);
                // needed to instantiate href of link for css in component rendering
                const safeCssUrl = this.sanitizer.bypassSecurityTrustResourceUrl(cssUrl);
                this.hrefsOfCssLink.push(safeCssUrl);
            });
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
                if (this.card.id !== this.lastCardSetToReadButNotYetOnFeed.id) this.updateLastReadCardStatusOnFeedIfNeeded();
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

    private computeFromEntityOrRepresentative() {
        if (this.card.publisherType === 'ENTITY') {
            this.fromEntityOrRepresentative = this.entitiesService.getEntityName(this.card.publisher);

            if (!!this.card.representativeType && !!this.card.representative) {
                const representative = this.card.representativeType === 'ENTITY' ?
                    this.entitiesService.getEntityName(this.card.representative) : this.card.representative;

                this.fromEntityOrRepresentative += ' (' + representative + ')';
            }
        } else
            this.fromEntityOrRepresentative = null;
    }

    private displayMessage(i18nKey: string, msg: string, severity: MessageLevel = MessageLevel.ERROR) {
        this.store.dispatch(new AlertMessage({alertMessage: {message: msg, level: severity, i18n: {key: i18nKey}}}));
    }

    public formatDate(date: number) {
        return this.time.formatDate(date);
    }

    public formatTime(date: number) {
        return this.time.formatTime(date);
    }

    // START - METHODS CALLED ONLY FROM HTML COMPONENT

    get i18nPrefix() {
        return `${this.card.process}.${this.card.processVersion}.`;
    }

    get btnAckText(): string {
        return this.card.hasBeenAcknowledged ? AckI18nKeys.BUTTON_TEXT_UNACK : AckI18nKeys.BUTTON_TEXT_ACK;
    }

    public getResponsePublisher(resp: Card) {
        return this.entitiesService.getEntityName(resp.publisher)
    }

    public isSmallscreen() {
        return (window.innerWidth < 1000);
    }

    public openModal(content) {
        const modalOptions = {centered: true};
        this.modalRef = this.modalService.open(content, modalOptions);
    }

    public setFullScreen(active) {
        this.fullscreen = active;
        templateGateway.setScreenSize(active ? 'lg' : 'md');
    }

    public acknowledgeCard() {
        if (this.card.hasBeenAcknowledged) {
            this.acknowledgeService.deleteUserAcknowledgement(this.card.uid).subscribe(resp => {
                if (resp.status === 200 || resp.status === 204) {
                    this.card = {...this.card, hasBeenAcknowledged: false};
                    this.acknowledgeService.updateAcknowledgementOnLightCard(this.card.id, false);
                } else {
                    console.error('the remote acknowledgement endpoint returned an error status(%d)', resp.status);
                    this.displayMessage(AckI18nKeys.ERROR_MSG, null, MessageLevel.ERROR);
                }
            });
        } else {
            const entitiesAcks = [];
            const entities = this.entitiesService.getEntitiesFromIds(this.user.entities);
            entities.forEach(entity => {
                if (entity.entityAllowedToSendCard) // this avoids to display entities used only for grouping
                    entitiesAcks.push(entity.id);
            });
            this.acknowledgeService.postUserAcknowledgement(this.card.uid, entitiesAcks).subscribe(resp => {
                if (resp.status === 201 || resp.status === 200) {
                    this.acknowledgeService.updateAcknowledgementOnLightCard(this.card.id, true);
                    this.closeDetails();
                } else {
                    console.error('the remote acknowledgement endpoint returned an error status(%d)', resp.status);
                    this.displayMessage(AckI18nKeys.ERROR_MSG, null, MessageLevel.ERROR);
                }
            });
        }
    }

    public closeDetails() {
        this.updateLastReadCardStatusOnFeedIfNeeded();
        if (this.parentModalRef) {
            this.parentModalRef.close();
            this.store.dispatch(new ClearLightCardSelection());
        } else this._appService.closeDetails();
    }

    public declineDeleteCard(): void {
        this.modalRef.dismiss();
    }

    public confirmDeleteCard(): void {
        this.cardService.deleteCard(this.card)
            .subscribe({
                next: (resp) => {
                    const status = resp.status;
                    this.modalRef.close();
                    if (status === 200) {
                        this.closeDetails();
                        this.displayMessage("userCard.deleteCard.cardDeletedWithNoError", null, MessageLevel.INFO);
                    } else {
                        console.log('Impossible to delete card , error status from service : ', status);
                        this.displayMessage("userCard.deleteCard.error.impossibleToDeleteCard ", null, MessageLevel.ERROR);
                    }
                },
                error: (err) => {
                    console.error('Error when deleting card :', err);
                    this.modalRef.close();
                    this.displayMessage("userCard.deleteCard.error.impossibleToDeleteCard ", null, MessageLevel.ERROR);
                }
            });
    }

    public editCard(): void {

        // We close the card detail in the background to avoid interference when executing the template for the edition preview.
        // Otherwise, this can cause issues with templates functions referencing elements by id as there are two elements with the same id
        // in the document.
        this.closeDetails();
        if (!!this.parentModalRef) this.parentModalRef.close();

        const options: NgbModalOptions = {
            size: 'usercard',
            backdrop: 'static'
        };
        this.modalRef = this.modalService.open(this.userCardTemplate, options);

        // Once the edition is complete or canceled, we reopen the card detail (see above).
        this.modalRef.result.then(
            () => { // If modal is closed
                this._appService.reopenDetails(this.currentPath, this.card.id);
            },
            () => {
                this._appService.reopenDetails(this.currentPath, this.card.id);
            });

    }

    public unlockAnswer() {
        this.isResponseLocked = false;
        templateGateway.unlockAnswer();
    }

    public cancelEntityChoice(): void {
        this.modalRef.dismiss();
    }

    public computeEntityOptionsDropdownListForResponse(): void {
        this.userEntityOptionsDropdownList = [];
        this.userEntityIdsPossibleForResponse.forEach(entityId => {
            const entity = this.entitiesService.getEntities().find(e => e.id === entityId);
            this.userEntityOptionsDropdownList.push({value: entity.id, label: entity.name});
        });
        this.userEntityOptionsDropdownList.sort((a, b) => Utilities.compareObj(a.label, b.label));
    }

    public displayEntityChoicePopup() {
        this.userEntityIdToUseForResponse = '';
        this.selectEntityForm.get('entity').setValue(this.userEntityOptionsDropdownList[0].value);
        this.openModal(this.chooseEntityForResponsePopupRef);
    }

    public submitResponse() {
        if (this.userEntityIdsPossibleForResponse.length > 1)
            this.displayEntityChoicePopup();
        else
            this.submitResponse0();
    }

    public getSelectedEntity() {
        return this.selectEntityForm.value['entity'];
    }

    public submitEntityChoice() {
        this.modalRef.dismiss();
        this.userEntityIdToUseForResponse = this.getSelectedEntity();
        this.submitResponse0();
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

            this.cardService.postCard(card)
                .subscribe(
                    rep => {
                        if (rep.status !== 201) {
                            this.displayMessage(ResponseI18nKeys.SUBMIT_ERROR_MSG, null, MessageLevel.ERROR);
                            console.error(rep);
                        } else {
                            this.isResponseLocked = true;
                            templateGateway.lockAnswer();
                            this.displayMessage(ResponseI18nKeys.SUBMIT_SUCCESS_MSG, null, MessageLevel.INFO);
                        }
                    },
                    err => {
                        this.displayMessage(ResponseI18nKeys.SUBMIT_ERROR_MSG, null, MessageLevel.ERROR);
                        console.error(err);
                    }
                );

        } else {
            (responseData.errorMsg && responseData.errorMsg !== '') ?
                this.displayMessage(responseData.errorMsg, null, MessageLevel.ERROR) :
                this.displayMessage(ResponseI18nKeys.FORM_ERROR_MSG, null, MessageLevel.ERROR);
        }
    }

    // END - METHODS CALLED ONLY FROM HTML COMPONENT

}
