/* Copyright (c) 2025-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ScreenDefinition} from './model/ScreenDefinition';

export class CustomScreenService {
    private static readonly customScreenDefinitions = new Map<string, ScreenDefinition>();

    public static addCustomScreenDefinition(customScreenDefinition: ScreenDefinition) {
        CustomScreenService.customScreenDefinitions.set(customScreenDefinition.id, customScreenDefinition);
    }
    public static getCustomScreenDefinition(customScreenId: string): ScreenDefinition {
        return CustomScreenService.customScreenDefinitions.get(customScreenId);
    }
    public static clearCustomScreenDefinitions() {
        CustomScreenService.customScreenDefinitions.clear();
    }
}
