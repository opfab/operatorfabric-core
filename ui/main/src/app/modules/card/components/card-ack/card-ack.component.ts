/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output} from '@angular/core';
import {Card, fromCardToLightCard} from '@ofModel/card.model';
import {MessageLevel} from '@ofModel/message.model';
import {PermissionEnum} from '@ofModel/permission.model';
import {AcknowledgmentAllowedEnum, ConsideredAcknowledgedForUserWhenEnum, State} from '@ofModel/processes.model';
import {User} from '@ofModel/user.model';
import {AcknowledgeService} from 'app/business/services/acknowledge.service';
import {AppService, PageType} from '@ofServices/app.service';
import {EntitiesService} from 'app/business/services/entities.service';
import {LightCardsStoreService} from '@ofServices/lightcards/lightcards-store.service';
import {LogOption, OpfabLoggerService} from 'app/business/services/logs/opfab-logger.service';
import {ProcessesService} from 'app/business/services/processes.service';
import {UserPermissionsService} from 'app/business/services/user-permissions.service';
import {UserService} from 'app/business/services/user.service';
import {Subject, takeUntil} from 'rxjs';
import {ServerResponseStatus} from 'app/business/server/serverResponse';
import {AlertMessageService} from 'app/business/services/alert-message.service';

const enum AckI18nKeys {
    BUTTON_TEXT_ACK = 'cardAcknowledgment.button.ack',
    BUTTON_TEXT_ACK_AND_CLOSE = 'cardAcknowledgment.button.ackAndClose',
    BUTTON_TEXT_UNACK = 'cardAcknowledgment.button.unack',
    ERROR_MSG = 'response.error.ack'
}

