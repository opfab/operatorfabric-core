/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
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
import {AdminItemType} from '../../services/sharing.service';
import {Entity} from '@ofServices/entities/model/Entity';
import {EntitiesService} from '@ofServices/entities/EntitiesService';
import {Utilities} from 'app/business/common/utilities';
import {NgFor} from '@angular/common';
import {TranslationService} from '@ofServices/translation/TranslationService';

@Component({
    selector: 'of-role-cell-renderer',
    templateUrl: './role-cell-renderer.component.html',
    styleUrls: ['./role-cell-renderer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgFor]
})
export class RoleCellRendererComponent implements ICellRendererAngularComp {
    itemType = AdminItemType.ENTITY;
    entities: Entity[];
    _roles = [];

    constructor() {
        this.entities = EntitiesService.getEntities();
    }

    agInit(params: any): void {
        const currentEntity = this.entities.filter((entity) => entity.id === params.data.id)[0];

        if (currentEntity?.roles) {
            currentEntity.roles.forEach((role) => {
                const roleTranslation = TranslationService.getTranslation('admin.input.entity.roleValues.' + role);
                this._roles.push(roleTranslation);
            });
            this._roles.sort((a, b) => Utilities.compareObj(a, b));
        }
    }

    refresh(params: ICellRendererParams): boolean {
        return true;
    }
}
