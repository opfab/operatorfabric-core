/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Observable, Subject} from 'rxjs';
import {environment} from '@env/environment';
import {map, takeUntil, tap} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {CachedCrudService} from 'app/business/services/cached-crud-service';
import {Perimeter} from '@ofModel/perimeter.model';;
import {OpfabLoggerService} from './logs/opfab-logger.service';
import {AlertMessageService} from './alert-message.service';
import {PerimetersServer} from '../server/perimeters.server';
import {ServerResponseStatus} from '../server/serverResponse';


@Injectable({
    providedIn: 'root'
})
export class PerimetersService extends CachedCrudService {
    readonly perimetersUrl: string;
    private _perimeters: Perimeter[];

    private ngUnsubscribe$ = new Subject<void>();

    /**
     * @constructor
     * @param httpClient - Angular build-in
     */
    constructor(protected loggerService: OpfabLoggerService, 
        alertMessageService: AlertMessageService,
        private perimeterServer: PerimetersServer) {
        super(loggerService, alertMessageService);
        this.perimetersUrl = `${environment.urls.perimeters}`;
    }

    deleteById(id: string) {
        return this.perimeterServer.deleteById(id).pipe(
            map((perimetersResponse) => {
                if (perimetersResponse.status === ServerResponseStatus.OK) {
                    this.deleteFromCachedPerimeters(id);
                } else {
                    this.handleServerResponseError(perimetersResponse);
                }
            })
        );
    }

    private deleteFromCachedPerimeters(id: string): void {
        this._perimeters = this._perimeters.filter((perimeter) => perimeter.id !== id);
    }

    private updateCachedPerimeters(perimeterData: Perimeter): void {
        const updatedPerimeters = this._perimeters.filter((perimeter) => perimeter.id !== perimeterData.id);
        updatedPerimeters.push(perimeterData);
        this._perimeters = updatedPerimeters;
    }

    private queryAllPerimeters(): Observable<Perimeter[]> {
        return this.perimeterServer.queryAllPerimeters().pipe(
            map((perimetersResponse) => {
                if (perimetersResponse.status === ServerResponseStatus.OK) {
                    return perimetersResponse.data;
                } else {
                    this.handleServerResponseError(perimetersResponse);
                    return [];
                }
            })
        );
    }

    public loadAllPerimetersData(): Observable<any> {
        return this.queryAllPerimeters().pipe(
            takeUntil(this.ngUnsubscribe$),
            tap({
                next: (perimeters) => {
                    if (perimeters) {
                        this._perimeters = perimeters;
                        console.log(new Date().toISOString(), 'List of perimeters loaded');
                    }
                },
                error: (error) => console.error(new Date().toISOString(), 'an error occurred', error)
            })
        );
    }

    public getPerimeters(): Perimeter[] {
        return this._perimeters;
    }

    public getCachedValues(): Array<Perimeter> {
        return this.getPerimeters();
    }

    createPerimeter(perimeterData: Perimeter): Observable<Perimeter> {
        return this.perimeterServer.createPerimeter(perimeterData).pipe(
            map((perimetersResponse) => {
                if (perimetersResponse.status === ServerResponseStatus.OK) {
                    this.updateCachedPerimeters(perimeterData);
                    return perimetersResponse.data;
                } else {
                    this.handleServerResponseError(perimetersResponse);
                    return null;
                }
            })
        );
    }

    updatePerimeter(perimeterData: Perimeter): Observable<Perimeter> {
        return this.perimeterServer.updatePerimeter(perimeterData).pipe(
            map((perimetersResponse) => {
                if (perimetersResponse.status === ServerResponseStatus.OK) {
                    this.updateCachedPerimeters(perimeterData);
                    return perimetersResponse.data;
                } else {
                    this.handleServerResponseError(perimetersResponse);
                    return null;
                }
            })
        );
    }

    getAll(): Observable<any[]> {
        return this.queryAllPerimeters();
    }

    create(data: any): Observable<any> {
        return this.createPerimeter(data);
    }

    update(data: any): Observable<any> {
        return this.updatePerimeter(data);
    }
}
