/* Copyright (c) 2021-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {DeviceConfiguration, Notification, SignalMapping, UserConfiguration} from '@ofModel/external-devices.model';

import {ErrorService} from 'app/business/services/error-service';
import {ExternalDevicesServer} from '../../server/external-devices.server';
import {ServerResponse, ServerResponseStatus} from '../../server/serverResponse';

export class ExternalDevicesService {
    private static externalDevicesServer: ExternalDevicesServer;

    /**
     * @constructor
     * @param httpClient - Angular built-in
     */
    static setExternalDevicesServer(externalDevicesServer: ExternalDevicesServer) {
        ExternalDevicesService.externalDevicesServer = externalDevicesServer;
    }

    static sendNotification(notification: Notification): Observable<any> {
        return ExternalDevicesService.externalDevicesServer.sendNotification(notification).pipe(
            map((serverResponse) => {
                if (serverResponse.status === ServerResponseStatus.OK) return serverResponse.data;
                else
                    return ErrorService.handleServerResponseError(serverResponse, {
                        key: 'feed.externalDeviceSoundNotificationError'
                    });
            })
        );
    }

    static fetchUserConfiguration(login: string): Observable<UserConfiguration> {
        return ExternalDevicesService.externalDevicesServer
            .fetchUserConfiguration(login)
            .pipe(map((serverResponse) => serverResponse.data));
    }

    static queryAllUserConfigurations(): Observable<UserConfiguration[]> {
        return ExternalDevicesService.externalDevicesServer
            .queryAllUserConfigurations()
            .pipe(map((serverResponse) => serverResponse.data));
    }

    static queryAllDevices(): Observable<DeviceConfiguration[]> {
        return ExternalDevicesService.externalDevicesServer
            .queryAllDevices()
            .pipe(map((serverResponse) => serverResponse.data));
    }

    static queryAllSignalMappings(): Observable<SignalMapping[]> {
        return ExternalDevicesService.externalDevicesServer
            .queryAllSignalMappings()
            .pipe(map((serverResponse) => serverResponse.data));
    }

    static updateUserConfiguration(userconfigData: UserConfiguration): Observable<UserConfiguration> {
        return ExternalDevicesService.externalDevicesServer.updateUserConfiguration(userconfigData).pipe(
            map((serverResponse) => {
                if (serverResponse.status === ServerResponseStatus.OK) return serverResponse.data;
                else return ErrorService.handleServerResponseError(serverResponse);
            })
        );
    }

    static enableDevice(deviceId: string): Observable<ServerResponse<any>> {
        return ExternalDevicesService.externalDevicesServer.enableDevice(deviceId);
    }

    static disableDevice(deviceId: string): Observable<ServerResponse<any>> {
        return ExternalDevicesService.externalDevicesServer.disableDevice(deviceId);
    }

    static deleteDevice(deviceId: string): Observable<string> {
        return ExternalDevicesService.externalDevicesServer
            .deleteDevice(deviceId)
            .pipe(map((serverResponse) => serverResponse.data));
    }

    static deleteByUserLogin(login: string) {
        return ExternalDevicesService.externalDevicesServer.deleteByUserLogin(login).pipe(
            map((serverResponse) => {
                if (serverResponse.status === ServerResponseStatus.OK) return serverResponse.data;
                else return ErrorService.handleServerResponseError(serverResponse);
            })
        );
    }

    static updateDevice(device: DeviceConfiguration): Observable<DeviceConfiguration> {
        return ExternalDevicesService.externalDevicesServer
            .updateDevice(device)
            .pipe(map((serverResponse) => serverResponse.data));
    }

    static updateSignalMappings(mapping: SignalMapping) {
        return ExternalDevicesService.externalDevicesServer
            .updateSignalMapping(mapping)
            .pipe(map((serverResponse) => serverResponse.data));
    }
}
