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
import {AcknowledgmentAllowedEnum, State as CardState} from '@ofModel/processes.model';
import {DetailContext} from '@ofModel/detail-context.model';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {selectAuthenticationState} from '@ofSelectors/authentication.selectors';
import {selectGlobalStyleState} from '@ofSelectors/global-style.selectors';
import {UserContext} from '@ofModel/user-context.model';
import {map, skip, take, takeUntil} from 'rxjs/operators';
import {fetchLightCard, selectLastCardLoaded} from '@ofStore/selectors/feed.selectors';
import {CardService} from '@ofServices/card.service';
import {Subject} from 'rxjs';
import {LightCard, Severity} from '@ofModel/light-card.model';
import {AppService, PageType} from '@ofServices/app.service';
import {User} from '@ofModel/user.model';
import {Map} from '@ofModel/map';
import {userRight} from '@ofModel/userWithPerimeters.model';
import {ClearLightCardSelection, UpdateALightCard} from '@ofStore/actions/light-card.actions';
import {UserService} from '@ofServices/user.service';
import {EntitiesService} from '@ofServices/entities.service';
import {NgbModal, NgbModalOptions, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {ConfigService} from '@ofServices/config.service';
import {TimeService} from '@ofServices/time.service';
import {AlertMessage} from '@ofStore/actions/alert.actions';
import {MessageLevel} from '@ofModel/message.model';
import {RightsEnum} from '@ofModel/perimeter.model';
import {AcknowledgeService} from '@ofServices/acknowledge.service';
import {ActionService} from '@ofServices/action.service';


declare const templateGateway: any;

class Message {
    text: string;
    display: boolean;
    className: ResponseMsgClass;
}

class EntityMessage {
    id: string;
    name: string;
    color: EntityMsgColor;
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
    SUBMIT_SUCCESS_MSG = 'response.submitSuccess',
    BUTTON_TITLE = 'response.btnTitle'
}

const enum AckI18nKeys {
    BUTTON_TEXT_ACK = 'cardAcknowledgment.button.ack',
    BUTTON_TEXT_UNACK = 'cardAcknowledgment.button.unack',
    ERROR_MSG = 'response.error.ack'
}

const enum ResponseMsgClass {
    SUCCESS = 'opfab-alert-success',
    ERROR = 'opfab-alert-error'
}

const enum EntityMsgColor {
    GREEN = 'green',
    ORANGE = '#ff6600'
}

const maxVisibleEntitiesToRespond = 3;

@Component({
    selector: 'of-detail',
    templateUrl: './detail.component.html',
    styleUrls: ['./detail.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DetailComponent implements OnChanges, OnInit, OnDestroy, AfterViewChecked, DoCheck {

    @Input() cardState: CardState;
    @Input() card: Card;
    @Input() childCards: Card[];
    @Input() user: User;
    @Input() currentPath: string;
    @Input() parentModalRef: NgbModalRef;
    @Input() screenSize: string;

    @ViewChild('cardDeletedWithNoErrorPopup') cardDeletedWithNoErrorPopupRef: TemplateRef<any>;
    @ViewChild('impossibleToDeleteCardPopup') impossibleToDeleteCardPopupRef: TemplateRef<any>;
    @ViewChild('userCard') userCardTemplate: TemplateRef<any>;

    public isActionEnabled = false;
    public lttdExpiredIsTrue: boolean;
    public hasAlreadyResponded = false;

    unsubscribe$: Subject<void> = new Subject<void>();
    public hrefsOfCssLink = new Array<SafeResourceUrl>();
    private _listEntitiesRequiredToRespond: string[];
    private _listEntitiesToRespondForHeader = new Array<EntityMessage>();
    private _userEntitiesAllowedToRespond: string[];
    private _htmlContent: SafeHtml;
    private _userContext: UserContext;
    message: Message = {display: false, text: undefined, className: undefined};

    public fullscreen = false;
    public showButtons = false;
    public showCloseButton = false;
    public showMaxAndReduceButton = false;
    public showAckButton = false;
    public showActionButton = false;
    public showEditAndDeleteButton = false ;
    public showDetailCardHeader = false;
    public fromEntityOrRepresentative = null;
    private lastCardSetToReadButNotYetOnFeed;

    modalRef: NgbModalRef;

    public displayDeleteResult = false;

    private static compareRightAction(userRights: RightsEnum, rightsAction: RightsEnum): boolean {
        return (userRight(userRights) - userRight(rightsAction)) === 0;
    }

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
                private configService: ConfigService,
                private time: TimeService,
                private acknowledgeService: AcknowledgeService,
                private actionService: ActionService) {
    }

    get isLocked() {
      return this.hasAlreadyResponded;
    }

    open(content) {
        const modalOptions = {centered: true};
        this.modalRef = this.modalService.open(content, modalOptions);
    }

    adaptTemplateSize() {
        const cardTemplate = document.getElementById('div-card-template');
        if (!!cardTemplate) {
            const diffWindow = cardTemplate.getBoundingClientRect();
            const divBtn = document.getElementById('div-detail-btn');

            let cardTemplateHeight = window.innerHeight - diffWindow.top;
            if (this._appService.pageType !== PageType.FEED) cardTemplateHeight -= 50;

            if (divBtn) {
                cardTemplateHeight -= divBtn.scrollHeight + 15 ;
            }

            cardTemplate.style.height = `${cardTemplateHeight}px`;
            cardTemplate.style.overflowX = 'hidden';
        }
    }

    ngAfterViewChecked() {
        this.adaptTemplateSize();
    }

    checkIfHasAlreadyResponded() {
      this.hasAlreadyResponded = false;
      for (const e of this.childCards.map(c => c.publisher)) {
        if (this.user.entities.includes(e)) {
          this.hasAlreadyResponded = true;
          break;
        }
      }
    }

    unlockAnswer() {
      this.hasAlreadyResponded = false;
      templateGateway.unlockAnswer();
    }

    ngOnInit() {
        this.reloadTemplateWhenGlobalStyleChange();
        if (this._appService.pageType !== PageType.ARCHIVE) {
            this.setEntitiesToRespond();
            this.integrateChildCardsInRealTime();
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

    private integrateOneChildCard(newChildCard:Card)
    {
        this.cardService.loadCard(newChildCard.id).subscribe (
            cardData => {
                const newChildArray = this.childCards.filter(childCard => childCard.id !== cardData.card.id);
                newChildArray.push(cardData.card);
                this.childCards = newChildArray;
                templateGateway.childCards = this.childCards;
                this.setEntitiesToRespond();
                templateGateway.applyChildCards();
            } 
        )
 
    }

    private setButtonsVisibility() {
        this.showButtons = this._appService.pageType !== PageType.ARCHIVE;
        if ((this._appService.pageType !== PageType.CALENDAR) && (this._appService.pageType !== PageType.MONITORING)) {
            this.showMaxAndReduceButton = true;
        }
        this.showCloseButton = true;
        this.showEditAndDeleteButton = this.doesTheUserHavePermissionToDeleteOrEditCard();
        this.showAckButton = this.isAcknowledgmentAllowed() && (this._appService.pageType !== PageType.CALENDAR);
        this.showActionButton =  (!!this.cardState.response);
    }

    ngDoCheck() {
        const previous = this.lttdExpiredIsTrue;
        this.checkLttdExpired();
        if (previous !== this.lttdExpiredIsTrue) {
            // Wait one second before sending the information to the template
            // to be synchronized with the countdown in card header and feed 
            setTimeout( () => templateGateway.setLttdExpired(this.lttdExpiredIsTrue),1000);
        }
    }

    checkLttdExpired(): void {
        this.lttdExpiredIsTrue = (this.card.lttd != null && Math.floor((this.card.lttd - new Date().getTime()) / 1000) <= 0);
    }

    get i18nPrefix() {
        return `${this.card.process}.${this.card.processVersion}.`;
    }

    get responseDataParameters(): Map<string> {
        return this.cardState.response.btnText ? this.cardState.response.btnText.parameters : undefined;
    }

    get btnText(): string {
      return ResponseI18nKeys.BUTTON_TITLE;
    }

    get responseDataExists(): boolean {
        return this.cardState.response != null && this.cardState.response !== undefined;
    }

    get btnAckText(): string {
        return this.card.hasBeenAcknowledged ? AckI18nKeys.BUTTON_TEXT_UNACK : AckI18nKeys.BUTTON_TEXT_ACK;
    }

    getFormattedPublishDate(): any {
        return  this.time.formatDate(this.card.publishDate);
    }

    getFormattedPublishTime(): any {
        return  this.time.formatTime(this.card.publishDate);
    }

    submitResponse() {

        const responseData: FormResult = templateGateway.getUserResponse();

        if (responseData.valid) {

            const card: CardForPublishing = {
                publisher: this.getUserEntityToRespond(),
                publisherType: 'ENTITY',
                processVersion: this.card.processVersion,
                process: this.card.process,
                processInstanceId: `${this.card.processInstanceId}_${this.getUserEntityToRespond()}`,
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
                .pipe(takeUntil(this.unsubscribe$))
                .subscribe(
                    rep => {
                        if (rep.status !== 201) {
                            this.displayMessage(ResponseI18nKeys.SUBMIT_ERROR_MSG, null, MessageLevel.ERROR);
                            console.error(rep);
                        } else {
                            this.hasAlreadyResponded = true;
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

    private displayMessage(i18nKey: string, msg: string, severity: MessageLevel = MessageLevel.ERROR) {
        this.store.dispatch(new AlertMessage({alertMessage: {message: msg, level: severity, i18n: {key: i18nKey}}}));
    }


    acknowledge() {
        if (this.card.hasBeenAcknowledged) {
            this.acknowledgeService.deleteUserAcknowledgement(this.card.uid).subscribe(resp => {
                if (resp.status === 200 || resp.status === 204) {
                    this.card = {...this.card, hasBeenAcknowledged: false};
                    this.updateAcknowledgementOnLightCard(false);
                } else {
                    console.error('the remote acknowledgement endpoint returned an error status(%d)', resp.status);
                    this.displayMessage(AckI18nKeys.ERROR_MSG, null, MessageLevel.ERROR);
                }
            });
        } else {
            this.acknowledgeService.postUserAcknowledgement(this.card.uid).subscribe(resp => {
                if (resp.status === 201 || resp.status === 200) {
                    this.updateAcknowledgementOnLightCard(true);
                    this.closeDetails();
                } else {
                    console.error('the remote acknowledgement endpoint returned an error status(%d)', resp.status);
                    this.displayMessage(AckI18nKeys.ERROR_MSG, null, MessageLevel.ERROR);
                }
            });
        }
    }

    updateAcknowledgementOnLightCard(hasBeenAcknowledged: boolean) {
        this.store.select(fetchLightCard(this.card.id)).pipe(take(1))
            .subscribe((lightCard: LightCard) => {
                // If the card has been acknowledged, set it as read as well otherwise leave it as is.
                // This is to prevent firing two updates, one for the ack and one for the read, which messed with sounds
                const hasBeenRead = hasBeenAcknowledged ? true : lightCard.hasBeenRead;
                const updatedLightCard = {...lightCard, hasBeenAcknowledged: hasBeenAcknowledged, hasBeenRead: hasBeenRead};
                this.store.dispatch(new UpdateALightCard({card: updatedLightCard}));
            });
    }

    markAsReadIfNecessary() {
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

    updateLastReadCardStatusOnFeedIfNeeded() {
        if (this.lastCardSetToReadButNotYetOnFeed) {
            this.store.select(fetchLightCard(this.lastCardSetToReadButNotYetOnFeed.id)).pipe(take(1))
                .subscribe((lightCard: LightCard) => {
                    const updatedLightCard = { ...lightCard, hasBeenRead: true };
                    this.store.dispatch(new UpdateALightCard({ card: updatedLightCard }));
                });
            this.lastCardSetToReadButNotYetOnFeed = null;
        }
    }

    closeDetails() {
        this.updateLastReadCardStatusOnFeedIfNeeded();
        if (this.parentModalRef)  {
            this.parentModalRef.close();
            this.store.dispatch(new ClearLightCardSelection());
        } else this._appService.closeDetails(this.currentPath);
    }

    // for certain types of template , we need to reload it to take into account
    // the new css style (for example with chart done with chart.js)
    private reloadTemplateWhenGlobalStyleChange() {
        this.store.select(selectGlobalStyleState)
            .pipe(takeUntil(this.unsubscribe$), skip(1))
            .subscribe(() => this.initializeHandlebarsTemplates());
    }

    ngOnChanges(): void {
        
        if (this.cardState.response != null && this.cardState.response !== undefined) {
            this.setEntitiesToRespond();
            this.setIsActionEnabled();
        }

        this.initializeHrefsOfCssLink();
        this.checkIfHasAlreadyResponded();
        this.initializeHandlebarsTemplates();
        this.markAsReadIfNecessary();
        this.message = {display: false, text: undefined, className: undefined};
        this.setButtonsVisibility();
        this.setShowDetailCardHeader();
        this.computeFromEntityOrRepresentative();
    }

    private setEntitiesToRespond() {
        this._listEntitiesToRespondForHeader = new Array<EntityMessage>();
        this._userEntitiesAllowedToRespond = [];

        let entitiesAllowedToRespondAndEntitiesRequiredToRespond = [];
        if (this.card.entitiesAllowedToRespond)
            entitiesAllowedToRespondAndEntitiesRequiredToRespond = entitiesAllowedToRespondAndEntitiesRequiredToRespond.concat(this.card.entitiesAllowedToRespond);
        if (this.card.entitiesRequiredToRespond)
            entitiesAllowedToRespondAndEntitiesRequiredToRespond = entitiesAllowedToRespondAndEntitiesRequiredToRespond.concat(this.card.entitiesRequiredToRespond);

        if (entitiesAllowedToRespondAndEntitiesRequiredToRespond) {

            const entitiesAllowedToRespond = this.entitiesService.getEntitiesFromIds(entitiesAllowedToRespondAndEntitiesRequiredToRespond);
            const allowed = this.entitiesService.resolveEntitiesAllowedToSendCards(entitiesAllowedToRespond).map(entity => entity.id).filter(x =>  x !== this.card.publisher);
            console.log(new Date().toISOString(), ' Detail card - entities allowed to respond = ', allowed);

            // This will be overwritten by the block below if entitiesRequiredToRespond is set and not empty/null
            // This is to avoid repeating the creation of the allowed list
            this._listEntitiesToRespondForHeader = this.createEntityHeaderFromList(allowed);

            this._userEntitiesAllowedToRespond = allowed.filter(x => this.user.entities.includes(x));
            console.log(new Date().toISOString(), ' Detail card - users entities allowed to respond = ', this._userEntitiesAllowedToRespond);
            if (this._userEntitiesAllowedToRespond.length > 1)
                console.log(new Date().toISOString(), 'Warning : user can respond on behalf of more than one entity, so response is disabled');
        }

        if (this.card.entitiesRequiredToRespond && this.card.entitiesRequiredToRespond.length > 0) {
            const entitiesRequiredToRespond = this.entitiesService.getEntitiesFromIds(this.card.entitiesRequiredToRespond);
            this._listEntitiesRequiredToRespond = this.entitiesService.resolveEntitiesAllowedToSendCards(entitiesRequiredToRespond).map(entity => entity.id);
            this._listEntitiesToRespondForHeader = this.createEntityHeaderFromList(this._listEntitiesRequiredToRespond);
        }
    }

    /** @param entities as list of strings
     * @return `EntityMessage` array (containing entity name and color based on response status)*/
    private createEntityHeaderFromList(entities : string[]) {
        const entityHeader = new Array<EntityMessage>();
        entities.forEach(entity => {
            const entityName = this.entitiesService.getEntityName(entity);
            if (entityName) {
                entityHeader.push(
                    {
                        id: entity,
                        name: entityName,
                        color: this.checkEntityAnswered(entity) ? EntityMsgColor.GREEN : EntityMsgColor.ORANGE
                    });
            }
        });
        return entityHeader;
    }

    private setIsActionEnabled() {
        this.isActionEnabled = this.actionService.isUserEnabledToRespond(this.userService.getCurrentUserWithPerimeters(),
            this.card, this.businessconfigService.getProcess(this.card.process));
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

    private setShowDetailCardHeader() {
        this.showDetailCardHeader = (this.cardState.showDetailCardHeader === null) || (this.cardState.showDetailCardHeader === true);
    }

    private getUserEntityToRespond(): string {
        return this._userEntitiesAllowedToRespond.length === 1 ? this._userEntitiesAllowedToRespond[0] : null;
    }

    private isAcknowledgmentAllowed(): boolean {

        // default value is true 
        if (!this.cardState.acknowledgmentAllowed) return true;

        return (this.cardState.acknowledgmentAllowed === AcknowledgmentAllowedEnum.ALWAYS ||
            (this.cardState.acknowledgmentAllowed === AcknowledgmentAllowedEnum.ONLY_WHEN_RESPONSE_DISABLED_FOR_USER && !this.isActionEnabled));
    }

    /* 1st check : card.publisherType == ENTITY
       2nd check : the card has been sent by an entity of the user connected
       3rd check : the user has the Write access to the process/state of the card */
    private doesTheUserHavePermissionToDeleteOrEditCard(): boolean {
        let permission = false;
        const userWithPerimeters = this.userService.getCurrentUserWithPerimeters();

        if ((this.card.publisherType === 'ENTITY') && (userWithPerimeters.userData.entities.includes(this.card.publisher))) {
            userWithPerimeters.computedPerimeters.forEach(perim => {
                if ((perim.process === this.card.process) &&
                    (perim.state === this.card.state)
                    && (DetailComponent.compareRightAction(perim.rights, RightsEnum.Write)
                        || DetailComponent.compareRightAction(perim.rights, RightsEnum.ReceiveAndWrite))) {
                    permission = true;
                    return true;
                }
            });
        }
        return permission;
    }

    get listVisibleEntitiesToRespond() {
        return this._listEntitiesToRespondForHeader.length > maxVisibleEntitiesToRespond ? this._listEntitiesToRespondForHeader.slice(0, maxVisibleEntitiesToRespond) : this._listEntitiesToRespondForHeader;
    }

    get listDropdownEntitiesToRespond() {
        return this._listEntitiesToRespondForHeader.length > maxVisibleEntitiesToRespond ? this._listEntitiesToRespondForHeader.slice(maxVisibleEntitiesToRespond) : [];
    }

    checkEntityAnswered(entity: string): boolean {
        return this.childCards.some(childCard => childCard.publisher === entity && childCard.initialParentCardUid === this.card.uid);
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

    private initializeHandlebarsTemplatesProcess() {
      templateGateway.childCards = this.childCards;
      templateGateway.isLocked = this.isLocked;
      templateGateway.userAllowedToRespond = this.isActionEnabled;

      if (this._listEntitiesRequiredToRespond && this._listEntitiesRequiredToRespond.length > 0) {
        const userEntitiesRequiredToRespond = this._listEntitiesRequiredToRespond.filter(entityId => this.user.entities.includes(entityId));
        templateGateway.userMemberOfAnEntityRequiredToRespond = userEntitiesRequiredToRespond.length > 0;
      } else {
        templateGateway.userMemberOfAnEntityRequiredToRespond = false;
      }

      const templateName = this.cardState.templateName;
        if (!!templateName) {
            this.handlebars.executeTemplate(templateName,
                new DetailContext(this.card, this._userContext, this.cardState.response))
                .subscribe(
                    html => {
                        this._htmlContent = this.sanitizer.bypassSecurityTrustHtml(html);
                        setTimeout(() => { // wait for DOM rendering
                            this.reinsertScripts();
                            setTimeout(() => { // wait for script loading before calling them in template
                                templateGateway.applyChildCards();
                                if (this.hasAlreadyResponded) templateGateway.lockAnswer();
                                if (this.card.lttd && this.lttdExpiredIsTrue) {
                                    templateGateway.setLttdExpired(true);
                                }
                                templateGateway.setScreenSize(this.screenSize);
                            }, 10);
                        }, 10);
                    }, () => {
                        console.log(new Date().toISOString(),'WARNING impossible to load template ', templateName);
                        this._htmlContent = this.sanitizer.bypassSecurityTrustHtml('');
                    }
                );
        } else {
            this._htmlContent = " TECHNICAL ERROR - NO TEMPLATE AVAILABLE";
            console.log(new Date().toISOString(), `WARNING No template for process ${this.card.process} version ${this.card.processVersion} with state ${this.card.state}`);
        }
    }

    private initializeHandlebarsTemplates() {

      if (!this._userContext) {
        this.store.select(selectAuthenticationState).subscribe(authState => {
          this._userContext = new UserContext(
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

    get htmlContent() {
        return this._htmlContent;
    }

    reinsertScripts(): void {
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

    confirmDeleteCard(): void {
        this.cardService.deleteCard(this.card)
            .subscribe(
                resp => {
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
                err => {
                    console.error('Error when deleting card :', err);
                    this.modalRef.close();
                    this.displayMessage("userCard.deleteCard.error.impossibleToDeleteCard ", null, MessageLevel.ERROR);
                }
            );
    }

    declineDeleteCard(): void {
        this.modalRef.dismiss();
    }

    editCard(): void {

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

    setFullScreen(active) {
        this.fullscreen = active;
        templateGateway.setScreenSize(active ? 'lg' : 'md');
    }

    public isSmallscreen() {
      return (window.innerWidth < 1000);
    }

    ngOnDestroy() {
        this.updateLastReadCardStatusOnFeedIfNeeded();
        templateGateway.childCards = [];
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

}
