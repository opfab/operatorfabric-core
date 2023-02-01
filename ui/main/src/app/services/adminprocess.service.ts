/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {environment} from '@env/environment';
import {Observable} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {
    Process,
} from '@ofModel/processes.model';
import {CachedCrudService} from './cached-crud-service';
import { OpfabLoggerService } from './logs/opfab-logger.service';
import {AlertMessageService} from '../business/services/alert-message.service';

@Injectable({
    providedIn: 'root'
})
export class AdminProcessesService extends CachedCrudService{
    
    readonly processesUrl: string;
    readonly processGroupsUrl: string;
    readonly monitoringConfigUrl: string;
    private processes: Process[];
    constructor(
        private httpClient: HttpClient,
        protected alertMessageService: AlertMessageService,
        protected loggerService: OpfabLoggerService
    ) {
        super(loggerService, alertMessageService);
        this.processesUrl = `${environment.urls.processes}`;
        this.processGroupsUrl = `${environment.urls.processGroups}`;
        this.monitoringConfigUrl = `${environment.urls.monitoringConfig}`;
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
        return this.httpClient
            .get<Process[]>(`${this.processesUrl}`)
            .pipe(catchError((error: HttpErrorResponse) => this.handleError(error))
            );
    }

    update(data: any): Observable<any> {
        return null;
    }

    public deleteById(id: string) {
        const url = `${this.processesUrl}/${id}`;
        return this.httpClient.delete(url).pipe(
            catchError((error: HttpErrorResponse) => this.handleError(error))
        );
    }

}
