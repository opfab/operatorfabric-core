/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {TemplateRenderingComponent} from './template-rendering.component';
import {SpinnerModule} from '../spinner/spinner.module';

@NgModule({
    declarations: [TemplateRenderingComponent],
    imports: [CommonModule,NgbModule,SpinnerModule],
    exports: [TemplateRenderingComponent]
})
export class TemplateRenderingModule {}
