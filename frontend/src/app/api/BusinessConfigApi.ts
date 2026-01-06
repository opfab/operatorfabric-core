/* Copyright (c) 2023-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {BusinessDataService} from '@ofServices/businessdata/businessdata.service';
import {CustomScreenService} from '@ofServices/customScreen/CustomScreenService';
import {OpfabEventStreamService} from '@ofServices/events/OpfabEventStreamService';
import {LogOption, LoggerService as logger} from 'app/services/logs/LoggerService';

declare const opfab: any;

export class BusinessConfigAPI {
    public static async getTags(screenName: string) {
        return undefined;
    }

    public static init() {
        opfab.businessconfig = {
            businessData: {
                get: async function (resourceName) {
                    const resource = await BusinessDataService.getBusinessData(resourceName);
                    return resource;
                },
                registerFunctionToListenToBusinessDataUpdates: function (callback) {
                    if (typeof callback !== 'function') {
                        throw new TypeError(
                            'registerFunctionToListenToBusinessDataUpdates : the provided object is not a function'
                        );
                    }
                    OpfabEventStreamService.getBusinessDataChanges().subscribe(() => {
                        callback();
                    });
                    logger.info('Registered function to listen to business data update', LogOption.LOCAL_AND_REMOTE);
                }
            },

            registerFunctionToGetTags: function (getTagsFunction) {
                if (typeof getTagsFunction !== 'function') {
                    throw new TypeError('registerFunctionToGetTags : the provided object is not a function');
                }
                BusinessConfigAPI.getTags = getTagsFunction;
                logger.info('Registered function to get tags', LogOption.LOCAL_AND_REMOTE);
            },
            registerCustomScreen: function (customScreen) {
                if (typeof customScreen !== 'object') {
                    throw new TypeError('registerCustomScreen : the provided object is not an object');
                }
                CustomScreenService.addCustomScreenDefinition(customScreen);
                logger.info('Registered custom screen', LogOption.LOCAL_AND_REMOTE);
            }
        };
        // prevent unwanted modifications from templates code or custom scripts
        Object.freeze(opfab.businessconfig);
    }
}
