/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, Input, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {AdminItemType, SharingService} from '../../../services/sharing.service';
import {CrudService} from 'app/business/services/admin/crud-service';
import {EntitiesService} from 'app/business/services/users/entities.service';
import {Entity} from '@ofModel/entity.model';
import {MultiSelectConfig, MultiSelectOption} from '@ofModel/multiselect.model';
import {SupervisedEntitiesService} from 'app/business/services/users/supervised-entities.service';
import {NgIf} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {MultiSelectComponent} from '../../../../share/multi-select/multi-select.component';
import {CrudUtilities} from 'app/business/services/admin/crudUtils';

@Component({
    selector: 'of-edit-supervised-entity-modal',
    templateUrl: './edit-supervised-entity-modal.component.html',
    styleUrls: ['./edit-supervised-entity-modal.component.scss'],
    standalone: true,
    imports: [NgIf, TranslateModule, FormsModule, ReactiveFormsModule, MultiSelectComponent]
})
export class EditSupervisedEntityModalComponent implements OnInit {
    entityForm: FormGroup;

    @Input() row: any;
    @Input() type: AdminItemType;

    entities: Entity[];
    entityName: string;
    supervisedEntities = [];

    supervisedMultiSelectOptions: Array<MultiSelectOption> = [];
    entityIdMultiSelectConfig: MultiSelectConfig = {
        labelKey: 'admin.input.supervisedEntity.entityName',
        placeholderKey: 'admin.input.selectEntityText',
        multiple: false,
        search: true,
        sortOptions: true,
        labelRenderer: CrudUtilities.entityLabelRenderer
    };
    supervisorsMultiSelectOptions: Array<MultiSelectOption> = [];
    selectedSupervisors = [];
    supervisorsMultiSelectConfig: MultiSelectConfig = {
        labelKey: 'admin.input.supervisedEntity.supervisors',
        placeholderKey: 'admin.input.selectEntityText',
        sortOptions: true,
        labelRenderer: CrudUtilities.entityLabelRenderer
    };

    private crudService: CrudService;
    allEntitiesSupervised: boolean;

    constructor(
        private activeModal: NgbActiveModal,
        private dataHandlingService: SharingService
    ) {}

    ngOnInit() {
        this.entityForm = new FormGroup({
            id: new FormControl(''),
            entityId: new FormControl<string | null>('', [Validators.required]),
            supervisors: new FormControl<string[] | null>([], [Validators.required])
        });

        this.entities = EntitiesService.getEntities();

        this.crudService = this.dataHandlingService.resolveCrudServiceDependingOnType(this.type);

        this.supervisedEntities = this.crudService.getCachedValues();

        if (this.row) this.initializeForEdition();

        this.allEntitiesSupervised = this.entities.length === this.supervisedEntities.length;

        if (!this.allEntitiesSupervised) this.initializeMultiselectOptions();
    }

    initializeForEdition() {
        this.entityForm.patchValue(this.row, {onlySelf: true});
        this.selectedSupervisors = SupervisedEntitiesService.getSupervisedEntity(this.row.entityId).supervisors;
        this.entityName = this.row.entityName;
    }

    isEntityAlreadySupervised(entityId: string) {
        return this.supervisedEntities.findIndex((supervisedEntity) => supervisedEntity.entityId === entityId) >= 0;
    }

    initializeMultiselectOptions() {
        this.entities.forEach((entity) => {
            const id = entity.id;
            if (!this.row || id !== this.row.entityId) {
                let itemName = entity.name;
                if (!itemName) {
                    itemName = id;
                }
                this.supervisorsMultiSelectOptions.push(new MultiSelectOption(id, itemName));

                if (!this.row && !this.isEntityAlreadySupervised(id))
                    this.supervisedMultiSelectOptions.push(new MultiSelectOption(id, itemName));
            }
        });
    }

    onSupervisedEntityChange($event) {
        const selectedId = $event;
        this.supervisorsMultiSelectOptions = [];
        this.entities.forEach((entity) => {
            const id = entity.id;
            if (id !== selectedId) {
                let itemName = entity.name;
                if (!itemName) {
                    itemName = id;
                }
                this.supervisorsMultiSelectOptions.push(new MultiSelectOption(id, itemName));
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

    private cleanForm() {
        if (this.row) {
            this.entityForm.value['entityId'] = this.row.entityId;
        }
        this.entityId.setValue((this.entityId.value as string).trim());
    }

    get entityId() {
        return this.entityForm.get('entityId');
    }

    get supervisors() {
        return this.entityForm.get('supervisors');
    }

    dismissModal(reason: string): void {
        this.activeModal.dismiss(reason);
    }
}
