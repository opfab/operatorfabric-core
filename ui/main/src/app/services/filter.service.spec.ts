/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
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
        publishDate: Date.parse("2019-04-10T00:00"),
        tags: ['tag1']
    }));
    testCards = testCards.concat(getSeveralRandomLightCards(2, {
        startDate: Date.parse("2019-04-10T00:00"),
        endDate: Date.parse("2019-04-10T06:00"),
        publishDate: Date.parse("2019-04-10T00:00"),
        tags: ['tag2']
    }));
    testCards = testCards.concat(getSeveralRandomLightCards(2, {
        startDate: Date.parse("2019-04-10T00:00"),
        endDate: Date.parse("2019-04-10T09:00"),
        publishDate: Date.parse("2019-04-10T00:00"),
        tags: ['tag1']
    }));
    testCards = testCards.concat(getSeveralRandomLightCards(2, {
        startDate: Date.parse("2019-04-10T15:00"),
        endDate: Date.parse("2019-04-10T23:59"),
        publishDate: Date.parse("2019-04-10T15:00"),
        tags: ['tag2']
    }));
    testCards = testCards.concat(getSeveralRandomLightCards(2, {
        startDate: Date.parse("2019-04-10T17:00"),
        endDate: Date.parse("2019-04-10T23:59"),
        publishDate: Date.parse("2019-04-10T17:00"),
        tags: ['tag1']
    }));
    testCards = testCards.concat(getSeveralRandomLightCards(2, {startDate: Date.parse("2019-04-10T00:00"),publishDate: Date.parse("2019-04-10T00:00")}));
    testCards = testCards.concat(getSeveralRandomLightCards(2, {startDate: Date.parse("2019-04-10T15:00"),publishDate: Date.parse("2019-04-10T15:00")}));
    testCards = testCards.concat(getSeveralRandomLightCards(2, {startDate: Date.parse("2019-04-10T17:00"),publishDate: Date.parse("2019-04-10T17:00")}));
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
        service = TestBed.inject(FilterService);
        store = TestBed.inject(Store);

    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    describe('time filter', () => {
        it('should not filter if inactive', () => {
            const businessDateFilter = service.defaultFilters().get(FilterType.BUSINESSDATE_FILTER);
            let testCards = buildTestCards();
            businessDateFilter.status.start = Date.parse("2019-04-10T08:00");
            businessDateFilter.status.end = Date.parse("2019-04-10T16:00");
            businessDateFilter.active = false;

            const filteredCards = testCards.filter((card) => businessDateFilter.applyFilter(card));
            expect(filteredCards.length).toBe(16)
        });
        it('should filter whith start and end', () => {
            let testCards = buildTestCards();
            const businessDateFilter = service.defaultFilters().get(FilterType.BUSINESSDATE_FILTER);
            businessDateFilter.status.start = Date.parse("2019-04-10T08:00");
            businessDateFilter.status.end = Date.parse("2019-04-10T16:00");
            businessDateFilter.active = true;
            const filteredCards = testCards.filter((card) => businessDateFilter.applyFilter(card));
            expect(filteredCards.length).toBe(10);
        });
        it('should filter whith start', () => {
            let testCards = buildTestCards();
            const businessDateFilter = service.defaultFilters().get(FilterType.BUSINESSDATE_FILTER);
            businessDateFilter.status.start = Date.parse("2019-04-10T08:00");
            businessDateFilter.active = true;
            const filteredCards = testCards.filter((card) => businessDateFilter.applyFilter(card));
            expect(filteredCards.length).toBe(14);
        });
        it('should filter whith end', () => {
            let testCards = buildTestCards();
            const businessDateFilter = service.defaultFilters().get(FilterType.BUSINESSDATE_FILTER);
            businessDateFilter.status.end = Date.parse("2019-04-10T16:00");
            businessDateFilter.active = true;
            const filteredCards = testCards.filter((card) => businessDateFilter.applyFilter(card));
            expect(filteredCards.length).toBe(12);
        });
    });
    describe('publishDate filter', () => {
        it('should not filter if inactive', () => {
            const publishDateFilter = service.defaultFilters().get(FilterType.PUBLISHDATE_FILTER);
            let testCards = buildTestCards();
            publishDateFilter.status.start = Date.parse("2019-04-10T08:00");
            publishDateFilter.status.end = Date.parse("2019-04-10T16:00");
            publishDateFilter.active = false;

            const filteredCards = testCards.filter((card) => publishDateFilter.applyFilter(card));
            expect(filteredCards.length).toBe(16)
        });
        it('should filter whith start and end', () => {
            let testCards = buildTestCards();
            const publishDateFilter = service.defaultFilters().get(FilterType.PUBLISHDATE_FILTER);
            publishDateFilter.status.start = Date.parse("2019-04-10T08:00");
            publishDateFilter.status.end = Date.parse("2019-04-10T16:00");
            publishDateFilter.active = true;
            const filteredCards = testCards.filter((card) => publishDateFilter.applyFilter(card));
            expect(filteredCards.length).toBe(4);
        });
        it('should filter whith start', () => {
            let testCards = buildTestCards();
            const publishDateFilter = service.defaultFilters().get(FilterType.PUBLISHDATE_FILTER);
            publishDateFilter.status.start = Date.parse("2019-04-10T08:00");
            publishDateFilter.active = true;
            const filteredCards = testCards.filter((card) => publishDateFilter.applyFilter(card));
            expect(filteredCards.length).toBe(8);
        });
        it('should filter whith end', () => {
            let testCards = buildTestCards();
            const publishDateFilter = service.defaultFilters().get(FilterType.PUBLISHDATE_FILTER);
            publishDateFilter.status.end = Date.parse("2019-04-10T16:00");
            publishDateFilter.active = true;
            const filteredCards = testCards.filter((card) => publishDateFilter.applyFilter(card));
            expect(filteredCards.length).toBe(12);
        });
    });
    describe('tag filter', () => {
        it('should not filter if inactive', () => {
            const tagFilter = service.defaultFilters().get(FilterType.TAG_FILTER);
            let testCards = buildTestCards();
            tagFilter.status.tags = ['tag1', 'tag2'];
            tagFilter.active = false;

            const filteredCards = testCards.filter((card) => tagFilter.applyFilter(card));
            expect(filteredCards.length).toBe(16)
        });
        it('should not filter if inactive', () => {
            const tagFilter = service.defaultFilters().get(FilterType.TAG_FILTER);
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