@Component({
    selector: 'of-card-ack',
    templateUrl: './card-ack.component.html'
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

    private unsubscribe$: Subject<void> = new Subject<void>();
    isReadOnlyUser: any;

    constructor(
        private _appService: AppService,
        private entitiesService: EntitiesService,
        private acknowledgeService: AcknowledgeService,
        private userService: UserService,
        private userPermissionsService: UserPermissionsService,
        private processService: ProcessesService,
        private lightCardsStoreService: LightCardsStoreService,
        private alertMessageService: AlertMessageService,
        private logger: OpfabLoggerService
    ) {
        const userWithPerimeters = this.userService.getCurrentUserWithPerimeters();
        if (!!userWithPerimeters) this.user = userWithPerimeters.userData;
    }

    ngOnInit()  {

            this.lightCardsStoreService
            .getReceivedAcks()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((receivedAck) => {
                if (receivedAck.cardUid === this.card.uid) {
                    this.addAckFromSubscription(receivedAck.entitiesAcks);
                }
            });
    }

    private addAckFromSubscription(entitiesAcksToAdd: string[]) {
        let lightcard = fromCardToLightCard(this.card);
        if (!!lightcard && !!entitiesAcksToAdd) {
            const newentitiesAcks = !!lightcard.entitiesAcks
                ? [...new Set([...lightcard.entitiesAcks, ...entitiesAcksToAdd])]
                : entitiesAcksToAdd;
           lightcard = {...lightcard, entitiesAcks: newentitiesAcks};
        }

        this.card = {
            ...this.card,
            hasBeenAcknowledged: this.lightCardsStoreService.isLightCardHasBeenAcknowledgedByUserOrByUserEntity(lightcard)
        };
        this.setAcknowledgeButtonVisibility();

    }

    ngOnChanges(): void {
        this.isReadOnlyUser = this.userService.hasCurrentUserAnyPermission([PermissionEnum.READONLY]);

        this.isUserEnabledToRespond = this.userPermissionsService.isUserEnabledToRespond(
            this.userService.getCurrentUserWithPerimeters(),
            this.card,
            this.processService.getProcess(this.card.process)
        );
        this.setAcknowledgeButtonVisibility();

    }

    private setAcknowledgeButtonVisibility() {
        this.showAckButton = this.card.hasBeenAcknowledged ? false
            : this.isAcknowledgmentAllowed() && this._appService.pageType !== PageType.CALENDAR;

        this.showUnAckButton = this.card.hasBeenAcknowledged && this.isCardAcknowledgedAtEntityLevel() && !this.isReadOnlyUser ? false
            : this.isCancelAcknowledgmentAllowed() && this._appService.pageType !== PageType.CALENDAR;
    }

    private isAcknowledgmentAllowed(): boolean {
        if (!this.cardState.acknowledgmentAllowed) return true;

        return (
            this.cardState.acknowledgmentAllowed === AcknowledgmentAllowedEnum.ALWAYS ||
            (this.cardState.acknowledgmentAllowed === AcknowledgmentAllowedEnum.ONLY_WHEN_RESPONSE_DISABLED_FOR_USER &&
                (this.isReadOnlyUser || !this.isUserEnabledToRespond || (this.isUserEnabledToRespond && this.lttdExpiredIsTrue)))
        );
    }

    private isCancelAcknowledgmentAllowed(): boolean {
        return (!this.card.hasBeenAcknowledged || !this.cardState.cancelAcknowledgmentAllowed) ? false
            : this.isAcknowledgmentAllowed();
    }

    private isCardAcknowledgedAtEntityLevel() {
        return this.cardState.consideredAcknowledgedForUserWhen && this.cardState.consideredAcknowledgedForUserWhen !== ConsideredAcknowledgedForUserWhenEnum.USER_HAS_ACKNOWLEDGED;
    }

    get btnAckText(): string {
        if (this.card.hasBeenAcknowledged) return AckI18nKeys.BUTTON_TEXT_UNACK
        else if (this.shouldCloseCardWhenUserAcknowledges()) return AckI18nKeys.BUTTON_TEXT_ACK_AND_CLOSE
        else return AckI18nKeys.BUTTON_TEXT_ACK;
    }

    get btnUnAckText(): string {
        return AckI18nKeys.BUTTON_TEXT_UNACK
    }

    private shouldCloseCardWhenUserAcknowledges(): boolean {
        return this.cardState.closeCardWhenUserAcknowledges;
    }

    public acknowledgeCard() {
        this.ackOrUnackInProgress = true;

        const entitiesAcks = this.computeAcknowledgedEntities();

        this.acknowledgeService.postUserAcknowledgement(this.card.uid, entitiesAcks).subscribe((resp) => {
            this.ackOrUnackInProgress = false;
            if (resp.status === ServerResponseStatus.OK) {
                this.acknowledgeService.updateAcknowledgementOnLightCard(this.card.id, true);
                this.card = {...this.card, hasBeenAcknowledged: true};
                this.setAcknowledgeButtonVisibility();
                if (this.shouldCloseCardWhenUserAcknowledges()) this.closeDetails();
            } else {
                this.logger.error(`The remote acknowledgement endpoint returned an error status(${resp.status})`,LogOption.LOCAL_AND_REMOTE);
                this.displayMessage(AckI18nKeys.ERROR_MSG, null, MessageLevel.ERROR);
            }
        });
    }

    private computeAcknowledgedEntities() : string[] {
        const entitiesAcks = [];
        if (!this.isReadOnlyUser) {
            const entities = this.entitiesService.getEntitiesFromIds(this.user.entities);
            entities.forEach((entity) => {
                if (entity.entityAllowedToSendCard)
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
        this.alertMessageService.sendAlertMessage({message: msg, level: severity, i18n: {key: i18nKey}});
    }

    public cancelAcknowledgement() {
        this.ackOrUnackInProgress = true;
        this.acknowledgeService.deleteUserAcknowledgement(this.card.uid).subscribe((resp) => {
            this.ackOrUnackInProgress = false;
            if (resp.status === ServerResponseStatus.OK) {
                this.card = {...this.card, hasBeenAcknowledged: false};
                this.setAcknowledgeButtonVisibility();
                this.acknowledgeService.updateAcknowledgementOnLightCard(this.card.id, false);
            } else {
                this.logger.error(`The remote acknowledgement endpoint returned an error status(${resp.status})`,LogOption.LOCAL_AND_REMOTE);
                this.displayMessage(AckI18nKeys.ERROR_MSG, null, MessageLevel.ERROR);
            }
        });
    }


    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }







}
