/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component} from '@angular/core';
import { MessageLevel } from '@ofModel/message.model';
import { Observable } from 'rxjs';
import { ExternalDevicesConfigurationDirective, Field, FieldType } from './externaldevicesconfiguration-directive';

@Component({
    selector: 'of-externaldevices',
    templateUrl: './externaldevicesconfiguration-directive.html',
    styleUrls: ['../externaldevicesconfiguration.component.scss']
})
export class DevicesTableComponent extends ExternalDevicesConfigurationDirective {

    fields = [
        new Field('id'),
        new Field('isEnabled', FieldType.CHECKBOX_COLUMN)
    ];

    canAddItems = false;

    queryData(): Observable<any[]> {
        return this.externalDevicesService.queryAllDevices();
    }

    detectCheckboxClick(deviceData: any, isCheckboxChecked: boolean): void {
        if (isCheckboxChecked) {
            this.externalDevicesService.enableDevice(deviceData.id).subscribe({
                error: () => this.displayMessage("externalDevicesConfiguration.error.errorWhenEnablingDevice", null, MessageLevel.ERROR)
            });
        } else {
            this.externalDevicesService.disableDevice(deviceData.id).subscribe({
                error: () => this.displayMessage("externalDevicesConfiguration.error.errorWhenDisablingDevice", null,  MessageLevel.ERROR)
            });
        }
    }

}
