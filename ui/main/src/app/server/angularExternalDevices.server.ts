/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {HttpClient} from '@angular/common/http';
import {Device, Notification, UserConfiguration} from '@ofModel/external-devices.model';
import {ExternalDevicesServer} from 'app/business/server/external-devices.server';
import {Observable} from 'rxjs';
import {AngularServer} from './angular.server';
import {environment} from '@env/environment';
import {ServerResponse} from 'app/business/server/serverResponse';
import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class AngularExternalDevicesServer extends AngularServer implements ExternalDevicesServer{

    readonly externalDevicesUrl: string;
    readonly notificationsUrl: string;
    readonly configurationsUrl: string;
    readonly devicesUrl: string;

    constructor(
        private httpClient: HttpClient,
    ) {
        super();
        this.externalDevicesUrl = `${environment.url}/externaldevices`;
        this.notificationsUrl = this.externalDevicesUrl + '/notifications';
        this.configurationsUrl = this.externalDevicesUrl + '/configurations';
        this.devicesUrl = this.externalDevicesUrl + '/devices';
    }

    sendNotification(notification: Notification): Observable<ServerResponse<any>> {
        return this.processHttpResponse(this.httpClient
            .post<Notification>(`${this.notificationsUrl}`, notification));

    }

    fetchUserConfiguration(login: string): Observable<ServerResponse<any>> {
        return this.processHttpResponse(this.httpClient.get<UserConfiguration>(`${this.configurationsUrl}/users/${login}`));
    }

    queryAllUserConfigurations(): Observable<ServerResponse<any>> {
        return this.processHttpResponse(this.httpClient.get<UserConfiguration[]>(`${this.configurationsUrl}/users`));
    }

    queryAllDevices(): Observable<ServerResponse<any>> {
        return this.processHttpResponse(this.httpClient.get<Device[]>(`${this.configurationsUrl}/devices`));
    }

    updateUserConfiguration(userconfigData: UserConfiguration): Observable<ServerResponse<any>> {
        return this.processHttpResponse(this.httpClient
            .post<UserConfiguration>(`${this.configurationsUrl}/users`, userconfigData));
    }

    enableDevice(deviceId: string): Observable<ServerResponse<any>> {
        return this.processHttpResponse(this.httpClient
            .post<string>(`${this.devicesUrl}/${deviceId}/enable`, deviceId));
    }

    disableDevice(deviceId: string): Observable<ServerResponse<any>> {
        return this.processHttpResponse(this.httpClient
            .post<string>(`${this.devicesUrl}/${deviceId}/disable`, deviceId));
    }

    deleteByUserLogin(login: string): Observable<ServerResponse<any>> {
        const url = `${this.configurationsUrl}/users/${login}`;
        return this.processHttpResponse(this.httpClient.delete(url));
    }

}
