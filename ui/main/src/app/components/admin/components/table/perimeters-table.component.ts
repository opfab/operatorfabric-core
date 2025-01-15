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
import {AdminTableDirective, Field} from './admin-table.directive';
import {AdminItemType} from '../../services/sharing.service';
import {EditPerimeterModalComponent} from '../editmodal/perimeters/edit-perimeter-modal.component';
import {Utilities} from 'app/business/common/utilities';
import {ActionButton} from '../cell-renderers/action-cell-renderer.component';
import {NgForOf, NgIf} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {FormsModule} from '@angular/forms';
import {AgGridAngular} from 'ag-grid-angular';
import {NgbPagination} from '@ng-bootstrap/ng-bootstrap';

@Component({
    templateUrl: 'admin-table.directive.html',
    selector: 'of-perimeters-table',
    styleUrls: ['admin-table.directive.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, TranslateModule, FormsModule, AgGridAngular, NgbPagination, NgForOf]
})
export class PerimetersTableComponent extends AdminTableDirective implements OnInit {
    tableType = AdminItemType.PERIMETER;
    fields = [
        new Field('id', 4, 'idCellRenderer'),
        new Field('process'),
        new Field('stateRights', 7, 'stateRightsCellRenderer', null, 'stateRightsColumn')
    ];
    idField = 'id';
    actionButtonsDisplayed = [ActionButton.EDIT, ActionButton.DELETE];
    editModalComponent = EditPerimeterModalComponent;
    modalOptions = {...AdminTableDirective.defaultEditionModalOptions, size: 'xl'};

    objectArrayToString(arr: any, renderer: string, data: any): string {
        if (renderer && renderer === 'stateRightsCellRenderer') {
            arr.map((str) => {
                const currentProcessDef = this.processesDefinition.filter((processDef) => processDef.id === data.id)[0];
                if (currentProcessDef) str.state = currentProcessDef.states.get(str.state).name;
                return str;
            });
            arr.sort((a, b) => Utilities.compareObj(a.state, b.state));
        }
        return JSON.stringify(arr);
    }
    ngOnInit() {
        this.gridOptions.columnTypes['stateRightsColumn'] = {
            sortable: false,
            filter: 'agTextColumnFilter',
            filterParams: {
                textMatcher: (params) => {
                    let response = false;

                    if (params.filterOption === 'blank') return params.data.stateRights.length === 0;
                    if (params.filterOption === 'notblank') return params.data.stateRights.length > 0;

                    const currentProcessDef = this.processesDefinition.filter(
                        (processDef) => processDef.id === params.data.process
                    )[0];
                    const stateNames = [];
                    for (const stateRight of params.data.stateRights) {
                        if (currentProcessDef.states.get(stateRight.state)) {
                            const stateName = currentProcessDef.states.get(stateRight.state).name.toLocaleLowerCase();
                            stateNames.push(stateName);
                            switch (params.filterOption) {
                                case 'equals':
                                    response = Utilities.compareObj(stateName, params.filterText) === 0;
                                    break;
                                case 'notEqual':
                                    response = Utilities.compareObj(stateName, params.filterText) !== 0;
                                    break;
                                case 'contains':
                                    response = stateName.indexOf(params.filterText) >= 0;
                                    break;
                                case 'startsWith':
                                    response = Utilities.removeEmojis(stateName).startsWith(params.filterText);
                                    break;
                                case 'endsWith':
                                    response = Utilities.removeEmojis(stateName).endsWith(params.filterText);
                                    break;
                            }
                            if (response) return true;
                        }
                    }
                    if (params.filterOption === 'notContains') {
                        const matchingStates = stateNames.filter((name) => name.indexOf(params.filterText) >= 0);
                        response = matchingStates.length === 0;
                    }
                    return response;
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
