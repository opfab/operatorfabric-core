/* Copyright (c) 2022, RTE (http://www.rte-france.com)
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

import {EntitiesService} from 'app/business/services/entities.service';
import {Entity} from '@ofModel/entity.model';

@Component({
    selector: 'of-entities-cell-renderer',
    templateUrl: 'entities-cell-renderer.component.html'
})
export class EntitiesCellRendererComponent implements ICellRendererAngularComp {
    entities: Entity[];


    constructor(protected entitiesService: EntitiesService) {}

    private _nameValues: string;

    agInit(params: any): void {
        this.entities = this.entitiesService.getCachedValues();
        // Look up code in values returned by the corresponding service, if it exists return corresponding name, otherwise return code
        if (this.entities) {
            const value = params.getValue();
            if (value) {
                this._nameValues = value
                    .map((code) => {
                        const lookedUpName = this.entities
                            .filter((cachedItem) => code === cachedItem['id'])
                            .map((cachedItem) => cachedItem['name']);
                        if (lookedUpName.length !== 0) {
                            return lookedUpName[0] ? lookedUpName[0] : code;
                        } else {
                            return code;
                        }
                    })
                    .sort()
                    .join(', ');
            }
        } else {
            console.log('User action log table: id/name mapping was undefined for entity');
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
