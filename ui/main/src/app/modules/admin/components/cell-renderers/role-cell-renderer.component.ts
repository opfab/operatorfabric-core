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
import {AdminItemType} from '../../services/sharing.service';
import {Entity} from '@ofModel/entity.model';
import {EntitiesService} from 'app/business/services/users/entities.service';
import {Utilities} from 'app/business/common/utilities';
import {TranslationService} from 'app/business/services/translation/translation.service';
import {NgFor} from '@angular/common';

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

    constructor(private translationService: TranslationService) {
        this.entities = EntitiesService.getEntities();
    }

    agInit(params: any): void {
        const currentEntity = this.entities.filter((entity) => entity.id === params.data.id)[0];

        if (currentEntity?.roles) {
            currentEntity.roles.forEach((role) => {
                const roleTranslation = this.translationService.getTranslation('admin.input.entity.roleValues.' + role);
                this._roles.push(roleTranslation);
            });
            this._roles.sort((a, b) => Utilities.compareObj(a, b));
        }
    }

    refresh(params: ICellRendererParams): boolean {
        return true;
    }
}
