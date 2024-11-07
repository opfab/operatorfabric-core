/* Copyright (c) 2021-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {LightCard} from '@ofModel/light-card.model';
import {BehaviorSubject} from 'rxjs';

export class GroupedCardsService {
    private static groupedChildCards: LightCard[] = [];
    private static parentsOfGroupedCards: LightCard[] = [];
    private static readonly tagsMap: Map<string, LightCard[]> = new Map();

    static computeEvent = new BehaviorSubject(null);

    static tagsAsString(tags: string[]): string {
        return tags ? JSON.stringify([...tags].sort((a, b) => a.localeCompare(b))) : '';
    }

    static computeGroupedCards(lightCards: LightCard[]) {
        GroupedCardsService.tagsMap.clear();
        GroupedCardsService.groupedChildCards = [];
        GroupedCardsService.parentsOfGroupedCards = [];

        lightCards.forEach((lightCard) => {
            const tagString = GroupedCardsService.tagsAsString(lightCard.tags);
            if (tagString === '[]' || tagString === '') {
                return; // Do not group cards without tags
            }
            let cardsByTag = GroupedCardsService.tagsMap.get(tagString);
            if (!cardsByTag) {
                cardsByTag = [];
                GroupedCardsService.parentsOfGroupedCards.push(lightCard);
            } else {
                GroupedCardsService.groupedChildCards.push(lightCard);
                cardsByTag.push(lightCard);
            }
            GroupedCardsService.tagsMap.set(tagString, cardsByTag);
        });

        GroupedCardsService.computeEvent.next(null);
    }

    static filterGroupedChilds(lightCards: LightCard[]): LightCard[] {
        return lightCards.filter((element) => !GroupedCardsService.groupedChildCards.includes(element));
    }

    static isParentGroupCard(lightCard: LightCard): boolean {
        return GroupedCardsService.parentsOfGroupedCards.indexOf(lightCard) !== -1;
    }

    static getChildCardsByTags(tags: string[]): LightCard[] {
        const tagString = GroupedCardsService.tagsAsString(tags);
        const groupedChildCardsByTags = GroupedCardsService.tagsMap.get(tagString);
        return groupedChildCardsByTags ?? [];
    }

    static isCardInGroup(child: string, parent: string): boolean {
        const parentCard = GroupedCardsService.parentsOfGroupedCards.find((c) => c.id === parent);
        if (parentCard) {
            const childCards = GroupedCardsService.getChildCardsByTags(parentCard.tags);
            return childCards.find((c) => c.id === child) !== undefined;
        }
        return false;
    }
}
