/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, EventEmitter, Input, OnChanges, Output} from '@angular/core';
import {Store} from '@ngrx/store';
import {Card} from '@ofModel/card.model';
import {MessageLevel} from '@ofModel/message.model';
import {AcknowledgmentAllowedEnum, State} from '@ofModel/processes.model';
import {User} from '@ofModel/user.model';
import {AcknowledgeService} from '@ofServices/acknowledge.service';
import {AppService, PageType} from '@ofServices/app.service';
import {EntitiesService} from '@ofServices/entities.service';
import {LogOption, OpfabLoggerService} from '@ofServices/logs/opfab-logger.service';
import {ProcessesService} from '@ofServices/processes.service';
import {UserPermissionsService} from '@ofServices/user-permissions.service';
import {UserService} from '@ofServices/user.service';
import {AlertMessageAction} from '@ofStore/actions/alert.actions';
import {AppState} from '@ofStore/index';

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


export class CardAckComponent implements OnChanges {
    @Input() card: Card;
    @Input() cardState: State;
    @Input() lttdExpiredIsTrue: boolean;

    @Output() closeCardDetail: EventEmitter<boolean> = new EventEmitter<boolean>();
    
    public ackOrUnackInProgress = false;
    public showAckButton = false;
    public isUserEnabledToRespond = false;

    public user: User;

    constructor(
        private store: Store<AppState>,
        private _appService: AppService,
        private entitiesService: EntitiesService,
        private acknowledgeService: AcknowledgeService,
        private userService: UserService,
        private userPermissionsService: UserPermissionsService,
        private processService: ProcessesService,
        private logger: OpfabLoggerService
    ) {
        const userWithPerimeters = this.userService.getCurrentUserWithPerimeters();
        if (!!userWithPerimeters) this.user = userWithPerimeters.userData;
    }

    ngOnChanges(): void {
        this.isUserEnabledToRespond = this.userPermissionsService.isUserEnabledToRespond(
            this.userService.getCurrentUserWithPerimeters(),
            this.card,
            this.processService.getProcess(this.card.process)
        );
        this.setAcknowledgeButtonVisibility();
    }

    private setAcknowledgeButtonVisibility() {
        this.showAckButton = this.isAcknowledgmentAllowed() && this._appService.pageType !== PageType.CALENDAR;
    }

    private isAcknowledgmentAllowed(): boolean {
        if (this.card.hasBeenAcknowledged && !this.cardState.cancelAcknowledgmentAllowed) return false;
        if (!this.cardState.acknowledgmentAllowed) return true;

        return (
            this.cardState.acknowledgmentAllowed === AcknowledgmentAllowedEnum.ALWAYS ||
            (this.cardState.acknowledgmentAllowed === AcknowledgmentAllowedEnum.ONLY_WHEN_RESPONSE_DISABLED_FOR_USER &&
                (!this.isUserEnabledToRespond || (this.isUserEnabledToRespond && this.lttdExpiredIsTrue)))
        );
    }

    get btnAckText(): string {
        if (this.card.hasBeenAcknowledged) return AckI18nKeys.BUTTON_TEXT_UNACK
        else if (this.shouldCloseCardWhenUserAcknowledges()) return AckI18nKeys.BUTTON_TEXT_ACK_AND_CLOSE
        else return AckI18nKeys.BUTTON_TEXT_ACK;
    }

    private shouldCloseCardWhenUserAcknowledges(): boolean {
        return this.cardState.closeCardWhenUserAcknowledges;
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
                    this.logger.error(`The remote acknowledgement endpoint returned an error status(${resp.status})`,LogOption.LOCAL_AND_REMOTE);
                    this.displayMessage(AckI18nKeys.ERROR_MSG, null, MessageLevel.ERROR);
                }
            });
        }
    }

    public closeDetails() {
        this.closeCardDetail.emit(true);
    }
   

    private displayMessage(i18nKey: string, msg: string, severity: MessageLevel = MessageLevel.ERROR) {
        this.store.dispatch(
            new AlertMessageAction({alertMessage: {message: msg, level: severity, i18n: {key: i18nKey}}})
        );
    }

    private cancelAcknowledgement() {
        this.acknowledgeService.deleteUserAcknowledgement(this.card.uid).subscribe((resp) => {
            this.ackOrUnackInProgress = false;
            if (resp.status === 200 || resp.status === 204) {
                this.card = {...this.card, hasBeenAcknowledged: false};
                this.acknowledgeService.updateAcknowledgementOnLightCard(this.card.id, false);
            } else {
                this.logger.error(`The remote acknowledgement endpoint returned an error status(${resp.status})`,LogOption.LOCAL_AND_REMOTE);
                this.displayMessage(AckI18nKeys.ERROR_MSG, null, MessageLevel.ERROR);
            }
        });
    }










}
