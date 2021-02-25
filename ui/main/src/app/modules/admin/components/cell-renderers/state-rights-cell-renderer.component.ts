/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {Component} from '@angular/core';
import {ICellRendererAngularComp} from 'ag-grid-angular';
import {ICellRendererParams} from 'ag-grid-community';
import {StateRight} from '@ofModel/perimeter.model';

@Component({
  selector: 'of-state-rights-cell-renderer',
  templateUrl: './state-rights-cell-renderer.component.html',
  styleUrls: ['./state-rights-cell-renderer.component.scss']
})
export class StateRightsCellRendererComponent implements ICellRendererAngularComp {

  constructor() {
  }

  // For explanations regarding ag-grid CellRenderers see
  // https://www.ag-grid.com/documentation/angular/component-cell-renderer/#example-rendering-using-angular-components
  private _stateRightsValues: StateRight[];


  agInit(params: any): void {

          this._stateRightsValues = params.getValue();

  }

    /** This method returns true to signal to the grid that this renderer doesn't need to be recreated if the underlying data changes
   *  See https://www.ag-grid.com/documentation/angular/component-cell-renderer/#handling-refresh
   * */
  refresh(params: ICellRendererParams): boolean {
    return true;
  }

  get stateRightsValues(): StateRight[] {
    return this._stateRightsValues;
  }

}
