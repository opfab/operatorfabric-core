/*
 * Copyright (c) 2021-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, OnInit} from '@angular/core';
import {EditUserModalComponent} from '../editmodal/users/edit-user-modal.component';
import {AdminTableDirective, Field} from './admin-table.directive';
import {AdminItemType} from '../../services/sharing.service';
import {ActionButton} from '../cell-renderers/action-cell-renderer.component';

@Component({
    templateUrl: 'admin-table.directive.html',
    selector: 'of-users-table',
    styleUrls: ['admin-table.directive.scss']
})
export class UsersTableComponent extends AdminTableDirective implements OnInit {
    tableType = AdminItemType.USER;
    fields = [
        new Field('login', 3, 'idCellRenderer'),
        new Field('firstName', 3),
        new Field('lastName', 3),
        new Field('groups', 6, 'groupCellRenderer', null, 'groupsColumn'),
        new Field('entities', 6, 'entityCellRenderer', null, 'entitiesColumn')
    ];
    idField = 'login';
    actionButtonsDisplayed = [ActionButton.EDIT, ActionButton.DELETE];
    editModalComponent = EditUserModalComponent;
    ngOnInit() {
        this.gridOptions.columnTypes['groupsColumn'] = {
            sortable: true,
            filter: 'agTextColumnFilter',
            filterParams: {
                valueGetter: (params) => {
                    let text = '';
                    params.data.groups.forEach((group) => {
                        text +=
                            this.groupsDefinition
                                .filter((groupDefinition) => group === groupDefinition.id)
                                .map((groupDefinition) => groupDefinition.name) + ' ';
                    });
                    return text;
                }
            },
            wrapText: true,
            autoHeight: true,
            flex: 4
        };
        this.gridOptions.columnTypes['entitiesColumn'] = {
            sortable: true,
            filter: 'agTextColumnFilter',
            filterParams: {
                valueGetter: (params) => {
                    let text = '';
                    params.data.entities.forEach((entity) => {
                        text +=
                            this.entitiesDefinition
                                .filter((entityDefinition) => entity === entityDefinition.id)
                                .map((entityDefinition) => entityDefinition.name) + ' ';
                    });
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
