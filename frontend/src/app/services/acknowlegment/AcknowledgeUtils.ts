/* Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {EntitiesService} from '@ofServices/entities/EntitiesService';
import {UsersService} from '@ofServices/users/UsersService';
import {LoggerService as logger} from '@ofServices/logs/LoggerService';

export class AcknowledgeUtils {
    public static getCurrentUserEntitiesAllowedToAcknowledge(): string[] {
        const currentUserEntities = UsersService.getCurrentUserWithPerimeters().userData?.entities;
        if (!currentUserEntities) {
            return [];
        }

        const parentsIds = new Set<string>();
        currentUserEntities.forEach((entityId) => {
            const entity = EntitiesService.getEntity(entityId);

            if (entity) {
                const parents = entity.parents;
                if (parents?.length) {
                    parents.forEach((parentId) => {
                        parentsIds.add(parentId);
                    });
                }
            } else {
                // This use case may happen in case of an entity having a parent entityId that does not exist
                // it happens when loading entities on startup via yml configuration
                // the actual loading code does not check the validity of parent entityIds
                // (issue: https://github.com/opfab/operatorfabric-core/issues/9235)
                logger.warn(`Entity with id ${entityId} not found`);
            }
        });

        return currentUserEntities.filter((entityId) => !parentsIds.has(entityId));
    }

    public static getEntitiesAllowedToAcknowledge(entityIds: string[]): string[] {
        return AcknowledgeUtils.getEntitiesExcludingParents(entityIds);
    }
    private static getEntitiesExcludingParents(entityIds: string[]): string[] {
        const entitiesAllowedToAcknowledge = new Set<string>();
        entityIds?.forEach((entityId) => {
            const childEntities = EntitiesService.resolveChildEntitiesByLevel(entityId, 1);
            if (childEntities?.length > 0) {
                AcknowledgeUtils.getEntitiesExcludingParents(childEntities.map((child) => child.id)).forEach(
                    (childEntityId) => {
                        entitiesAllowedToAcknowledge.add(childEntityId);
                    }
                );
            } else {
                entitiesAllowedToAcknowledge.add(entityId);
            }
        });
        return Array.from(entitiesAllowedToAcknowledge);
    }
}
