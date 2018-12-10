/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {ModuleWithProviders, NgModule, Optional, SkipSelf} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CardService} from '@core/services/card.service';
import {IdentificationService} from '@core/services/identification.service';
import {HTTP_INTERCEPTORS} from "@angular/common/http";
import {TokenInjector} from "@core/services/interceptors.service";
import {AuthenticationGuard, UnAuthorizedGuard} from "@core/services/guard.service";

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [CardService, IdentificationService,{
    provide: HTTP_INTERCEPTORS,
    useClass: TokenInjector,
    multi: true
  },AuthenticationGuard, UnAuthorizedGuard]
})
export class CoreModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: CoreModule
    };
  }

  constructor(
    @Optional()
    @SkipSelf()
      parentModule: CoreModule
  ) {
    if (parentModule) {
      throw new Error(
        'CoreModule is already loaded. Import it in the AppModule only'
      );
    }
  }
}
