/* Copyright (c) 2018-2020, RTEI (http://www.rte-international.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EntitiesService } from '@ofServices/entities.service';
import { GroupsService } from '@ofServices/groups.service';
import { DataTableShareService } from 'app/modules/admin/services/data.service';
import { IdValidatorService } from 'app/modules/admin/services/id-validator.service';

@Component({
  selector: 'of-edit-group-modal',
  templateUrl: './edit-group-modal.component.html',
  styleUrls: ['./edit-group-modal.component.scss']
})
export class EditEntityGroupModalComponent implements OnInit {

  form = new FormGroup({
    id: new FormControl(''
      , [Validators.required, Validators.minLength(2), Validators.maxLength(20)]
      , this.existsId.bind(this)),
    name: new FormControl('', [Validators.required, Validators.maxLength(20)]),
    description: new FormControl('')
  });

  @Input() row: any;
  @Input() type: string;

  constructor(
    public activeModal: NgbActiveModal,
    private data: DataTableShareService,
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
    if (this.type === 'entity') {
      this.entitiesService.update(this.form.value).subscribe(() => {
        this.data.changeEntityRow(this.form.value);
        this.activeModal.dismiss('Update click');
      });
    }
    if (this.type === 'group') {
      this.groupsService.update(this.form.value).subscribe(() => {
        this.data.changeGroupRow(this.form.value);
        this.activeModal.dismiss('Update click');
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

  existsId(control: AbstractControl) {
    // if create
    if (!this.row) {
      if (this.type === 'entity')
        return new IdValidatorService(this.entitiesService).isIdAvailable(control);
      else
        return new IdValidatorService(this.groupsService).isIdAvailable(control);
    } else {
      return new Promise((resolve) => {
        resolve(null);
      });
    }
  }

}
