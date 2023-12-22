/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Observable, Subject} from 'rxjs';
import {map, takeUntil, tap} from 'rxjs/operators';
import {Perimeter} from '@ofModel/perimeter.model';
import {PerimetersServer} from '../../server/perimeters.server';
import {ServerResponseStatus} from '../../server/serverResponse';
import {ErrorService} from '../error-service';


export class PerimetersService  {

    private static perimeterServer : PerimetersServer;
    private static _perimeters: Perimeter[];

    private static ngUnsubscribe$ = new Subject<void>();

    public static setPerimeterServer(perimeterServer: PerimetersServer) {
        PerimetersService.perimeterServer = perimeterServer;
    }

    public static deleteById(id: string) {
        return PerimetersService.perimeterServer.deleteById(id).pipe(
            map((perimetersResponse) => {
                if (perimetersResponse.status === ServerResponseStatus.OK) {
                    PerimetersService.deleteFromCachedPerimeters(id);
                } else {
                    ErrorService.handleServerResponseError(perimetersResponse);
                }
            })
        );
    }

    private static deleteFromCachedPerimeters(id: string): void {
        PerimetersService._perimeters = PerimetersService._perimeters.filter((perimeter) => perimeter.id !== id);
    }

    private static updateCachedPerimeters(perimeterData: Perimeter): void {
        const updatedPerimeters = PerimetersService._perimeters.filter((perimeter) => perimeter.id !== perimeterData.id);
        updatedPerimeters.push(perimeterData);
        PerimetersService._perimeters = updatedPerimeters;
    }

    private static queryAllPerimeters(): Observable<Perimeter[]> {
        return PerimetersService.perimeterServer.queryAllPerimeters().pipe(
            map((perimetersResponse) => {
                if (perimetersResponse.status === ServerResponseStatus.OK) {
                    return perimetersResponse.data;
                } else {
                    ErrorService.handleServerResponseError(perimetersResponse);
                    return [];
                }
            })
        );
    }

    public static loadAllPerimetersData(): Observable<any> {
        return PerimetersService.queryAllPerimeters().pipe(
            takeUntil(PerimetersService.ngUnsubscribe$),
            tap({
                next: (perimeters) => {
                    if (perimeters) {
                        PerimetersService._perimeters = perimeters;
                        console.log(new Date().toISOString(), 'List of perimeters loaded');
                    }
                },
                error: (error) => console.error(new Date().toISOString(), 'an error occurred', error)
            })
        );
    }

    public static getPerimeters(): Perimeter[] {
        return PerimetersService._perimeters;
    }

    public static getCachedValues(): Array<Perimeter> {
        return PerimetersService.getPerimeters();
    }

    public static createPerimeter(perimeterData: Perimeter): Observable<Perimeter> {
        return PerimetersService.perimeterServer.createPerimeter(perimeterData).pipe(
            map((perimetersResponse) => {
                if (perimetersResponse.status === ServerResponseStatus.OK) {
                    PerimetersService.updateCachedPerimeters(perimeterData);
                    return perimetersResponse.data;
                } else {
                    ErrorService.handleServerResponseError(perimetersResponse);
                    return null;
                }
            })
        );
    }

    public static updatePerimeter(perimeterData: Perimeter): Observable<Perimeter> {
        return PerimetersService.perimeterServer.updatePerimeter(perimeterData).pipe(
            map((perimetersResponse) => {
                if (perimetersResponse.status === ServerResponseStatus.OK) {
                    PerimetersService.updateCachedPerimeters(perimeterData);
                    return perimetersResponse.data;
                } else {
                    ErrorService.handleServerResponseError(perimetersResponse);
                    return null;
                }
            })
        );
    }

    public static getAll(): Observable<any[]> {
        return PerimetersService.queryAllPerimeters();
    }

    public static create(data: any): Observable<any> {
        return PerimetersService.createPerimeter(data);
    }

    public static update(data: any): Observable<any> {
        return PerimetersService.updatePerimeter(data);
    }
}
