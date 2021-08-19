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

@Component({
  selector: 'of-action-cell-renderer',
  templateUrl: './action-cell-renderer.component.html'
})
export class ActionCellRendererComponent implements ICellRendererAngularComp {

  // For explanations regarding ag-grid CellRenderers see
  // https://www.ag-grid.com/documentation/angular/component-cell-renderer/#example-rendering-using-angular-components
  public params: any;
  private actionType: string;

  // Defines icons to display depending on action type
  private actionIconsMapping = {
    'edit': 'fas fa-pen',
    'delete': 'far fa-trash-alt'
  };

  agInit(params: any): void {
    this.params = params;
    this.actionType = this.params.colDef.colId;
  }

  public openModalFromParent() {
    this.params.context.componentParent.openActionModal(this.params);
  }


  // noinspection JSUnusedLocalSymbols
  /** This method returns true to signal to the grid that this renderer doesn't need to be recreated if the underlying data changes
   *  See https://www.ag-grid.com/documentation/angular/component-cell-renderer/#handling-refresh
   * */
  refresh(params: ICellRendererParams): boolean {
    return true;
  }

  getIconForAction(): string {
    return this.actionIconsMapping[this.actionType];
  }
}
