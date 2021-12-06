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
import {EMPTY, Observable} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {ConfigService} from '@ofServices/config.service';
import {FilterType} from '@ofModel/feed-filter.model';
import {LoadSettingsSuccess, SettingsActionTypes} from '@ofActions/settings.actions';
import {FilterService} from '@ofServices/lightcards/filter.service';

@Injectable()
export class FeedFiltersEffects {

    constructor(
                private actions$: Actions,
                private configService: ConfigService,
                private filterService: FilterService) {
    }

    initTagFilterOnLoadedSettings: Observable<any> = createEffect(() => this.actions$
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
                this.filterService.updateFilter( FilterType.TAG_FILTER,true, {tags: v});
                return EMPTY;
            })
        ), { dispatch: false });


}
