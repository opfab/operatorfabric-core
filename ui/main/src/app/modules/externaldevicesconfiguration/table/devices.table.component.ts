/* Copyright (c) 2022-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component} from '@angular/core';
import {MessageLevel} from '@ofModel/message.model';
import {Observable, throwError} from 'rxjs';
import {ExternalDevicesConfigurationDirective, Field, FieldType} from './externaldevicesconfiguration-directive';
import {ExternalDevicesService} from 'app/business/services/notifications/external-devices.service';

@Component({
    selector: 'of-externaldevices',
    templateUrl: './externaldevices-directive.html',
    styleUrls: ['../externaldevicesconfiguration.component.scss']
})
export class DevicesTableComponent extends ExternalDevicesConfigurationDirective {
    fields = [
        new Field('id'),
        new Field('isEnabled', FieldType.CHECKBOX_COLUMN),
        new Field('delete', FieldType.ACTION_COLUMN)
    ];

    canAddItems = true;

    queryData(): Observable<any[]> {
        return ExternalDevicesService.queryAllDevices();
    }

    detectCheckboxClick(deviceData: any, isCheckboxChecked: boolean): void {
        if (isCheckboxChecked) {
            ExternalDevicesService.enableDevice(deviceData.id).subscribe({
                error: () =>
                    this.displayMessage(
                        'externalDevicesConfiguration.error.errorWhenEnablingDevice',
                        null,
                        MessageLevel.ERROR
                    )
            });
        } else {
            ExternalDevicesService.disableDevice(deviceData.id).subscribe({
                error: () =>
                    this.displayMessage(
                        'externalDevicesConfiguration.error.errorWhenDisablingDevice',
                        null,
                        MessageLevel.ERROR
                    )
            });
        }
    }

    createNewItem() {
        const modalRef = this.modalService.open(this.addDeviceModalComponent, this.modalOptions);
        modalRef.componentInstance.configurations = this.configurations;
        modalRef.result.then(
            // Hooking the refresh of the data to the closing of the modal seemed simpler than setting up
            // NGRX actions and effects for this sole purpose
            () => {
                // If modal is closed
                this.refreshData(); // This refreshes the data when the modal is closed after a change
            },
            () => {
                // If modal is dismissed (by clicking the "close" button, the top right cross icon
                // or clicking outside the modal, there is no need to refresh the data
            }
        );
    }

    openDeleteConfirmationDialog(row: any): any {
        this.confirmationDialogService
            .confirm(
                this.translateService.instant('externalDevicesConfiguration.input.confirm'),
                this.translateService.instant('externalDevicesConfiguration.input.confirmDeleteDevice') +
                    ' ' +
                    row['id'] +
                    ' ?',
                'OK',
                this.translateService.instant('admin.input.cancel')
            )
            .then((confirmed) => {
                if (confirmed) {
                    // The data refresh is launched inside the subscribe to make sure that the deletion request has been (correctly)
                    // handled first
                    ExternalDevicesService.deleteDevice(row['id']).subscribe(() => {
                        this.refreshData();
                    });
                }
            })
            .catch((error) => throwError(() => error));
    }
}
