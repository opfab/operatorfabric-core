/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component} from '@angular/core';
import { Observable } from 'rxjs';
import { ExternalDevicesConfigurationDirective, Field, FieldType } from './externaldevicesconfiguration-directive';

@Component({
    selector: 'of-externaldevices',
    templateUrl: './externaldevicesconfiguration-directive.html',
    styleUrls: ['../externaldevicesconfiguration.component.scss']
})
export class UsersTableComponent extends ExternalDevicesConfigurationDirective {

    fields = [
        new Field('userLogin'),
        new Field('externalDeviceIds'),
        new Field('edit', FieldType.ACTION_COLUMN),
        new Field('delete', FieldType.ACTION_COLUMN)
    ];

    canAddItems = true;

    queryData(): Observable<any[]> {
        return this.externalDevicesService.queryAllUserConfigurations();
    }
}
