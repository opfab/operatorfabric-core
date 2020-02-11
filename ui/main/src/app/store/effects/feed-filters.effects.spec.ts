/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


import {Actions} from '@ngrx/effects';
import {hot} from 'jasmine-marbles';
import {FeedFiltersEffects} from "@ofEffects/feed-filters.effects";
import {Filter} from "@ofModel/feed-filter.model";
import {ApplyFilter, InitFilters} from "@ofActions/feed.actions";
import {LoadSettingsSuccess} from "@ofActions/settings.actions";
import {of} from "rxjs";
import {FilterService, FilterType} from "@ofServices/filter.service";
import {async, TestBed} from "@angular/core/testing";
import {Store} from "@ngrx/store";
import {AppState} from "@ofStore/index";
import {map} from "rxjs/operators";
import {configInitialState} from "@ofStates/config.state";
import {feedInitialState} from "@ofStates/feed.state";
import {Tick, TickPayload} from "@ofActions/time.actions";
import {emptyAppState4Test} from "@tests/helpers";
// import moment = require("moment-timezone");
import moment from 'moment-timezone';
import createSpyObj = jasmine.createSpyObj;
import SpyObj = jasmine.SpyObj;
import { User } from '@ofModel/user.model';
import { UserApplicationRegistered } from '@ofStore/actions/user.actions';

