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
import {OpfabLoggerService} from './logs/opfab-logger.service';

@Injectable({
    providedIn: 'root'
})
export class BusinessDataService {

    constructor(private businessDataServer: BusinessDataServer, private loggerService: OpfabLoggerService) {}

    public async getBusinessData(resourceName: string): Promise<any> {
        const resource = await firstValueFrom(this.businessDataServer.getBusinessData(resourceName));
        if (resource.status === ServerResponseStatus.OK) {
            return resource.data;
        } else {
            this.loggerService.info(`Could not find the resource. See : ${resource.statusMessage}`);
            return {};
        }
    }
}
