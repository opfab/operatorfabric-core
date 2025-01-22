/* Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {CustomScreenDefinition} from './model/CustomScreenDefinition';

export class CustomScreenService {
    private static readonly customScreenDefinitions = new Map<string, CustomScreenDefinition>();

    public static addCustomScreenDefinition(customScreenDefinition: CustomScreenDefinition) {
        CustomScreenService.customScreenDefinitions.set(customScreenDefinition.id, customScreenDefinition);
    }
    public static getCustomScreenDefinition(customScreenId: string): CustomScreenDefinition {
        return CustomScreenService.customScreenDefinitions.get(customScreenId);
    }
    public static clearCustomScreenDefinitions() {
        CustomScreenService.customScreenDefinitions.clear();
    }
}
