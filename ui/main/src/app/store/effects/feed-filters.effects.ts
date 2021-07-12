/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {Observable} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {ConfigService} from '@ofServices/config.service';

import {Action, Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {FilterService, FilterType} from '@ofServices/filter.service';
import {
    ApplyFilter,
    ApplySeveralFilters,
    FeedActionTypes,
    ResetFilter
} from '@ofActions/feed.actions';
import {LoadSettingsSuccess, SettingsActionTypes} from '@ofActions/settings.actions';

@Injectable()
export class FeedFiltersEffects {


    /* istanbul ignore next */
    constructor(private store: Store<AppState>,
                private actions$: Actions,
                private configService: ConfigService,
                private service: FilterService) {

    }

    
    initTagFilterOnLoadedSettings: Observable<Action> = createEffect(() => this.actions$
        .pipe(
            ofType<LoadSettingsSuccess>(SettingsActionTypes.LoadSettingsSuccess),
            map(action => {
                const configTags = this.configService.getConfigValue('settings.defaultTags');
                if (action.payload.settings.defaultTags && action.payload.settings.defaultTags.length > 0) {
                    return action.payload.settings.defaultTags;
                } else if (configTags && configTags.length > 0) {
                    return configTags;
                }
                return null;
            }),
            filter(v => !!v),
            map(v => {
                return new ApplyFilter({name: FilterType.TAG_FILTER, active: true, status: {tags: v}});
            })
        ));

    
    resetFeedFilter: Observable<Action> = createEffect(() => this.actions$
        .pipe(
            ofType<ResetFilter>(FeedActionTypes.ResetFilter),
            map(() => new ApplySeveralFilters({filterStatuses: this.service.defaultFilters()}))
        ));

}
