/* Copyright (c) 2022-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, Input, OnChanges, OnDestroy, OnInit} from '@angular/core';
import {Card} from 'app/model/Card';
import {EntitiesService} from '@ofServices/entities/EntitiesService';
import {Utilities} from '../../../../utils/Utilities';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {OpfabStore} from '../../../../store/OpfabStore';
import {TranslateModule} from '@ngx-translate/core';
import {NgFor, NgStyle} from '@angular/common';
import {NgbPopover} from '@ng-bootstrap/ng-bootstrap';
import {CardOperationType} from '@ofServices/events/model/CardOperation';
import {AcknowledgeUtils} from '@ofServices/acknowlegment/AcknowledgeUtils';

@Component({
    selector: 'of-card-acks-footer',
    templateUrl: './CardAcksFooterComponent.html',
    styleUrls: ['./CardAcksFooterComponent.scss'],
    imports: [TranslateModule, NgFor, NgStyle, NgbPopover]
})
export class CardAcksFooterComponent implements OnChanges, OnInit, OnDestroy {
    @Input() card: Card;

    public listEntitiesToAck = [];
    public acknowledgedList: any[];
    public notAcknowledgedList: any[];

    private readonly unsubscribe$: Subject<void> = new Subject<void>();

    private static readonly ORANGE: string = 'var(--opfab-color-darker-orange)';
    private static readonly GREEN: string = 'var(--opfab-color-green)';

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

    private updateAckFromSubscription(entitiesAcksToUpdate: string[], operation: CardOperationType) {
        if (this.listEntitiesToAck?.length > 0) {
            entitiesAcksToUpdate.forEach((entityAckToUpdate) => {
                const indexToUpdate = this.listEntitiesToAck.findIndex(
                    (entityToAck) => entityToAck.id === entityAckToUpdate
                );
                if (indexToUpdate !== -1) {
                    this.listEntitiesToAck[indexToUpdate].color =
                        operation === CardOperationType.ACK
                            ? CardAcksFooterComponent.GREEN
                            : CardAcksFooterComponent.ORANGE;
                }
            });
            this.computeAcknowlegmentLists();
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
        const entityRecipientsToAck = Utilities.removeElementsFromArray(
            this.card.entityRecipients,
            this.card.entityRecipientsForInformation
        );

        AcknowledgeUtils.getEntitiesAllowedToAcknowledge(entityRecipientsToAck).forEach((entityToAck) =>
            this.listEntitiesToAck.push({
                id: entityToAck,
                name: EntitiesService.getEntityName(entityToAck),
                color: this.checkEntityAcknowledged(entityToAck)
                    ? CardAcksFooterComponent.GREEN
                    : CardAcksFooterComponent.ORANGE
            })
        );
        this.listEntitiesToAck.sort((entity1, entity2) => Utilities.compareObj(entity1.name, entity2.name));
        this.computeAcknowlegmentLists();
    }

    private computeAcknowlegmentLists() {
        this.acknowledgedList = this.listEntitiesToAck.filter(
            (entity) => entity.color === CardAcksFooterComponent.GREEN
        );
        this.notAcknowledgedList = this.listEntitiesToAck.filter(
            (entity) => entity.color === CardAcksFooterComponent.ORANGE
        );
    }

    private checkEntityAcknowledged(entityId: string): boolean {
        return this.card.entitiesAcks?.includes(entityId);
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
