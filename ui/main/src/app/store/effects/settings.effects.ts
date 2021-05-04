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
import {Action, Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {catchError, map, switchMap} from 'rxjs/operators';
import {AppState} from "@ofStore/index";
import {
    LoadSettings,
    LoadSettingsSuccess,
    PatchSettings,
    PatchSettingsSuccess,
    SettingsActionTypes
} from "@ofActions/settings.actions";
import {SettingsService} from "@ofServices/settings.service";
import {UserActionsTypes} from '@ofStore/actions/user.actions';
import {AcceptLogIn} from '@ofStore/actions/authentication.actions';


@Injectable()
export class SettingsEffects {


    constructor(private store: Store<AppState>,
                private actions$: Actions,
                private service: SettingsService
    ) {}
    
    loadSettings: Observable<Action> = createEffect(() => this.actions$
        .pipe(
            ofType<LoadSettings>(SettingsActionTypes.LoadSettings),
            switchMap(action => this.service.fetchUserSettings()),
            map((settings: any) => {
                return new LoadSettingsSuccess({settings: settings});
            }),
            catchError((err,caught) => {
            if (err.status === 404) console.log(new Date().toISOString(),"No settings for user");
            else console.error(new Date().toISOString(),"Error when loading settings", err);
            return caught;
            })
        ));

    loadSettingsOnLogin: Observable<Action> = createEffect(() => this.actions$.pipe(
      ofType<AcceptLogIn>(UserActionsTypes.UserApplicationRegistered),
      map(a=>new LoadSettings())
    ));

    patchSettings: Observable<Action> = createEffect(() => this.actions$.pipe(
        ofType(SettingsActionTypes.PatchSettings),
        switchMap((action:PatchSettings)=>this.service.patchUserSettings(action.payload.settings)),
        map(settings => new PatchSettingsSuccess({settings:settings})),
        catchError((err,caught) => {
            console.error(new Date().toISOString(),"Error when patching settings", err);
            return caught;
        })
    ));
}
