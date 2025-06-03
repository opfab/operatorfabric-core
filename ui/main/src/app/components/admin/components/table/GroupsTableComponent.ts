/*
 * Copyright (c) 2021-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {AdminTableDirective, Field} from './AdminTableDirective';
import {AdminItemType} from '../../services/SharingService';
import {EditGroupModalComponent} from '../editmodal/groups/EditGroupModalComponent';
import {ActionButton} from '../cell-renderers/ActionCellRendererComponent';
import {NgForOf, NgIf} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {FormsModule} from '@angular/forms';
import {AgGridAngular} from 'ag-grid-angular';
import {NgbPagination} from '@ng-bootstrap/ng-bootstrap';

@Component({
    templateUrl: 'AdminTableDirective.html',
    selector: 'of-groups-table',
    styleUrls: ['AdminTableDirective.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgIf, TranslateModule, FormsModule, AgGridAngular, NgbPagination, NgForOf]
})
export class GroupsTableComponent extends AdminTableDirective implements OnInit {
    tableType = AdminItemType.GROUP;
    fields = [
        new Field('id', 4, 'idCellRenderer'),
        new Field('name', 6),
        new Field('description', 5),
        new Field('perimeters', 8),
        new Field('permissions', 6, null, null, 'permissionsColumn')
    ];
    idField = 'id';
    actionButtonsDisplayed = [ActionButton.EDIT, ActionButton.DELETE];
    editModalComponent = EditGroupModalComponent;

    ngOnInit() {
        this.gridOptions.columnTypes['permissionsColumn'] = {
            sortable: true,
            filter: 'agTextColumnFilter',
            wrapText: true,
            autoHeight: true,
            flex: 6,
            resizable: false
        };
        super.initCrudService();
    }
}
