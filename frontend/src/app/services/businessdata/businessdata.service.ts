/* Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {firstValueFrom, map, Observable} from 'rxjs';
import {BusinessDataServer} from './server/BusinessDataServer';
import {ServerResponseStatus} from '../../server/ServerResponse';
import {LogOption, LoggerService as logger} from 'app/services/logs/LoggerService';
import {OpfabEventStreamService} from '../events/OpfabEventStreamService';
import * as _ from 'lodash-es';
import {AlertMessageService} from '../alerteMessage/AlertMessageService';
import {I18n} from 'app/model/I18n';
import {Message, MessageLevel} from '@ofServices/alerteMessage/model/Message';

export class BusinessDataService {
    private static readonly _cachedResources = new Map<string, string>();
    private static businessDataServer: BusinessDataServer;

    public static setBusinessDataServer(businessDataServer: BusinessDataServer) {
        BusinessDataService.businessDataServer = businessDataServer;
    }

    public static init() {
        BusinessDataService.listenForBusinessDataUpdate();
    }

    public static listenForBusinessDataUpdate() {
        OpfabEventStreamService.getBusinessDataChanges().subscribe(() => {
            logger.info(`New business data posted, emptying cache`, LogOption.LOCAL_AND_REMOTE);
            BusinessDataService.emptyCache();
        });
    }

    public static emptyCache() {
        BusinessDataService._cachedResources.clear();
    }

    public static async getBusinessData(resourceName: string): Promise<any> {
        if (BusinessDataService._cachedResources.has(resourceName)) {
            return _.clone(BusinessDataService.getCachedValue(resourceName));
        }
        const resource = await firstValueFrom(BusinessDataService.businessDataServer.getBusinessData(resourceName));
        if (resource.status === ServerResponseStatus.OK) {
            BusinessDataService.addResourceToCache(resourceName, resource.data);
            return _.clone(resource.data);
        } else {
            logger.info(`Could not find the resource. See : ${resource.statusMessage}`);
            return {};
        }
    }

    public static getCachedValue(resourceName: string): string {
        return BusinessDataService._cachedResources.get(resourceName);
    }

    public static addResourceToCache(resourceName: string, resourceContent: string) {
        BusinessDataService._cachedResources.set(resourceName, resourceContent);
    }

    public static getCachedValues(): any[] {
        return Array.from(BusinessDataService._cachedResources.keys());
    }

    public static getAll(): Observable<any[]> {
        return BusinessDataService.queryAllBusinessData().pipe(
            map((data) => {
                const businessDataList = [];
                data.forEach((businessDataTitle) => {
                    businessDataList.push({name: businessDataTitle});
                });
                return businessDataList;
            })
        );
    }

    private static queryAllBusinessData(): Observable<string[]> {
        return BusinessDataService.businessDataServer.queryAllBusinessData().pipe(
            map((response) => {
                if (response.status === ServerResponseStatus.OK) {
                    return response.data;
                } else {
                    logger.error(`Error while getting businessData :  ${response.statusMessage}`);
                    AlertMessageService.sendAlertMessage({
                        message: '',
                        i18n: {key: 'shared.error.businessData.gettingBusinessData'},
                        level: MessageLevel.ERROR
                    });
                    return [];
                }
            })
        );
    }

    public static update(data: any): Observable<any> {
        return null;
    }

    public static updateBusinessData(resourceName: string, data: FormData): Observable<any> {
        return BusinessDataService.businessDataServer.updateBusinessData(resourceName, data).pipe(
            map((responseBusinessData) => {
                if (responseBusinessData.status === ServerResponseStatus.OK) {
                    AlertMessageService.sendAlertMessage(
                        new Message(null, MessageLevel.INFO, new I18n('admin.input.businessData.uploadSuccess'))
                    );
                    return responseBusinessData.data;
                } else {
                    logger.error(
                        `Error while updating businessData ${resourceName} :  ${responseBusinessData.statusMessage}`
                    );
                    AlertMessageService.sendAlertMessage({
                        message: '',
                        i18n: {key: 'shared.error.businessData.updateBusinessData'},
                        level: MessageLevel.ERROR
                    });
                    return null;
                }
            })
        );
    }

    public static deleteById(id: string) {
        return BusinessDataService.businessDataServer.deleteById(id).pipe(
            map((response) => {
                if (response.status !== ServerResponseStatus.OK) {
                    logger.error(`Error while deleting businessdata ${id} :  ${response.statusMessage}`);
                    AlertMessageService.sendAlertMessage({
                        message: '',
                        i18n: {key: 'shared.error.businessData.deleteBusinessData'},
                        level: MessageLevel.ERROR
                    });
                }
            })
        );
    }
}
