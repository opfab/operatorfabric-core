/* Copyright (c) 2020, RTEi (http://www.rte-international.com)
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Component, Input, OnInit} from '@angular/core';
import {User} from '@ofModel/user.model';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {UserService} from '@ofServices/user.service';
import {GroupsService} from '@ofServices/groups.service';
import {EntitiesService} from '@ofServices/entities.service';

@Component({
  selector: 'of-edit-user-modal',
  templateUrl: './edit-user-modal.component.html',
  styleUrls: ['./edit-user-modal.component.scss']
})
export class EditUserModalComponent implements OnInit {

  userForm: FormGroup;

  entitiesDropdownList = [];
  selectedEntities = [];
  entitiesDropdownSettings = {
    badgeShowLimit: 3,
    enableSearchFilter: true
  };

  groupsDropdownList = [];
  selectedGroups = [];
  groupsDropdownSettings = {
    badgeShowLimit: 3,
    enableSearchFilter: true
  };

  @Input() row: User;

  constructor(
      private activeModal: NgbActiveModal,
      private crudService: UserService,
      private groupsService: GroupsService,
      private entitiesService: EntitiesService) {

    this.userForm = new FormGroup({
      login: new FormControl(''
          , [Validators.required, Validators.minLength(2), Validators.pattern(/^[A-z\d\-_.]+$/)]),
      firstName: new FormControl('', []),
      lastName: new FormControl('', []),
      groups: new FormControl([]),
      entities: new FormControl([]),
      authorizedIPAddresses: new FormControl('', [])
    });

  }

  ngOnInit() {
    if (this.row) { // If the modal is used for edition, initialize the modal with current data from this row

      // For 'simple' fields (where the value is directly displayed), we use the form's patching method
      const {login, firstName, lastName} = this.row;
      this.userForm.patchValue({login, firstName, lastName}, { onlySelf: false });

      if (!!this.row.authorizedIPAddresses) {
        this.userForm.patchValue({'authorizedIPAddresses' : this.row.authorizedIPAddresses.join(',')});
      }
      // Otherwise, we use the selectedItems property of the of-multiselect component
      this.selectedGroups = this.row.groups;
      this.selectedEntities = this.row.entities;

    }


    // Initialize value lists for Entities and Groups inputs
    this.entitiesService.getEntities().forEach((entity) => {
      const id = entity.id;
      let itemName = entity.name;
      if (!itemName) {
        itemName = id;
      }
      this.entitiesDropdownList.push({ id: id, itemName: itemName });
    });

    this.groupsService.getGroups().forEach((group) => {
      const id = group.id;
      let itemName = group.name;
      if (!itemName) {
        itemName = id;
      }
      this.groupsDropdownList.push({ id: id, itemName: itemName });
    });


  }

  update() {
    this.cleanForm();
    this.groups.setValue(this.groups.value.map(group => group.id));
    this.entities.setValue(this.entities.value.map(entity => entity.id));
    const ipList = this.authorizedIPAddresses.value.trim().length > 0 ? this.authorizedIPAddresses.value.split(',') : [];
    this.authorizedIPAddresses.setValue(ipList.map(str => str.trim()));
    this.crudService.update(this.userForm.value).subscribe(() => {
      this.activeModal.close('Update button clicked on user modal');
      // We call the activeModal "close" method and not "dismiss" to indicate that the modal was closed because the
      // user chose to perform an action (here, update the selected item).
      // This is important as code in the corresponding table components relies on the resolution of the
      // `NgbMobalRef.result` promise to trigger a refresh of the data shown on the table.
    });
  }

  private cleanForm() {
    if (this.row) {
      this.userForm.value['login'] = this.row.login;
    }
    this.login.setValue((this.login.value as string).trim());
    if (!!this.lastName.value) 
      this.lastName.setValue((this.lastName.value as string).trim());
    if (!!this.firstName.value) 
      this.firstName.setValue((this.firstName.value as string).trim());

  }

  get login() {
    return this.userForm.get('login') as FormControl;
  }

  get firstName() {
    return this.userForm.get('firstName') as FormControl;
  }

  get lastName() {
    return this.userForm.get('lastName') as FormControl;
  }

  get groups() {
    return this.userForm.get('groups') as FormControl;
  }

  get entities() {
    return this.userForm.get('entities') as FormControl;
  }

  get authorizedIPAddresses() {
    return this.userForm.get('authorizedIPAddresses') as FormControl;
  }


  dismissModal(reason: string): void {
    this.activeModal.dismiss(reason);
  }

}
