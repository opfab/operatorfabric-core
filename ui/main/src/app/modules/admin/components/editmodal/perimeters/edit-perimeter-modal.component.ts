/* Copyright (c) 2020, RTEi (http://www.rte-international.com)
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Component, Input, OnInit} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {Perimeter, RightsEnum, StateRight} from '@ofModel/perimeter.model';
import {ProcessesService} from '@ofServices/processes.service';
import {PerimetersService} from '@ofServices/perimeters.service';
import {Process} from '@ofModel/processes.model';
import {Utilities} from '../../../../../common/utilities';
import {MessageLevel} from '@ofModel/message.model';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {AlertMessage} from '@ofStore/actions/alert.actions';

@Component({
  selector: 'of-edit-user-modal',
  templateUrl: './edit-perimeter-modal.component.html',
  styleUrls: ['./edit-perimeter-modal.component.scss']
})
export class EditPerimeterModalComponent implements OnInit {


  constructor(
      private store: Store<AppState>,
      private activeModal: NgbActiveModal,
      private crudService: PerimetersService,
      private processesService: ProcessesService,
      private formBuilder: FormBuilder) {

    this.perimeterForm = this.formBuilder.group({
      id: new FormControl(''
          , [Validators.required, Validators.minLength(2), Validators.pattern(/^[A-z\d\-_]+$/)]),
      process: new FormControl(''),
      stateRights: this.formBuilder.array([EditPerimeterModalComponent.createStateRightFormGroup()])
    });

  }

  get id() {
    return this.perimeterForm.get('id') as FormControl;
  }

  get process() {
    return this.perimeterForm.get('process') as FormControl;
  }

  get stateRights() {
    return this.perimeterForm.get('stateRights') as FormGroup;
  }

  perimeterForm: FormGroup;

  processesDefinition: Process[];
  processOptions = [];
  stateOptions = [];
  rightOptions = Object.values(RightsEnum);

  @Input() row: Perimeter;

  private static createStateRightFormGroup(initialState?, initialRight?): FormGroup {
    return new FormGroup({
      'state': new FormControl(initialState ? initialState : '', [Validators.required]),
      'right': new FormControl(initialRight ? initialRight : '', [Validators.required])
    });
  }

  ngOnInit() {

    // Initialize value lists for process inputs
    this.initProcessOptions();
    this.changeStatesWhenSelectProcess();

    if (this.row) { // If the modal is used for edition, initialize the modal with current data from this row
      const {id, process, stateRights} = this.row;
      this.perimeterForm.patchValue({id, process}, { onlySelf: false });
      const stateRightsControls = this.formBuilder.array(stateRights
              .map((stateRight: StateRight) => EditPerimeterModalComponent.createStateRightFormGroup(stateRight.state, stateRight.right)));
      this.perimeterForm.setControl('stateRights', stateRightsControls);
    }
  }

  initProcessOptions(): void {
    this.processesDefinition = this.processesService.getAllProcesses();

    // The dropdown will prefix values with the process Ids because there is no certainty that i18n values are unique across bundles.
    this.processesDefinition.forEach((process: Process) => {
      const label = process.name ? process.name : process.id;
      const processToShow = { value: process.id, label: label };
      this.processOptions.push(processToShow);
    });
  }

  changeStatesWhenSelectProcess(): void {
    this.perimeterForm.get('process').valueChanges.subscribe((process) => {

      // Update state options based on selected process
      if (!!process) {
        this.stateOptions = this.processesDefinition.filter(processDef => processDef.id === process)
            .flatMap((processDef: Process) => {
              const statesToShow = [];
              for (const [stateId, value] of Object.entries(processDef.states)) {
                statesToShow.push({value: stateId, label: value.name});
              }
              return statesToShow;
            });
      }

      // Reset stateRights form controls
      this.perimeterForm.setControl('stateRights', this.formBuilder.array([EditPerimeterModalComponent.createStateRightFormGroup()]));
    });
  }

  create() {
    this.cleanForm();
    this.crudService.create(this.perimeterForm.value).subscribe(() => {
      this.activeModal.close('Update button clicked on perimeter modal');
      // We call the activeModal "close" method and not "dismiss" to indicate that the modal was closed because the
      // user chose to perform an action (here, update the selected item).
      // This is important as code in the corresponding table components relies on the resolution of the
      // `NgbMobalRef.result` promise to trigger a refresh of the data shown on the table.
    });
  }

  update() {
    this.cleanForm();
    this.crudService.update(this.perimeterForm.value).subscribe({
        next: res => this.onSavesuccess(),
        error: err => this.onSaveError(err)
    });
  }

  onSavesuccess() {
    this.activeModal.close('Update button clicked on perimeter modal');
  }

  onSaveError(res) {
    this.store.dispatch(new AlertMessage({alertMessage: {message: res.originalError.error.message, level: MessageLevel.ERROR}}));
  }

  public addStateRightFormGroup() {
    const stateRights = this.perimeterForm.get('stateRights') as FormArray;
    stateRights.push(EditPerimeterModalComponent.createStateRightFormGroup());
  }

  public removeOrClearStateRight(i: number) {
    const emails = this.perimeterForm.get('stateRights') as FormArray;
    if (emails.length > 1) {
      emails.removeAt(i);
    } else {
      emails.reset();
    }
  }

  private cleanForm() {
    if (this.row) {
      this.perimeterForm.value['id'] = this.row.id;
    }
    this.id.setValue((this.id.value as string).trim());
  }

  dismissModal(reason: string): void {
    this.activeModal.dismiss(reason);
  }

}
