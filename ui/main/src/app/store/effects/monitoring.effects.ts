/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from '@angular/core';
import {AppState} from '@ofStore/index';
import {Action, Store} from '@ngrx/store';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {Observable} from 'rxjs';
import {
    HandleUnexpectedError,
    MonitoringActionType,
    SendMonitoringQuery,
    UpdateMonitoringFilter
} from '@ofActions/monitoring.actions';
import {catchError, map} from 'rxjs/operators';

@Injectable()
export class MonitoringEffects {
    constructor(private store: Store<AppState>
        , private actions$: Actions) {
    }

    
    queryMonitoringResult: Observable<Action> = createEffect(() => this.actions$.pipe(
        ofType(MonitoringActionType.SendMonitoringQuery),
        map((action: SendMonitoringQuery) => action.payload.params),
        map( (params: Map<string, string[]>) =>  new UpdateMonitoringFilter({filters: params})),
        catchError((error, caught) => {
            this.store.dispatch(new HandleUnexpectedError({error: error}));
            return caught;
        })
    ));

}
