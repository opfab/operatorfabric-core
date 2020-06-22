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
import {Action, Store} from '@ngrx/store';
import {Observable, of} from 'rxjs';
import {catchError, map, switchMap} from 'rxjs/operators';
import {AppState} from "@ofStore/index";
import {
    LoadSettings,
    LoadSettingsFailure,
    LoadSettingsSuccess,
    PatchSettings,
    PatchSettingsFailure,
    PatchSettingsSuccess,
    SettingsActionTypes
} from "@ofActions/settings.actions";
import {SettingsService} from "@ofServices/settings.service";
import { UserActionsTypes } from '@ofStore/actions/user.actions';
import { AcceptLogIn } from '@ofStore/actions/authentication.actions';

// those effects are unused for the moment
@Injectable()
export class SettingsEffects {

    /* istanbul ignore next */
    constructor(private store: Store<AppState>,
                private actions$: Actions,
                private service: SettingsService
    ) {}


    /**
     * Manages settings load -> service request -> success/message
     */
    @Effect()
    loadSettings: Observable<Action> = this.actions$
        .pipe(
            ofType<LoadSettings>(SettingsActionTypes.LoadSettings),
            switchMap(action => this.service.fetchUserSettings()),
            map((settings: any) => {
                return new LoadSettingsSuccess({settings: settings});
            }),
            catchError((err, caught) => of(new LoadSettingsFailure(err)))
        );


    @Effect()
    loadSettingsOnLogin: Observable<Action> = this.actions$.pipe(
      ofType<AcceptLogIn>(UserActionsTypes.UserApplicationRegistered),
      map(a=>new LoadSettings())
    );

    @Effect()
    patchSettings: Observable<Action> = this.actions$.pipe(
        ofType(SettingsActionTypes.PatchSettings),
        switchMap((action:PatchSettings)=>this.service.patchUserSettings(action.payload.settings)),
        map(settings => new PatchSettingsSuccess({settings:settings})),
        catchError((err, caught) => of(new PatchSettingsFailure(err)))
    );
}
