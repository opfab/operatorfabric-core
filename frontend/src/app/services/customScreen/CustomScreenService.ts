/* Copyright (c) 2025-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {LoggerService} from 'app/services/logs/LoggerService';
import {ScreenDefinition, ScreenType} from './ScreenDefinition';

export class CustomScreenService {
    private static readonly customScreenDefinitions = new Map<string, ScreenDefinition>();

    public static addCustomScreenDefinition(customScreenDefinition: ScreenDefinition) {
        if (!customScreenDefinition.type) {
            LoggerService.error(
                `CustomScreenService - Custom screen with id '${customScreenDefinition.id}' has no 'type' defined and will not be loaded. Please set a valid type (e.g. CARD_LIST or DASHBOARD).`
            );
            return;
        }
        if (!Object.values(ScreenType).includes(customScreenDefinition.type)) {
            LoggerService.error(
                `CustomScreenService - Custom screen with id '${customScreenDefinition.id}' has an invalid type '${customScreenDefinition.type}' and will not be loaded. Valid types are: ${Object.values(ScreenType).join(', ')}.`
            );
            return;
        }
        if (CustomScreenService.customScreenDefinitions.has(customScreenDefinition.id)) {
            LoggerService.error(
                `CustomScreenService - A custom screen with id '${customScreenDefinition.id}' is already declared and will not be loaded again.`
            );
            return;
        }
        CustomScreenService.customScreenDefinitions.set(customScreenDefinition.id, customScreenDefinition);
    }
    public static getCustomScreenDefinition(customScreenId: string): ScreenDefinition {
        return CustomScreenService.customScreenDefinitions.get(customScreenId);
    }
    public static clearCustomScreenDefinitions() {
        CustomScreenService.customScreenDefinitions.clear();
    }
}
