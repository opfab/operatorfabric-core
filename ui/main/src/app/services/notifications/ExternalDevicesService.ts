/* Copyright (c) 2021-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {map} from 'rxjs/operators';
import {Observable, throwError} from 'rxjs';
import {DeviceConfiguration, Notification, SignalMapping, UserConfiguration} from './model/ExternalDevices';
import {ExternalDevicesServer} from './server/ExternalDevicesServer';
import {ServerResponse, ServerResponseStatus} from '../../server/ServerResponse';
import {AlertMessageService} from '@ofServices/alerteMessage/AlertMessageService';
import {MessageLevel} from '@ofServices/alerteMessage/model/Message';
import {LoggerService} from '@ofServices/logs/LoggerService';

export class ExternalDevicesService {
    private static externalDevicesServer: ExternalDevicesServer;

    static setExternalDevicesServer(externalDevicesServer: ExternalDevicesServer) {
        ExternalDevicesService.externalDevicesServer = externalDevicesServer;
    }

    static sendNotification(notification: Notification): Observable<any> {
        return ExternalDevicesService.externalDevicesServer.sendNotification(notification).pipe(
            map((serverResponse) => {
                if (serverResponse.status === ServerResponseStatus.OK) return serverResponse.data;
                else {
                    LoggerService.error(`Error while sending notification :  ${serverResponse.statusMessage}`);
                    AlertMessageService.sendAlertMessage({
                        message: '',
                        i18n: {key: 'feed.externalDeviceSoundNotificationError'},
                        level: MessageLevel.ERROR
                    });

                    return throwError(() => serverResponse);
                }
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
                else {
                    LoggerService.error(
                        `Error while updating user ${userconfigData.userLogin} external devices configuration :  ${serverResponse.statusMessage}`
                    );
                    AlertMessageService.sendAlertMessage({
                        message: '',
                        i18n: {key: 'shared.error.externalDevice.updateUserConfiguration'},
                        level: MessageLevel.ERROR
                    });

                    return throwError(() => serverResponse);
                }
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
                else {
                    LoggerService.error(
                        `Error while deleting user ${login} external devices configuration :  ${serverResponse.statusMessage}`
                    );
                    AlertMessageService.sendAlertMessage({
                        message: '',
                        i18n: {key: 'shared.error.externalDevice.deleteDevicesForUser'},
                        level: MessageLevel.ERROR
                    });

                    return throwError(() => serverResponse);
                }
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
