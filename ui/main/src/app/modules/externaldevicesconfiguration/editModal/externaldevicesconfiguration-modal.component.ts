/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, Input, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {User} from '@ofModel/user.model';
import {UserService} from '@ofServices/user.service';
import {ExternalDevicesService} from '@ofServices/external-devices.service';
import {Device, UserConfiguration} from '@ofModel/external-devices.model';

@Component({
  selector: 'of-externaldevices-modal',
  templateUrl: './externaldevicesconfiguration-modal.component.html',
  styleUrls: ['./externaldevicesconfiguration-modal.component.scss']
})
export class ExternaldevicesconfigurationModalComponent implements OnInit {

  userdeviceForm = new FormGroup({
    userLogin: new FormControl('', [Validators.required]),
    externalDeviceId: new FormControl('', [Validators.required])
  });

  @Input() row: any;
  @Input() configurations: UserConfiguration[] = [];


  users: User[];
  usersDropdownList = [];
  devices = [];
  devicesDropdownList = [];

  constructor(
    private activeModal: NgbActiveModal,
    private externalDevicesService: ExternalDevicesService,
    private userService: UserService,
  ) {
  }

  ngOnInit() {
    if (this.row) { // If the modal is used for edition, initialize the modal with current data from this row
      this.userdeviceForm.patchValue(this.row, { onlySelf: true });
    }

    this.userService.queryAllUsers().subscribe(allUsers => this.setUsersList(allUsers));

    this.externalDevicesService.queryAllDevices().subscribe(allDevices => this.setDevicesList(allDevices));
  }

  setUsersList(allUsers: User[]) {
    this.users = allUsers;
    this.users.forEach(usr => {
      const alreadyConfiguredUser = this.configurations.find(c => c.userLogin === usr.login);
      if (!alreadyConfiguredUser) {
        this.usersDropdownList.push(usr.login);
      }
    });
  }

  setDevicesList(allDevices: Device[]) {
    this.devices = allDevices;
    this.devices.forEach(dev => {
      this.devicesDropdownList.push(dev.id);
    });
  }

  update() {
    // We call the activeModal "close" method and not "dismiss" to indicate that the modal was closed because the
    // user chose to perform an action (here, update the selected item).
    // This is important as code in the corresponding table components relies on the resolution of the
    // `NgbModalRef.result` promise to trigger a refresh of the data shown on the table.

    this.externalDevicesService.updateUserConfiguration(this.formToUserConfig()).subscribe(() => {
      this.activeModal.close('Update button clicked on modal');
    });
  }

  formToUserConfig() {
    return {
      userLogin: this.userLogin.value as string,
      externalDeviceId: this.externalDeviceId.value as string
    };
  }

  get userLogin() {
    return this.userdeviceForm.get('userLogin');
  }

  get externalDeviceId() {
    return this.userdeviceForm.get('externalDeviceId');
  }

  dismissModal(reason: string): void {
    this.activeModal.dismiss(reason);
  }
}
