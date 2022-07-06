/* Copyright (c) 2020, RTEi (http://www.rte-international.com)
 * Copyright (c) 2021-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {Component, Input, OnInit} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {Perimeter, RightsEnum} from '@ofModel/perimeter.model';
import {ProcessesService} from '@ofServices/processes.service';
import {PerimetersService} from '@ofServices/perimeters.service';
import {Process} from '@ofModel/processes.model';
import {MessageLevel} from '@ofModel/message.model';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {AlertMessageAction} from '@ofStore/actions/alert.actions';
import {MultiSelectConfig} from '@ofModel/multiselect.model';

@Component({
    selector: 'of-edit-perimeter-modal',
    templateUrl: './edit-perimeter-modal.component.html',
    styleUrls: ['./edit-perimeter-modal.component.scss']
})
export class EditPerimeterModalComponent implements OnInit {
    constructor(
        private store: Store<AppState>,
        private activeModal: NgbActiveModal,
        private crudService: PerimetersService,
        private processesService: ProcessesService,
        private formBuilder: UntypedFormBuilder
    ) {
        this.perimeterForm = this.formBuilder.group({
            id: new UntypedFormControl('', [
                Validators.required,
                Validators.minLength(2),
                Validators.pattern(/^[A-z\d\-_]+$/)
            ]),
            process: new UntypedFormControl('')
        });

        Object.keys(RightsEnum).forEach((key) => {
            this.rightOptions.push({value: key, label: key});
        });
    }

    get id() {
        return this.perimeterForm.get('id');
    }

    get process() {
        return this.perimeterForm.get('process');
    }

    get stateRights() {
        return this.perimeterForm.get('stateRights');
    }

    perimeterForm: UntypedFormGroup;

    processesDefinition: Process[];
    processOptions = [];
    stateOptions = [];
    rightOptions = [];
    stateRightControlsIndexes: number[] = [];
    processIdEdited = '';
    indexForNewStateRightControl = 0;

    @Input() row: Perimeter;

    public multiSelectConfigForProcess: MultiSelectConfig = {
        labelKey: 'admin.input.perimeter.process',
        placeholderKey: 'admin.input.selectProcessText',
        multiple: false,
        search: true,
        sortOptions: true
    };

    public multiSelectConfigForState: MultiSelectConfig = {
        labelKey: 'admin.input.perimeter.state',
        placeholderKey: 'admin.input.selectStateText',
        multiple: false,
        search: true,
        sortOptions: true
    };

    public multiSelectConfigForRight: MultiSelectConfig = {
        labelKey: 'admin.input.perimeter.right',
        placeholderKey: 'admin.input.selectRightText',
        multiple: false,
        search: true
    };

    private addStateRightControl(initialState?, initialRight?) {
        const stateKey = 'state' + this.indexForNewStateRightControl;
        const rightKey = 'right' + this.indexForNewStateRightControl;

        this.perimeterForm.addControl(
            stateKey,
            new UntypedFormControl(initialState ? initialState : '', [Validators.required])
        );
        this.perimeterForm.addControl(
            rightKey,
            new UntypedFormControl(initialRight ? initialRight : '', [Validators.required])
        );
        this.addStateRightControlIndexToList();
    }

    private addStateRightControlIndexToList() {
        this.stateRightControlsIndexes.push(this.indexForNewStateRightControl);
        this.indexForNewStateRightControl++;
    }

    ngOnInit() {
        // Initialize value lists for process inputs
        this.initProcessOptions();
        this.changeStatesWhenSelectProcess();

        if (this.row) {
            // If the modal is used for edition, initialize the modal with current data from this row
            this.stateRightControlsIndexes = [];
            const {id, process, stateRights} = this.row;
            this.processIdEdited = process;
            this.perimeterForm.patchValue({id, process}, {onlySelf: false});

            stateRights.forEach((stateRight) => {
                this.addStateRightControl(stateRight.state, stateRight.right);
            });
        }
    }

    initProcessOptions(): void {
        this.processesDefinition = this.processesService.getAllProcesses();

        // The dropdown will prefix values with the process Ids because there is no certainty that i18n values are unique across bundles.
        this.processesDefinition.forEach((process: Process) => {
            const label = process.name ? process.name : process.id;
            const processToShow = {value: process.id, label: process.id + ' - ' + label};
            this.processOptions.push(processToShow);
        });
    }

    changeStatesWhenSelectProcess(): void {
        this.perimeterForm.get('process').valueChanges.subscribe((process) => {
            let isSelectedProcessDifferentFromPrevious = false;

            // Update state options based on selected process
            if (!!process) {
                if (process !== this.processIdEdited) {
                    isSelectedProcessDifferentFromPrevious = true;
                    this.processIdEdited = process;
                }

                this.stateOptions = this.processesDefinition
                    .filter((processDef) => processDef.id === process)
                    .flatMap((processDef: Process) => {
                        const statesToShow = [];
                        for (const [stateId, value] of Object.entries(processDef.states)) {
                            statesToShow.push({value: stateId, label: value.name});
                        }
                        return statesToShow;
                    });
            }

            // we reset the state/right values in two cases :
            // 1) we are not editing a perimeter
            // 2) we are editing a perimeter but the user change the process
            if (!this.row || isSelectedProcessDifferentFromPrevious) {
                this.clearAllStateRights();
                this.stateRightControlsIndexes = [];
                this.addStateRightControl();
            }
        });
    }

    create() {
        this.cleanForm();
        this.computeStateRightsForPerimeterForm();

        this.crudService.create(this.perimeterForm.value).subscribe({
            next: () => this.onSavesuccess(),
            error: (e) => this.onSaveError(e)
        });
    }

    update() {
        this.cleanForm();
        this.computeStateRightsForPerimeterForm();

        this.crudService.update(this.perimeterForm.value).subscribe({
            next: (res) => this.onSavesuccess(),
            error: (err) => this.onSaveError(err)
        });
    }

    private computeStateRightsForPerimeterForm() {
        const stateRights = [];
        this.stateRightControlsIndexes.forEach((index) => {
            const stateKey = 'state' + index;
            const rightKey = 'right' + index;
            stateRights.push({state: this.perimeterForm.value[stateKey], right: this.perimeterForm.value[rightKey]});
        });
        this.perimeterForm.value.stateRights = stateRights;
    }

    onSavesuccess() {
        this.activeModal.close('Update button clicked on perimeter modal');
        // We call the activeModal "close" method and not "dismiss" to indicate that the modal was closed because the
        // user chose to perform an action (here, update the selected item).
        // This is important as code in the corresponding table components relies on the resolution of the
        // `NgbMobalRef.result` promise to trigger a refresh of the data shown on the table.
    }

    onSaveError(res) {
        this.store.dispatch(
            new AlertMessageAction({
                alertMessage: {message: res.originalError.error.message, level: MessageLevel.ERROR}
            })
        );
    }

    public removeOrClearStateRight(indexToRemove: number) {
        this.clearStateRight(indexToRemove);
        const indexFound = this.stateRightControlsIndexes.findIndex((element) => element === indexToRemove);
        if (indexFound !== -1) {
            this.stateRightControlsIndexes.splice(indexFound, 1);
        }
    }

    private clearAllStateRights() {
        this.stateRightControlsIndexes.forEach((indexToRemove) => {
            this.clearStateRight(indexToRemove);
        });
    }

    private clearStateRight(indexToRemove: number) {
        const stateKey = 'state' + indexToRemove;
        const rightKey = 'right' + indexToRemove;
        if (this.perimeterForm.contains(stateKey)) {
            this.perimeterForm.removeControl(stateKey);
        }

        if (this.perimeterForm.contains(rightKey)) {
            this.perimeterForm.removeControl(rightKey);
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
