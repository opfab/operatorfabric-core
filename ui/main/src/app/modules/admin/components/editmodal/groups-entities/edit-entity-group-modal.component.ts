/* Copyright (c) 2020, RTEi (http://www.rte-international.com)
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EntitiesService } from '@ofServices/entities.service';
import { GroupsService } from '@ofServices/groups.service';
import { AdminTableType } from '../../table/admin-table.component';

@Component({
  selector: 'of-edit-group-modal',
  templateUrl: './edit-group-modal.component.html',
  styleUrls: ['./edit-group-modal.component.scss']
})
export class EditEntityGroupModalComponent implements OnInit {

  form = new FormGroup({
    id: new FormControl(''
      , [Validators.required, Validators.minLength(2), Validators.maxLength(20)]),
    name: new FormControl('', [Validators.required, Validators.maxLength(20)]),
    description: new FormControl('')
  });

  @Input() row: any;
  @Input() type: AdminTableType;

  constructor(
    private activeModal: NgbActiveModal,
    private groupsService: GroupsService,
    private entitiesService: EntitiesService) {
  }

  ngOnInit() {
    if (this.row) {
      this.form.patchValue(this.row, { onlySelf: true });
    }
  }

  update() {
    this.cleanForm();
    // We call the activeModal "close" method and not "dismiss" to indicate that the modal was closed because the
    // user chose to perform an action (here, update the selected item).
    // This is important as code in the corresponding table components relies on the resolution of the
    // `NgbMobalRef.result` promise to trigger a refresh of the data shown on the table.
    if (this.type === AdminTableType.ENTITY) {
      this.entitiesService.update(this.form.value).subscribe(() => {
        this.activeModal.close('Update button clicked on ' + this.type + ' modal');
      });
    }
    if (this.type === AdminTableType.GROUP) {
      this.groupsService.update(this.form.value).subscribe(() => {
        this.activeModal.close('Update button clicked on ' + this.type + ' modal');
      });
    }
  }

  private cleanForm() {
    if (this.row) {
      this.form.value['id'] = this.row.id;
    }
    this.id.setValue((this.id.value as string).trim());
    this.name.setValue((this.name.value as string).trim());
    this.description.setValue((this.description.value as string).trim());

  }

  get id() {
    return this.form.get('id') as FormControl;
  }

  get name() {
    return this.form.get('name') as FormControl;
  }

  get description() {
    return this.form.get('description') as FormControl;
  }

  dismissModal(reason: string): void {
    this.activeModal.dismiss(reason);
  }
}
