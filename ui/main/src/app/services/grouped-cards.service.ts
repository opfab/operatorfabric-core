/* Copyright (c) 2021-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from '@angular/core';
import {LightCard} from '@ofModel/light-card.model';

@Injectable({
    providedIn: 'root'
})
export class GroupedCardsService {
    private groupedChildCards: LightCard[] = [];
    private parentsOfGroupedCards: LightCard[] = [];

    static tagsAsString(tags: string[]): string {
        return tags ? JSON.stringify([...tags].sort()) : '';
    }

    computeGroupedCards(lightCards: LightCard[]) {
        this.groupedChildCards = [];
        this.parentsOfGroupedCards = [];
        const allTags = [];
        const parentTags = new Set<string>();

        lightCards.forEach(lightCard => {
            allTags.push(GroupedCardsService.tagsAsString(lightCard.tags));
        });

        lightCards.forEach(lightCard => {
            const tagString = GroupedCardsService.tagsAsString(lightCard.tags);

            if ( allTags.indexOf(tagString) !== allTags.lastIndexOf(tagString)) {
                if (!parentTags.has(tagString)) {
                    this.parentsOfGroupedCards.push(lightCard);
                    parentTags.add(tagString);
                } else {
                    this.groupedChildCards.push(lightCard);
                }
            }
        });
    }

    filterGroupedChilds(lightCards: LightCard[]): LightCard[] {
        return  lightCards.filter(element => !this.groupedChildCards.includes(element));
    }

    isParentGroupCard(lightCard: LightCard): boolean {
        return this.parentsOfGroupedCards.indexOf(lightCard) !== -1;
    }

    getChildCardsByTags(tags: string[]): LightCard[] {
        const tagString = GroupedCardsService.tagsAsString(tags);
        return this.groupedChildCards.filter (e => {
            const childTagString = GroupedCardsService.tagsAsString(e.tags);
            return childTagString === tagString;
        });
    }

    isCardInGroup(child: string, parent: string): boolean {
        const parentCard = this.parentsOfGroupedCards.find(c => c.id === parent);
        if (parentCard) {
            const childCards = this.getChildCardsByTags(parentCard.tags);
            return childCards.find(c => c.id === child) !== undefined;
        }
        return false;
    }
}
