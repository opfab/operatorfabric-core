/* Copyright (c) 2021-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {NgModule} from '@angular/core';
import {CommonModule, LowerCasePipe} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {LightCardComponent} from './light-card.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import {GroupedCardListComponent} from './grouped-card-list/grouped-card-list.component';
import {CountDownComponent} from '../countdown/countdown.component';
import {OpfabTitleCasePipe} from '../pipes/opfab-title-case.pipe';

@NgModule({
    declarations: [LightCardComponent, GroupedCardListComponent],
    imports: [CommonModule, TranslateModule, CountDownComponent, NgbModule, OpfabTitleCasePipe, LowerCasePipe],
    exports: [LightCardComponent]
})
export class LightCardModule {}
