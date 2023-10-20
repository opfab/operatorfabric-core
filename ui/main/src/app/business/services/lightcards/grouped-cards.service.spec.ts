/* Copyright (c) 2023, Alliander (http://www.alliander.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Severity} from '@ofModel/light-card.model';
import {getSeveralRandomLightCards} from '@tests/helpers';
import {GroupedCardsService} from './grouped-cards.service';

describe('GroupedCardFilterService ', () => {
    let service: GroupedCardsService;

    beforeEach(() => {
        service = new GroupedCardsService();
    });

    function getCardWithTag(tags: string[]) {
        return getSeveralRandomLightCards(1, {
            startDate: new Date().valueOf(),
            endDate: null,
            publishDate: new Date().valueOf(),
            severity: Severity.ALARM,
            hasBeenAcknowledged: false,
            hasChildCardFromCurrentUserEntity: false,
            tags: tags
        });
    }

    describe('group cards', () => {
        it('no child cards', () => {
            const cards = getCardWithTag(['tag1']);
            service.computeGroupedCards(cards);
            const childCards = service.getChildCardsByTags(['tag1']);
            expect(childCards.length).toBe(0);
        });
        it('Three tags that are the same', () => {
            const cards = getCardWithTag(['tag1'])
                .concat(getCardWithTag(['tag1']))
                .concat(getCardWithTag(['tag1']));

            service.computeGroupedCards(cards);
            const childCards = service.getChildCardsByTags(['tag1']);
            expect(childCards.length).toBe(2);
        });
        it('Two sets of two different tags', () => {
            const cards = getCardWithTag(['tag1', 'tag2'])
                .concat(getCardWithTag(['tag1', 'tag2']))
                .concat(getCardWithTag(['tag1', 'tag3']));

            service.computeGroupedCards(cards);
            const childCardsTwo = service.getChildCardsByTags(['tag1', 'tag2']);
            expect(childCardsTwo.length).toBe(1);

            const childCardsOneTag = service.getChildCardsByTags(['tag1', 'tag3']);
            expect(childCardsOneTag.length).toBe(0);
        });
        it('Three cards with empty tags => expect no child cards', () => {
            const cards = getCardWithTag([]).concat(getCardWithTag([])).concat(getCardWithTag([]));

            service.computeGroupedCards(cards);
            const childCards = service.getChildCardsByTags([]);
            expect(childCards.length).toBe(0);
        });
        it('Three cards with null tags => expect no child cards', () => {
            const cards = getCardWithTag(null).concat(getCardWithTag(null)).concat(getCardWithTag([]));

            service.computeGroupedCards(cards);
            const childCards = service.getChildCardsByTags(null);
            expect(childCards.length).toBe(0);
        });
    });
});