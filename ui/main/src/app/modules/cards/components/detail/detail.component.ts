/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
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
import {AcknowledgmentAllowedEnum, State} from '@ofModel/processes.model';
import {DetailContext} from '@ofModel/detail-context.model';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {selectAuthenticationState} from '@ofSelectors/authentication.selectors';
import {selectGlobalStyleState} from '@ofSelectors/global-style.selectors';
import {UserContext} from '@ofModel/user-context.model';
import {map, skip, takeUntil} from 'rxjs/operators';
import {selectLastCardLoaded} from '@ofStore/selectors/feed.selectors';
import {CardService} from '@ofServices/card.service';
import {Subject} from 'rxjs';
import {Severity} from '@ofModel/light-card.model';
import {AppService, PageType} from '@ofServices/app.service';
import {User} from '@ofModel/user.model';
import {ClearLightCardSelection, UpdateLightCardRead} from '@ofStore/actions/light-card.actions';
import {UserService} from '@ofServices/user.service';
import {EntitiesService} from '@ofServices/entities.service';
import {NgbModal, NgbModalOptions, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {TimeService} from '@ofServices/time.service';
import {AlertMessage} from '@ofStore/actions/alert.actions';
import {MessageLevel} from '@ofModel/message.model';
import {AcknowledgeService} from '@ofServices/acknowledge.service';
import {UserPermissionsService} from '@ofServices/user-permissions-.service';

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
    @Input() user: User;
    @Input() currentPath: string;
    @Input() parentModalRef: NgbModalRef;
    @Input() screenSize: string;

    @ViewChild('cardDeletedWithNoErrorPopup') cardDeletedWithNoErrorPopupRef: TemplateRef<any>;
    @ViewChild('impossibleToDeleteCardPopup') impossibleToDeleteCardPopupRef: TemplateRef<any>;
    @ViewChild('userCard') userCardTemplate: TemplateRef<any>;

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
    public showEditAndDeleteButton = false;
    public showDetailCardHeader = false;
    public fromEntityOrRepresentative = null;
    public formattedPublishDate = "";
    public formattedPublishTime = "";
    public htmlTemplateContent: SafeHtml;
    public listVisibleEntitiesToRespond = [];
    public listDropdownEntitiesToRespond = [];
    public isCardAQuestionCard = false;

    private lastCardSetToReadButNotYetOnFeed;
    private entityIdsAllowedOrRequiredToRespondAndAllowedToSendCards = [];
    private userEntityIdToUseForResponse: string;
    private userMemberOfAnEntityRequiredToRespondAndAllowedToSendCards = false;
    private userContext: UserContext;
    private unsubscribe$: Subject<void> = new Subject<void>();
    private modalRef: NgbModalRef;

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
        private userPermissionsService: UserPermissionsService) {
    }


    // START - ANGULAR COMPONENT LIFECYCLE 

    ngOnInit() {
        this.reloadTemplateWhenGlobalStyleChange();
        if (this._appService.pageType !== PageType.ARCHIVE) this.integrateChildCardsInRealTime();

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
        if (this.cardState.response != null && this.cardState.response !== undefined) {
            this.isCardAQuestionCard = true;
            this.computeEntitiesForResponses();
            this.isUserEnabledToRespond = this.userPermissionsService.isUserEnabledToRespond(this.userService.getCurrentUserWithPerimeters(),
                this.card, this.businessconfigService.getProcess(this.card.process));
        }
        else this.isCardAQuestionCard = false;

        this.checkIfHasAlreadyResponded();

        // this call is necessary done after computeEntitiesForResponses() and  checkIfHasAlreadyResponded() 
        // to have the variables for templateGateway set
        this.setTemplateGatewayVariables();

        this.initializeHrefsOfCssLink();
        this.initializeHandlebarsTemplates();
        this.markAsReadIfNecessary();
        this.setButtonsVisibility();
        this.showDetailCardHeader = (this.cardState.showDetailCardHeader === null) || (this.cardState.showDetailCardHeader === true);
        this.computeFromEntityOrRepresentative();
        this.formattedPublishDate = this.time.formatDate(this.card.publishDate);
        this.formattedPublishTime = this.time.formatTime(this.card.publishDate);
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
                            }, 10);
                        }, 10);
                    },
                    error: () => {
                        console.log(new Date().toISOString(), 'WARNING impossible to load template ', templateName);
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
        this.store.select(selectLastCardLoaded)
            .pipe(
                takeUntil(this.unsubscribe$),
                map(lastCardLoaded => {
                    if (!!lastCardLoaded) {
                        if (lastCardLoaded.parentCardId === this.card.id &&
                            !this.childCards.map(childCard => childCard.uid).includes(lastCardLoaded.uid)) {
                            this.integrateOneChildCard(lastCardLoaded);
                        }
                    }
                })).subscribe()
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
            }
        )
    }

    private computeEntitiesForResponses() {

        let entityIdsRequiredToRespondAndAllowedToSendCards = this.getEntityIdsRequiredToRespondAndAllowedToSendCards();
        this.entityIdsAllowedOrRequiredToRespondAndAllowedToSendCards = this.getEntityIdsAllowedOrRequiredToRespondAndAllowedToSendCards();
        console.log(new Date().toISOString(), ' Detail card - entities allowed to respond = ', this.entityIdsAllowedOrRequiredToRespondAndAllowedToSendCards);

        this.setEntitiesToRespondForCardHeader(entityIdsRequiredToRespondAndAllowedToSendCards);
        this.setUserEntityIdToUseForResponse();
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
            if (entityIdsRequiredToRespondAndAllowedToSendCards.length > 0) listEntitiesToRespondForHeader = this.createEntityHeaderFromList(entityIdsRequiredToRespondAndAllowedToSendCards);
            else listEntitiesToRespondForHeader = this.createEntityHeaderFromList(this.entityIdsAllowedOrRequiredToRespondAndAllowedToSendCards);

            this.listVisibleEntitiesToRespond = listEntitiesToRespondForHeader.length > maxVisibleEntitiesForCardHeader ? listEntitiesToRespondForHeader.slice(0, maxVisibleEntitiesForCardHeader) : listEntitiesToRespondForHeader;
            this.listDropdownEntitiesToRespond = listEntitiesToRespondForHeader.length > maxVisibleEntitiesForCardHeader ? listEntitiesToRespondForHeader.slice(maxVisibleEntitiesForCardHeader) : [];
        }
        else {
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

    private setUserEntityIdToUseForResponse() {
        const userEntityIdsAllowedToRespond = this.entityIdsAllowedOrRequiredToRespondAndAllowedToSendCards.filter(x => this.user.entities.includes(x));
        console.log(new Date().toISOString(), ' Detail card - users entities allowed to respond = ', userEntityIdsAllowedToRespond);
        if (userEntityIdsAllowedToRespond.length > 1)
            console.log(new Date().toISOString(), 'Warning : user can respond on behalf of more than one entity, so response is disabled');
        this.userEntityIdToUseForResponse = userEntityIdsAllowedToRespond.length === 1 ? userEntityIdsAllowedToRespond[0] : null;
    }

    private checkEntityAnswered(entity: string): boolean {
        return this.childCards.some(childCard => childCard.publisher === entity && childCard.initialParentCardUid === this.card.uid);
    }

    private adaptTemplateSize() {
        const cardTemplate = document.getElementById('opfab-div-card-template');
        if (!!cardTemplate) {
            const diffWindow = cardTemplate.getBoundingClientRect();
            const divBtn = document.getElementById('div-detail-btn');

            let cardTemplateHeight = window.innerHeight - diffWindow.top;
            if (this._appService.pageType !== PageType.FEED) cardTemplateHeight -= 50;

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


    private setButtonsVisibility() {
        this.showButtons = this._appService.pageType !== PageType.ARCHIVE;
        if ((this._appService.pageType !== PageType.CALENDAR) && (this._appService.pageType !== PageType.MONITORING)) {
            this.showMaxAndReduceButton = true;
        }
        this.showCloseButton = true;
        this.showEditAndDeleteButton = this.doesTheUserHavePermissionToDeleteOrEditCard();
        this.showAckButton = this.isAcknowledgmentAllowed() && (this._appService.pageType !== PageType.CALENDAR);
        this.showActionButton = (!!this.cardState.response);
    }

    private doesTheUserHavePermissionToDeleteOrEditCard(): boolean {
        return this.userPermissionsService.doesTheUserHavePermissionToDeleteOrEditCard(this.userService.getCurrentUserWithPerimeters(), this.card);
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

    private setTemplateGatewayVariables() {
        templateGateway.childCards = this.childCards;
        templateGateway.isLocked = this.isResponseLocked;
        templateGateway.userAllowedToRespond = this.isUserEnabledToRespond;
        templateGateway.entitiesAllowedToRespond = this.entityIdsAllowedOrRequiredToRespondAndAllowedToSendCards;
        templateGateway.userMemberOfAnEntityRequiredToRespond = this.userMemberOfAnEntityRequiredToRespondAndAllowedToSendCards;
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
            // we do not set now the card as read in the store , as we want to keep
            // the card as unread in the feed
            // we will set it read in the feed when
            //  - we close the card
            //  - we exit the feed (i.e destroy the card)
            //  - we change card

            if (this.lastCardSetToReadButNotYetOnFeed) {
                // if the user has change selected card in feed , set the previous read card as read in the feed
                if (this.card.id != this.lastCardSetToReadButNotYetOnFeed.id) this.updateLastReadCardStatusOnFeedIfNeeded();
            }
            this.lastCardSetToReadButNotYetOnFeed = this.card;
            this.cardService.postUserCardRead(this.card.uid).subscribe();
        }
        else this.updateLastReadCardStatusOnFeedIfNeeded();
    }

    private updateLastReadCardStatusOnFeedIfNeeded() {
        if (this.lastCardSetToReadButNotYetOnFeed) {
            this.store.dispatch(new UpdateLightCardRead({cardId: this.lastCardSetToReadButNotYetOnFeed.id, hasBeenRead: true}));
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

    //START - METHODS CALLED ONLY FROM HTML COMPONENT  

    get i18nPrefix() {
        return `${this.card.process}.${this.card.processVersion}.`;
    }

    get btnAckText(): string {
        return this.card.hasBeenAcknowledged ? AckI18nKeys.BUTTON_TEXT_UNACK : AckI18nKeys.BUTTON_TEXT_ACK;
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
            this.acknowledgeService.postUserAcknowledgement(this.card.uid).subscribe(resp => {
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

    public submitResponse() {

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
