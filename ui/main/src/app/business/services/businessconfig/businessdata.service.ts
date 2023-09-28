/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from '@angular/core';
import {firstValueFrom, map, Observable} from 'rxjs';
import {BusinessDataServer} from '../../server/businessData.server';
import {ServerResponseStatus} from '../../server/serverResponse';
import {LogOption, OpfabLoggerService} from '../logs/opfab-logger.service';
import {AlertMessageService} from '../alert-message.service';
import {OpfabEventStreamService} from '../events/opfabEventStream.service';
import * as _ from 'lodash-es';
import {CachedCrudService} from '../cached-crud-service';

@Injectable({
    providedIn: 'root'
})
export class BusinessDataService extends CachedCrudService {
    private _cachedResources = new Map<string, string>();

    constructor(
        private opfabEventStreamService: OpfabEventStreamService,
        private businessDataServer: BusinessDataServer,
        protected alertMessageService: AlertMessageService,
        protected loggerService: OpfabLoggerService
    ) {
        super(loggerService, alertMessageService);
        this.listenForBusinessDataUpdate();
    }

    listenForBusinessDataUpdate() {
        this.opfabEventStreamService.getBusinessDataChanges().subscribe(() => {
            this.loggerService.info(`New business data posted, emptying cache`, LogOption.LOCAL_AND_REMOTE);
            this.emptyCache();
        });
    }

    emptyCache() {
        this._cachedResources.clear();
    }

    public async getBusinessData(resourceName: string): Promise<any> {
        if (this._cachedResources.has(resourceName)) {
            return _.clone(this.getCachedValue(resourceName));
        }
        const resource = await firstValueFrom(this.businessDataServer.getBusinessData(resourceName));
        if (resource.status === ServerResponseStatus.OK) {
            this.addResourceToCache(resourceName, resource.data);
            return _.clone(resource.data);
        } else {
            this.loggerService.info(`Could not find the resource. See : ${resource.statusMessage}`);
            return {};
        }
    }

    getCachedValue(resourceName: string): string {
        return this._cachedResources.get(resourceName);
    }

    addResourceToCache(resourceName: string, resourceContent: string) {
        this._cachedResources.set(resourceName, resourceContent);
    }

    getCachedValues(): any[] {
        return Array.from(this._cachedResources.keys());
    }

    public getAll(): Observable<any[]> {
        return this.queryAllBusinessData().pipe(
            map((data) => {
                let businessDataList = [];
                data.forEach((businessDataTitle) => {
                    businessDataList.push({name: businessDataTitle});
                });
                return businessDataList;
            })
        );
    }

    private queryAllBusinessData(): Observable<string[]> {
        return this.businessDataServer.queryAllBusinessData().pipe(
            map((response) => {
                if (response.status === ServerResponseStatus.OK) {
                    return response.data;
                } else {
                    this.handleServerResponseError(response);
                    return [];
                }
            })
        );
    }

    update(data: any): Observable<any> {
        return null;
    }

    updateBusinessData(resourceName: string, data: FormData): Observable<any> {
        return this.businessDataServer.updateBusinessData(resourceName, data).pipe(
            map((responseBusinessData) => {
                if (responseBusinessData.status === ServerResponseStatus.OK) {
                    return responseBusinessData.data;
                } else {
                    this.handleServerResponseError(responseBusinessData);
                    return null;
                }
            })
        );
    }

    public deleteById(id: string) {
        return this.businessDataServer.deleteById(id).pipe(
            map((response) => {
                if (response.status !== ServerResponseStatus.OK) {
                    this.emptyCache();
                    this.handleServerResponseError(response);
                }
            })
        );
    }
}