describe('FeedFilterEffects', () => {
    let effects: FeedFiltersEffects;
    let localMockFeedFilterService:SpyObj<FilterService>;
    let mockStore:SpyObj<Store<AppState>>;
    let emptyAppState: AppState = emptyAppState4Test;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [
                {provide: FilterService, useValue: createSpyObj('FilterService', ['defaultFilters'])},
                {provide: Store, useValue: createSpyObj('Store', ['dispatch', 'select'])}
            ]
        });

    }));
    beforeEach(() => {
        localMockFeedFilterService = TestBed.get(FilterService);
        mockStore = TestBed.get(Store);
    });

    describe('loadFeedFilterOnAuthenticationSuccess', () => {

        it('should return a InitFilter Action', () => {
            const localActions$ = new Actions(hot('a', {a: new UserApplicationRegistered({user: new User("userRegisterd", "aa", "bb")})}));

            const defaultFilters= new Map();
            defaultFilters.set('testFilter',
                new Filter(
                    () => false,
                    false,
                    {}
                ));

            localMockFeedFilterService.defaultFilters.and.returnValue(defaultFilters);

            const expectedAction = new InitFilters({filters: localMockFeedFilterService.defaultFilters()});
            const localExpected = hot('c', {c: expectedAction});

            mockStore.select.and.returnValue(of(null)); //needed otherwise "TypeError: Cannot read property 'pipe' of undefined"

            effects = new FeedFiltersEffects(mockStore, localActions$, localMockFeedFilterService);

            expect(effects).toBeTruthy();
            expect(effects.loadFeedFilterOnAuthenticationSuccess).toBeObservable(localExpected);
        });

    });
    describe('initTagFilterOnLoadedSettings', () => {
        it('should return nothing if no default tags', () => {
            const localActions$ = new Actions(hot('a', {a: new LoadSettingsSuccess({settings:{}})}));

            const localExpected = hot('', {});

            mockStore.select.and.returnValue(of(null));
            effects = new FeedFiltersEffects(mockStore, localActions$, localMockFeedFilterService);

            expect(effects).toBeTruthy();
            expect(effects.initTagFilterOnLoadedSettings).toBeObservable(localExpected);
        });
        it('should return nothing if default tags is set to null', () => {
            const localActions$ = new Actions(hot('a', {a: new LoadSettingsSuccess({settings:{defaultTags:null}})}));

            const localExpected = hot('', {c:new ApplyFilter({name:FilterType.TAG_FILTER,active:true,status:{tags:['test1']}})});

            mockStore.select.and.returnValue(of(null));
            effects = new FeedFiltersEffects(mockStore, localActions$, localMockFeedFilterService);

            expect(effects).toBeTruthy();
            expect(effects.initTagFilterOnLoadedSettings).toBeObservable(localExpected);
        });
        it('should return nothing if default tags is set to empty', () => {
            const localActions$ = new Actions(hot('a', {a: new LoadSettingsSuccess({settings:{defaultTags:[]}})}));

            const localExpected = hot('', {c:new ApplyFilter({name:FilterType.TAG_FILTER,active:true,status:{tags:['test1']}})});

            mockStore.select.and.returnValue(of(null));
            effects = new FeedFiltersEffects(mockStore, localActions$, localMockFeedFilterService);

            expect(effects).toBeTruthy();
            expect(effects.initTagFilterOnLoadedSettings).toBeObservable(localExpected);
        });
        it('should return ApplyFilter with settings value if default tags is set in settings', () => {
            const localActions$ = new Actions(hot('-a', {a: new LoadSettingsSuccess({settings:{defaultTags:['test1']}})}));

            const localExpected = hot('-c', {c:new ApplyFilter({name:FilterType.TAG_FILTER,active:true,status:{tags:['test1']}})});

            mockStore.select.and.returnValue(of(null));
            effects = new FeedFiltersEffects(mockStore, localActions$, localMockFeedFilterService);

            expect(effects).toBeTruthy();
            expect(effects.initTagFilterOnLoadedSettings).toBeObservable(localExpected);
        });
        it('should return ApplyFilter with settings value if default tags is set in settings over default configuration', () => {
            const localActions$ = new Actions(hot('-a', {a: new LoadSettingsSuccess({settings:{defaultTags:['test1']}})}));

            const localExpected = hot('-c', {c:new ApplyFilter({name:FilterType.TAG_FILTER,active:true,status:{tags:['test1']}})});

            mockStore.select.and.returnValue(of(['test2']));
            effects = new FeedFiltersEffects(mockStore, localActions$, localMockFeedFilterService);

            expect(effects).toBeTruthy();
            expect(effects.initTagFilterOnLoadedSettings).toBeObservable(localExpected);
        });
        it('should return ApplyFilter with default config value if default tags is null set in settings', () => {
            const localActions$ = new Actions(hot('-a', {a: new LoadSettingsSuccess({settings:{defaultTags:null}})}));

            const localExpected = hot('-c', {c:new ApplyFilter({name:FilterType.TAG_FILTER,active:true,status:{tags:['test2']}})});

            mockStore.select.and.returnValue(of(['test2']));
            effects = new FeedFiltersEffects(mockStore, localActions$, localMockFeedFilterService);

            expect(effects).toBeTruthy();
            expect(effects.initTagFilterOnLoadedSettings).toBeObservable(localExpected);
        });
        it('should return ApplyFilter with default config value if default tags is empty set in settings', () => {
            const localActions$ = new Actions(hot('-a', {a: new LoadSettingsSuccess({settings:{defaultTags:[]}})}));

            const localExpected = hot('-c', {c:new ApplyFilter({name:FilterType.TAG_FILTER,active:true,status:{tags:['test2']}})});

            mockStore.select.and.returnValue(of(['test2']));
            effects = new FeedFiltersEffects(mockStore, localActions$, localMockFeedFilterService);

            expect(effects).toBeTruthy();
            expect(effects.initTagFilterOnLoadedSettings).toBeObservable(localExpected);
        });
    });

    describe('updateFilterOnClockTick', () => {

        let initialStart, initialEnd, timeBetweenTicks, refreshThreshold: number;
        let filters: Map<any,any>;

        beforeAll(() => {
        initialStart = 1562250123000;
        initialEnd = 1562422923000;

        timeBetweenTicks = 10000;
        refreshThreshold = 60000;

        filters = new Map();
        const initialFilter = new Filter(
            (card,status)=>true,
            true,
            {start: initialStart, end: initialEnd}
        );
        filters.set(FilterType.TIME_FILTER,initialFilter);
        });

        it('should return nothing if followClockTick property is set to false', () => {

            const localActions$ = new Actions(hot('aaaaaa', {a: new Tick(new TickPayload(moment(), timeBetweenTicks))}));

            const localExpected = hot('------');

            mockStore.select.and.callFake(buildFn =>
            {
                return of({
                        ...emptyAppState,
                        config: {
                            ...configInitialState,
                            config: {
                                feed: {
                                    timeFilter: {
                                        followClockTick: false
                                    }
                                }
                            }
                        },
                        feed: {
                            ...feedInitialState,
                            filters: filters
                        }
                    }
                ).pipe(
                    map(v => buildFn(v))
                )
            }  )

            effects = new FeedFiltersEffects(mockStore, localActions$, localMockFeedFilterService);

            expect(effects).toBeTruthy();
            expect(effects.updateFilterOnClockTick).toBeObservable(localExpected);

        });

        it('should return ApplyFilter actions  if followClockTick property is set to true', () => {


            const localActions$ = new Actions(hot('aaaaaa', {a: new Tick(new TickPayload(moment(), timeBetweenTicks))}));

            const localExpected = hot('-----b', {b: new ApplyFilter({
                    name: FilterType.TIME_FILTER,
                    active: true,
                    status: {
                        start: initialStart + refreshThreshold,
                        end: initialEnd + refreshThreshold
                    }
                })
            });

            mockStore.select.and.callFake(buildFn =>
            {
                return of({
                        ...emptyAppState,
                        config: {
                            ...configInitialState,
                            config: {
                                feed: {
                                    timeFilter: {
                                        followClockTick: true
                                    }
                                }
                            }
                        },
                        feed: {
                            ...feedInitialState,
                            filters: filters
                        }
                    }
                ).pipe(
                    map(v => buildFn(v))
                )
            }  )


            effects = new FeedFiltersEffects(mockStore, localActions$, localMockFeedFilterService);

            expect(effects).toBeTruthy();
            expect(effects.updateFilterOnClockTick).toBeObservable(localExpected);

        });
    });

});
