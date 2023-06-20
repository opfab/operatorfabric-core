/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, Input, OnChanges, OnDestroy, OnInit} from '@angular/core';
import {Card} from '@ofModel/card.model';
import {EntitiesService} from 'app/business/services/users/entities.service';
import {LightCardsStoreService} from 'app/business/services/lightcards/lightcards-store.service';
import {Utilities} from 'app/business/common/utilities';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
    selector: 'of-card-acks-footer',
    templateUrl: './card-acks-footer.component.html'
})
export class CardAcksFooterComponent implements OnChanges, OnInit, OnDestroy {
    @Input() card: Card;

    public listEntitiesToAck = [];

    private unsubscribe$: Subject<void> = new Subject<void>();

    constructor(private entitiesService: EntitiesService, private lightCardStoreService:LightCardsStoreService) {}

    ngOnInit() {
        this.lightCardStoreService
            .getReceivedAcks()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((receivedAck) => {
                if (receivedAck.cardUid === this.card.uid) {
                    this.addAckFromSubscription(receivedAck.entitiesAcks);
                }
            });
    }

    private addAckFromSubscription(entitiesAcksToAdd: string[]) {
        if (this.listEntitiesToAck?.length > 0) {
            entitiesAcksToAdd.forEach((entityAckToAdd) => {
                const indexToUpdate = this.listEntitiesToAck.findIndex(
                    (entityToAck) => entityToAck.id === entityAckToAdd
                );
                if (indexToUpdate !== -1) {
                    this.listEntitiesToAck[indexToUpdate].color = 'green';
                }
            });
        }
    }

    ngOnChanges(): void {
        this.setAcksList();
    }

    setAcksList() {
        this.listEntitiesToAck = [];
        if (this.card.entityRecipients) this.computeListEntitiesToAck();
    }

    private computeListEntitiesToAck() {
        const resolved = new Set<string>();

        const entityRecipientsToAck = Utilities.removeElementsFromArray(this.card.entityRecipients, this.card.entityRecipientsForInformation);

        entityRecipientsToAck.forEach((entityRecipient) => {
            const entity = this.entitiesService.getEntitiesFromIds([entityRecipient])[0];
            if (entity.entityAllowedToSendCard) {
                resolved.add(entityRecipient);
            }

            this.entitiesService
                .resolveChildEntities(entityRecipient)
                .filter((child) => child.entityAllowedToSendCard)
                .forEach((child) => resolved.add(child.id));
        });

        resolved.forEach((entityToAck) =>
            this.listEntitiesToAck.push({
                id: entityToAck,
                name: this.entitiesService.getEntityName(entityToAck),
                color: this.checkEntityAcknowledged(entityToAck) ? 'green' : '#ff6600'
            })
        );
        this.listEntitiesToAck.sort((entity1, entity2) => Utilities.compareObj(entity1.name, entity2.name));
    }

    private checkEntityAcknowledged(entityId: string): boolean {
        return this.card.entitiesAcks?.includes(entityId);
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
