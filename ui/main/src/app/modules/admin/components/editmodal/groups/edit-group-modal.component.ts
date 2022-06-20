/* Copyright (c) 2020, RTEi (http://www.rte-international.com)
 * Copyright (c) 2021-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, Input, OnInit} from '@angular/core';
import {AsyncValidatorFn, FormControl, FormGroup, Validators} from '@angular/forms';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {AdminItemType, SharingService} from '../../../services/sharing.service';
import {CrudService} from '@ofServices/crud-service';
import {PerimetersService} from '@ofServices/perimeters.service';
import {AlertMessageAction} from '@ofStore/actions/alert.actions';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {MessageLevel} from '@ofModel/message.model';
import {GroupsService} from '@ofServices/groups.service';
import {debounceTime, distinctUntilChanged, first, map, switchMap} from 'rxjs/operators';
import {MultiSelectConfig, MultiSelectOption} from '@ofModel/multiselect.model';

@Component({
    selector: 'of-edit-group-modal',
    templateUrl: './edit-group-modal.component.html',
    styleUrls: ['./edit-group-modal.component.scss']
})
export class EditGroupModalComponent implements OnInit {
    groupForm: FormGroup;

    perimetersMultiSelectOptions: Array<MultiSelectOption> = [];
    selectedPerimeters = [];

    perimetersMultiSelectConfig: MultiSelectConfig = {
        labelKey: 'admin.input.group.perimeters',
        placeholderKey: 'admin.input.selectPerimeterText',
        sortOptions: true
    };

    @Input() row: any;
    @Input() type: AdminItemType;

    private crudService: CrudService;

    constructor(
        private store: Store<AppState>,
        private activeModal: NgbActiveModal,
        private dataHandlingService: SharingService,
        private perimetersService: PerimetersService,
        private groupsService: GroupsService
    ) {}

    ngOnInit() {
        const uniqueGroupIdValidator = [];
        if (!this.row)
            // modal used for creating a new group
            uniqueGroupIdValidator.push(this.uniqueGroupIdValidatorFn());

        this.groupForm = new FormGroup({
            id: new FormControl(
                '',
                [Validators.required, Validators.minLength(2), Validators.pattern(/^[A-z\d\-_]+$/)],
                uniqueGroupIdValidator
            ),
            name: new FormControl('', [Validators.required]),
            description: new FormControl(''),
            perimeters: new FormControl([]),
            realtime: new FormControl(false)
        });

        this.crudService = this.dataHandlingService.resolveCrudServiceDependingOnType(this.type);

        if (this.row) {
            // If the modal is used for edition, initialize the modal with current data from this row

            // For 'simple' fields (where the value is directly displayed), we use the form's patching method
            const {id, name, description, realtime} = this.row;
            this.groupForm.patchValue({id, name, description, realtime}, {onlySelf: false});

            // Otherwise, we use the selectedItems property of the of-multiselect component
            this.selectedPerimeters = this.row.perimeters;
        }

        this.perimetersService.getPerimeters().forEach((perimeter) => {
            this.perimetersMultiSelectOptions.push(new MultiSelectOption(perimeter.id, perimeter.id));
        });
    }

    update() {
        this.cleanForm();
        // We call the activeModal "close" method and not "dismiss" to indicate that the modal was closed because the
        // user chose to perform an action (here, update the selected item).
        // This is important as code in the corresponding table components relies on the resolution of the
        // `NgbModalRef.result` promise to trigger a refresh of the data shown on the table.
        this.crudService.update(this.groupForm.value).subscribe({
            next: () => this.onSavesuccess(),
            error: (e) => this.onSaveError(e)
        });
    }

    isUniqueGroupId(groupId: string): boolean {
        if (!!groupId && this.groupsService.getGroups().filter((group) => group.id === groupId).length) return false;
        else return true;
    }

    uniqueGroupIdValidatorFn(): AsyncValidatorFn {
        return (control) =>
            control.valueChanges.pipe(
                debounceTime(500),
                distinctUntilChanged(),
                switchMap(async (value) => this.isUniqueGroupId(value)),
                map((unique: boolean) => (unique ? null : {uniqueGroupIdViolation: true})),
                first()
            ); // important to make observable finite
    }

    onSavesuccess() {
        this.activeModal.close('Update button clicked on ' + this.type + ' modal');
    }

    onSaveError(res) {
        this.perimeters.setValue(
            this.perimeters.value.map((perimeterId) => {
                return {id: perimeterId, itemName: perimeterId};
            })
        );
        this.store.dispatch(
            new AlertMessageAction({alertMessage: {message: res.originalError.error.message, level: MessageLevel.ERROR}})
        );
    }

    private cleanForm() {
        if (this.row) {
            this.groupForm.value['id'] = this.row.id;
        }
        this.id.setValue((this.id.value as string).trim());
        this.name.setValue((this.name.value as string).trim());
        this.description.setValue((this.description.value as string).trim());
        this.realtime.setValue(this.realtime.value as boolean);
    }

    get id() {
        return this.groupForm.get('id');
    }

    get name() {
        return this.groupForm.get('name');
    }

    get description() {
        return this.groupForm.get('description');
    }

    get perimeters() {
        return this.groupForm.get('perimeters');
    }

    get realtime() {
        return this.groupForm.get('realtime');
    }

    dismissModal(reason: string): void {
        this.activeModal.dismiss(reason);
    }
}
