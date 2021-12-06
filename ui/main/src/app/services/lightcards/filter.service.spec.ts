/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {TestBed} from '@angular/core/testing';
import {FilterType, Filter} from '@ofModel/feed-filter.model';
import {LightCard, Severity} from '@ofModel/light-card.model';
import {getSeveralRandomLightCards} from '@tests/helpers';
import {FilterService} from './filter.service';


describe('NewFilterService ', () => {
    let service: FilterService ;
    const ONE_HOUR =  3600000;

    beforeEach(() => {
        service = TestBed.inject(FilterService);

    });

    function getFourCard() {
        let cards: LightCard[]  = new Array();
        cards = cards.concat(getSeveralRandomLightCards(1, {
            startDate: new Date().valueOf(),
            endDate: null,
            publishDate : new Date().valueOf(),
            severity: Severity.ALARM,
            hasBeenAcknowledged: false,
            hasChildCardFromCurrentUserEntity: false,
            tags: ['tag1']
        }));
        cards = cards.concat(getSeveralRandomLightCards(1, {
            startDate: new Date().valueOf(),
            endDate: new Date().valueOf() + ONE_HOUR,
            publishDate : new Date().valueOf() - ONE_HOUR,
            severity: Severity.ACTION,
            hasBeenAcknowledged: false,
            hasChildCardFromCurrentUserEntity: true,
            tags: ['tag1', 'tag2']
        }));
        cards = cards.concat(getSeveralRandomLightCards(1, {
            startDate: new Date().valueOf(),
            endDate: new Date().valueOf() + 2 * ONE_HOUR,
            publishDate : new Date().valueOf() - ONE_HOUR * 2 ,
            severity: Severity.COMPLIANT,
            hasBeenAcknowledged: true,
            hasChildCardFromCurrentUserEntity: false
        }));
        cards = cards.concat(getSeveralRandomLightCards(1, {
            startDate: new Date().valueOf(),
            endDate: new Date().valueOf() + 3 * ONE_HOUR,
            publishDate : new Date().valueOf() - ONE_HOUR * 3,
            severity: Severity.INFORMATION,
            hasBeenAcknowledged: true,
            hasChildCardFromCurrentUserEntity: false
        }));
        return cards;

    }

    describe('ack filter', () => {
        it('filter 0 cards shall return 0 cards ', () => {
            const cards: LightCard[]  = new Array();
            const filteredCards = service.filterLightCards(cards);
            expect( filteredCards.length).toBe(0);
        });
        it('filter 4 cards with two ack shall return 2 cards  ', () => {
            const cards = getFourCard();
            const filteredCards = service.filterLightCards(cards);
            expect(filteredCards.length).toBe(2);
            expect( filteredCards).toContain(cards[0]);
            expect( filteredCards).toContain(cards[1]);
        });

        it('filter 4 cards  , filter is inative => shall return the 4 cards  ', () => {
            const cards = getFourCard();
            service.updateFilter(FilterType.ACKNOWLEDGEMENT_FILTER, false, false);
            const filteredCards = service.filterLightCards(cards);
            expect(filteredCards.length).toBe(4);
            expect(filteredCards).toContain(cards[0]);
            expect(filteredCards).toContain(cards[1]);
            expect(filteredCards).toContain(cards[2]);
            expect(filteredCards).toContain(cards[3]);
        });

    });

    describe('response form my own entity  filter', () => {

        it('filter 1 with child card and 3 with no child card filter is active   => shall return the  3 cards with no child ', () => {
            const cards = getFourCard();
            service.updateFilter(FilterType.ACKNOWLEDGEMENT_FILTER, false, false);
            service.updateFilter(FilterType.RESPONSE_FILTER, true, false);
            const filteredCards = service.filterLightCards(cards);
            expect(filteredCards.length).toBe(3);
            expect(filteredCards).toContain(cards[0]);
            expect(filteredCards).toContain(cards[2]);
            expect(filteredCards).toContain(cards[3]);
        });

    });


    describe('type  filter', () => {

        it('filter 4 cards with 4 different severity , filter is set to alarm severity only => shall return the alarm card only  ', () => {
            const cards  = getFourCard();
            service.updateFilter(FilterType.ACKNOWLEDGEMENT_FILTER, false, false);
            service.updateFilter(FilterType.TYPE_FILTER, true, {alarm: true, action: false, compliant: false, information: false });
            const filteredCards = service.filterLightCards(cards);
            expect(filteredCards.length).toBe(1);
            expect(filteredCards).toContain(cards[0]);
        });


        it('filter 4 cards with 4 different severity , filter is set to action/compliant/information severity => shall return 3 cards',
         () => {
            const cards  = getFourCard();
            service.updateFilter(FilterType.ACKNOWLEDGEMENT_FILTER, false, false);
            service.updateFilter(FilterType.TYPE_FILTER, true, {alarm: false, action: true, compliant: true, information: true });
            const filteredCards = service.filterLightCards(cards);
            expect(filteredCards.length).toBe(3);
            expect(filteredCards).toContain(cards[1]);
            expect(filteredCards).toContain(cards[2]);
            expect(filteredCards).toContain(cards[3]);
        });

    });

    describe('tag  filter', () => {

        it('filter on tag "tag2" => shall return the second card   ', () => {
            const cards  = getFourCard();
            service.updateFilter(FilterType.ACKNOWLEDGEMENT_FILTER, false, false);
            service.updateFilter(FilterType.TAG_FILTER, true, {tags: ['tag2']});
            const filteredCards = service.filterLightCards(cards);
            expect(filteredCards.length).toBe(1);
            expect(filteredCards).toContain(cards[1]);
        });


        it('filter on tag "tag1" and "tag2" => shall return the first 2 cards ', () => {
            const cards  = getFourCard();
            service.updateFilter(FilterType.ACKNOWLEDGEMENT_FILTER, false, false);
            service.updateFilter(FilterType.TAG_FILTER, true, {tags: ['tag1', 'tag2']});
            const filteredCards = service.filterLightCards(cards);
            expect(filteredCards.length).toBe(2);
            expect(filteredCards).toContain(cards[0]);
            expect(filteredCards).toContain(cards[1]);
        });

    });

    describe('business  date  filter', () => {

        it('Filter with start date after card 1 startDate => shoud return 3 cards   ', () => {
            const cards  = getFourCard();
            service.updateFilter(FilterType.ACKNOWLEDGEMENT_FILTER, false, false);
            service.updateFilter(FilterType.BUSINESSDATE_FILTER, true, {
                start: new Date().valueOf() + 0.5 * ONE_HOUR,
                end : new Date().valueOf() + 10 * ONE_HOUR
            });
            const filteredCards = service.filterLightCards(cards);
            expect(filteredCards.length).toBe(3);
            expect(filteredCards).toContain(cards[1]);
            expect(filteredCards).toContain(cards[2]);
            expect(filteredCards).toContain(cards[3]);
        });

        it('Filter with business period matching card 3 & 4    => shoud return 1 cards   ', () => {
            const cards  = getFourCard();
            service.updateFilter(FilterType.ACKNOWLEDGEMENT_FILTER, false, false);
            service.updateFilter(FilterType.BUSINESSDATE_FILTER, true, {
                start: new Date().valueOf() + 1.5 * ONE_HOUR,
                end : new Date().valueOf() + 30 * ONE_HOUR
            });
            const filteredCards = service.filterLightCards(cards);
            expect(filteredCards.length).toBe(2);
            expect(filteredCards).toContain(cards[2]);
            expect(filteredCards).toContain(cards[3]);
        });

        it('Filter with business period matching card 4 only   => shoud return 1 cards   ', () => {
            const cards  = getFourCard();
            service.updateFilter(FilterType.ACKNOWLEDGEMENT_FILTER, false, false);
            service.updateFilter(FilterType.BUSINESSDATE_FILTER, true, {
                start: new Date().valueOf() + 2.5 * ONE_HOUR,
                end : new Date().valueOf() + 30 * ONE_HOUR
            });
            const filteredCards = service.filterLightCards(cards);
            expect(filteredCards.length).toBe(1);
            expect(filteredCards).toContain(cards[3]);
        });

        it('Filter with start date after all business period  => shoud return 0 cards   ', () => {
            const cards  = getFourCard();
            service.updateFilter(FilterType.ACKNOWLEDGEMENT_FILTER, false, false);
            service.updateFilter(FilterType.BUSINESSDATE_FILTER, true, {
                start: new Date().valueOf() + 20 * ONE_HOUR,
                end : new Date().valueOf() + 30 * ONE_HOUR
            });
            const filteredCards = service.filterLightCards(cards);
            expect(filteredCards.length).toBe(0);
        });

    });

    describe('publish date  filter', () => {

        it('Filter with start date before all date => shoud return the four cards   ', () => {
            const cards  = getFourCard();
            service.updateFilter(FilterType.ACKNOWLEDGEMENT_FILTER, false, false);
            service.updateFilter(FilterType.PUBLISHDATE_FILTER, true, {start: new Date().valueOf() - 4 * ONE_HOUR} );
            const filteredCards = service.filterLightCards(cards);
            expect(filteredCards.length).toBe(4);
            expect(filteredCards).toContain(cards[0]);
            expect(filteredCards).toContain(cards[1]);
            expect(filteredCards).toContain(cards[2]);
            expect(filteredCards).toContain(cards[3]);
        });


        it('Filter with start date before two date => shoud return two cards   ', () => {
            const cards  = getFourCard();
            service.updateFilter(FilterType.ACKNOWLEDGEMENT_FILTER, false, false);
            service.updateFilter(FilterType.PUBLISHDATE_FILTER, true, {start: new Date().valueOf() - 1.5 * ONE_HOUR} );
            const filteredCards = service.filterLightCards(cards);
            expect(filteredCards.length).toBe(2);
            expect(filteredCards).toContain(cards[0]);
            expect(filteredCards).toContain(cards[1]);
        });

        it('Filter with start date after all date => shoud return no cards   ', () => {
            const cards  = getFourCard();
            service.updateFilter(FilterType.ACKNOWLEDGEMENT_FILTER, false, false);
            service.updateFilter(FilterType.PUBLISHDATE_FILTER, true, {start: new Date().valueOf() +  ONE_HOUR} );
            const filteredCards = service.filterLightCards(cards);
            expect(filteredCards.length).toBe(0);
        });

        it('Filter with end date after  all date => shoud return the four cards   ', () => {
            const cards  = getFourCard();
            service.updateFilter(FilterType.ACKNOWLEDGEMENT_FILTER, false, false);
            service.updateFilter(FilterType.PUBLISHDATE_FILTER, true, {end: new Date().valueOf() + 4 * ONE_HOUR} );
            const filteredCards = service.filterLightCards(cards);
            expect(filteredCards.length).toBe(4);
            expect(filteredCards).toContain(cards[0]);
            expect(filteredCards).toContain(cards[1]);
            expect(filteredCards).toContain(cards[2]);
            expect(filteredCards).toContain(cards[3]);
        });


        it('Filter with end date before two date => shoud return two cards   ', () => {
            const cards  = getFourCard();
            service.updateFilter(FilterType.ACKNOWLEDGEMENT_FILTER, false, false);
            service.updateFilter(FilterType.PUBLISHDATE_FILTER, true, {end: new Date().valueOf() - 1.5 * ONE_HOUR} );
            const filteredCards = service.filterLightCards(cards);
            expect(filteredCards.length).toBe(2);
            expect(filteredCards).toContain(cards[2]);
            expect(filteredCards).toContain(cards[3]);
        });

        it('Filter with end date before all date => shoud return no cards   ', () => {
            const cards  = getFourCard();
            service.updateFilter(FilterType.ACKNOWLEDGEMENT_FILTER, false, false);
            service.updateFilter(FilterType.PUBLISHDATE_FILTER, true, {end: new Date().valueOf() -   5 * ONE_HOUR} );
            const filteredCards = service.filterLightCards(cards);
            expect(filteredCards.length).toBe(0);
        });

        it('Filter with [start date ; end date ]  => shoud return two cards   ', () => {
            const cards  = getFourCard();
            service.updateFilter(FilterType.ACKNOWLEDGEMENT_FILTER, false, false);
            service.updateFilter(FilterType.PUBLISHDATE_FILTER, true, {
                    start: new Date().valueOf() - 2.5 * ONE_HOUR,
                    end: new Date().valueOf() - 0.5 * ONE_HOUR
                });
                const filteredCards = service.filterLightCards(cards);
            expect(filteredCards.length).toBe(2);
            expect(filteredCards).toContain(cards[1]);
            expect(filteredCards).toContain(cards[2]);
        });

    });
});

