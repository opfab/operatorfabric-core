/* Copyright (c) 2021-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {map} from 'rxjs/operators';
import {Observable, Subject} from 'rxjs';
import {Device, Notification, UserConfiguration} from '@ofModel/external-devices.model';
import {Injectable} from '@angular/core';
import {ErrorService} from 'app/business/services/error-service';
import {OpfabLoggerService} from 'app/business/services/logs/opfab-logger.service';
import {ExternalDevicesServer} from '../../server/external-devices.server';
import {ServerResponseStatus} from '../../server/serverResponse';
import {AlertMessageService} from '../alert-message.service';

@Injectable({
    providedIn: 'root'
})
export class ExternalDevicesService extends ErrorService {

    private ngUnsubscribe$ = new Subject<void>();
    /**
     * @constructor
     * @param httpClient - Angular build-in
     */
    constructor(private server: ExternalDevicesServer, protected loggerService: OpfabLoggerService, protected alertMessageService: AlertMessageService) {
        super(loggerService, alertMessageService);
    }

    sendNotification(notification: Notification): Observable<any> {
        return this.server.sendNotification(notification).pipe(( map((serverResponse) => { if (serverResponse.status === ServerResponseStatus.OK) return serverResponse.data; else  return this.handleServerResponseError(serverResponse)})));
    }

    fetchUserConfiguration(login: string): Observable<UserConfiguration> {
        return this.server.fetchUserConfiguration(login).pipe(( map((serverResponse) => serverResponse.data)));
    }

    queryAllUserConfigurations(): Observable<UserConfiguration[]> {
        return this.server.queryAllUserConfigurations().pipe(( map((serverResponse) => serverResponse.data)));
    }

    queryAllDevices(): Observable<Device[]> {
        return this.server.queryAllDevices().pipe(( map((serverResponse) => serverResponse.data)));
    }

    updateUserConfiguration(userconfigData: UserConfiguration): Observable<UserConfiguration> {
        return this.server.updateUserConfiguration(userconfigData).pipe(( map((serverResponse) => { if (serverResponse.status === ServerResponseStatus.OK) return serverResponse.data; else  return this.handleServerResponseError(serverResponse)})));
    }

    enableDevice(deviceId: string): Observable<string> {
        return this.server.enableDevice(deviceId).pipe(( map((serverResponse) => serverResponse.data)));
    }

    disableDevice(deviceId: string): Observable<string> {
        return this.server.disableDevice(deviceId).pipe(( map((serverResponse) => serverResponse.data)));
    }

    deleteByUserLogin(login: string) {
        return this.server.deleteByUserLogin(login).pipe(( map((serverResponse) => { if (serverResponse.status === ServerResponseStatus.OK) return serverResponse.data; else  return this.handleServerResponseError(serverResponse)})));
    }
}
