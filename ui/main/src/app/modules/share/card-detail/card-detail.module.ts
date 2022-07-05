/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {CardDetailComponent} from './card-detail.component';
import { SpinnerModule } from '../spinner/spinner.module';

@NgModule({
    declarations: [CardDetailComponent],
    imports: [CommonModule, TranslateModule, SpinnerModule],
    exports: [CardDetailComponent]
})
export class CardDetailModule {}
