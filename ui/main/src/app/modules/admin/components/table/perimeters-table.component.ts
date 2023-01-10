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
import {AdminTableDirective, Field} from './admin-table.directive';
import {AdminItemType} from '../../services/sharing.service';
import {EditPerimeterModalComponent} from '../editmodal/perimeters/edit-perimeter-modal.component';
import {Utilities} from 'app/common/utilities';

@Component({
    templateUrl: 'admin-table.directive.html',
    selector: 'of-perimeters-table',
    styleUrls: ['admin-table.directive.scss']
})
export class PerimetersTableComponent extends AdminTableDirective implements OnInit {
    tableType = AdminItemType.PERIMETER;
    fields = [
        new Field('id', 4, 'idCellRenderer'), 
        new Field('process'), 
        new Field('stateRights', 7, 'stateRightsCellRenderer', null, 'stateRightsColumn')
    ];
    idField = 'id';
    editModalComponent = EditPerimeterModalComponent;
    modalOptions = {...AdminTableDirective.defaultEditionModalOptions, size: 'xl'};

    objectArrayToString(arr: any, renderer: string, data: any): string {
        if (renderer && renderer === 'stateRightsCellRenderer') {
            arr.map((str) => {
                const currentProcessDef = this.processesDefinition.filter((processDef) => processDef.id === data.id)[0];
                if (!!currentProcessDef) str.state = currentProcessDef.states[str.state].name;
                return str;
            });
            arr.sort((a, b) => Utilities.compareObj(a.state, b.state));
        }
        return JSON.stringify(arr);
    }
    ngOnInit(){
        this.gridOptions.columnTypes['stateRightsColumn'] = {
            sortable: false,
            filter: 'agTextColumnFilter',
            filterParams: {
                valueGetter: (params) => {
                    const currentProcessDef = this.processesDefinition.filter(
                        (processDef) => processDef.id === params.data.process
                    )[0];
                    let text = '';
                    params.data.stateRights.forEach((stateRight) => {
                        if (!!currentProcessDef.states[stateRight.state])
                            text += currentProcessDef.states[stateRight.state].name + ' ';
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

