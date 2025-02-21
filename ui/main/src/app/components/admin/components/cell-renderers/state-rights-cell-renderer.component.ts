/* Copyright (c) 2021-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ICellRendererAngularComp} from 'ag-grid-angular';
import {ICellRendererParams} from 'ag-grid-community';
import {StateRight} from '@ofServices/perimeters/model/Perimeter';
import {Process} from '@ofServices/processes/model/Processes';
import {ProcessesService} from '@ofServices/processes/ProcessesService';
import {Utilities} from '../../../../utils/Utilities';
import {LoggerService} from 'app/services/logs/LoggerService';
import {NgFor, LowerCasePipe} from '@angular/common';

@Component({
    selector: 'of-state-rights-cell-renderer',
    templateUrl: './state-rights-cell-renderer.component.html',
    styleUrls: ['./state-rights-cell-renderer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgFor, LowerCasePipe]
})
export class StateRightsCellRendererComponent implements ICellRendererAngularComp {
    // For explanations regarding ag-grid CellRenderers see
    // https://www.ag-grid.com/documentation/angular/component-cell-renderer/#example-rendering-using-angular-components
    _stateRightsValues: {stateName: string; stateRight: StateRight}[] = [];
    processesDefinition: Process[];

    constructor() {
        this.processesDefinition = ProcessesService.getAllProcesses();
    }

    agInit(params: any): void {
        const stateRightsValues = params.getValue();

        const currentProcessDef = this.processesDefinition.filter(
            (processDef) => processDef.id === params.data.process
        )[0];
        if (currentProcessDef) {
            stateRightsValues.forEach((stateRight) => {
                if (currentProcessDef.states.get(stateRight.state))
                    this._stateRightsValues.push({
                        stateName: currentProcessDef.states.get(stateRight.state).name,
                        stateRight: stateRight
                    });
                else {
                    LoggerService.warn(
                        `The state ${stateRight.state} of process ${currentProcessDef.id} does not exist anymore`
                    );
                }
            });

            this._stateRightsValues.sort((a, b) => Utilities.compareObj(a.stateName, b.stateName));
        } else {
            LoggerService.warn(`The process ${params.data.process} does not exist anymore`);
        }
    }

    /** This method returns true to signal to the grid that this renderer doesn't need to be recreated if the underlying data changes
     *  See https://www.ag-grid.com/documentation/angular/component-cell-renderer/#handling-refresh
     * */
    refresh(params: ICellRendererParams): boolean {
        return true;
    }

    get stateRightsValues(): {stateName: string; stateRight: StateRight}[] {
        return this._stateRightsValues;
    }
}
