/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Observable} from 'rxjs';
import {filter, map, withLatestFrom} from 'rxjs/operators';
import {Action, Store} from "@ngrx/store";
import {AppState} from "@ofStore/index";
import {FilterService, FilterType} from "@ofServices/filter.service";
import {ApplyFilter} from "@ofActions/feed.actions";
import {LoadSettingsSuccess, SettingsActionTypes} from "@ofActions/settings.actions";
import {buildConfigSelector} from "@ofSelectors/config.selectors";
import {Tick, TimeActionTypes} from "@ofActions/time.actions";
import {buildFilterSelector} from "@ofSelectors/feed.selectors";

@Injectable()
export class FeedFiltersEffects {

    private followClockTick = false;

    //Constants used by the updateFilterOnClockTick effect if the feed.timeFilter.followClockTick property is set to true
    private elapsedSoFar = 0;
    /*The time filter should only be refreshed once the accumulated shift in time is 1m
    (since the time filter component only displays the time up to minutes)*/
    private refreshThreshold = 60000;


    /* istanbul ignore next */
    constructor(private store: Store<AppState>,
                private actions$: Actions,
                private service: FilterService) {

        this.store.select(buildConfigSelector('feed.timeFilter.followClockTick')).subscribe(x => this.followClockTick = x);

    }

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
            map(v=> {
                console.log(new Date().toISOString(),"BUG OC-604 feed_filters.effects.ts initTagFilterOnLoadedSettings ");
                return new ApplyFilter({name:FilterType.TAG_FILTER,active:true,status:{tags:v}});
            })
            // tap(v=>console.log("initTagFilterOnLoadedSettings: mapped action", v))
        );

    @Effect()
    updateFilterOnClockTick: Observable<any> = this.actions$
        .pipe(
            filter(x => this.followClockTick),
            ofType<Tick>(TimeActionTypes.Tick),
            map( tick => {
                const newElapsedSoFar = this.elapsedSoFar+tick.payload.elapsedSinceLast;
                if(newElapsedSoFar>=this.refreshThreshold){
                    this.elapsedSoFar = newElapsedSoFar - this.refreshThreshold;
                    return this.refreshThreshold;
                } else {
                    this.elapsedSoFar = newElapsedSoFar;
                    return newElapsedSoFar;
                }
            }),
            filter(time => (time >= this.refreshThreshold)), //Only emit accumulation values that are above the threshold
            withLatestFrom(this.store.select(buildFilterSelector(FilterType.TIME_FILTER))),
            filter(([elapsedSinceLast, currentTimeFilter]) => (currentTimeFilter.active && (!!currentTimeFilter.status.start || !!currentTimeFilter.status.end))),
            //updates should only be sent if the filter is active and if there is something to shift (start or end)
            map(([elapsedSinceLast, currentTimeFilter]) => {
                const start = currentTimeFilter.status.start == null ? null : currentTimeFilter.status.start + elapsedSinceLast;
                const end = currentTimeFilter.status.end == null ? null : currentTimeFilter.status.end + elapsedSinceLast;
                console.log(new Date().toISOString(),"BUG OC-604 updateFilterOnClockTick()  start= ", start,",end=",end);
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
