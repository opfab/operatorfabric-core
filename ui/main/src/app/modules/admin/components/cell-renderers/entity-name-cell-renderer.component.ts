/* Copyright (c) 2023, RTE (http://www.rte-france.com)
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
import {AdminItemType, SharingService} from '../../services/sharing.service';
import {CrudService} from 'app/business/services/crud-service';
import {LoggerService} from 'app/business/services/logs/logger.service';

@Component({
    selector: 'of-entity-name-cell-renderer',
    templateUrl: './id-cell-renderer.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EntityNameCellRendererComponent implements ICellRendererAngularComp  {

    value: string;
    private mapping: any[];
    private crudService: CrudService;
    itemType = AdminItemType.ENTITY;


    constructor(protected dataHandlingService: SharingService) {}

    agInit(params: ICellRendererParams<any, any>): void {
        this.value = params.value;

        this.crudService = this.dataHandlingService.resolveCrudServiceDependingOnType(this.itemType);
        this.mapping = this.crudService.getCachedValues();

        if (this.mapping && params.value) {

            const lookedUpEntity = this.mapping.find((entityDefinition) => params.value === entityDefinition.id);

            if (!lookedUpEntity) 
                LoggerService.warn('Admin table: id/name mapping was undefined for ' + this.itemType);
            
            this.value = lookedUpEntity.name;
        }

    }

    refresh(params: ICellRendererParams<any, any>): boolean {
        return true;
    }

}
