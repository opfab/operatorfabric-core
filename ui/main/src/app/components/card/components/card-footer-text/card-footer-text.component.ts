/* Copyright (c) 2022-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {Card} from '@ofServices/cards/model/Card';
import {User} from '@ofServices/users/model/User';
import {DateTimeFormatterService} from 'app/services/dateTimeFormatter/DateTimeFormatterService';
import {EntitiesService} from '@ofServices/entities/EntitiesService';
import {UsersService} from '@ofServices/users/UsersService';
import {Utilities} from 'app/business/common/utilities';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {OpfabStore} from '../../../../store/opfabStore';
import {CardOperationType} from '@ofServices/events/model/CardOperation';
import {TranslateModule} from '@ngx-translate/core';
import {NgIf, NgFor} from '@angular/common';

@Component({
    selector: 'of-card-footer-text',
    templateUrl: './card-footer-text.component.html',
    styleUrls: ['./card-footer-text.component.scss'],
    standalone: true,
    imports: [TranslateModule, NgIf, NgFor]
})
export class CardFooterTextComponent implements OnChanges, OnInit {
    @Input() card: Card;
    @Input() childCards: Card[];
    public formattedPublishDate = '';
    public formattedPublishTime = '';
    public fromEntityOrRepresentative = null;
    public listEntitiesAcknowledged = [];
    public lastResponse: Card;

    public user: User;

    private readonly unsubscribe$: Subject<void> = new Subject<void>();

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
                    this.updateAckFromSubscription(receivedAck.entitiesAcks, receivedAck.operation);
                }
            });
    }

    ngOnChanges(): void {
        this.formattedPublishDate = this.formatDate(this.card.publishDate);
        this.formattedPublishTime = this.formatTime(this.card.publishDate);
        this.computeFromEntityOrRepresentative();
        this.computeListEntitiesAcknowledged();
        this.lastResponse = this.getLastResponse();
    }

    public formatDate(date: number) {
        return DateTimeFormatterService.getFormattedDate(date);
    }

    public formatTime(date: number) {
        return DateTimeFormatterService.getFormattedTime(date);
    }

    private computeFromEntityOrRepresentative() {
        if (this.card.publisherType === 'ENTITY') {
            this.fromEntityOrRepresentative = EntitiesService.getEntityName(this.card.publisher);

            if (this.card.representativeType && this.card.representative) {
                const representative =
                    this.card.representativeType === 'ENTITY'
                        ? EntitiesService.getEntityName(this.card.representative)
                        : this.card.representative;

                this.fromEntityOrRepresentative += ' (' + representative + ')';
            }
        } else this.fromEntityOrRepresentative = null;
    }

    private computeListEntitiesAcknowledged() {
        const addressedTo = [];
        if (this.card.entityRecipients && this.card.entityRecipients.length > 0) {
            // We compute the entities allowed to send cards to which the user is connected
            const userEntitiesAllowedToSendCards = this.user.entities.filter((entityId) =>
                EntitiesService.isEntityAllowedToSendCard(entityId)
            );

            // We compute the entities recipients of the card, taking into account parent entities
            const entityRecipients = EntitiesService.getEntitiesFromIds(this.card.entityRecipients);
            const entityRecipientsAllowedToSendCards = EntitiesService.resolveEntitiesAllowedToSendCards(
                entityRecipients
            ).map((entity) => entity.id);

            const userEntitiesAllowedToSendCardsWhichAreRecipient = userEntitiesAllowedToSendCards.filter((entityId) =>
                entityRecipientsAllowedToSendCards.includes(entityId)
            );
            userEntitiesAllowedToSendCardsWhichAreRecipient.forEach((entityId) => {
                addressedTo.push({
                    id: entityId,
                    entityName: EntitiesService.getEntityName(entityId),
                    acknowledged: this.card.entitiesAcks ? this.card.entitiesAcks.includes(entityId) : false
                });
            });

            addressedTo.sort((a, b) => Utilities.compareObj(a.entityName, b.entityName));
        }
        this.listEntitiesAcknowledged = addressedTo;
    }

    private updateAckFromSubscription(entitiesAcksToUpdate: string[], operation: CardOperationType) {
        if (this.listEntitiesAcknowledged?.length > 0) {
            entitiesAcksToUpdate.forEach((entityAckToUpdate) => {
                const indexToUpdate = this.listEntitiesAcknowledged.findIndex(
                    (entityToAck) => entityToAck.id === entityAckToUpdate
                );
                if (indexToUpdate !== -1) {
                    this.listEntitiesAcknowledged[indexToUpdate].acknowledged = operation === CardOperationType.ACK;
                }
            });
        }
    }

    private getLastResponse(): Card {
        if (this.childCards?.length > 0) {
            return [...this.childCards].sort((a, b) => (a.publishDate < b.publishDate ? 1 : -1))[0];
        }
        return null;
    }

    public getResponsePublisher(resp: Card) {
        return EntitiesService.getEntityName(resp.publisher);
    }
}
