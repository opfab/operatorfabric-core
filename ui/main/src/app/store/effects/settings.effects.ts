/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Action, Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {catchError, map, switchMap} from 'rxjs/operators';
import {AppState} from "@ofStore/index";
import {LoadSettings, LoadSettingsFailure, LoadSettingsSuccess, SettingsActionTypes} from "@ofActions/settings.actions";
import {AcceptLogIn, AuthenticationActionTypes} from "@ofActions/authentication.actions";
import {SettingsService} from "@ofServices/settings.service";

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
            catchError((err, caught) => {
                this.store.dispatch(new LoadSettingsFailure(err));
                return caught;
            })
        );

    @Effect()
    loadSettingsOnLogin: Observable<Action> = this.actions$.pipe(
      ofType<AcceptLogIn>(AuthenticationActionTypes.AcceptLogIn),
      map(a=>new LoadSettings())
    );

    
}
