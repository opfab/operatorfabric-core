/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Inject, Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Action, Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {catchError, delay, filter, map, switchMap, withLatestFrom} from 'rxjs/operators';
import {ConfigService} from '@ofServices/config.service';
import {AppState} from "@ofStore/index";
import {
    ConfigActionTypes,
    LoadConfig,
    LoadConfigFailure,
    LoadConfigSuccess, LoadSettings, LoadSettingsFailure,
    LoadSettingsSuccess
} from "@ofActions/config.actions";
import {selectConfigRetry} from "@ofSelectors/config.selectors";
import {CONFIG_LOAD_MAX_RETRIES} from "@ofStates/config.state";
import {AcceptLogIn, AuthenticationActionTypes} from "@ofActions/authentication.actions";

// those effects are unused for the moment
@Injectable()
export class ConfigEffects {

    /* istanbul ignore next */
    constructor(private store: Store<AppState>,
                private actions$: Actions,
                private service: ConfigService,
                @Inject('configRetryDelay')
                private retryDelay: number = 5000,
    ) {

        if (this.retryDelay > 0)
            this.retryConfigurationLoading = this.actions$
                .pipe(
                    ofType<LoadConfigFailure>(ConfigActionTypes.LoadConfigFailure),
                    withLatestFrom(this.store.select(selectConfigRetry)),
                    filter(([action, retry]) => retry < CONFIG_LOAD_MAX_RETRIES),
                    map(() => new LoadConfig()),
                    delay(this.retryDelay)
                );
        else
            this.retryConfigurationLoading = this.actions$
                .pipe(
                    ofType<LoadConfigFailure>(ConfigActionTypes.LoadConfigFailure),
                    withLatestFrom(this.store.select(selectConfigRetry)),
                    filter(([action, retry]) => retry < CONFIG_LOAD_MAX_RETRIES),
                    map(() => new LoadConfig())
                );
    }

    /**
     * Manages configuration load -> service request -> success/message
     */
    @Effect()
    loadConfiguration: Observable<Action> = this.actions$
        .pipe(
            ofType<LoadConfig>(ConfigActionTypes.LoadConfig),
            switchMap(action => this.service.fetchConfiguration()),
            map((config: any) => {
                return new LoadConfigSuccess({config: config});
            }),
            catchError((err, caught) => {
                this.store.dispatch(new LoadConfigFailure(err));
                return caught;
            })
        );

    /**
     * Manages load retry upon message
     */
    @Effect()
    retryConfigurationLoading: Observable<Action>;

    /**
     * Manages settings load -> service request -> success/message
     */
    @Effect()
    loadSettings: Observable<Action> = this.actions$
        .pipe(
            ofType<LoadConfig>(ConfigActionTypes.LoadSettings),
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
