/* Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {HttpClient} from '@angular/common/http';
import {
    DeviceConfiguration,
    Notification,
    SignalMapping,
    UserConfiguration
} from '@ofServices/notifications/model/ExternalDevices';
import {ExternalDevicesServer} from '@ofServices/notifications/server/ExternalDevicesServer';
import {Observable} from 'rxjs';
import {AngularServer} from '../../../server/AngularServer';
import {environment} from '@env/environment';
import {ServerResponse} from 'app/server/ServerResponse';
import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class AngularExternalDevicesServer extends AngularServer implements ExternalDevicesServer {
    readonly externalDevicesUrl: string;
    readonly notificationsUrl: string;
    readonly configurationsUrl: string;
    readonly devicesUrl: string;
    readonly devicesConfigurationsUrl: string;
    readonly signalMappingUrl: string;

    constructor(private readonly httpClient: HttpClient) {
        super();
        this.externalDevicesUrl = `${environment.url}externaldevices`;
        this.notificationsUrl = this.externalDevicesUrl + '/notifications';
        this.configurationsUrl = this.externalDevicesUrl + '/configurations';
        this.devicesUrl = this.externalDevicesUrl + '/devices';
        this.devicesConfigurationsUrl = this.configurationsUrl + '/devices';
        this.signalMappingUrl = this.configurationsUrl + '/signals';
    }

    sendNotification(notification: Notification): Observable<ServerResponse<any>> {
        return this.processHttpResponse(this.httpClient.post<Notification>(`${this.notificationsUrl}`, notification));
    }

    fetchUserConfiguration(login: string): Observable<ServerResponse<any>> {
        return this.processHttpResponse(
            this.httpClient.get<UserConfiguration>(`${this.configurationsUrl}/users/${login}`)
        );
    }

    queryAllUserConfigurations(): Observable<ServerResponse<any>> {
        return this.processHttpResponse(this.httpClient.get<UserConfiguration[]>(`${this.configurationsUrl}/users`));
    }

    queryAllDevices(): Observable<ServerResponse<any>> {
        return this.processHttpResponse(
            this.httpClient.get<DeviceConfiguration[]>(`${this.configurationsUrl}/devices`)
        );
    }

    queryAllSignalMappings(): Observable<ServerResponse<any>> {
        return this.processHttpResponse(this.httpClient.get<SignalMapping[]>(`${this.configurationsUrl}/signals`));
    }

    updateUserConfiguration(userconfigData: UserConfiguration): Observable<ServerResponse<any>> {
        return this.processHttpResponse(
            this.httpClient.post<UserConfiguration>(`${this.configurationsUrl}/users`, userconfigData)
        );
    }

    enableDevice(deviceId: string): Observable<ServerResponse<any>> {
        return this.processHttpResponse(
            this.httpClient.post<string>(`${this.devicesUrl}/${deviceId}/enable`, deviceId)
        );
    }

    disableDevice(deviceId: string): Observable<ServerResponse<any>> {
        return this.processHttpResponse(
            this.httpClient.post<string>(`${this.devicesUrl}/${deviceId}/disable`, deviceId)
        );
    }

    deleteByUserLogin(login: string): Observable<ServerResponse<any>> {
        const url = `${this.configurationsUrl}/users/${login}`;
        return this.processHttpResponse(this.httpClient.delete(url));
    }

    updateDevice(device: DeviceConfiguration): Observable<ServerResponse<any>> {
        return this.processHttpResponse(
            this.httpClient.post<DeviceConfiguration>(`${this.devicesConfigurationsUrl}`, device)
        );
    }

    deleteDevice(deviceId: string): Observable<ServerResponse<any>> {
        return this.processHttpResponse(this.httpClient.delete<string>(`${this.devicesConfigurationsUrl}/${deviceId}`));
    }

    updateSignalMapping(mapping: SignalMapping): Observable<ServerResponse<any>> {
        const supportedSignals = {};

        mapping.supportedSignals.forEach((v, k) => {
            supportedSignals[k] = v;
        });

        return this.processHttpResponse(
            this.httpClient.post<any>(`${this.signalMappingUrl}`, {id: mapping.id, supportedSignals: supportedSignals})
        );
    }
}
