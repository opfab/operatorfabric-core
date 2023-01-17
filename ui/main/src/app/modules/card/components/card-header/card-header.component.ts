/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, Input, OnChanges} from '@angular/core';
import {Card} from '@ofModel/card.model';
import {State, TypeOfStateEnum} from '@ofModel/processes.model';
import {EntitiesService} from '@ofServices/entities.service';
import {ProcessesService} from 'app/business/services/processes.service';

const maxVisibleEntitiesForCardHeader = 3;

class EntityForCardHeader {
    id: string;
    name: string;
    color: string;
}

@Component({
    selector: 'of-card-header',
    templateUrl: './card-header.component.html',
    styleUrls: ['./card-header.component.scss']
})
export class CardHeaderComponent implements OnChanges {
    @Input() card: Card;
    @Input() childCards: Card[];
    @Input() cardState: State;
    @Input() lttdExpiredIsTrue: boolean;

    public showExpiredIcon = true;
    public showExpiredLabel = true;
    public expiredLabel = 'feed.lttdFinished';

    public listVisibleEntitiesToRespond = [];
    public listDropdownEntitiesToRespond = [];

    constructor(private businessconfigService: ProcessesService, private entitiesService: EntitiesService) {}

    ngOnChanges(): void {
        this.computeExpireLabelAndIcon();
        this.computeEntitiesForHeader();
    }

    private computeExpireLabelAndIcon() {
        this.businessconfigService.queryProcess(this.card.process, this.card.processVersion).subscribe((process) => {
            const state = process.extractState(this.card);
            if (state.type === TypeOfStateEnum.FINISHED) {
                this.showExpiredIcon = false;
                this.showExpiredLabel = false;
            } else {
                this.showExpiredIcon = false;
                this.showExpiredLabel = true;
                this.expiredLabel = 'feed.responsesClosed';
            }
        });
    }

    private computeEntitiesForHeader() {
        let entityIdsForHeader = this.card.entitiesRequiredToRespond;
        if (!entityIdsForHeader || entityIdsForHeader.length === 0)  entityIdsForHeader = this.card.entitiesAllowedToRespond;
        entityIdsForHeader = this.getEntityIdsAllowedToSendCards(entityIdsForHeader);
        this.setEntitiesForCardHeader(entityIdsForHeader);
    }

    private getEntityIdsAllowedToSendCards(entityIds) {
        if (!entityIds) return [];
        const entities = this.entitiesService.getEntitiesFromIds(entityIds);
        return this.entitiesService
            .resolveEntitiesAllowedToSendCards(entities)
            .map((entity) => entity.id);
    }

    private setEntitiesForCardHeader(entities) {
        const entitiesForCardHeader = this.getEntitiesForCardHeaderFromEntityIds(entities);
        entitiesForCardHeader.sort((a, b) => a.name?.localeCompare(b.name));
        this.separateEntitiesBetweenVisibleAndDropdown(entitiesForCardHeader);
    }

    private getEntitiesForCardHeaderFromEntityIds(entities: string[]) {
        const entityHeader = new Array<EntityForCardHeader>();
        entities.forEach((entity) => {
            const entityName = this.entitiesService.getEntityName(entity);
            if (entityName) {
                entityHeader.push({
                    id: entity,
                    name: entityName,
                    color: this.hasEntityAnswered(entity) ? 'green' : '#ff6600'
                });
            }
        });
        return entityHeader;
    }

    private hasEntityAnswered(entity: string): boolean {
        return this.childCards.some((childCard) => childCard.publisher === entity);
    }

    private separateEntitiesBetweenVisibleAndDropdown(entities) {
        this.listVisibleEntitiesToRespond =
            entities.length > maxVisibleEntitiesForCardHeader
                ? entities.slice(0, maxVisibleEntitiesForCardHeader)
                : entities;

        this.listDropdownEntitiesToRespond =
            entities.length > maxVisibleEntitiesForCardHeader ? entities.slice(maxVisibleEntitiesForCardHeader) : [];
    }
}
