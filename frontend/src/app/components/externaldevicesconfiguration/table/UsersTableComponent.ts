/* Copyright (c) 2022-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component} from '@angular/core';
import {Observable} from 'rxjs';
import {ExternalDevicesConfigurationDirective, Field, FieldType} from './ExternalDevicesConfigurationDirective';
import {ExternalDevicesService} from '@ofServices/notifications/ExternalDevicesService';
import {UsersconfigurationModalComponent} from '../editModal/UsersConfigurationModalComponent';
import {TranslateDirective} from '@ngx-translate/core';
import {SpinnerComponent} from '../../share/spinner/SpinnerComponent';
import {AgGridAngular} from 'ag-grid-angular';
import {NgbPagination} from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'of-externaldevices',
    templateUrl: './ExternalDevicesConfigurationDirective.html',
    styleUrls: ['../ExternalDevicesConfigurationComponent.scss'],
    imports: [TranslateDirective, SpinnerComponent, AgGridAngular, NgbPagination]
})
export class UsersTableComponent extends ExternalDevicesConfigurationDirective {
    tableType = 'users';
    fields = [
        new Field('userLogin'),
        new Field('externalDeviceIds'),
        new Field('edit', FieldType.ACTION_COLUMN),
        new Field('delete', FieldType.ACTION_COLUMN)
    ];

    editModalComponent = UsersconfigurationModalComponent;

    canAddItems = true;

    queryData(): Observable<any[]> {
        return ExternalDevicesService.queryAllUserConfigurations();
    }
}
