/* Copyright (c) 2022-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, Input, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {User} from '@ofModel/user.model';
import {UserService} from 'app/business/services/users/user.service';
import {ExternalDevicesService} from '@ofServices/notifications/ExternalDevicesService';
import {DeviceConfiguration, UserConfiguration} from '@ofServices/notifications/model/ExternalDevices';
import {MultiSelectConfig} from '@ofModel/multiselect.model';
import {NgIf} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {SpinnerComponent} from '../../share/spinner/spinner.component';
import {MultiSelectComponent} from '../../share/multi-select/multi-select.component';

@Component({
    selector: 'of-externaldevices-users-modal',
    templateUrl: './usersconfiguration-modal.component.html',
    styleUrls: ['./externaldevicesconfiguration-modal.component.scss'],
    standalone: true,
    imports: [NgIf, TranslateModule, SpinnerComponent, FormsModule, ReactiveFormsModule, MultiSelectComponent]
})
export class UsersconfigurationModalComponent implements OnInit {
    userdeviceForm = new FormGroup({
        userLogin: new FormControl<string | null>('', [Validators.required]),
        externalDeviceIds: new FormControl<string[] | null>([], [Validators.required])
    });

    @Input() row: any;
    @Input() configurations: UserConfiguration[] = [];

    isLoadingExternalDevices = false;
    isLoadingUsers = false;
    users: User[];
    usersDropdownList = [];
    devicesMultiSelectOptions = [];
    selectedDevices = [];
    devicesMultiSelectConfig: MultiSelectConfig = {
        labelKey: 'externalDevicesConfiguration.externalDeviceIds',
        placeholderKey: 'externalDevicesConfiguration.input.selectDeviceText',
        sortOptions: true,
        nbOfDisplayValues: 6
    };

    public multiSelectConfig: MultiSelectConfig = {
        labelKey: 'externalDevicesConfiguration.userLogin',
        multiple: false,
        search: true,
        sortOptions: true
    };

    constructor(private readonly activeModal: NgbActiveModal) {}

    ngOnInit() {
        if (this.row) {
            // If the modal is used for edition, initialize the modal with current data from this row
            this.userdeviceForm.patchValue(this.row, {onlySelf: true});
            this.selectedDevices = this.row.externalDeviceIds;
        }

        if (!this.row) {
            this.isLoadingUsers = true;
            UserService.queryAllUsers().subscribe((allUsers) => this.setUsersList(allUsers));
        }
        this.isLoadingExternalDevices = true;
        ExternalDevicesService.queryAllDevices().subscribe((allDevices) => this.setDevicesList(allDevices));
    }

    setUsersList(allUsers: User[]) {
        this.users = allUsers;
        this.users.forEach((usr) => {
            const alreadyConfiguredUser = this.configurations.find((c) => c.userLogin === usr.login);
            if (!alreadyConfiguredUser) {
                this.usersDropdownList.push({value: usr.login, label: usr.login});
            }
        });
        this.isLoadingUsers = false;
    }

    setDevicesList(allDevices: DeviceConfiguration[]) {
        allDevices.forEach((dev) => {
            this.devicesMultiSelectOptions.push({value: dev.id, label: dev.id});
        });
        this.isLoadingExternalDevices = false;
    }

    update() {
        // We call the activeModal "close" method and not "dismiss" to indicate that the modal was closed because the
        // user chose to perform an action (here, update the selected item).
        // This is important as code in the corresponding table components relies on the resolution of the
        // `NgbModalRef.result` promise to trigger a refresh of the data shown on the table.

        ExternalDevicesService.updateUserConfiguration(this.formToUserConfig()).subscribe(() => {
            this.activeModal.close('Update button clicked on modal');
        });
    }

    formToUserConfig() {
        return {
            userLogin: this.userLogin.value as string,
            externalDeviceIds: this.externalDeviceIds.value
        };
    }

    get userLogin() {
        return this.userdeviceForm.get('userLogin');
    }

    get externalDeviceIds() {
        return this.userdeviceForm.get('externalDeviceIds');
    }

    dismissModal(reason: string): void {
        this.activeModal.dismiss(reason);
    }

    isLoading(): boolean {
        return this.isLoadingUsers || this.isLoadingExternalDevices;
    }
}
