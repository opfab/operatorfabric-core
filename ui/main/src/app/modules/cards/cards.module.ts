/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {CUSTOM_ELEMENTS_SCHEMA, ModuleWithProviders, NgModule, NO_ERRORS_SCHEMA} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CardDetailsComponent} from './components/card-details/card-details.component';
import {DetailComponent} from './components/detail/detail.component';
import {TranslateModule} from '@ngx-translate/core';
import {ProcessesService} from '@ofServices/processes.service';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {CountDownModule} from '../share/countdown/countdown.module';
import {UserCardModule} from '../usercard/usercard.module';

@NgModule({
  declarations: [
       CardDetailsComponent
      , DetailComponent],
  imports: [
    CommonModule,
      CountDownModule,
      TranslateModule,
      NgbModule,
      UserCardModule
  ],
    exports: [
         CardDetailsComponent
        , DetailComponent
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA
      ]
})

export class CardsModule {
    static forRoot(): ModuleWithProviders<CardsModule> {
        return {
            ngModule: CardsModule,
            providers: [ProcessesService]
        };
    }
}
