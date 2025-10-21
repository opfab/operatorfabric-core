/* Copyright (c) 2021-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Card} from 'app/model/Card';
import {BehaviorSubject} from 'rxjs';

export class GroupedLightCardsService {
    private static groupedChildCards: Card[] = [];
    private static parentsOfGroupedCards: Card[] = [];
    private static readonly tagsMap: Map<string, Card[]> = new Map();

    static readonly computeEvent = new BehaviorSubject(null);

    static tagsAsString(tags: string[]): string {
        return tags ? JSON.stringify([...tags].sort((a, b) => a.localeCompare(b))) : '';
    }

    static computeGroupedCards(lightCards: Card[]) {
        GroupedLightCardsService.tagsMap.clear();
        GroupedLightCardsService.groupedChildCards = [];
        GroupedLightCardsService.parentsOfGroupedCards = [];

        lightCards.forEach((lightCard) => {
            const tagString = GroupedLightCardsService.tagsAsString(lightCard.tags);
            if (tagString === '[]' || tagString === '') {
                return; // Do not group cards without tags
            }
            let cardsByTag = GroupedLightCardsService.tagsMap.get(tagString);
            if (!cardsByTag) {
                cardsByTag = [];
                GroupedLightCardsService.parentsOfGroupedCards.push(lightCard);
            } else {
                GroupedLightCardsService.groupedChildCards.push(lightCard);
                cardsByTag.push(lightCard);
            }
            GroupedLightCardsService.tagsMap.set(tagString, cardsByTag);
        });

        GroupedLightCardsService.computeEvent.next(null);
    }

    static filterGroupedChilds(lightCards: Card[]): Card[] {
        return lightCards.filter((element) => !GroupedLightCardsService.groupedChildCards.includes(element));
    }

    static isParentGroupCard(lightCard: Card): boolean {
        return GroupedLightCardsService.parentsOfGroupedCards.indexOf(lightCard) !== -1;
    }

    static getChildCardsByTags(tags: string[]): Card[] {
        const tagString = GroupedLightCardsService.tagsAsString(tags);
        const groupedChildCardsByTags = GroupedLightCardsService.tagsMap.get(tagString);
        return groupedChildCardsByTags ?? [];
    }

    static isCardInGroup(child: string, parent: string): boolean {
        const parentCard = GroupedLightCardsService.parentsOfGroupedCards.find((c) => c.id === parent);
        if (parentCard) {
            const childCards = GroupedLightCardsService.getChildCardsByTags(parentCard.tags);
            return childCards.find((c) => c.id === child) !== undefined;
        }
        return false;
    }
}
