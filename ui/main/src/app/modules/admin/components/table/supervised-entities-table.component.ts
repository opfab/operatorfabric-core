/*
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {AdminTableDirective, Field} from './admin-table.directive';
import {AdminItemType} from '../../services/sharing.service';
import {ActionButton} from '../cell-renderers/action-cell-renderer.component';
import {EditSupervisedEntityModalComponent} from '../editmodal/supervised-entities/edit-supervised-entity-modal.component';

@Component({
    templateUrl: 'admin-table.directive.html',
    selector: 'of-supervised-entities-table',
    styleUrls: ['admin-table.directive.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SupervisedEntitiesTableComponent extends AdminTableDirective implements OnInit {
    tableType = AdminItemType.SUPERVISED_ENTITY;
    fields = [
        new Field('entityId', 3, 'entityNameCellRenderer', null, 'entityNameColumn'),
        new Field('supervisors', 5, 'entityCellRenderer', null, 'supervisorsColumn')
    ];
    idField = 'entityId';
    actionButtonsDisplayed = [ActionButton.EDIT, ActionButton.DELETE];
    editModalComponent = EditSupervisedEntityModalComponent;

    ngOnInit() {
        this.gridOptions.columnTypes['entityNameColumn'] = {
            sortable: true,
            filter: 'agTextColumnFilter',
            filterParams: {
                valueGetter: (params) => {
                    const entity = this.entitiesDefinition
                        .find((entityDefinition) => params.data.entityId === entityDefinition.id);
                        
                    return entity ? entity.name : params.data.entityId;
                }
            },
            wrapText: true,
            autoHeight: true,
            flex: 3
        };
        this.gridOptions.columnTypes['supervisorsColumn'] = {
            sortable: true,
            filter: 'agTextColumnFilter',
            filterParams: {
                valueGetter: (params) => {
                    let text = '';
                    if (params.data.supervisors) {
                        params.data.supervisors.forEach((supervisor) => {
                            text +=
                                this.entitiesDefinition
                                    .filter((entityDefinition) => supervisor === entityDefinition.id)
                                    .map((entityDefinition) => entityDefinition.name) + ' ';
                        });
                    }
                    return text;
                }
            },
            wrapText: true,
            autoHeight: true,
            flex: 4
        };
        super.ngOnInit();
    }
}
