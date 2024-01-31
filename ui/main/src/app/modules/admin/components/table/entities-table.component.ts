/*
 * Copyright (c) 2021-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {AdminTableDirective, Field} from './admin-table.directive';
import {EditEntityModalComponent} from '../editmodal/entities/edit-entity-modal.component';
import {AdminItemType} from '../../services/sharing.service';
import {ActionButton} from '../cell-renderers/action-cell-renderer.component';

@Component({
    templateUrl: 'admin-table.directive.html',
    selector: 'of-entities-table',
    styleUrls: ['admin-table.directive.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntitiesTableComponent extends AdminTableDirective implements OnInit {
    tableType = AdminItemType.ENTITY;
    fields = [
        new Field('id', 3, 'idCellRenderer'),
        new Field('name', 3),
        new Field('description', 5),
        new Field('roles', 4, 'roleCellRenderer', null, 'rolesColumn'),
        new Field('parents', 5, 'entityCellRenderer', null, 'parentsColumn')
    ];
    idField = 'id';
    actionButtonsDisplayed = [ActionButton.EDIT, ActionButton.DELETE];
    editModalComponent = EditEntityModalComponent;

    ngOnInit() {
        this.gridOptions.columnTypes['rolesColumn'] = {
            sortable: true,
            wrapText: true,
            autoHeight: true,
            flex: 4
        };
        this.gridOptions.columnTypes['parentsColumn'] = {
            sortable: true,
            filter: 'agTextColumnFilter',
            filterParams: {
                valueGetter: (params) => {
                    let text = '';
                    if (params.data.parents) {
                        params.data.parents.forEach((parent) => {
                            text +=
                                this.entitiesDefinition
                                    .filter((entityDefinition) => parent === entityDefinition.id)
                                    .map((entityDefinition) => entityDefinition.name) + ' ';
                        });
                    }
                    return text;
                }
            },
            wrapText: true,
            autoHeight: true,
            flex: 4,
            resizable: false
        };
        super.initCrudService();
    }
}
