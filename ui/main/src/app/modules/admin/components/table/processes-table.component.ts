/*
 * Copyright (c) 2021-2023, RTE (http://www.rte-france.com)
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

@Component({
    templateUrl: 'admin-table.directive.html',
    selector: 'of-processes-table',
    styleUrls: ['admin-table.directive.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProcessesTableComponent extends AdminTableDirective implements OnInit {
    tableType = AdminItemType.PROCESS;
    fields = [
        new Field('id', 6, 'idCellRenderer'), 
        new Field('name', 6, null), 
        new Field('version', 6, null, null, 'versionColumn')
    ];
    idField = 'id';
    showAddButton = false;
    actionButtonsDisplayed = [ActionButton.DELETE];

    ngOnInit() {
        this.gridOptions.columnTypes['versionColumn'] = {
            resizable: false
        };
        super.ngOnInit();
    }
}
