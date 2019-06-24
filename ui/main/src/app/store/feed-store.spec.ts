/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {async, TestBed} from '@angular/core/testing';

import {appReducer, AppState, storeConfig} from '@ofStore/index';
import {Store, StoreModule} from '@ngrx/store';
import {LoadLightCardsSuccess} from '@ofStore/actions/light-card.actions';
import {LightCard} from '@ofModel/light-card.model';
import {getSeveralRandomLightCards} from '@tests/helpers';
import {NO_ERRORS_SCHEMA} from "@angular/core";
import {selectFilteredFeed} from "@ofStore/selectors/feed.selectors";
import {cold} from "jasmine-marbles";
import {ApplyFilter, InitFilters} from "@ofActions/feed.actions";
import {Filter} from "@ofModel/feed-filter.model";
import {tap} from "rxjs/operators";
import {FilterType} from "@ofServices/filter.service";
import {compareByLttd, compareBySeverityLttdPublishDate} from "@ofStates/feed.state";

describe('Feed store', () => {
    let store: Store<AppState>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                StoreModule.forRoot(appReducer, storeConfig)],
            providers: [{provide: Store, useClass: Store}],
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents();
        store = TestBed.get(Store);
        spyOn(store, 'dispatch').and.callThrough();
    }));

    it('should be filtered when an all or nothing filter is activated', () => {
        const lightCards: LightCard[] = getSeveralRandomLightCards(3).sort(compareBySeverityLttdPublishDate);
        const loadCardAction = new LoadLightCardsSuccess({lightCards: lightCards});
        const filters = new Map();
        const testFilter = new Filter(
            () => false,
            true,
            {}
        );
        filters.set(FilterType.TEST_FILTER, testFilter);
        const initFilterAction = new InitFilters({filters: filters});
        const applyFilterAction = new ApplyFilter({name: FilterType.TEST_FILTER, active: false, status: {}});

        const feed = store.select(selectFilteredFeed).pipe(tap(feed => {
            console.debug(feed)
        }));
        const possibleValues = {a: [], b: lightCards};
        expect(feed).toBeObservable(cold("a", possibleValues));
        store.dispatch(loadCardAction);
        expect(feed).toBeObservable(cold("b", possibleValues));
        store.dispatch(initFilterAction);
        expect(feed).toBeObservable(cold("a", possibleValues));
        store.dispatch(applyFilterAction);
        expect(feed).toBeObservable(cold("b", possibleValues));


    });

    it('should be filtered when an evict odd filter is activated', () => {
        const lightCards: LightCard[] = getSeveralRandomLightCards(3).sort(compareBySeverityLttdPublishDate);
        const loadCardAction = new LoadLightCardsSuccess({lightCards: lightCards});
        let count = -1;
        const filters = new Map();
        const testFilter = new Filter(
            (card, status) => {
                count = count + 1;
                return count % 2 == 0
            },
            true,
            {}
        );
        filters.set(FilterType.TEST_FILTER, testFilter);
        const initFilterAction = new InitFilters({filters:filters});
        const applyFilterAction = new ApplyFilter({name: FilterType.TEST_FILTER, active: false, status: {}});

        const feed = store.select(selectFilteredFeed).pipe(tap(feed => {
            console.debug(feed)
        }));
        const possibleValues = {a: [], b: lightCards, c: lightCards.filter((card, index) => (index % 2) == 0)};
        expect(feed).toBeObservable(cold("a", possibleValues));
        store.dispatch(loadCardAction);
        expect(feed).toBeObservable(cold("b", possibleValues));
        store.dispatch(initFilterAction);
        expect(feed).toBeObservable(cold("c", possibleValues));
        store.dispatch(applyFilterAction);
        expect(feed).toBeObservable(cold("b", possibleValues));


    });
});
