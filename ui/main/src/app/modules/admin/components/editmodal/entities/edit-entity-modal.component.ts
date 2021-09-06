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
import {EntitiesService} from '@ofServices/entities.service';
import {Entity} from '@ofModel/entity.model';
import {TranslateService} from '@ngx-translate/core';

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
    description: new FormControl(''),
    entityAllowedToSendCard: new FormControl(false),
    parents: new FormControl([]),
  });

  @Input() row: any;
  @Input() type: AdminItemType;

  entities: Entity[];
  entitiesDropdownList = [];
  selectedEntities = [];
  entitiesDropdownSettings = {};

  private crudService: CrudService;

  constructor(
    private translate: TranslateService,
    private activeModal: NgbActiveModal,
    private dataHandlingService: SharingService,
    private entitiesService: EntitiesService
  ) {
  }

  ngOnInit() {
    this.crudService = this.dataHandlingService.resolveCrudServiceDependingOnType(this.type);
    if (this.row) { // If the modal is used for edition, initialize the modal with current data from this row
      this.entityForm.patchValue(this.row, { onlySelf: true });
      this.selectedEntities = this.row.parents;
    }


    this.translate.get('admin.input.selectEntityText')
        .subscribe(translation => {
            this.entitiesDropdownSettings = {
              text: translation,
              badgeShowLimit: 6,
              enableSearchFilter: true
          };
    });

    // Initialize value lists for Entities 
    this.entities = this.entitiesService.getEntities();
    this.entities.forEach((entity) => {
      const id = entity.id;
      if (!this.row || id !== this.row.id ) {
        let itemName = entity.name;
        if (!itemName) {
          itemName = id;
        }
        this.entitiesDropdownList.push({ id: id, itemName: itemName });
      }
    });
  }

  update() {
    this.cleanForm();
    this.parents.setValue(this.parents.value.map(entity => entity.id));
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
    this.entityAllowedToSendCard.setValue(this.entityAllowedToSendCard.value as boolean);
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

  get entityAllowedToSendCard() {
    return this.entityForm.get('entityAllowedToSendCard') as FormControl;
  }

  get parents() {
    return this.entityForm.get('parents') as FormControl;
  }


  dismissModal(reason: string): void {
    this.activeModal.dismiss(reason);
  }
}
