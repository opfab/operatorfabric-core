/* Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Observable, Subject} from 'rxjs';
import {map, takeUntil, tap} from 'rxjs/operators';
import {Perimeter} from '@ofServices/perimeters/model/Perimeter';
import {PerimetersServer} from './server/PerimetersServer';
import {ServerResponseStatus} from '../../business/server/serverResponse';
import {LoggerService} from 'app/services/logs/LoggerService';
import {AlertMessageService} from '@ofServices/alerteMessage/AlertMessageService';
import {MessageLevel} from '@ofServices/alerteMessage/model/Message';

export class PerimetersService {
    private static perimeterServer: PerimetersServer;
    private static _perimeters: Perimeter[];

    private static readonly ngUnsubscribe$ = new Subject<void>();

    public static setPerimeterServer(perimeterServer: PerimetersServer) {
        PerimetersService.perimeterServer = perimeterServer;
    }

    public static deleteById(id: string) {
        return PerimetersService.perimeterServer.deleteById(id).pipe(
            map((perimetersResponse) => {
                if (perimetersResponse.status === ServerResponseStatus.OK) {
                    PerimetersService.deleteFromCachedPerimeters(id);
                } else {
                    LoggerService.error(`Error while deleting perimeter ${id} :  ${perimetersResponse.statusMessage}`);
                    AlertMessageService.sendAlertMessage({
                        message: '',
                        i18n: {key: 'shared.error.perimeter.deletePerimeter'},
                        level: MessageLevel.ERROR
                    });
                }
            })
        );
    }

    private static deleteFromCachedPerimeters(id: string): void {
        PerimetersService._perimeters = PerimetersService._perimeters.filter((perimeter) => perimeter.id !== id);
    }

    private static updateCachedPerimeters(perimeterData: Perimeter): void {
        const updatedPerimeters = PerimetersService._perimeters.filter(
            (perimeter) => perimeter.id !== perimeterData.id
        );
        updatedPerimeters.push(perimeterData);
        PerimetersService._perimeters = updatedPerimeters;
    }

    private static queryAllPerimeters(): Observable<Perimeter[]> {
        return PerimetersService.perimeterServer.queryAllPerimeters().pipe(
            map((perimetersResponse) => {
                if (perimetersResponse.status === ServerResponseStatus.OK) {
                    return perimetersResponse.data;
                } else {
                    LoggerService.error(`Error while getting perimeters :  ${perimetersResponse.statusMessage}`);
                    AlertMessageService.sendAlertMessage({
                        message: '',
                        i18n: {key: 'shared.error.perimeter.gettingPerimeters'},
                        level: MessageLevel.ERROR
                    });
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
                        LoggerService.info('List of perimeters loaded');
                    }
                },
                error: (error) => LoggerService.error('An error occurred when loading perimeters', error)
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
                    LoggerService.error(`Error while creating perimeter :  ${perimetersResponse.statusMessage}`);
                    AlertMessageService.sendAlertMessage({
                        message: '',
                        i18n: {key: 'shared.error.perimeter.createPerimeter'},
                        level: MessageLevel.ERROR
                    });
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
                    LoggerService.error(`Error while updating perimeter :  ${perimetersResponse.statusMessage}`);
                    AlertMessageService.sendAlertMessage({
                        message: '',
                        i18n: {key: 'shared.error.perimeter.updatePerimeter'},
                        level: MessageLevel.ERROR
                    });
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
