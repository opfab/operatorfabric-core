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
import {PerimetersService} from '@ofServices/perimeters.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'of-edit-group-modal',
  templateUrl: './edit-group-modal.component.html',
  styleUrls: ['./edit-group-modal.component.scss']
})
export class EditGroupModalComponent implements OnInit {

  groupForm = new FormGroup({
    id: new FormControl(''
      , [Validators.required, Validators.minLength(2), Validators.pattern(/^[A-z\d\-_]+$/)]),
    name: new FormControl('', [Validators.required]),
    description: new FormControl(''),
    perimeters: new FormControl([])
  });

  perimetersDropdownList = [];
  selectedPerimeters = [];
  perimetersDropdownSettings = {};

  @Input() row: any;
  @Input() type: AdminItemType;

  private crudService: CrudService;

  constructor(
    private translate: TranslateService,
    private activeModal: NgbActiveModal,
    private dataHandlingService: SharingService,
    private perimetersService: PerimetersService
  ) {
  }

  ngOnInit() {
    this.crudService = this.dataHandlingService.resolveCrudServiceDependingOnType(this.type);

    if (this.row) { // If the modal is used for edition, initialize the modal with current data from this row

      // For 'simple' fields (where the value is directly displayed), we use the form's patching method
      const {id, name, description} = this.row;
      this.groupForm.patchValue({id, name, description}, { onlySelf: false });

      // Otherwise, we use the selectedItems property of the of-multiselect component
      this.selectedPerimeters = this.row.perimeters;
    }


    this.translate.get('admin.input.selectPerimeterText')
        .subscribe(translation => {
            this.perimetersDropdownSettings = {
              text: translation,
              badgeShowLimit: 3,
              enableSearchFilter: true
          };
    });

    this.perimetersService.getPerimeters().forEach((perimeter) => {
      this.perimetersDropdownList.push({ id: perimeter.id });
    });
  }

  update() {
    this.cleanForm();
    this.perimeters.setValue(this.perimeters.value.map(entity => entity.id));
    // We call the activeModal "close" method and not "dismiss" to indicate that the modal was closed because the
    // user chose to perform an action (here, update the selected item).
    // This is important as code in the corresponding table components relies on the resolution of the
    // `NgbModalRef.result` promise to trigger a refresh of the data shown on the table.
    this.crudService.update(this.groupForm.value).subscribe(() => {
      this.activeModal.close('Update button clicked on ' + this.type + ' modal');
    });
  }

  private cleanForm() {
    if (this.row) {
      this.groupForm.value['id'] = this.row.id;
    }
    this.id.setValue((this.id.value as string).trim());
    this.name.setValue((this.name.value as string).trim());
    this.description.setValue((this.description.value as string).trim());

  }

  get id() {
    return this.groupForm.get('id') as FormControl;
  }

  get name() {
    return this.groupForm.get('name') as FormControl;
  }

  get description() {
    return this.groupForm.get('description') as FormControl;
  }

  get perimeters() {
    return this.groupForm.get('perimeters') as FormControl;
  }

  dismissModal(reason: string): void {
    this.activeModal.dismiss(reason);
  }
}
