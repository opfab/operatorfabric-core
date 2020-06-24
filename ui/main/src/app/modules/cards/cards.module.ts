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
import {CardComponent} from "./components/card/card.component";
import {CardDetailsComponent} from "./components/card-details/card-details.component";
import {DetailsComponent} from "./components/details/details.component";
import {DetailComponent} from "./components/detail/detail.component";
import {TranslateModule} from "@ngx-translate/core";
import {ProcessesService} from "@ofServices/processes.service";
import {HandlebarsService} from "./services/handlebars.service";
import {UtilitiesModule} from "../utilities/utilities.module";
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";

@NgModule({
  declarations: [CardComponent
      , CardDetailsComponent
      , DetailsComponent
      , DetailComponent],
  imports: [
    CommonModule,
      TranslateModule,
      UtilitiesModule,
      NgbModule
  ],
    exports: [CardComponent
        , CardDetailsComponent
        , DetailsComponent
        , DetailComponent
    ],
    providers: [HandlebarsService],
    entryComponents: []
})
export class CardsModule {
    static forRoot(): ModuleWithProviders{
        return {
            ngModule: CardsModule,
            providers: [ProcessesService]
        }
    }
}
