

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
    providers:[{provide:'configRetryDelay',useValue:5000}]
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
