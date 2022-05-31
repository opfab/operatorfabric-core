/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {TestBed} from '@angular/core/testing';
import {LightCard, Severity} from '@ofModel/light-card.model';
import {getSeveralRandomLightCards} from '@tests/helpers';
import {SortService} from './sort.service';

describe('NewFilterService ', () => {
    let service: SortService;
    const ONE_HOUR = 3600000;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [SortService]
        });
        service = TestBed.inject(SortService);
    });

    function getFourCard() {
        let cards: LightCard[] = new Array();
        cards = cards.concat(
            getSeveralRandomLightCards(1, {
                startDate: new Date().valueOf(),
                endDate: null,
                publishDate: new Date().valueOf(),
                severity: Severity.ACTION,
                hasBeenAcknowledged: false,
                hasBeenRead: true,
                hasChildCardFromCurrentUserEntity: false
            })
        );
        cards = cards.concat(
            getSeveralRandomLightCards(1, {
                startDate: new Date().valueOf(),
                endDate: new Date().valueOf() + ONE_HOUR,
                publishDate: new Date().valueOf() - ONE_HOUR,
                severity: Severity.INFORMATION,
                hasBeenAcknowledged: false,
                hasBeenRead: true,
                hasChildCardFromCurrentUserEntity: true
            })
        );
        cards = cards.concat(
            getSeveralRandomLightCards(1, {
                startDate: new Date().valueOf(),
                endDate: new Date().valueOf() + 2 * ONE_HOUR,
                publishDate: new Date().valueOf() - ONE_HOUR * 3,
                severity: Severity.ALARM,
                hasBeenAcknowledged: true,
                hasBeenRead: false,
                hasChildCardFromCurrentUserEntity: false
            })
        );
        cards = cards.concat(
            getSeveralRandomLightCards(1, {
                startDate: new Date().valueOf(),
                endDate: new Date().valueOf() + 3 * ONE_HOUR,
                publishDate: new Date().valueOf() - ONE_HOUR * 2,
                severity: Severity.INFORMATION,
                hasBeenAcknowledged: true,
                hasBeenRead: false,
                hasChildCardFromCurrentUserEntity: false
            })
        );
        return cards;
    }

    describe(' filter', () => {
        it('unread filter  ', () => {
            const cards = getFourCard();
            service.setSortBy('unread');
            const sortedCards = [...cards].sort(service.getSortFunction());
            expect(sortedCards[0]).toEqual(cards[3]);
            expect(sortedCards[1]).toEqual(cards[2]);
            expect(sortedCards[2]).toEqual(cards[0]);
            expect(sortedCards[3]).toEqual(cards[1]);
        });
        it('severity filter  ', () => {
            const cards = getFourCard();
            service.setSortBy('severity');
            const sortedCards = [...cards].sort(service.getSortFunction());
            expect(sortedCards[0]).toEqual(cards[2]);
            expect(sortedCards[1]).toEqual(cards[0]);
            expect(sortedCards[2]).toEqual(cards[1]);
            expect(sortedCards[3]).toEqual(cards[3]);
        });
        it('date filter  ', () => {
            const cards = getFourCard();
            service.setSortBy('date');
            const sortedCards = [...cards].sort(service.getSortFunction());
            expect(sortedCards[0]).toEqual(cards[0]);
            expect(sortedCards[1]).toEqual(cards[1]);
            expect(sortedCards[2]).toEqual(cards[3]);
            expect(sortedCards[3]).toEqual(cards[2]);
        });
    });
});
