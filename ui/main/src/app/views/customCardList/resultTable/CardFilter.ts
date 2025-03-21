/* Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ReadAndAckEnum} from '@ofServices/processes/model/Processes';
import {ProcessesService} from '@ofServices/processes/ProcessesService';
import {Card} from 'app/model/Card';
import {FilterValues} from '../FilterValues';

export class CardFilter {
    private startDate: number;
    private endDate: number;
    private processIds: string[] = [];
    private typesOfState: string[] = [];
    private includeCardsWithResponseFromMyEntities = true;
    private includeCardsWithResponsesFromAllEntities = true;
    private readFilter: boolean = undefined;
    private ackFilter: boolean = undefined;

    public setFilters(filterValues: FilterValues) {
        this.startDate = filterValues.startDate;
        this.endDate = filterValues.endDate;
        this.processIds = filterValues.processes;
        this.typesOfState = filterValues.typesOfStateFilter;
        this.setReadAndAckFilter(filterValues.readAndAckFilter);
        this.includeCardsWithResponsesFromAllEntities = filterValues.includeCardsWithResponsesFromAllEntities;
        this.includeCardsWithResponseFromMyEntities = filterValues.includeCardsWithResponseFromMyEntities;
    }

    private setReadAndAckFilter(readAndAck: string[]) {
        if (readAndAck) {
            // readFilter is either:
            //  - undefined : no filtering at all
            //  - true : only read cards
            //  - false : only not read cards
            this.readFilter =
                readAndAck.includes(ReadAndAckEnum.READ) === readAndAck.includes(ReadAndAckEnum.NOT_READ)
                    ? undefined
                    : readAndAck.includes(ReadAndAckEnum.READ);
            // similar as readFilter
            this.ackFilter =
                readAndAck.includes(ReadAndAckEnum.ACKNOWLEDGED) ===
                readAndAck.includes(ReadAndAckEnum.NOT_ACKNOWLEDGED)
                    ? undefined
                    : readAndAck.includes(ReadAndAckEnum.ACKNOWLEDGED);
        }
    }

    public isCardFiltered(card: Card, childCards: Map<string, Array<Card>>): boolean {
        if (!this.isCardInDateRange(card)) return true;
        if (!this.isCardInProcessIds(card)) return true;
        if (!this.isCardInTypesOfState(card)) return true;
        if (this.isCardFilteredByRead(card)) return true;
        if (this.isCardFilteredByAck(card)) return true;
        if (!this.includeCardsWithResponseFromMyEntities && card.hasChildCardFromCurrentUserEntity) return true;
        if (!this.includeCardsWithResponsesFromAllEntities && this.haveAllEntitiesResponded(card, childCards))
            return true;
        return false;
    }

    private isCardInDateRange(card: Card): boolean {
        if (!this.startDate || !this.endDate) return true;
        if (card.startDate > this.endDate) return false;
        if (card.endDate) {
            return card.endDate >= this.startDate;
        }
        return card.startDate >= this.startDate;
    }

    private isCardInProcessIds(card: Card): boolean {
        if (!this.processIds || this.processIds.length === 0) return true;
        return this.processIds.includes(card.process);
    }

    private isCardInTypesOfState(card: Card): boolean {
        if (!this.typesOfState || this.typesOfState.length === 0) return true;
        const type = ProcessesService.getProcess(card.process)?.states?.get(card.state)?.type;
        if (!type) return false;
        return this.typesOfState.includes(type);
    }

    private isCardFilteredByRead(card: Card) {
        return this.readFilter !== undefined && card.hasBeenRead !== this.readFilter;
    }

    private isCardFilteredByAck(card: Card) {
        return this.ackFilter !== undefined && card.hasBeenAcknowledged !== this.ackFilter;
    }

    private haveAllEntitiesResponded(card: Card, childCards: Map<string, Array<Card>>): boolean {
        const entitiesToRespond = new Set(
            card.entitiesRequiredToRespond?.length > 0
                ? card.entitiesRequiredToRespond
                : (card.entitiesAllowedToRespond ?? [])
        );
        if (entitiesToRespond.size === 0) return false;
        const respondedEntities = new Set(childCards.get(card.id)?.map((card) => card.publisher) ?? []);
        return Array.from(entitiesToRespond).every((entity) => respondedEntities.has(entity));
    }
}
