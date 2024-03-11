/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {DeviceConfiguration, Notification, UserConfiguration} from '@ofModel/external-devices.model';
import {ExternalDevicesServer} from 'app/business/server/external-devices.server';
import {ServerResponse} from 'app/business/server/serverResponse';
import {Observable, ReplaySubject} from 'rxjs';

export class ExternalDevicesServerMock implements ExternalDevicesServer {
    private fetchUserConfiguration$: ReplaySubject<ServerResponse<any>>;

    public setResponseForFetchUserConfiguration(response: ServerResponse<any>) {
        this.fetchUserConfiguration$ = new ReplaySubject<ServerResponse<any>>();
        this.fetchUserConfiguration$.next(response);
        this.fetchUserConfiguration$.complete();
    }

    sendNotification(notification: Notification): Observable<ServerResponse<any>> {
        throw new Error('Method not implemented.');
    }
    fetchUserConfiguration(login: string): Observable<ServerResponse<any>> {
        return this.fetchUserConfiguration$.asObservable();
    }
    queryAllUserConfigurations(): Observable<ServerResponse<any>> {
        throw new Error('Method not implemented.');
    }
    queryAllDevices(): Observable<ServerResponse<any>> {
        throw new Error('Method not implemented.');
    }
    updateUserConfiguration(userconfigData: UserConfiguration): Observable<ServerResponse<any>> {
        throw new Error('Method not implemented.');
    }
    enableDevice(deviceId: string): Observable<ServerResponse<any>> {
        throw new Error('Method not implemented.');
    }
    disableDevice(deviceId: string): Observable<ServerResponse<any>> {
        throw new Error('Method not implemented.');
    }
    deleteByUserLogin(login: string): Observable<ServerResponse<any>> {
        throw new Error('Method not implemented.');
    }
    queryAllSignalMappings(): Observable<ServerResponse<any>> {
        throw new Error('Method not implemented.');
    }
    updateDevice(DeviceConfiguration: any): Observable<ServerResponse<DeviceConfiguration>> {
        throw new Error('Method not implemented.');
    }
    deleteDevice(deviceId: string): Observable<ServerResponse<any>> {
        throw new Error('Method not implemented.');
    }
}
