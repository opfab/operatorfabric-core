/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {StoreModule} from '@ngrx/store';
import {EffectsModule} from '@ngrx/effects';
import {LightCardEffects} from './light-card/light-card.effects';
import {appMetaReducers, appReducer} from './app.reducer';
import {environment} from '@env/environment';
import {StoreDevtoolsModule} from '@ngrx/store-devtools';
import {RouterStateSerializer, StoreRouterConnectingModule} from '@ngrx/router-store';
import {CustomRouterStateSerializer} from '@state/shared/utils';
import {AuthenticationEffects} from './authentication/authentication.effects';
import {CardOperationEffects} from '@state/card-operation/card-operation.effects';
import {RouterEffects} from "ngrx-router";

@NgModule({
  imports: [
    CommonModule,
    StoreRouterConnectingModule,
    StoreModule.forRoot(appReducer, {
      metaReducers: appMetaReducers,
      /*
      * following configuration initialize the state of router in order to enable the currentUrl in app.component.ts
      * source: https://github.com/ngrx/platform/issues/835
      */
      initialState: {
        router: {
          state: {
            url: window.location.pathname,
            params: {},
            queryParams: {}
          },
          navigationId: 0
        },

      }
    }),
    EffectsModule.forRoot([LightCardEffects, CardOperationEffects, RouterEffects,AuthenticationEffects]),
    !environment.production ? StoreDevtoolsModule.instrument() : [],
  ],
  declarations: []
})
export class StateModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: StateModule
      ,
      providers: [
        /**
         * The `RouterStateSnapshot` provided by the `Router` is a large complex structure.
         * A custom RouterStateSerializer is used to parse the `RouterStateSnapshot` provided
         * by `@ngrx/router-store` to include only the desired pieces of the snapshot.
         */
        {provide: RouterStateSerializer, useClass: CustomRouterStateSerializer}
      ]
    };
  }
}
