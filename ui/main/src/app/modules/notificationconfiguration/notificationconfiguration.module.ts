/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NotificationConfigurationRoutingModule} from './notificationconfiguration-routing.module';
import {NotificationConfigurationComponent} from './notificationconfiguration.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
    declarations: [NotificationConfigurationComponent],
    imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule, NotificationConfigurationRoutingModule]
})
export class NotificationConfigurationModule {}
