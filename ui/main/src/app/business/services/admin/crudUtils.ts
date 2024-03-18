/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Utilities} from 'app/business/common/utilities';
import {EntitiesService} from '../users/entities.service';

export class CrudUtilities {
    public static formatEntityIdsToNames(entityIds: string[]): string {
        if (entityIds != null) {
            const entityNames = entityIds.map(EntitiesService.getEntityName);
            entityNames.sort((a, b) => Utilities.compareObj(a, b));
            return entityNames.join(', ');
        } else return '';
    }
}
