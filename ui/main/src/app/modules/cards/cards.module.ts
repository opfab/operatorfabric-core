/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {ModuleWithProviders, NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import {CardComponent} from "./components/card/card.component";
import {CardDetailsComponent} from "./components/card-details/card-details.component";
import {DetailsComponent} from "./components/details/details.component";
import {DetailComponent} from "./components/detail/detail.component";
import {TranslateLoader, TranslateModule} from "@ngx-translate/core";
import {
    ThirdsI18nLoaderFactory,
    ThirdsService
} from "./services/thirds.service";

@NgModule({
  declarations: [CardComponent, CardDetailsComponent, DetailsComponent, DetailComponent],
  imports: [
    CommonModule,
      TranslateModule.forChild({
          loader: {
              provide: TranslateLoader,
              useFactory: ThirdsI18nLoaderFactory,
              deps:[ThirdsService]},
          useDefaultLang: false
      })
  ],
    exports: [CardComponent, CardDetailsComponent, DetailsComponent, DetailComponent],
    providers: [ThirdsService]
})
export class CardsModule {
    static forRoot(): ModuleWithProviders{
        return {
            ngModule: CardsModule,
            providers: [ThirdsService]
        }
    }
}
