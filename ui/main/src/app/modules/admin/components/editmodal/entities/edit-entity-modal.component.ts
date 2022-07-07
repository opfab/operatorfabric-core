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
import {AsyncValidatorFn, UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {AdminItemType, SharingService} from '../../../services/sharing.service';
import {CrudService} from '@ofServices/crud-service';
import {EntitiesService} from '@ofServices/entities.service';
import {Entity} from '@ofModel/entity.model';
import {TranslateService} from '@ngx-translate/core';
import {debounceTime, distinctUntilChanged, first, map, switchMap} from 'rxjs/operators';
import {MultiSelectConfig, MultiSelectOption} from '@ofModel/multiselect.model';

@Component({
    selector: 'of-edit-entity-modal',
    templateUrl: './edit-entity-modal.component.html',
    styleUrls: ['./edit-entity-modal.component.scss']
})
export class EditEntityModalComponent implements OnInit {
    entityForm: UntypedFormGroup;

    @Input() row: any;
    @Input() type: AdminItemType;

    entities: Entity[];
    entitiesMultiSelectOptions: Array<MultiSelectOption> = [];
    selectedEntities = [];
    entitiesMultiSelectConfig: MultiSelectConfig = {
        labelKey: 'admin.input.entity.parents',
        placeholderKey: 'admin.input.selectEntityText',
        sortOptions: true
    };
    labelsPlaceholder: string;

    private crudService: CrudService;

    constructor(
        private translate: TranslateService,
        private activeModal: NgbActiveModal,
        private dataHandlingService: SharingService,
        private entitiesService: EntitiesService
    ) {}

    ngOnInit() {
        const uniqueEntityIdValidator = [];
        if (!this.row)
            // modal used for creating a new entity
            uniqueEntityIdValidator.push(this.uniqueEntityIdValidatorFn());

        this.entityForm = new UntypedFormGroup({
            id: new UntypedFormControl(
                '',
                [Validators.required, Validators.minLength(2), Validators.pattern(/^[A-z\d\-_]+$/)],
                uniqueEntityIdValidator
            ),
            name: new UntypedFormControl('', [Validators.required]),
            description: new UntypedFormControl(''),
            entityAllowedToSendCard: new UntypedFormControl(false),
            labels: new UntypedFormControl([]),
            parents: new UntypedFormControl([])
        });

        this.crudService = this.dataHandlingService.resolveCrudServiceDependingOnType(this.type);
        if (this.row) {
            // If the modal is used for edition, initialize the modal with current data from this row
            this.entityForm.patchValue(this.row, {onlySelf: true});
            this.selectedEntities = this.row.parents;
        }

        this.translate.get('admin.input.entity.addLabel').subscribe((translation) => {
            this.labelsPlaceholder = translation;
        });

        // Initialize value lists for Entities
        this.entities = this.entitiesService.getEntities();
        this.entities.forEach((entity) => {
            const id = entity.id;
            if (!this.row || id !== this.row.id) {
                let itemName = entity.name;
                if (!itemName) {
                    itemName = id;
                }
                this.entitiesMultiSelectOptions.push(new MultiSelectOption(id, itemName));
            }
        });
    }

    update() {
        this.cleanForm();

        // We call the activeModal "close" method and not "dismiss" to indicate that the modal was closed because the
        // user chose to perform an action (here, update the selected item).
        // This is important as code in the corresponding table components relies on the resolution of the
        // `NgbModalRef.result` promise to trigger a refresh of the data shown on the table.
        // Wait 100ms to let labels <tag-component> update pending values
        setTimeout(() => {
            this.crudService.update(this.entityForm.value).subscribe(() => {
                this.activeModal.close('Update button clicked on ' + this.type + ' modal');
            });
        }, 100);
    }

    isUniqueEntityId(entityId: string): boolean {
        if (!!entityId && this.entitiesService.getEntities().filter((entity) => entity.id === entityId).length)
            return false;
        else return true;
    }

    uniqueEntityIdValidatorFn(): AsyncValidatorFn {
        return (control) =>
            control.valueChanges.pipe(
                debounceTime(500),
                distinctUntilChanged(),
                switchMap(async (value) => this.isUniqueEntityId(value)),
                map((unique: boolean) => (unique ? null : {uniqueEntityIdViolation: true})),
                first()
            ); // important to make observable finite
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
        return this.entityForm.get('id');
    }

    get name() {
        return this.entityForm.get('name');
    }

    get description() {
        return this.entityForm.get('description');
    }

    get entityAllowedToSendCard() {
        return this.entityForm.get('entityAllowedToSendCard');
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
