/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {LogOption, LoggerService as logger} from '../business/services/logs/logger.service';

declare const opfab: any;

export class HandlebarsAPI {
    public static async getHandlebarHelpers() {
        return undefined;
    }

    public static init() {
        opfab.handlebars = {
            registerCustomHelpers: function (getHandlebarHelpersFunction) {
                if (typeof getHandlebarHelpersFunction !== 'function') {
                    throw new TypeError('registerCustomHelpers : the provided object is not function');
                }
                HandlebarsAPI.getHandlebarHelpers = getHandlebarHelpersFunction;
                logger.info('Registered function to get handlebar helpers', LogOption.LOCAL_AND_REMOTE);
            }
        };

        // prevent unwanted modifications from templates code or custom scripts
        Object.freeze(opfab.handlebars);
    }
}
