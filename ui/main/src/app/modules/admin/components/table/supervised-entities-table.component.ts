/*
 * Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
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
import {SupervisedEntitiesService} from '@ofServices/admin/SupervisedEntitiesService';
import {NgForOf, NgIf} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {FormsModule} from '@angular/forms';
import {AgGridAngular} from 'ag-grid-angular';
import {NgbPagination} from '@ng-bootstrap/ng-bootstrap';

@Component({
    templateUrl: 'admin-table.directive.html',
    selector: 'of-supervised-entities-table',
    styleUrls: ['admin-table.directive.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, TranslateModule, FormsModule, AgGridAngular, NgbPagination, NgForOf]
})
export class SupervisedEntitiesTableComponent extends AdminTableDirective implements OnInit {
    tableType = AdminItemType.SUPERVISED_ENTITY;
    fields = [
        new Field('entityName', 3, 'idCellRenderer', null, 'entityNameColumn'),
        new Field('supervisors', 5, null, null, 'supervisorsColumn')
    ];
    idField = 'entityId';
    actionButtonsDisplayed = [ActionButton.EDIT, ActionButton.DELETE];
    editModalComponent = EditSupervisedEntityModalComponent;

    ngOnInit() {
        SupervisedEntitiesService.loadAllSupervisedEntitiesData().subscribe();

        this.gridOptions.columnTypes['entityNameColumn'] = {
            sortable: true,
            filter: 'agTextColumnFilter',
            wrapText: true,
            autoHeight: true,
            maxWidth: 500,
            flex: 3
        };
        this.gridOptions.columnTypes['supervisorsColumn'] = {
            sortable: true,
            filter: 'agTextColumnFilter',
            wrapText: true,
            autoHeight: true,
            flex: 4,
            resizable: false
        };
        super.initCrudService();
    }
}
