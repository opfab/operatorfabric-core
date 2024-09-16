/* Copyright (c) 2020, RTEi (http://www.rte-international.com)
 * Copyright (c) 2021-2024, RTE (http://www.rte-france.com)
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
    Validators,
    FormsModule,
    ReactiveFormsModule
} from '@angular/forms';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {AdminItemType, SharingService} from '../../../services/sharing.service';
import {CrudService} from 'app/business/services/admin/crud-service';
import {EntitiesService} from 'app/business/services/users/entities.service';
import {Entity} from '@ofModel/entity.model';
import {TranslateService, TranslateModule} from '@ngx-translate/core';
import {TranslationService} from 'app/business/services/translation/translation.service';
import {MultiSelectConfig, MultiSelectOption} from '@ofModel/multiselect.model';
import {User} from '@ofModel/user.model';
import {UserService} from 'app/business/services/users/user.service';
import {Observable, of} from 'rxjs';
import {RolesEnum} from '@ofModel/roles.model';
import {NgIf} from '@angular/common';
import {MultiSelectComponent} from '../../../../share/multi-select/multi-select.component';
import {TagInputModule} from 'ngx-chips';

@Component({
    selector: 'of-edit-entity-modal',
    templateUrl: './edit-entity-modal.component.html',
    styleUrls: ['./edit-entity-modal.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, TranslateModule, FormsModule, ReactiveFormsModule, MultiSelectComponent, TagInputModule]
})
export class EditEntityModalComponent implements OnInit {
    entityForm: FormGroup<{
        id: FormControl<string | null>;
        name: FormControl<string | null>;
        description: FormControl<string | null>;
        roles: FormControl<[] | null>;
        labels: FormControl<[] | null>;
        parents: FormControl<[] | null>;
        users: FormControl<[] | null>;
    }>;

    @Input() row: any;
    @Input() type: AdminItemType;

    entities: Entity[];
    entityParentsMultiSelectOptions: Array<MultiSelectOption> = [];
    entityRolesMultiSelectOptions: Array<MultiSelectOption> = [];
    entityUsersMultiSelectOptions: Array<MultiSelectOption> = [];
    selectedEntities = [];
    selectedRoles = [];
    selectedUsers = [];
    entityParentsMultiSelectConfig: MultiSelectConfig = {
        labelKey: 'admin.input.entity.parents',
        placeholderKey: 'admin.input.selectEntityText',
        sortOptions: true
    };
    entityRolesMultiSelectConfig: MultiSelectConfig = {
        labelKey: 'admin.input.entity.roles',
        placeholderKey: 'admin.input.selectEntityText',
        sortOptions: true
    };
    entityUsersMultiSelectConfig: MultiSelectConfig = {
        labelKey: 'admin.input.entity.users',
        placeholderKey: 'admin.input.selectUserText',
        sortOptions: true
    };
    labelsPlaceholder: string;

    private crudService: CrudService;

    constructor(
        private translationService: TranslationService,
        private translate: TranslateService,
        private activeModal: NgbActiveModal,
        private dataHandlingService: SharingService,
        private changeDetector: ChangeDetectorRef
    ) {}

    ngOnInit() {
        const uniqueEntityIdValidator = [];
        const uniqueEntityNameValidator = [];
        if (!this.row) {
            uniqueEntityIdValidator.push(this.uniqueEntityIdValidatorFn());
        }
        uniqueEntityNameValidator.push(this.uniqueEntityNameValidatorFn());
        // modal used for creating a new entity

        this.entityForm = new FormGroup({
            id: new FormControl(
                '',
                [Validators.required, Validators.minLength(2), Validators.pattern(/^[A-Za-z\d\-_]+$/)],
                uniqueEntityIdValidator
            ),
            name: new FormControl('', [Validators.required], uniqueEntityNameValidator),
            description: new FormControl(''),
            roles: new FormControl([]),
            labels: new FormControl([]),
            parents: new FormControl([]),
            users: new FormControl([])
        });

        this.crudService = this.dataHandlingService.resolveCrudServiceDependingOnType(this.type);
        if (this.row) {
            // If the modal is used for edition, initialize the modal with current data from this row
            const rowEntity = EntitiesService.getEntity(this.row.id);
            this.entityForm.patchValue(this.row, {onlySelf: true});
            this.selectedEntities = rowEntity.parents;
            this.selectedRoles = this.row.roles;
        }

        UserService.getAll().subscribe((users) => {
            this.entityUsersMultiSelectOptions = [];
            users.forEach((u) => this.entityUsersMultiSelectOptions.push(new MultiSelectOption(u.login, u.login)));
            if (this.row)
                this.selectedUsers = users.filter((usr) => this.isUserInCurrentEntity(usr)).map((usr) => usr.login);
            this.changeDetector.markForCheck();
        });

        this.translate.get('admin.input.entity.addLabel').subscribe((translation) => {
            this.labelsPlaceholder = translation;
        });

        // Initialize the value list for parent Entities
        this.entities = EntitiesService.getEntities();
        this.entities.forEach((entity) => {
            const id = entity.id;
            if (!this.row || id !== this.row.id) {
                let itemName = entity.name;
                if (!itemName) {
                    itemName = id;
                }
                this.entityParentsMultiSelectOptions.push(new MultiSelectOption(id, itemName));
            }
        });

        for (const role in RolesEnum) {
            const roleTranslation = this.translationService.getTranslation('admin.input.entity.roleValues.' + role);
            this.entityRolesMultiSelectOptions.push(new MultiSelectOption(role, roleTranslation));
        }
    }

    private isUserInCurrentEntity(usr: User): boolean {
        return usr.entities && usr.entities.findIndex((g) => g === this.row.id) >= 0;
    }

    update() {
        this.cleanForm();

        // We call the activeModal "close" method and not "dismiss" to indicate that the modal was closed because the
        // user chose to perform an action (here, update the selected item).
        // This is important as code in the corresponding table components relies on the resolution of the
        // `NgbModalRef.result` promises to trigger a refresh of the data shown on the table.
        // Wait 100ms to let labels <tag-component> update pending values
        setTimeout(() => {
            this.crudService.update(this.entityForm.value).subscribe(() => {
                this.activeModal.close('Update button clicked on ' + this.type + ' modal');
            });
        }, 100);
    }

    isUniqueEntityId(entityId: string): boolean {
        if (entityId && EntitiesService.getEntities().filter((entity) => entity.id === entityId).length) return false;
        else return true;
    }

    uniqueEntityIdValidatorFn(): AsyncValidatorFn {
        return (control: AbstractControl): Observable<ValidationErrors> => {
            const err: ValidationErrors = {uniqueEntityIdViolation: true};
            return this.isUniqueEntityId(this.entityForm.controls['id'].value) ? of(null) : of(err);
        };
    }

    isUniqueEntityName(entityName: string): boolean {
        if (
            entityName &&
            EntitiesService.getEntities().filter(
                (entity) => entity.name === entityName.trim() && entity.id !== this.row?.id
            ).length
        )
            return false;
        else return true;
    }

    uniqueEntityNameValidatorFn(): AsyncValidatorFn {
        return (control: AbstractControl): Observable<ValidationErrors> => {
            const err: ValidationErrors = {uniqueEntityNameViolation: true};
            return this.isUniqueEntityName(this.entityForm.controls['name'].value) ? of(null) : of(err);
        };
    }

    private cleanForm() {
        if (this.row) {
            this.entityForm.value['id'] = this.row.id;
        }
        this.id.setValue(this.id.value.trim());
        this.name.setValue(this.name.value.trim());
        this.description.setValue(this.description.value.trim());
        this.roles.setValue(this.roles.value);
    }

    get id() {
        return this.entityForm.get('id');
    }

    get name() {
        return this.entityForm.get('name');
    }

    get description() {
        return this.entityForm.get('description');
    }

    get roles() {
        return this.entityForm.get('roles');
    }

    get labels() {
        return this.entityForm.get('labels');
    }

    get parents() {
        return this.entityForm.get('parents');
    }

    dismissModal(reason: string): void {
        this.activeModal.dismiss(reason);
    }
}
