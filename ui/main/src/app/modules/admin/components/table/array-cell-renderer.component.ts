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
import {CachedCrudService} from '@ofServices/cached-crud-service';
import {AdminItemType, SharingService} from '../../services/sharing.service';

@Component({
  selector: 'of-array-cell-renderer',
  templateUrl: 'array-cell-renderer.component.html'
})
export class ArrayCellRendererComponent implements ICellRendererAngularComp {

    protected itemType: AdminItemType;
    private mapping: any[];
    private cachedCrudService: CachedCrudService;

  constructor(protected dataHandlingService: SharingService) {
  }

  // For explanations regarding ag-grid CellRenderers see
  // https://www.ag-grid.com/documentation/angular/component-cell-renderer/#example-rendering-using-angular-components
  private _nameValues: string;


  agInit(params: any): void {

      this.cachedCrudService = this.dataHandlingService.resolveCachedCrudServiceDependingOnType(this.itemType);
      this.mapping = this.cachedCrudService.getCachedValues();
    // Look up code in values returned by the corresponding service, if it exists return corresponding name, otherwise return code
      if (!!this.mapping) {
          this._nameValues = params.getValue().map(code  => {
                  // This entails that the items that need to be rendered have an `id` and a `name` property.
                  // I tried defining an interface to enforce that but it made the code very cumbersome so it didn't look worth the effort
                  // for now.
                  const lookedUpName = this.mapping.filter(cachedItem => code === cachedItem['id'])
                                                    .map(cachedItem => cachedItem['name']);
                  if (lookedUpName.length !== 0) {
                      return lookedUpName[0] ? lookedUpName[0] : code;
                  } else {
                      return code;
                  }
              }
          ).join(', ');
      } else {
          console.log('Admin table: id/name mapping was undefined for ' + this.itemType);
          this._nameValues = params.getValue();
      }

  }

    /** This method returns true to signal to the grid that this renderer doesn't need to be recreated if the underlying data changes
   *  See https://www.ag-grid.com/documentation/angular/component-cell-renderer/#handling-refresh
   * */
  refresh(params: ICellRendererParams): boolean {
    return true;
  }

  get nameValues(): string {
    return this._nameValues;
  }

}
