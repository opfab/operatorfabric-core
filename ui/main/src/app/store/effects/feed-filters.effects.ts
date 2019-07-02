/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Observable} from 'rxjs';
import {
    concatMap,
    distinctUntilChanged,
    filter,
    map,
    reduce,
    switchMap,
    tap,
    windowTime,
    withLatestFrom
} from 'rxjs/operators';
import {AuthenticationActionTypes} from '@ofActions/authentication.actions';
import {Action, Store} from "@ngrx/store";
import {AppState} from "@ofStore/index";
import {FilterService, FilterType} from "@ofServices/filter.service";
import {ApplyFilter, InitFilters} from "@ofActions/feed.actions";
import {LoadSettingsSuccess, SettingsActionTypes} from "@ofActions/settings.actions";
import {buildConfigSelector} from "@ofSelectors/config.selectors";
import {Tick, TimeActionTypes} from "@ofActions/time.actions";
import {buildFilterSelector} from "@ofSelectors/feed.selectors";

@Injectable()
export class FeedFiltersEffects {

    //private elapsedTimeBuffer: number;

    /* istanbul ignore next */
    constructor(private store: Store<AppState>,
                private actions$: Actions,
                private service: FilterService) {
    }

    @Effect()
    loadFeedFilterOnAuthenticationSuccess: Observable<Action> = this.actions$
        .pipe(
            // loads card operations only after authentication of a default user ok.
            tap(v=>console.log("loadFeedFilterOnAuthenticationSuccess: action start", v)),
            ofType(AuthenticationActionTypes.AcceptLogIn),
            map((action) => {
                return new InitFilters({filters:this.service.defaultFilters()});
            }));

    @Effect()
    initTagFilterOnLoadedSettings: Observable<Action> = this.actions$
        .pipe(
            // tap(v=>console.log("initTagFilterOnLoadedSettings: action start", v)),
            ofType<LoadSettingsSuccess>(SettingsActionTypes.LoadSettingsSuccess),
            withLatestFrom(this.store.select(buildConfigSelector('settings.defaultTags'))),
            // tap(v=>console.log("initTagFilterOnLoadedSettings: latest config", v)),
            map(([action,configTags])=>{
                if(action.payload.settings.defaultTags && action.payload.settings.defaultTags.length>0)
                    return action.payload.settings.defaultTags;
                else if (configTags && configTags.length > 0)
                    return configTags;
                return null;
            }),
            // tap(v=>console.log("initTagFilterOnLoadedSettings: mapped tag array", v)),
            filter(v=>!!v),
            // tap(v=>console.log("initTagFilterOnLoadedSettings: filtered empty array", v)),
            map(v=>new ApplyFilter({name:FilterType.TAG_FILTER,active:true,status:{tags:v}})),
            // tap(v=>console.log("initTagFilterOnLoadedSettings: mapped action", v))
        );

    @Effect()
    updateFilterOnClockTick: Observable<Action> = this.store.select(buildConfigSelector('feed.timeFilter.followClockTick'))
        .pipe(
            distinctUntilChanged(),
            switchMap(followClockTick => {
                if(followClockTick) {
                    return this.actions$
                        .pipe(
                            ofType<Tick>(TimeActionTypes.Tick),
                            windowTime(20000),  // add up the elapsed time from each Tick action in local buffer, waiting for next emission
                            concatMap(tickWindow => tickWindow.pipe(
                                map(tick => tick.payload.elapsedSinceLast),
                                reduce((acc, elapsedSinceLast) => acc + elapsedSinceLast))),
                            withLatestFrom(this.store.select(buildFilterSelector(FilterType.TIME_FILTER))),
                            filter(([elapsedSinceLast, currentTimeFilter]) => (currentTimeFilter.active && (!!currentTimeFilter.status.start || !!currentTimeFilter.status.end))),
                            map(([elapsedSinceLast, currentTimeFilter]) => {
                                const start = currentTimeFilter.status.start == null ? null : currentTimeFilter.status.start + elapsedSinceLast;
                                const end = currentTimeFilter.status.end == null ? null : currentTimeFilter.status.end + elapsedSinceLast;
                                return new ApplyFilter({
                                    name: FilterType.TIME_FILTER,
                                    active: true,
                                    status: {
                                        start: start,
                                        end: end,
                                    }
                                })
                            }))
                }
            })
        )
    //DONE Add and manage elapsed time since last heart beat info
    //DONE Fix existing tests
    //DONE Get previous filter status to update
    //DONE Debounce events with a certain delay
    //TODO Make delay a configurable property
    //TODO Make sure we're not one elapsedTime short
    //DONE Only do it if followClockTick property is set to true
    //TODO Manual tests, including time reference / speed update
    //TODO Add tests
    //TODO Update doc & define properties
    //DONE Test with and without timeline, with and without follow clock tick
    //TODO Add default value somewhere (config file) if needed (see what happens if no value)


}
