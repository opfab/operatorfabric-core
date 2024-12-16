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
import {SignalMapping} from '@ofServices/notifications/model/ExternalDevices';
import {Observable, of} from 'rxjs';
import {NgIf} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {SpinnerComponent} from '../../share/spinner/spinner.component';

@Component({
    selector: 'of-signal-mappings-modal',
    templateUrl: './signal-mappings-modal.component.html',
    styleUrls: ['./externaldevicesconfiguration-modal.component.scss'],
    standalone: true,
    imports: [NgIf, TranslateModule, SpinnerComponent, FormsModule, ReactiveFormsModule]
})
export class SignalMappingsModalComponent implements OnInit {
    signalMappingsForm: FormGroup;

    @Input() row: any;

    selectedDevice;
    signalMappings: SignalMapping[];
    isLoadingSignalMappings: boolean;

    constructor(private activeModal: NgbActiveModal) {}

    ngOnInit() {
        const uniqueDeviceIdValidator = [];
        if (!this.row) {
            uniqueDeviceIdValidator.push(this.uniqueDeviceIdValidatorFn());
        }
        this.signalMappingsForm = new FormGroup({
            id: new FormControl<string | null>('', [Validators.required], uniqueDeviceIdValidator),
            alarm: new FormControl<string | null>('', [Validators.required]),
            action: new FormControl<string | null>('', [Validators.required]),
            information: new FormControl<string | null>('', [Validators.required]),
            compliant: new FormControl<string | null>('', [Validators.required])
        });

        this.isLoadingSignalMappings = true;
        ExternalDevicesService.queryAllSignalMappings().subscribe((signalMappings) => {
            this.signalMappings = signalMappings;
            this.isLoadingSignalMappings = false;
        });

        if (this.row) {
            this.signalMappingsForm.patchValue(this.row, {onlySelf: true});
            this.selectedDevice = this.row.deviceId;
        }
    }

    uniqueDeviceIdValidatorFn(): AsyncValidatorFn {
        return (control: AbstractControl): Observable<ValidationErrors> => {
            const err: ValidationErrors = {uniqueDeviceIdViolation: true};
            return this.isUniqueDeviceId(this.signalMappingsForm.controls['id'].value) ? of(null) : of(err);
        };
    }

    isUniqueDeviceId(mappingId: string): boolean {
        return mappingId && this.signalMappings.findIndex((dev) => dev.id === mappingId) < 0;
    }

    update() {
        // We call the activeModal "close" method and not "dismiss" to indicate that the modal was closed because the
        // user chose to perform an action (here, update the selected item).
        // This is important as code in the corresponding table components relies on the resolution of the
        // `NgbModalRef.result` promise to trigger a refresh of the data shown on the table.
        ExternalDevicesService.updateSignalMappings(this.formToSignalMappings()).subscribe(() => {
            this.activeModal.close('Update button clicked on modal');
        });
    }

    formToSignalMappings(): SignalMapping {
        const alarmSignal: number = +this.signalMappingsForm.get('alarm').value;
        const actionSignal: number = +this.signalMappingsForm.get('action').value;
        const informationSignal: number = +this.signalMappingsForm.get('information').value;
        const compliantSignal: number = +this.signalMappingsForm.get('compliant').value;

        const signalMap = new Map();
        signalMap.set('ALARM', alarmSignal);
        signalMap.set('ACTION', actionSignal);
        signalMap.set('INFORMATION', informationSignal);
        signalMap.set('COMPLIANT', compliantSignal);
        return new SignalMapping(this.signalMappingsForm.get('id').value, signalMap);
    }

    isLoading(): boolean {
        return this.isLoadingSignalMappings;
    }

    get id(): AbstractControl {
        return this.signalMappingsForm.get('id');
    }

    get alarm(): AbstractControl {
        return this.signalMappingsForm.get('alarm');
    }

    get action(): AbstractControl {
        return this.signalMappingsForm.get('action');
    }

    get information(): AbstractControl {
        return this.signalMappingsForm.get('information');
    }

    get compliant(): AbstractControl {
        return this.signalMappingsForm.get('compliant');
    }

    dismissModal(reason: string): void {
        this.activeModal.dismiss(reason);
    }
}
