/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
    ViewEncapsulation
} from '@angular/core';
import {Card} from '@ofModel/card.model';
import {ProcessesService} from 'app/business/services/businessconfig/processes.service';
import {SafeHtml} from '@angular/platform-browser';
import {AcknowledgmentAllowedEnum, State} from '@ofModel/processes.model';
import {map, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {User} from '@ofModel/user.model';
import {UserService} from 'app/business/services/users/user.service';
import {EntitiesService} from 'app/business/services/users/entities.service';
import {NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {UserPermissionsService} from 'app/business/services/user-permissions.service';
import {DisplayContext} from '@ofModel/template.model';
import {CardComponent} from '../../card.component';
import {LoggerService as logger} from 'app/business/services/logs/logger.service';
import {UserWithPerimeters} from '@ofModel/userWithPerimeters.model';
import {SelectedCardService} from 'app/business/services/card/selectedCard.service';
import {CardService} from 'app/business/services/card/card.service';
import {RouterStore, PageType} from 'app/business/store/router.store';
import {Router} from '@angular/router';
import {Utilities} from '../../../../business/common/utilities';
import {OpfabAPIService} from 'app/business/services/opfabAPI.service';
import {OpfabStore} from 'app/business/store/opfabStore';

@Component({
    selector: 'of-card-body',
    templateUrl: './card-body.component.html',
    styleUrls: ['./card-body.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class CardBodyComponent implements OnChanges, OnInit, OnDestroy {
    @Input() cardState: State;
    @Input() card: Card;
    @Input() childCards: Card[];

    @Input() parentModalRef: NgbModalRef;
    @Input() screenSize: string;
    @Input() parentComponent: CardComponent;

    @Output() closeCardDetail: EventEmitter<boolean> = new EventEmitter<boolean>();

    public displayContext: DisplayContext = DisplayContext.REALTIME;
    public isUserEnabledToRespond = false;
    public lttdExpiredIsTrue: boolean;
    private regularlyLttdCheckActive = false;

    public isResponseLocked = false;
    public fullscreen = false;
    public showMaxAndReduceButton = false;
    public showDetailCardHeader= true;
    public htmlTemplateContent: SafeHtml;
    public templateOffset = 15;
    public truncatedTitle: string;

    private lastCardSetToReadButNotYetOnFeed;
    private entityIdsAllowedOrRequiredToRespondAndAllowedToSendCards = [];
    public userEntityIdsPossibleForResponse = [];
    private userEntityIdToUseForResponse = '';
    private userMemberOfAnEntityRequiredToRespondAndAllowedToSendCards = false;
    private unsubscribe$: Subject<void> = new Subject<void>();

    public user: User;
    private userWithPerimeters: UserWithPerimeters;

    constructor(
        private router: Router,
        private opfabAPIService: OpfabAPIService
    ) {
        this.userWithPerimeters = UserService.getCurrentUserWithPerimeters();
        if (this.userWithPerimeters) {
            this.user = this.userWithPerimeters.userData;
        }
    }

    ngOnInit() {
        this.integrateChildCardsInRealTime();
        const pageType = RouterStore.getCurrentPageType();
        if (pageType === PageType.CALENDAR || pageType === PageType.MONITORING || pageType === PageType.DASHBOARD) this.templateOffset = 35;
        if (pageType !== PageType.CALENDAR && pageType !== PageType.MONITORING && pageType !== PageType.DASHBOARD) this.showMaxAndReduceButton = true;
    }

    private integrateChildCardsInRealTime() {
        OpfabStore.getLightCardStore()
            .getNewLightChildCards()
            .pipe(
                takeUntil(this.unsubscribe$),
                map((lastCardLoaded) => {
                    if (lastCardLoaded) {
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

        OpfabStore.getLightCardStore()
            .getDeletedChildCardsIds()
            .pipe(
                takeUntil(this.unsubscribe$),
                map((lastCardDeleted) => {
                    if (
                        lastCardDeleted?.parentCardId === this.card.id &&
                        this.childCards.map((childCard) => childCard.id).includes(lastCardDeleted.cardId)
                    ) {
                        this.removeChildCard(lastCardDeleted.cardId);
                    }
                })
            )
            .subscribe();
    }

    private integrateOneChildCard(newChildCard: Card) {
        CardService.loadCard(newChildCard.id).subscribe((cardData) => {
            const newChildArray = this.childCards.filter((childCard) => childCard.id !== cardData.card.id);
            newChildArray.push(cardData.card);
            this.childCards = newChildArray;
            this.opfabAPIService.currentCard.childCards = this.childCards;
            this.opfabAPIService.currentCard.applyChildCards();
            this.lockResponseIfOneUserEntityHasAlreadyRespond();
            if (this.isResponseLocked) this.opfabAPIService.templateInterface.lockAnswer();
        });
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

    private removeChildCard(deletedChildCardId: string) {
        const newChildArray = this.childCards.filter((childCard) => childCard.id !== deletedChildCardId);
        this.childCards = newChildArray;
        this.lockResponseIfOneUserEntityHasAlreadyRespond();
        this.opfabAPIService.currentCard.isResponseLocked = this.isResponseLocked;
        if (!this.isResponseLocked) this.opfabAPIService.templateInterface.unlockAnswer();
        this.opfabAPIService.currentCard.childCards = this.childCards;
        this.opfabAPIService.currentCard.applyChildCards();
    }

    public unlockAnswer() {
        this.isResponseLocked = false;
        this.opfabAPIService.templateInterface.unlockAnswer();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!!changes.card || !!changes.cardState) {
            if (changes.card) this.opfabAPIService.currentCard.card = this.card;
            if (this.cardState.response != null && this.cardState.response !== undefined) {
                this.computeEntityIdsAllowedOrRequiredToRespondAndAllowedToSendCards();
                this.computeUserEntityIdsPossibleForResponse();
                this.computeUserMemberOfAnEntityRequiredToRespondAndAllowedToSendCards();
                this.isUserEnabledToRespond = UserPermissionsService.isUserEnabledToRespond(
                    UserService.getCurrentUserWithPerimeters(),
                    this.card,
                    ProcessesService.getProcess(this.card.process)
                );
            }
            this.truncatedTitle = this.card.titleTranslated;
            this.computeShowDetailCardHeader();
            this.lockResponseIfOneUserEntityHasAlreadyRespond();
            this.markAsReadIfNecessary();
        }
    }

    private computeEntityIdsAllowedOrRequiredToRespondAndAllowedToSendCards() {
        let entityIdsAllowedOrRequiredToRespond = [];
        if (this.card.entitiesAllowedToRespond)
            entityIdsAllowedOrRequiredToRespond = entityIdsAllowedOrRequiredToRespond.concat(
                this.card.entitiesAllowedToRespond
            );
        if (this.card.entitiesRequiredToRespond)
            entityIdsAllowedOrRequiredToRespond = entityIdsAllowedOrRequiredToRespond.concat(
                this.card.entitiesRequiredToRespond
            );

        const entitiesAllowedOrRequiredToRespond = EntitiesService.getEntitiesFromIds(
            entityIdsAllowedOrRequiredToRespond
        );
        this.entityIdsAllowedOrRequiredToRespondAndAllowedToSendCards = EntitiesService
            .resolveEntitiesAllowedToSendCards(entitiesAllowedOrRequiredToRespond)
            .map((entity) => entity.id);

        logger.debug(
            `Detail card - entities allowed to respond = ${this.entityIdsAllowedOrRequiredToRespondAndAllowedToSendCards}`
        );
    }

    private computeUserEntityIdsPossibleForResponse() {
        this.userEntityIdsPossibleForResponse = this.entityIdsAllowedOrRequiredToRespondAndAllowedToSendCards.filter(
            (entityId) => this.user.entities.includes(entityId)
        );
        logger.debug(`Detail card - user entities allowed to respond = ${this.userEntityIdsPossibleForResponse}`);
        if (this.userEntityIdsPossibleForResponse.length === 1)
            this.userEntityIdToUseForResponse = this.userEntityIdsPossibleForResponse[0];
    }
    private computeUserMemberOfAnEntityRequiredToRespondAndAllowedToSendCards() {
        if (!this.card.entitiesRequiredToRespond) {
            this.userMemberOfAnEntityRequiredToRespondAndAllowedToSendCards = false;
            return;
        }

        const entitiesRequiredToRespond = EntitiesService.getEntitiesFromIds(this.card.entitiesRequiredToRespond);

        const entityIdsRequiredToRespondAndAllowedToSendCards = EntitiesService
            .resolveEntitiesAllowedToSendCards(entitiesRequiredToRespond)
            .map((entity) => entity.id);

        const userEntitiesRequiredToRespondAndAllowedToSendCards =
            entityIdsRequiredToRespondAndAllowedToSendCards.filter((entityId) => this.user.entities.includes(entityId));
        this.userMemberOfAnEntityRequiredToRespondAndAllowedToSendCards =
            userEntitiesRequiredToRespondAndAllowedToSendCards.length > 0;
    }

    public computeShowDetailCardHeader() {
        this.showDetailCardHeader =
            (this.cardState.showDetailCardHeader === undefined || this.cardState.showDetailCardHeader === true) &&
            this.cardState.response != null &&
            this.cardState.response !== undefined;
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
            CardService.postUserCardRead(this.card.uid).subscribe();
        } else this.updateLastReadCardStatusOnFeedIfNeeded();
    }

    private updateLastReadCardStatusOnFeedIfNeeded() {
        if (this.lastCardSetToReadButNotYetOnFeed) {
            OpfabStore.getLightCardStore().setLightCardRead(this.lastCardSetToReadButNotYetOnFeed.id, true);
            this.lastCardSetToReadButNotYetOnFeed = null;
        }
    }

    public displayCardAcknowledgedFooter(): boolean {
        let entityRecipientsToAck = [];
        if (this.card.entityRecipients) {
            entityRecipientsToAck = Utilities.removeElementsFromArray(
                this.card.entityRecipients,
                this.card.entityRecipientsForInformation
            );
        }

        return (
            this.cardState.acknowledgmentAllowed !== AcknowledgmentAllowedEnum.NEVER &&
            entityRecipientsToAck.length > 0 &&
            UserPermissionsService.isUserAuthorizedToSeeAcknowledgmentFooter(this.userWithPerimeters, this.card)
        );
    }

    public beforeTemplateRendering() {
        this.setOpfabApiVariables();
        this.stopRegularlyCheckLttd();
    }

    private setOpfabApiVariables() {
        this.opfabAPIService.currentCard.childCards = this.childCards;
        this.opfabAPIService.currentCard.isResponseLocked = this.isResponseLocked;
        this.opfabAPIService.currentCard.isUserAllowedToRespond = this.isUserEnabledToRespond;
        this.opfabAPIService.currentCard.entitiesAllowedToRespond =
            this.entityIdsAllowedOrRequiredToRespondAndAllowedToSendCards;
        this.opfabAPIService.currentCard.isUserMemberOfAnEntityRequiredToRespond =
            this.userMemberOfAnEntityRequiredToRespondAndAllowedToSendCards;
        this.opfabAPIService.currentCard.entityUsedForUserResponse = this.userEntityIdToUseForResponse;
        this.opfabAPIService.currentCard.entitiesUsableForUserResponse = this.userEntityIdsPossibleForResponse;
        }

    private stopRegularlyCheckLttd() {
        this.regularlyLttdCheckActive = false;
        this.lttdExpiredIsTrue = false;
    }

    public afterTemplateRendering() {
        if (this.isResponseLocked) this.opfabAPIService.templateInterface.lockAnswer();
        this.startRegularlyCheckLttd();
    }

    private startRegularlyCheckLttd() {
        this.regularlyLttdCheckActive = true;
        this.regularlyCheckLttd();
    }

    private regularlyCheckLttd() {
        if (this.card.lttd && !this.lttdExpiredIsTrue && this.regularlyLttdCheckActive) {
            if (this.isLttdExpired()) {
                this.lttdExpiredIsTrue = true;
                this.opfabAPIService.templateInterface.setLttdExpired(true);
            } else setTimeout(() => this.regularlyCheckLttd(), 500);
        }
    }

    private isLttdExpired(): boolean {
        return this.card.lttd != null && this.card.lttd - new Date().getTime() <= 0;
    }

    public isThereEnoughSpaceToShowCard() {
        const domElement = document.getElementsByTagName('of-card-body');
        const cardWidth =  domElement.item(0).getBoundingClientRect().width;

        if (cardWidth === 0) //Full screen
            return window.innerWidth > 1300
        else
            return cardWidth > 485 || window.innerWidth > 1300;
    }

    public setFullScreen(active) {
        this.fullscreen = active;
        if (this.parentComponent) this.parentComponent.screenSize = active ? 'lg' : 'md';
    }

    public closeDetails() {
        this.closeCardDetail.next(true);
        this.updateLastReadCardStatusOnFeedIfNeeded();
        if (this.parentModalRef) {
            this.parentModalRef.close();
            SelectedCardService.clearSelectedCardId();
        } else {
            SelectedCardService.clearSelectedCardId();
            this.router.navigate(['/' + RouterStore.getCurrentRoute().split('/')[1]]);
        }
    }

    ngOnDestroy() {
        this.updateLastReadCardStatusOnFeedIfNeeded();
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
