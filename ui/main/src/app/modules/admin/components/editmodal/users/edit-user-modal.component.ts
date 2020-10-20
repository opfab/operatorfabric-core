/* Copyright (c) 2018-2020, RTEI (http://www.rte-international.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { OnInit, Component, Input } from '@angular/core';
import { User } from '@ofModel/user.model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from '@ofServices/user.service';
import { DataTableShareService } from 'app/modules/admin/services/data.service';
import { GroupsService } from '@ofServices/groups.service';
import { EntitiesService } from '@ofServices/entities.service';
import { Entity } from '@ofModel/entity.model';
import { Group } from '@ofModel/group.model';
import { IdValidatorService } from 'app/modules/admin/services/id-validator.service';

@Component({
  selector: 'of-editmodal',
  templateUrl: './edit-user-modal.component.html',
  styleUrls: ['./edit-user-modal.component.scss']
})
export class EditUsermodalComponent implements OnInit {

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
    public activeModal: NgbActiveModal,
    private crudService: UserService,
    private data: DataTableShareService,
    private groupsService: GroupsService,
    private entitesService: EntitiesService) {
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
      this.data.changeUserRow(this.form.value);
      this.activeModal.dismiss('Update click');
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
    this.entitesService.getAll().subscribe(response => {
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