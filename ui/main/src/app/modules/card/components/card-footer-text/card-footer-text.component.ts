/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {Card} from '@ofModel/card.model';
import {User} from '@ofModel/user.model';
import {CardService} from '@ofServices/card.service';
import {DateTimeFormatterService} from 'app/business/services/date-time-formatter.service';
import {EntitiesService} from '@ofServices/entities.service';
import {UserService} from '@ofServices/user.service';
import {Utilities} from 'app/common/utilities';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
    selector: 'of-card-footer-text',
    templateUrl: './card-footer-text.component.html',
    styleUrls:['./card-footer-text.component.scss']
})
export class CardFooterTextComponent implements OnChanges,OnInit {
    @Input() card: Card;
    @Input() childCards: Card[];
    public formattedPublishDate = '';
    public formattedPublishTime = '';
    public fromEntityOrRepresentative = null;
    public listEntitiesAcknowledged = [];
    public lastResponse: Card;

    public user: User;

    private unsubscribe$: Subject<void> = new Subject<void>();

    constructor(
        private cardService: CardService,
        private entitiesService: EntitiesService,
        private dateTimeFormatterService: DateTimeFormatterService,
        private userService: UserService
    ) {
        const userWithPerimeters = this.userService.getCurrentUserWithPerimeters();
        if (!!userWithPerimeters) this.user = userWithPerimeters.userData;
    }

    ngOnInit() {

        this.cardService
            .getReceivedAcks()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((receivedAck) => {
                if (receivedAck.cardUid === this.card.uid) {
                    this.addAckFromSubscription(receivedAck.entitiesAcks);
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
        return this.dateTimeFormatterService.getFormattedDateFromEpochDate(date);
    }

    public formatTime(date: number) {
        return this.dateTimeFormatterService.getFormattedTimeFromEpochDate(date);
    }

    private computeFromEntityOrRepresentative() {
        if (this.card.publisherType === 'ENTITY') {
            this.fromEntityOrRepresentative = this.entitiesService.getEntityName(this.card.publisher);

            if (!!this.card.representativeType && !!this.card.representative) {
                const representative =
                    this.card.representativeType === 'ENTITY'
                        ? this.entitiesService.getEntityName(this.card.representative)
                        : this.card.representative;

                this.fromEntityOrRepresentative += ' (' + representative + ')';
            }
        } else this.fromEntityOrRepresentative = null;
    }

    private computeListEntitiesAcknowledged() {
        const addressedTo = [];
        if (!!this.card.entityRecipients && this.card.entityRecipients.length > 0) {
            // We compute the entities allowed to send cards to which the user is connected
            const userEntitiesAllowedToSendCards = this.user.entities.filter((entityId) =>
                this.entitiesService.isEntityAllowedToSendCard(entityId)
            );

            // We compute the entities recipients of the card, taking into account parent entities
            const entityRecipients = this.entitiesService.getEntitiesFromIds(this.card.entityRecipients);
            const entityRecipientsAllowedToSendCards = this.entitiesService
                .resolveEntitiesAllowedToSendCards(entityRecipients)
                .map((entity) => entity.id);

            const userEntitiesAllowedToSendCardsWhichAreRecipient = userEntitiesAllowedToSendCards.filter((entityId) =>
                entityRecipientsAllowedToSendCards.includes(entityId)
            );
            userEntitiesAllowedToSendCardsWhichAreRecipient.forEach((entityId) => {
                addressedTo.push({id: entityId, entityName: this.entitiesService.getEntityName(entityId), acknowledged: !!this.card.entitiesAcks? this.card.entitiesAcks.includes(entityId) : false});
            });

            addressedTo.sort((a, b) => Utilities.compareObj(a.entityName, b.entityName));
        }
        this.listEntitiesAcknowledged = addressedTo;
    }

    private addAckFromSubscription(entitiesAcksToAdd: string[]) {
        if (!!this.listEntitiesAcknowledged && this.listEntitiesAcknowledged.length > 0) {
            entitiesAcksToAdd.forEach((entityAckToAdd) => {
                const indexToUpdate = this.listEntitiesAcknowledged.findIndex(
                    (entityToAck) => entityToAck.id === entityAckToAdd
                );
                if (indexToUpdate !== -1) {
                    this.listEntitiesAcknowledged[indexToUpdate].acknowledged = true;
                }
            });
        }
    }
    private getLastResponse(): Card {
        if (!!this.childCards && this.childCards.length > 0) {
            return [...this.childCards].sort((a, b) => (a.publishDate < b.publishDate ? 1 : -1))[0];
        }
        return null;
    }
    
    public getResponsePublisher(resp: Card) {
        return this.entitiesService.getEntityName(resp.publisher);
    }
}
