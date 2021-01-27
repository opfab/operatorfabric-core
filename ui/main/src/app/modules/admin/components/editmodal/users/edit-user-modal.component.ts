/* Copyright (c) 2020, RTEi (http://www.rte-international.com)
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {AbstractControl, FormControl, FormGroup, Validators} from '@angular/forms';
import {Component, Input, OnInit} from '@angular/core';
import {User} from '@ofModel/user.model';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {UserService} from '@ofServices/user.service';
import {GroupsService} from '@ofServices/groups.service';
import {EntitiesService} from '@ofServices/entities.service';
import {Entity} from '@ofModel/entity.model';
import {Group} from '@ofModel/group.model';
import {IdValidatorService} from 'app/modules/admin/services/id-validator.service';

@Component({
  selector: 'of-edit-user-modal',
  templateUrl: './edit-user-modal.component.html',
  styleUrls: ['./edit-user-modal.component.scss']
})
export class EditUserModalComponent implements OnInit {

  form = new FormGroup({
    login: new FormControl(''
      , [Validators.required, Validators.minLength(4), Validators.maxLength(20)]
      , this.existsId.bind(this)),
    firstName: new FormControl('', [Validators.required, Validators.maxLength(20)]),
    lastName: new FormControl('', [Validators.required, Validators.maxLength(20)]),
    groups: new FormControl([]),
    entities: new FormControl([])
  });

  entitiesList: Array<Entity>;
  groupsList: Array<Group>;

  @Input() row: User;

  constructor(
    private activeModal: NgbActiveModal,
    private crudService: UserService,
    private groupsService: GroupsService,
    private entitiesService: EntitiesService) {
  }

  ngOnInit() {
    if (this.row) {
      this.form.patchValue(this.row, { onlySelf: true });
    }
    this.initializeEntities();
    this.initializeGroups();

  }

  update() {

    this.cleanForm();
    this.groups.setValue(this.groups.value.filter((item: string) => item.length > 0));
    this.entities.setValue(this.entities.value.filter((item: string) => item.length > 0));
    this.crudService.update(this.form.value).subscribe(() => {
      this.activeModal.close('Update button clicked on user modal');
      // We call the activeModal "close" method and not "dismiss" to indicate that the modal was closed because the
      // user chose to perform an action (here, update the selected item).
      // This is important as code in the corresponding table components relies on the resolution of the
      // `NgbMobalRef.result` promise to trigger a refresh of the data shown on the table.
    });
  }

  private cleanForm() {
    if (this.row) {
      this.form.value['login'] = this.row.login;
    }
    this.login.setValue((this.login.value as string).trim());
    this.lastName.setValue((this.lastName.value as string).trim());
    this.firstName.setValue((this.firstName.value as string).trim());

  }

  get login() {
    return this.form.get('login') as FormControl;
  }

  get firstName() {
    return this.form.get('firstName') as FormControl;
  }

  get lastName() {
    return this.form.get('lastName') as FormControl;
  }

  get groups() {
    return this.form.get('groups') as FormControl;
  }

  get entities() {
    return this.form.get('entities') as FormControl;
  }



  private initializeEntities(): void {
    this.entitiesService.getAll().subscribe(response => {
      this.entitiesList = response;
    });

  }

  private initializeGroups(): void {
    this.groupsService.getAll().subscribe(response => {
      this.groupsList = response;
    });

  }

 existsId(control: AbstractControl) {
    // if create
    if (!this.row) {
      return new IdValidatorService(this.crudService).isIdAvailable(control);
    } else {
      return new Promise((resolve) => {
        resolve(null);
      });
    }
  }

}
