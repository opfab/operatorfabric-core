/* Copyright (c) 2020, RTEi (http://www.rte-international.com)
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
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
import {AdminItemType, SharingService} from '../../../services/sharing.service';
import {CrudService} from '@ofServices/crud-service';

@Component({
  selector: 'of-edit-entity-modal',
  templateUrl: './edit-entity-modal.component.html',
  styleUrls: ['./edit-entity-modal.component.scss']
})
export class EditEntityModalComponent implements OnInit {

  entityForm = new FormGroup({
    id: new FormControl(''
      , [Validators.required, Validators.minLength(2), Validators.pattern(/^[A-z\d\-_]+$/)]),
    name: new FormControl('', [Validators.required]),
    description: new FormControl('')
  });

  @Input() row: any;
  @Input() type: AdminItemType;

  private crudService: CrudService;

  constructor(
    private activeModal: NgbActiveModal,
    private dataHandlingService: SharingService
  ) {
  }

  ngOnInit() {
    this.crudService = this.dataHandlingService.resolveCrudServiceDependingOnType(this.type);
    if (this.row) { // If the modal is used for edition, initialize the modal with current data from this row
      this.entityForm.patchValue(this.row, { onlySelf: true });
    }
  }

  update() {
    this.cleanForm();
    // We call the activeModal "close" method and not "dismiss" to indicate that the modal was closed because the
    // user chose to perform an action (here, update the selected item).
    // This is important as code in the corresponding table components relies on the resolution of the
    // `NgbModalRef.result` promise to trigger a refresh of the data shown on the table.
    this.crudService.update(this.entityForm.value).subscribe(() => {
      this.activeModal.close('Update button clicked on ' + this.type + ' modal');
    });
  }

  private cleanForm() {
    if (this.row) {
      this.entityForm.value['id'] = this.row.id;
    }
    this.id.setValue((this.id.value as string).trim());
    this.name.setValue((this.name.value as string).trim());
    this.description.setValue((this.description.value as string).trim());

  }

  get id() {
    return this.entityForm.get('id') as FormControl;
  }

  get name() {
    return this.entityForm.get('name') as FormControl;
  }

  get description() {
    return this.entityForm.get('description') as FormControl;
  }

  dismissModal(reason: string): void {
    this.activeModal.dismiss(reason);
  }
}
