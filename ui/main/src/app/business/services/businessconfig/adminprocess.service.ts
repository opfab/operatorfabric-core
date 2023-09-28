/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {Process} from '@ofModel/processes.model';
import {CachedCrudService} from 'app/business/services/cached-crud-service';
import {OpfabLoggerService} from '../logs/opfab-logger.service';
import {AlertMessageService} from '../alert-message.service';
import {AdminProcessServer} from '../../server/adminprocess.server';
import {ServerResponseStatus} from '../../server/serverResponse';

@Injectable({
    providedIn: 'root'
})
export class AdminProcessesService extends CachedCrudService{
    
    private processes: Process[];
    constructor(
        private adminprocessServer: AdminProcessServer,
        protected alertMessageService: AlertMessageService,
        protected loggerService: OpfabLoggerService
    ) {
        super(loggerService, alertMessageService);
    }

    public getCachedValues():  Array<Process> {
        return this.getAllProcesses();
    }
    private getAllProcesses(): Process[]{
        return this.processes;
    }

    public getAll(): Observable<any[]> {
        return this.queryAllProcesses();
    }
    private queryAllProcesses(): Observable<Process[]> {
        return this.adminprocessServer.queryAllProcesses().pipe(
            map((adminprocessResponse) => {
                if (adminprocessResponse.status === ServerResponseStatus.OK){
                    return adminprocessResponse.data;
                } else {
                    this.handleServerResponseError(adminprocessResponse);
                    return [];
                }
            })
        );  
    }

    update(data: any): Observable<any> {
        return null;
    }

    public deleteById(id: string) {
        return this.adminprocessServer.deleteById(id).pipe(
            map((adminprocessResponse) => {
                if (adminprocessResponse.status !== ServerResponseStatus.OK){
                    this.handleServerResponseError(adminprocessResponse);
                }
            })
        );
    }

}
