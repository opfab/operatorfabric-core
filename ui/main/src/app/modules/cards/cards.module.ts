/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CardDetailsComponent} from './components/card-details/card-details.component';
import {DetailComponent} from './components/detail/detail.component';
import {TranslateModule} from '@ngx-translate/core';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {CountDownModule} from '../share/countdown/countdown.module';
import {UserCardModule} from '../usercard/usercard.module';
import {ReactiveFormsModule} from '@angular/forms';
import {MultiSelectModule} from '../share/multi-select/multi-select.module';
import {SpinnerModule} from '../share/spinner/spinner.module';
import {TemplateRenderingModule} from '../share/template-rendering/template-rendering.module';
import {PipesModule} from '../share/pipes/pipes.module';
import {CardActionsComponent} from './components/card-actions/card-actions.component';

@NgModule({
    declarations: [CardDetailsComponent, DetailComponent,CardActionsComponent],
    imports: [
        CommonModule,
        CountDownModule,
        TranslateModule,
        NgbModule,
        UserCardModule,
        ReactiveFormsModule,
        MultiSelectModule,
        SpinnerModule,
        TemplateRenderingModule,
        PipesModule
    ],
    exports: [CardDetailsComponent, DetailComponent]
})
export class CardsModule {}
