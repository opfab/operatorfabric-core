/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, Input, OnInit} from '@angular/core';
import {
    AbstractControl,
    AsyncValidatorFn,
    FormControl,
    FormGroup,
    ValidationErrors,
    Validators,
    FormsModule,
    ReactiveFormsModule
} from '@angular/forms';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {ExternalDevicesService} from '@ofServices/notifications/ExternalDevicesService';
import {DeviceConfiguration} from '@ofServices/notifications/model/ExternalDevices';
import {MultiSelectConfig} from '@ofModel/multiselect.model';
import {Observable, of} from 'rxjs';
import {NgIf} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {SpinnerComponent} from '../../share/spinner/spinner.component';
import {MultiSelectComponent} from '../../share/multi-select/multi-select.component';

@Component({
    selector: 'of-externaldevices-modal',
    templateUrl: './externaldevices-modal.component.html',
    styleUrls: ['./externaldevicesconfiguration-modal.component.scss'],
    standalone: true,
    imports: [NgIf, TranslateModule, SpinnerComponent, FormsModule, ReactiveFormsModule, MultiSelectComponent]
})
export class ExternaldevicesModalComponent implements OnInit {
    signalMappingMultiSelectOptions = [];
    selectedSignalMapping = [];
    signalMappingMultiSelectConfig: MultiSelectConfig = {
        labelKey: 'externalDevicesConfiguration.signalMapping',
        sortOptions: true,
        multiple: false
    };

    deviceForm: FormGroup;

    @Input() row: any;

    devices: DeviceConfiguration[];
    isLoadingExternalDevices: boolean;
    isLoadingSignalMappings: boolean;

    constructor(private activeModal: NgbActiveModal) {}

    ngOnInit() {
        const uniqueDeviceIdValidator = [];
        if (!this.row) {
            uniqueDeviceIdValidator.push(this.uniqueDeviceIdValidatorFn());
        }
        this.deviceForm = new FormGroup({
            id: new FormControl<string | null>('', [Validators.required], uniqueDeviceIdValidator),
            host: new FormControl<string | null>('', [Validators.required]),
            port: new FormControl<string | null>('', [Validators.required]),
            signalMappingId: new FormControl<string | null>(null, [Validators.required]),
            enabled: new FormControl<boolean | null>(true)
        });
        this.isLoadingExternalDevices = true;
        ExternalDevicesService.queryAllDevices().subscribe((allDevices) => {
            this.devices = allDevices;
            this.isLoadingExternalDevices = false;
        });
        this.isLoadingSignalMappings = true;
        ExternalDevicesService.queryAllSignalMappings().subscribe((signalMappings) => {
            signalMappings.forEach((mapping) => {
                this.signalMappingMultiSelectOptions.push({value: mapping.id, label: mapping.id});
                this.isLoadingSignalMappings = false;
            });
        });

        if (this.row) {
            this.deviceForm.patchValue(this.row, {onlySelf: true});
            this.selectedSignalMapping = [this.row.signalMappingId];
        }
    }

    uniqueDeviceIdValidatorFn(): AsyncValidatorFn {
        return (control: AbstractControl): Observable<ValidationErrors> => {
            const err: ValidationErrors = {uniqueDeviceIdViolation: true};
            return this.isUniquedeviceId(this.deviceForm.controls['id'].value) ? of(null) : of(err);
        };
    }

    isUniquedeviceId(deviceId: string): boolean {
        if (deviceId && this.devices.findIndex((dev) => dev.id === deviceId) >= 0) return false;
        else return true;
    }

    update() {
        // We call the activeModal "close" method and not "dismiss" to indicate that the modal was closed because the
        // user chose to perform an action (here, update the selected item).
        // This is important as code in the corresponding table components relies on the resolution of the
        // `NgbModalRef.result` promise to trigger a refresh of the data shown on the table.
        ExternalDevicesService.updateDevice(this.formToDevice()).subscribe(() => {
            this.activeModal.close('Update button clicked on modal');
        });
    }

    formToDevice(): DeviceConfiguration {
        const port: number = +this.deviceForm.get('port').value;
        const enabled: boolean = this.row ? this.row.isEnabled : this.deviceForm.get('enabled').value;
        return new DeviceConfiguration(
            this.deviceForm.get('id').value,
            this.deviceForm.get('host').value,
            port,
            this.deviceForm.get('signalMappingId').value,
            enabled
        );
    }

    isLoading(): boolean {
        return this.isLoadingExternalDevices || this.isLoadingSignalMappings;
    }

    get id(): AbstractControl {
        return this.deviceForm.get('id');
    }

    get host(): AbstractControl {
        return this.deviceForm.get('host');
    }

    get port(): AbstractControl {
        return this.deviceForm.get('port');
    }

    dismissModal(reason: string): void {
        this.activeModal.dismiss(reason);
    }
}
