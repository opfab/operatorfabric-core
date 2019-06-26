/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {TestBed} from '@angular/core/testing';

import {FilterService, FilterType} from './filter.service';
import {getSeveralRandomLightCards} from "@tests/helpers";
import {Store, StoreModule} from "@ngrx/store";
import {appReducer, AppState} from "@ofStore/index";

function buildTestCards() {
    let testCards = [];
    testCards = testCards.concat(getSeveralRandomLightCards(2, {
        startDate: Date.parse("2019-04-10T00:00"),
        endDate: Date.parse("2019-04-10T23:59"),
        tags: ['tag1']
    }));
    testCards = testCards.concat(getSeveralRandomLightCards(2, {
        startDate: Date.parse("2019-04-10T00:00"),
        endDate: Date.parse("2019-04-10T06:00"),
        tags: ['tag2']
    }));
    testCards = testCards.concat(getSeveralRandomLightCards(2, {
        startDate: Date.parse("2019-04-10T00:00"),
        endDate: Date.parse("2019-04-10T09:00"),
        tags: ['tag1']
    }));
    testCards = testCards.concat(getSeveralRandomLightCards(2, {
        startDate: Date.parse("2019-04-10T15:00"),
        endDate: Date.parse("2019-04-10T23:59"),
        tags: ['tag2']
    }));
    testCards = testCards.concat(getSeveralRandomLightCards(2, {
        startDate: Date.parse("2019-04-10T17:00"),
        endDate: Date.parse("2019-04-10T23:59"),
        tags: ['tag1']
    }));
    testCards = testCards.concat(getSeveralRandomLightCards(2, {startDate: Date.parse("2019-04-10T00:00")}));
    testCards = testCards.concat(getSeveralRandomLightCards(2, {startDate: Date.parse("2019-04-10T15:00")}));
    testCards = testCards.concat(getSeveralRandomLightCards(2, {startDate: Date.parse("2019-04-10T17:00")}));
    return testCards;
}

describe('FilterService', () => {
    let service: FilterService;
    let store: Store<AppState>;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                StoreModule.forRoot(appReducer),]
        });
        service = TestBed.get(FilterService);
        store = TestBed.get(Store);

    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    describe('time filter', () => {
        it('should not filter if inactive', () => {
            const timeFilter = service.defaultFilters.get(FilterType.TIME_FILTER);
            let testCards = buildTestCards();
            timeFilter.status.start = Date.parse("2019-04-10T08:00");
            timeFilter.status.end = Date.parse("2019-04-10T16:00");
            timeFilter.active = false;

            const filteredCards = testCards.filter((card) => timeFilter.applyFilter(card));
            expect(filteredCards.length).toBe(16)
        });
        it('should filter whith start and end', () => {
            let testCards = buildTestCards();
            const timeFilter = service.defaultFilters.get(FilterType.TIME_FILTER);
            timeFilter.status.start = Date.parse("2019-04-10T08:00");
            timeFilter.status.end = Date.parse("2019-04-10T16:00");
            timeFilter.active = true;
            const filteredCards = testCards.filter((card) => timeFilter.applyFilter(card));
            expect(filteredCards.length).toBe(10);
        });
        it('should filter whith start', () => {
            let testCards = buildTestCards();
            const timeFilter = service.defaultFilters.get(FilterType.TIME_FILTER);
            timeFilter.status.start = Date.parse("2019-04-10T08:00");
            timeFilter.active = true;
            const filteredCards = testCards.filter((card) => timeFilter.applyFilter(card));
            expect(filteredCards.length).toBe(14);
        });
        it('should filter whith end', () => {
            let testCards = buildTestCards();
            const timeFilter = service.defaultFilters.get(FilterType.TIME_FILTER);
            timeFilter.status.end = Date.parse("2019-04-10T16:00");
            timeFilter.active = true;
            const filteredCards = testCards.filter((card) => timeFilter.applyFilter(card));
            expect(filteredCards.length).toBe(12);
        });
    });
    describe('tag filter', () => {
        it('should not filter if inactive', () => {
            const tagFilter = service.defaultFilters.get(FilterType.TAG_FILTER);
            let testCards = buildTestCards();
            tagFilter.status.tags = ['tag1', 'tag2'];
            tagFilter.active = false;

            const filteredCards = testCards.filter((card) => tagFilter.applyFilter(card));
            expect(filteredCards.length).toBe(16)
        });
        it('should not filter if inactive', () => {
            const tagFilter = service.defaultFilters.get(FilterType.TAG_FILTER);
            let testCards = buildTestCards();
            tagFilter.status.tags = ['tag1', 'tag2'];
            tagFilter.active = true;

            let filteredCards = testCards.filter((card) => tagFilter.applyFilter(card));
            expect(filteredCards.length).toBe(10);

            tagFilter.status.tags = ['tag1'];
            filteredCards = testCards.filter((card) => tagFilter.applyFilter(card));
            expect(filteredCards.length).toBe(6);
        });
    });
});
