/*
 * Copyright (c) 2021-2026, RTE (http://www.rte-france.com)
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
import {ActionButton} from '../cell-renderers/ActionCellRendererComponent';
import {TranslateDirective} from '@ngx-translate/core';
import {FormsModule} from '@angular/forms';
import {AgGridAngular} from 'ag-grid-angular';
import {NgbPagination} from '@ng-bootstrap/ng-bootstrap';
import {CrudProcessesService} from '@ofServices/admin/CrudProcessesService';
import {ModalService} from '@ofServices/modal/ModalService';
import {I18n} from '../../../../model/I18n';
import {LoggerService as logger} from '@ofServices/logs/LoggerService';

@Component({
    templateUrl: 'AdminTableDirective.html',
    selector: 'of-processes-table',
    styleUrls: ['AdminTableDirective.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [TranslateDirective, FormsModule, AgGridAngular, NgbPagination]
})
export class ProcessesTableComponent extends AdminTableDirective implements OnInit {
    tableType = AdminItemType.PROCESS;
    fields = [
        new Field('id', 6, 'idCellRenderer'),
        new Field('name', 6, null),
        new Field('version', 2, null, null, 'versionColumn'),
        new Field('currentVersion', 2, null, (params) => (params.value ? '✔' : ''))
    ];
    idField = 'id';
    showAddButton = false;
    actionButtonsDisplayed = [ActionButton.DOWNLOAD, ActionButton.DELETE];

    ngOnInit() {
        this.gridOptions.columnTypes['versionColumn'] = {
            resizable: false
        };
        super.initCrudService();
    }

    override openDeleteConfirmationDialog(row: any): any {
        const confirmDeleteMessage =
            `${this.translateService.instant('admin.input.' + this.tableType + '.confirmDelete')} ` +
            `${row[this.idField]} (` +
            `${this.translateService.instant('admin.input.' + this.tableType + '.version').toLowerCase()}` +
            ` ${row.version}) ?`;

        ModalService.openConfirmationModal(new I18n('userCard.deleteCard.title'), confirmDeleteMessage).then(
            (confirmed) => {
                if (confirmed) {
                    this.deleteProcessVersion(row);
                }
            }
        );
    }

    private deleteProcessVersion(row: any) {
        (this.crudService as CrudProcessesService).deleteVersion(row.id, row.version).subscribe({
            next: () => this.refreshData(),
            error: (err) => {
                logger.error('Delete version failed', err);
            }
        });
    }
}
