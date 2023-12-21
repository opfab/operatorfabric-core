/* Copyright (c) 2020, RTEi (http://www.rte-international.com)
 * Copyright (c) 2021-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {
    AbstractControl,
    AsyncValidatorFn,
    FormControl,
    FormGroup,
    ValidationErrors,
    Validators
} from '@angular/forms';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {AdminItemType, SharingService} from '../../../services/sharing.service';
import {CrudService} from 'app/business/services/admin/crud-service';
import {PerimetersService} from 'app/business/services/users/perimeters.service';
import {MessageLevel} from '@ofModel/message.model';
import {GroupsService} from 'app/business/services/users/groups.service';
import {MultiSelectConfig, MultiSelectOption} from '@ofModel/multiselect.model';
import {UserService} from 'app/business/services/users/user.service';
import {User} from '@ofModel/user.model';
import {PermissionEnum} from '@ofModel/permission.model';
import {Observable, of} from 'rxjs';
import {AlertMessageService} from 'app/business/services/alert-message.service';


@Component({
    selector: 'of-edit-group-modal',
    templateUrl: './edit-group-modal.component.html',
    styleUrls: ['./edit-group-modal.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditGroupModalComponent implements OnInit {

    groupForm: FormGroup<{
        id: FormControl<string | null>,
        name: FormControl<string | null>,
        description: FormControl<string | null>,
        perimeters: FormControl<{}[] | null>,
        permissions: FormControl<[] | null>,
        realtime: FormControl<boolean | null>,
    }>;

    perimetersMultiSelectOptions: Array<MultiSelectOption> = [];
    selectedPerimeters = [];
    selectedGroupPermissions = [];

    perimetersMultiSelectConfig: MultiSelectConfig = {
        labelKey: 'admin.input.group.perimeters',
        placeholderKey: 'admin.input.selectPerimeterText',
        sortOptions: true
    };

    @Input() row: any;
    @Input() type: AdminItemType;

    private crudService: CrudService;

    groupPermissions = [];

    groupUsers: string;

    public permissionsMultiSelectConfig: MultiSelectConfig = {
        labelKey: 'admin.input.group.permissions',
        placeholderKey: 'admin.input.selectGroupPermissionText',
        multiple: true,
        sortOptions: true
    };

    constructor(
        private activeModal: NgbActiveModal,
        private dataHandlingService: SharingService,
        private changeDetector: ChangeDetectorRef
    ) {
        Object.values(PermissionEnum).forEach((t) => this.groupPermissions.push({value: String(t), label: String(t)}));
    }

    ngOnInit() {
        const uniqueGroupIdValidator = [];
        const uniqueGroupNameValidator = [];
        if (!this.row) {
            uniqueGroupIdValidator.push(this.uniqueGroupIdValidatorFn());
        }
        uniqueGroupNameValidator.push(this.uniqueGroupNameValidatorFn());
            // modal used for creating a new group

        this.groupForm = new FormGroup({
            id: new FormControl(
                '',
                [Validators.required, Validators.minLength(2), Validators.pattern(/^[A-Za-z\d\-_]+$/)],
                uniqueGroupIdValidator
            ),
            name: new FormControl(
                '',
                [Validators.required],
                uniqueGroupNameValidator
            ),
            description: new FormControl(''),
            perimeters: new FormControl([]),
            permissions: new FormControl([]),
            realtime: new FormControl<boolean | null>(false),
        });

        this.crudService = this.dataHandlingService.resolveCrudServiceDependingOnType(this.type);

        if (this.row) {
            // If the modal is used for edition, initialize the modal with current data from this row

            // For 'simple' fields (where the value is directly displayed), we use the form's patching method
            const {id, name, description, realtime} = this.row;
            this.groupForm.patchValue({id, name, description, realtime}, {onlySelf: false});
            // Otherwise, we use the selectedItems property of the of-multiselect component
            this.selectedPerimeters = this.row.perimeters;
            this.selectedGroupPermissions = this.row.permissions;

            UserService.getAll().subscribe(users => {
                this.groupUsers = users.filter(usr => this.isUserInCurrentGroup(usr)).map(usr => usr.login).join(', ');
                this.changeDetector.markForCheck();
            });
        }

        PerimetersService.getPerimeters().forEach((perimeter) => {
            this.perimetersMultiSelectOptions.push(new MultiSelectOption(perimeter.id, perimeter.id));
        });



    }

    private isUserInCurrentGroup(usr: User) :boolean {
        return usr.groups && usr.groups.findIndex(g => g === this.row.id) >= 0;
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
        if (groupId && GroupsService.getGroups().filter((group) => group.id === groupId).length) return false;
        else return true;
    }

    uniqueGroupIdValidatorFn(): AsyncValidatorFn {
        return (control: AbstractControl): Observable<ValidationErrors> =>
        {
            const err : ValidationErrors = {'uniqueGroupIdViolation': true};
            return this.isUniqueGroupId(this.groupForm.controls["id"].value)? of(null) : of(err)
        }
    }

    isUniqueGroupName(groupName: string): boolean {
        if (groupName && GroupsService.getGroups().filter((group) => (group.name === groupName.trim()) && (group.id !== this.row?.id)).length) return false;
        else return true;
    }

    uniqueGroupNameValidatorFn(): AsyncValidatorFn {
        return (control: AbstractControl): Observable<ValidationErrors> =>
        {
            const err : ValidationErrors = {'uniqueGroupNameViolation': true};
            return this.isUniqueGroupName(this.groupForm.controls["name"].value)? of(null) : of(err)
        }
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

        AlertMessageService.sendAlertMessage({message: res.originalError.error.message, level: MessageLevel.ERROR});

    }

    private cleanForm() {
        if (this.row) {
            this.groupForm.value['id'] = this.row.id;
        }
        this.id.setValue((this.id.value).trim());
        this.name.setValue((this.name.value).trim());

        if (this.description.value) {
            this.description.setValue((this.description.value).trim());
        }

        this.realtime.setValue(this.realtime.value);
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

    get permissions() {
        return this.groupForm.get('permissions');
    }

    get realtime() {
        return this.groupForm.get('realtime');
    }

    dismissModal(reason: string): void {
        this.activeModal.dismiss(reason);
    }
}
