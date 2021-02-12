/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {AppState} from '@ofStore/index';
import * as _ from 'lodash-es';

export function buildSettingsOrConfigSelector(path: string, fallback: any = null) {
    return (state: AppState) => {
        const settings = state.settings.settings;
        const config = state.config.config;
        let result = _.get(settings, path, null);
        if (result == null) {
            result = _.get(config, `settings.${path}`, null);
        }
        if (result == null && fallback)
            return fallback
        return result;
    }
}
