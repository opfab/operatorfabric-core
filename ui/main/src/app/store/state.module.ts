/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {StoreModule} from '@ngrx/store';
import {EffectsModule} from '@ngrx/effects';
import {appEffects, appReducer, storeConfig} from './index';
import {environment} from '@env/environment';
import {StoreDevtoolsModule} from '@ngrx/store-devtools';
import {NavigationActionTiming, RouterStateSerializer, StoreRouterConnectingModule} from '@ngrx/router-store';
import {CustomRouterStateSerializer} from '@ofStore/states/router.state';

@NgModule({
    imports: [
        CommonModule,
        StoreModule.forRoot(appReducer, storeConfig),
        StoreRouterConnectingModule.forRoot({
            navigationActionTiming: NavigationActionTiming.PostActivation,
            serializer: CustomRouterStateSerializer
        }),
        EffectsModule.forRoot(appEffects),
        !environment.production ? StoreDevtoolsModule.instrument() : [],
    ],
    declarations: [],
    providers: [{provide: 'configRetryDelay', useValue: 5000}]
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
