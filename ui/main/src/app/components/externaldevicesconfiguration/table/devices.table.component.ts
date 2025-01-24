/* Copyright (c) 2022-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component} from '@angular/core';
import {MessageLevel} from '@ofServices/alerteMessage/model/Message';
import {Observable} from 'rxjs';
import {ExternalDevicesConfigurationDirective, Field, FieldType} from './externaldevicesconfiguration-directive';
import {ExternalDevicesService} from '@ofServices/notifications/ExternalDevicesService';
import {ModalService} from '@ofServices/modal/ModalService';
import {I18n} from 'app/model/I18n';
import {ExternaldevicesModalComponent} from '../editModal/externaldevices-modal.component';
import {ServerResponseStatus} from 'app/server/ServerResponse';
import {NgIf} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {SpinnerComponent} from '../../share/spinner/spinner.component';
import {AgGridAngular} from 'ag-grid-angular';
import {NgbPagination} from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'of-externaldevices',
    templateUrl: './externaldevicesconfiguration-directive.html',
    styleUrls: ['../externaldevicesconfiguration.component.scss'],
    standalone: true,
    imports: [NgIf, TranslateModule, SpinnerComponent, AgGridAngular, NgbPagination]
})
export class DevicesTableComponent extends ExternalDevicesConfigurationDirective {
    fields = [
        new Field('id'),
        new Field('isEnabled', FieldType.CHECKBOX_COLUMN),
        new Field('edit', FieldType.ACTION_COLUMN),
        new Field('delete', FieldType.ACTION_COLUMN)
    ];

    canAddItems = true;
    addItemLabel = 'externalDevicesConfiguration.input.addDevice';
    addDeviceModalComponent = ExternaldevicesModalComponent;
    editModalComponent = ExternaldevicesModalComponent;

    queryData(): Observable<any[]> {
        return ExternalDevicesService.queryAllDevices();
    }

    detectCheckboxClick(deviceData: any, isCheckboxChecked: boolean): void {
        this.waitingDeviceResponse = true;
        setTimeout(() => {
            if (this.waitingDeviceResponse) this.showSpinner = true;
        }, 500);
        if (isCheckboxChecked) {
            ExternalDevicesService.enableDevice(deviceData.id).subscribe((response) => {
                this.waitingDeviceResponse = false;
                this.showSpinner = false;
                if (response.status !== ServerResponseStatus.OK)
                    this.displayMessage(
                        'externalDevicesConfiguration.error.errorWhenEnablingDevice',
                        response.statusMessage,
                        MessageLevel.ERROR
                    );
                else this.refreshData();
            });
        } else {
            ExternalDevicesService.disableDevice(deviceData.id).subscribe((response) => {
                this.waitingDeviceResponse = false;
                this.showSpinner = false;
                if (response.status !== ServerResponseStatus.OK)
                    this.displayMessage(
                        'externalDevicesConfiguration.error.errorWhenDisablingDevice',
                        response.statusMessage,
                        MessageLevel.ERROR
                    );
                else this.refreshData();
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
        const confirmDeleteDeviceMessage = `${this.translateService.instant('externalDevicesConfiguration.input.confirmDeleteDevice')} ${row['id']} ?`;

        ModalService.openConfirmationModal(
            new I18n('externalDevicesConfiguration.input.confirm'),
            confirmDeleteDeviceMessage
        ).then((confirmed) => {
            if (confirmed) {
                // The data refresh is launched inside the subscribe to make sure that the deletion request has been (correctly)
                // handled first
                ExternalDevicesService.deleteDevice(row['id']).subscribe(() => {
                    this.refreshData();
                });
            }
        });
    }
}
