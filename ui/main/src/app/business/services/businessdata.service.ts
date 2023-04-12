/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from '@angular/core';
import {firstValueFrom} from 'rxjs';
import {BusinessDataServer} from '../server/businessData.server';
import {ServerResponseStatus} from '../server/serverResponse';
import {LogOption, OpfabLoggerService} from './logs/opfab-logger.service';
import {OpfabEventStreamService} from './opfabEventStream.service';

@Injectable({
    providedIn: 'root'
})
export class BusinessDataService {
    private _cachedResources = new Map<string, string>();

    constructor(
        private opfabEventStreamService: OpfabEventStreamService,
        private businessDataServer: BusinessDataServer,
        protected loggerService: OpfabLoggerService
    ) {
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
            return this.getCachedValue(resourceName);
        }
        const resource = await firstValueFrom(this.businessDataServer.getBusinessData(resourceName));
        if (resource.status === ServerResponseStatus.OK) {
            this.addResourceToCache(resourceName, resource.data);
            return resource.data;
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
}
