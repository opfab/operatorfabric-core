/* Copyright (c) 2021-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from '@angular/core';
import {LightCard} from '@ofModel/light-card.model';
import {BehaviorSubject} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class GroupedCardsService {
    private groupedChildCards: LightCard[] = [];
    private parentsOfGroupedCards: LightCard[] = [];
    private tagsMap = new Map();

    computeEvent = new BehaviorSubject(null);

    static tagsAsString(tags: string[]): string {
        return tags ? JSON.stringify([...tags].sort()) : '';
    }

    computeGroupedCards(lightCards: LightCard[]) {
        this.tagsMap.clear();
        this.groupedChildCards = [];
        this.parentsOfGroupedCards = [];

        lightCards.forEach((lightCard) => {

            const tagString = GroupedCardsService.tagsAsString(lightCard.tags);
            let cardsByTag = this.tagsMap.get(tagString);
            if (!cardsByTag) {
                cardsByTag = [];
                this.parentsOfGroupedCards.push(lightCard);
            } else {
                this.groupedChildCards.push(lightCard);
                cardsByTag.push(lightCard)
            }
            this.tagsMap.set(tagString, cardsByTag);
        });

        this.computeEvent.next(null);
    }

    filterGroupedChilds(lightCards: LightCard[]): LightCard[] {
        return lightCards.filter((element) => !this.groupedChildCards.includes(element));
    }

    isParentGroupCard(lightCard: LightCard): boolean {
        return this.parentsOfGroupedCards.indexOf(lightCard) !== -1;
    }

    getChildCardsByTags(tags: string[]): LightCard[] {
        const tagString = GroupedCardsService.tagsAsString(tags);
        const groupedChildCardsByTags = this.tagsMap.get(tagString);
        return groupedChildCardsByTags ? groupedChildCardsByTags : [];
    }

    isCardInGroup(child: string, parent: string): boolean {
        const parentCard = this.parentsOfGroupedCards.find((c) => c.id === parent);
        if (parentCard) {
            const childCards = this.getChildCardsByTags(parentCard.tags);
            return childCards.find((c) => c.id === child) !== undefined;
        }
        return false;
    }
}
