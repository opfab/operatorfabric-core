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
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {Card} from '@ofModel/card.model';
import {ProcessesService} from '@ofServices/processes.service';
import {SafeHtml} from '@angular/platform-browser';
import {AcknowledgmentAllowedEnum, State} from '@ofModel/processes.model';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {map, takeUntil} from 'rxjs/operators';
import {CardService} from '@ofServices/card.service';
import {Subject} from 'rxjs';
import {AppService, PageType} from '@ofServices/app.service';
import {User} from '@ofModel/user.model';
import {ClearLightCardSelectionAction} from '@ofStore/actions/light-card.actions';
import {UserService} from '@ofServices/user.service';
import {EntitiesService} from '@ofServices/entities.service';
import {NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {UserPermissionsService} from '@ofServices/user-permissions.service';
import {DisplayContext} from '@ofModel/templateGateway.model';
import {LightCardsStoreService} from '@ofServices/lightcards/lightcards-store.service';
import {CardDetailsComponent} from '../card-details/card-details.component';
import {OpfabLoggerService} from '@ofServices/logs/opfab-logger.service';

declare const templateGateway: any;

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

    public isUserEnabledToRespond = false;
    public lttdExpiredIsTrue: boolean;
    public isResponseLocked = false;
    public fullscreen = false;
    public showButtons = false;
    public showMaxAndReduceButton = false;
    public showDetailCardHeader = false;
    public htmlTemplateContent: SafeHtml;
    public isCardAQuestionCard = false;
    public templateOffset = 15;

    private lastCardSetToReadButNotYetOnFeed;
    private entityIdsAllowedOrRequiredToRespondAndAllowedToSendCards = [];
    private userEntityIdsPossibleForResponse = [];
    private userEntityIdToUseForResponse = '';
    private userMemberOfAnEntityRequiredToRespondAndAllowedToSendCards = false;
    private unsubscribe$: Subject<void> = new Subject<void>();

    public user: User;

    constructor(
        private businessconfigService: ProcessesService,
        private store: Store<AppState>,
        private cardService: CardService,
        private _appService: AppService,
        private userService: UserService,
        private entitiesService: EntitiesService,
        private userPermissionsService: UserPermissionsService,
        private lightCardsStoreService: LightCardsStoreService,
        private logger: OpfabLoggerService
    ) {
        const userWithPerimeters = this.userService.getCurrentUserWithPerimeters();
        if (!!userWithPerimeters) this.user = userWithPerimeters.userData;
    }

    // START - ANGULAR COMPONENT LIFECYCLE

    ngOnInit() {
        if (this._appService.pageType !== PageType.ARCHIVE) this.integrateChildCardsInRealTime();
        if (this._appService.pageType === PageType.MONITORING || this._appService.pageType === PageType.CALENDAR)
            this.templateOffset = 35;
            if (this._appService.pageType !== PageType.CALENDAR && this._appService.pageType !== PageType.MONITORING) {
                this.showMaxAndReduceButton = true;
            }
    }

    ngDoCheck() {
        if (templateGateway.setLttdExpired) {
            const previous = this.lttdExpiredIsTrue;
            this.checkLttdExpired();
            if (previous !== this.lttdExpiredIsTrue) {
                templateGateway.setLttdExpired(this.lttdExpiredIsTrue);
            }
        }
    }

    ngOnChanges(): void {
        if (this.cardState.response != null && this.cardState.response !== undefined) {
            this.isCardAQuestionCard = true;
            this.computeEntitiesForResponses();
            this.computeUserEntitiesRequiredToRespondAndAllowedToSendCards();
            this.isUserEnabledToRespond = this.userPermissionsService.isUserEnabledToRespond(
                this.userService.getCurrentUserWithPerimeters(),
                this.card,
                this.businessconfigService.getProcess(this.card.process)
            );
        } else this.isCardAQuestionCard = false;

        this.lockResponseIfOneUserEntityHasAlreadyRespond();

        this.markAsReadIfNecessary();
        this.showDetailCardHeader =
            !this.cardState.showDetailCardHeader || this.cardState.showDetailCardHeader === true;
    }

    public displayCardAcknowledgedFooter(): boolean {
        return (
            this.cardState.acknowledgmentAllowed !== AcknowledgmentAllowedEnum.NEVER &&
            !!this.card.entityRecipients &&
            this.card.entityRecipients.length > 0 &&
            this.isCardPublishedByUserEntity()
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
        this.showButtons = false;
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
        this.showButtons = this._appService.pageType !== PageType.ARCHIVE;
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
            templateGateway.applyChildCards();
            this.lockResponseIfOneUserEntityHasAlreadyRespond();
            if (this.isResponseLocked) templateGateway.lockAnswer();
        });
    }

    private removeChildCard(deletedChildCardId: string) {
        const newChildArray = this.childCards.filter((childCard) => childCard.id !== deletedChildCardId);
        this.childCards = newChildArray;
        this.lockResponseIfOneUserEntityHasAlreadyRespond();
        templateGateway.isLocked = this.isResponseLocked;
        if (!this.isResponseLocked) templateGateway.unlockAnswer();
        templateGateway.childCards = this.childCards;
        templateGateway.applyChildCards();
    }

    private computeEntitiesForResponses() {
        this.entityIdsAllowedOrRequiredToRespondAndAllowedToSendCards =
            this.getEntityIdsAllowedOrRequiredToRespondAndAllowedToSendCards();
        this.logger.debug(
            `Detail card - entities allowed to respond = ${this.entityIdsAllowedOrRequiredToRespondAndAllowedToSendCards}`
        );
        this.setUserEntityIdsPossibleForResponse();
    }

    private computeUserEntitiesRequiredToRespondAndAllowedToSendCards() {
        const entityIdsRequiredToRespondAndAllowedToSendCards =
            this.getEntityIdsRequiredToRespondAndAllowedToSendCards();
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
            (entityId) => this.user.entities.includes(entityId)
        );
        this.logger.debug(`Detail card - user entities allowed to respond = ${this.userEntityIdsPossibleForResponse}`);
        if (this.userEntityIdsPossibleForResponse.length === 1)
            this.userEntityIdToUseForResponse = this.userEntityIdsPossibleForResponse[0];
    }

    private checkLttdExpired(): void {
        this.lttdExpiredIsTrue = this.card.lttd != null && this.card.lttd - new Date().getTime() <= 0;
    }

    private lockResponseIfOneUserEntityHasAlreadyRespond() {
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

    // START - METHODS CALLED ONLY FROM HTML COMPONENT

    public isSmallscreen() {
        return window.innerWidth < 1000;
    }

    public setFullScreen(active) {
        this.fullscreen = active;
        if (!!this.parentComponent) this.parentComponent.screenSize = active ? 'lg' : 'md';
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

    // END - METHODS CALLED ONLY FROM HTML COMPONENT
}
