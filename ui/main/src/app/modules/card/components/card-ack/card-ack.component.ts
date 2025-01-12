/* Copyright (c) 2022-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import {Card, convertCardToLightCard} from '@ofServices/cards/model/Card';
import {MessageLevel} from '@ofServices/alerteMessage/model/Message';
import {PermissionEnum} from '@ofServices/groups/model/PermissionEnum';
import {Process, State} from '@ofServices/processes/model/Processes';
import {User} from '@ofServices/users/model/User';
import {AcknowledgeService} from '@ofServices/acknowlegment/AcknowledgeService';
import {EntitiesService} from '@ofServices/entities/EntitiesService';
import {LogOption, LoggerService as logger} from 'app/services/logs/LoggerService';
import {ProcessesService} from '@ofServices/processes/ProcessesService';
import {UserPermissionsService} from '@ofServices/userPermissions/UserPermissionsService';
import {UsersService} from '@ofServices/users/UsersService';
import {Subject, map, takeUntil} from 'rxjs';
import {ServerResponseStatus} from 'app/business/server/serverResponse';
import {AlertMessageService} from '@ofServices/alerteMessage/AlertMessageService';
import {OpfabStore} from 'app/business/store/opfabStore';
import {RoleEnum} from '@ofServices/entities/model/RoleEnum';
import {CardAction} from '@ofModel/light-card.model';
import {UserWithPerimeters} from '@ofServices/users/model/UserWithPerimeters';
import {CardOperationType} from '@ofModel/card-operation.model';
import {NgIf} from '@angular/common';
import {SpinnerComponent} from '../../../share/spinner/spinner.component';
import {TranslateModule} from '@ngx-translate/core';
import {NavigationService, PageType} from '@ofServices/navigation/NavigationService';

const enum AckI18nKeys {
    BUTTON_TEXT_ACK = 'cardAcknowledgment.button.ack',
    BUTTON_TEXT_ACK_AND_CLOSE = 'cardAcknowledgment.button.ackAndClose',
    BUTTON_TEXT_UNACK = 'cardAcknowledgment.button.unack',
    ERROR_MSG = 'response.error.ack'
}

@Component({
    selector: 'of-card-ack',
    templateUrl: './card-ack.component.html',
    standalone: true,
    imports: [NgIf, SpinnerComponent, TranslateModule]
})
export class CardAckComponent implements OnInit, OnChanges, OnDestroy {
    @Input() card: Card;
    @Input() cardState: State;
    @Input() lttdExpiredIsTrue: boolean;

    @Output() closeCardDetail: EventEmitter<boolean> = new EventEmitter<boolean>();

    public ackOrUnackInProgress = false;
    public showAckButton = false;
    public showUnAckButton = false;
    public isUserEnabledToRespond = false;

    public user: User;

    private readonly unsubscribe$: Subject<void> = new Subject<void>();
    isReadOnlyUser: any;

    cardProcess: Process;
    currentUserWithPerimeters: UserWithPerimeters;

    constructor() {
        const userWithPerimeters = UsersService.getCurrentUserWithPerimeters();
        if (userWithPerimeters) this.user = userWithPerimeters.userData;
    }

    ngOnInit() {
        OpfabStore.getLightCardStore()
            .getReceivedAcks()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((receivedAck) => {
                if (receivedAck.cardUid === this.card.uid) {
                    if (receivedAck.operation === CardOperationType.ACK)
                        this.addAckFromSubscription(receivedAck.entitiesAcks);
                    else this.removeAckFromSubscription(receivedAck.entitiesAcks);
                }
            });
        this.integrateChildCardsInRealTime();
    }

    private addAckFromSubscription(entitiesAcksToAdd: string[]) {
        let lightcard = convertCardToLightCard(this.card);
        if (lightcard && entitiesAcksToAdd) {
            const newentitiesAcks = lightcard.entitiesAcks
                ? [...new Set([...lightcard.entitiesAcks, ...entitiesAcksToAdd])]
                : entitiesAcksToAdd;
            lightcard = {...lightcard, entitiesAcks: newentitiesAcks};
        }

        this.card = {
            ...this.card,
            hasBeenAcknowledged: AcknowledgeService.isLightCardHasBeenAcknowledgedByUserOrByUserEntity(lightcard)
        };
        this.setAcknowledgeButtonVisibility();
    }

    private removeAckFromSubscription(entitiesAcksToRemove: string[]) {
        const lightcard = convertCardToLightCard(this.card);
        if (lightcard?.entitiesAcks && entitiesAcksToRemove) {
            entitiesAcksToRemove.forEach((entityToRemove) => {
                const indexToRemove = lightcard.entitiesAcks.indexOf(entityToRemove);
                if (indexToRemove >= 0) lightcard.entitiesAcks.splice(indexToRemove, 1);
            });
        }
        this.card = {
            ...this.card,
            hasBeenAcknowledged: AcknowledgeService.isLightCardHasBeenAcknowledgedByUserOrByUserEntity(lightcard)
        };
        this.setAcknowledgeButtonVisibility();
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.currentUserWithPerimeters = UsersService.getCurrentUserWithPerimeters();
        this.cardProcess = ProcessesService.getProcess(this.card.process);
        this.isReadOnlyUser = UsersService.hasCurrentUserAnyPermission([PermissionEnum.READONLY]);

        this.isUserEnabledToRespond = UserPermissionsService.isUserEnabledToRespond(
            UsersService.getCurrentUserWithPerimeters(),
            this.card,
            ProcessesService.getProcess(this.card.process)
        );
        if (changes.card) {
            this.card.hasBeenAcknowledged = OpfabStore.getLightCardStore().isLightCardHasBeenAcknowledged(this.card);

            this.setAcknowledgeButtonVisibility();
        }
    }

    private integrateChildCardsInRealTime() {
        OpfabStore.getLightCardStore()
            .getNewLightChildCards()
            .pipe(
                takeUntil(this.unsubscribe$),
                map((lastCardLoaded) => {
                    this.updateAcknowledgeButtonVisibilityIfCardsIsChildOfCurrentCard(lastCardLoaded);
                })
            )
            .subscribe();

        OpfabStore.getLightCardStore()
            .getDeletedChildCardsIds()
            .pipe(
                takeUntil(this.unsubscribe$),
                map((lastCardDeleted) => {
                    this.updateAcknowledgeButtonVisibilityIfCardsIsChildOfCurrentCard(lastCardDeleted);
                })
            )
            .subscribe();
    }

    private updateAcknowledgeButtonVisibilityIfCardsIsChildOfCurrentCard(childCard) {
        if (
            childCard?.parentCardId === this.card.id &&
            childCard.actions?.includes(CardAction.PROPAGATE_READ_ACK_TO_PARENT_CARD)
        ) {
            this.card.hasBeenAcknowledged = OpfabStore.getLightCardStore().isLightCardHasBeenAcknowledged(this.card);
            this.setAcknowledgeButtonVisibility();
        }
    }

    private setAcknowledgeButtonVisibility() {
        this.showAckButton = this.card.hasBeenAcknowledged
            ? false
            : AcknowledgeService.isAcknowledgmentAllowed(this.currentUserWithPerimeters, this.card, this.cardProcess) &&
              NavigationService.getCurrentPageType() !== PageType.CALENDAR;

        this.showUnAckButton =
            this.isCancelAcknowledgmentAllowed() && NavigationService.getCurrentPageType() !== PageType.CALENDAR;
    }

    private isCancelAcknowledgmentAllowed(): boolean {
        return !this.card.hasBeenAcknowledged || !this.cardState.cancelAcknowledgmentAllowed
            ? false
            : AcknowledgeService.isAcknowledgmentAllowed(this.currentUserWithPerimeters, this.card, this.cardProcess);
    }

    get btnAckText(): string {
        if (this.card.hasBeenAcknowledged) return AckI18nKeys.BUTTON_TEXT_UNACK;
        else if (this.shouldCloseCardWhenUserAcknowledges()) return AckI18nKeys.BUTTON_TEXT_ACK_AND_CLOSE;
        else return AckI18nKeys.BUTTON_TEXT_ACK;
    }

    get btnUnAckText(): string {
        return AckI18nKeys.BUTTON_TEXT_UNACK;
    }

    private shouldCloseCardWhenUserAcknowledges(): boolean {
        return this.cardState.closeCardWhenUserAcknowledges;
    }

    public acknowledgeCard() {
        this.ackOrUnackInProgress = true;

        const entitiesAcks = this.computeAcknowledgedEntities();

        AcknowledgeService.postUserAcknowledgement(this.card.uid, entitiesAcks).subscribe((resp) => {
            this.ackOrUnackInProgress = false;
            if (resp.status === ServerResponseStatus.OK) {
                OpfabStore.getLightCardStore().setLightCardAcknowledgment(this.card.id, true);
                this.card = {...this.card, hasBeenAcknowledged: true};
                this.setAcknowledgeButtonVisibility();

                const childCards = OpfabStore.getLightCardStore().getChildCards(this.card.id);
                if (childCards) {
                    childCards.forEach((child) => {
                        if (child.actions?.includes(CardAction.PROPAGATE_READ_ACK_TO_PARENT_CARD)) {
                            AcknowledgeService.postUserAcknowledgement(child.uid, entitiesAcks).subscribe();
                            child.hasBeenAcknowledged = true;
                        }
                    });
                }

                if (this.shouldCloseCardWhenUserAcknowledges()) this.closeDetails();
            } else {
                logger.error(
                    `The remote acknowledgement endpoint returned an error status(${resp.status})`,
                    LogOption.LOCAL_AND_REMOTE
                );
                this.displayMessage(AckI18nKeys.ERROR_MSG, null, MessageLevel.ERROR);
            }
        });
    }

    private computeAcknowledgedEntities(): string[] {
        const entitiesAcks = [];
        if (!this.isReadOnlyUser) {
            const entities = EntitiesService.getEntitiesFromIds(this.user.entities);
            entities.forEach((entity) => {
                if (entity.roles?.includes(RoleEnum.CARD_SENDER))
                    // this avoids to display entities used only for grouping
                    entitiesAcks.push(entity.id);
            });
        }
        return entitiesAcks;
    }

    public closeDetails() {
        this.closeCardDetail.emit(true);
    }

    private displayMessage(i18nKey: string, msg: string, severity: MessageLevel = MessageLevel.ERROR) {
        AlertMessageService.sendAlertMessage({message: msg, level: severity, i18n: {key: i18nKey}});
    }

    public cancelAcknowledgement() {
        this.ackOrUnackInProgress = true;
        const entitiesAcks = this.computeAcknowledgedEntities();
        AcknowledgeService.deleteUserAcknowledgement(this.card.uid, entitiesAcks).subscribe((resp) => {
            this.ackOrUnackInProgress = false;
            if (resp.status === ServerResponseStatus.OK) {
                this.card = {...this.card, hasBeenAcknowledged: false};
                this.setAcknowledgeButtonVisibility();
                OpfabStore.getLightCardStore().setLightCardAcknowledgment(this.card.id, false);
            } else {
                logger.error(
                    `The remote acknowledgement endpoint returned an error status(${resp.status})`,
                    LogOption.LOCAL_AND_REMOTE
                );
                this.displayMessage(AckI18nKeys.ERROR_MSG, null, MessageLevel.ERROR);
            }
        });
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
