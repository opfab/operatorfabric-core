/*
 * Copyright (c) 2021-2022, RTE (http://www.rte-france.com)
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
    fields = [new Field('id'), new Field('process'), new Field('stateRights', 7, 'stateRightsCellRenderer')];
    idField = 'id';
    editModalComponent = EditPerimeterModalComponent;
    modalOptions = {...AdminTableDirective.defaultModalOptions, size: 'xl'};

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
}
