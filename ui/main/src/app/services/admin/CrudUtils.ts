/* Copyright (c) 2024-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Utilities} from 'app/business/common/utilities';
import {MultiSelectOption} from 'app/modules/share/multi-select/model/MultiSelect';
import {EntitiesService} from '../entities/EntitiesService';
import {GroupsService} from '../groups/GroupsService';

export class CrudUtilities {
    public static formatArrayToString(arrayToFormat: any) {
        if (arrayToFormat != null) {
            arrayToFormat.sort((a, b) => Utilities.compareObj(a, b));
            return arrayToFormat.join(', ');
        } else return '';
    }

    public static formatGroupIdsToNames(groupIds: string[]): string {
        const groupNames = groupIds?.map(GroupsService.getGroupName);
        return this.formatArrayToString(groupNames);
    }

    public static formatEntityIdsToNames(entityIds: string[]): string {
        const entityNames = entityIds?.map(EntitiesService.getEntityName);
        return this.formatArrayToString(entityNames);
    }

    public static entityLabelRenderer(data: MultiSelectOption): string {
        if (CrudUtilities.isDuplicatedEntityName(data.label, data.value)) {
            return (
                data.label +
                ' <i style="color: var(--opfab-color-grey);text-overflow: ellipsis">(' +
                data.value +
                ')</i>'
            );
        }
        return data.label;
    }

    private static isDuplicatedEntityName(label: string, id: string): boolean {
        return (
            label &&
            EntitiesService.getEntities().filter((entity) => entity.name === label.trim() && entity.id !== id).length >
                0
        );
    }
}
