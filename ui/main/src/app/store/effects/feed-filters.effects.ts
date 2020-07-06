/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Observable} from 'rxjs';
import {filter, map, withLatestFrom} from 'rxjs/operators';
import {Action, Store} from "@ngrx/store";
import {AppState} from "@ofStore/index";
import {FilterType} from "@ofServices/filter.service";
import {ApplyFilter} from "@ofActions/feed.actions";
import {LoadSettingsSuccess, SettingsActionTypes} from "@ofActions/settings.actions";
import {ConfigService} from "@ofServices/config.service";


@Injectable()
export class FeedFiltersEffects {


    /* istanbul ignore next */
    constructor(private store: Store<AppState>,
                private actions$: Actions,
                private configService: ConfigService) {

    }

    @Effect()
    initTagFilterOnLoadedSettings: Observable<Action> = this.actions$
        .pipe(

            ofType<LoadSettingsSuccess>(SettingsActionTypes.LoadSettingsSuccess),
            map(action=>{
                const configTags = this.configService.getConfigValue('settings.defaultTags');
                if(action.payload.settings.defaultTags && action.payload.settings.defaultTags.length>0)
                    return action.payload.settings.defaultTags;
                else if (configTags && configTags.length > 0)
                    return configTags;
                return null;
            }),
            filter(v=>!!v),
            map(v=> {
                console.log(new Date().toISOString(),"BUG OC-604 feed_filters.effects.ts initTagFilterOnLoadedSettings ");
                return new ApplyFilter({name:FilterType.TAG_FILTER,active:true,status:{tags:v}});
            })
        );
}
