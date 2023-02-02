/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {UserConfiguration, Notification} from '@ofModel/external-devices.model';
import {Observable} from 'rxjs';
import {ServerResponse} from './serverResponse';

export abstract class ExternalDevicesServer {
    abstract sendNotification(notification: Notification): Observable<ServerResponse<any>>;
    abstract fetchUserConfiguration(login: string): Observable<ServerResponse<any>>;
    abstract queryAllUserConfigurations(): Observable<ServerResponse<any>>;
    abstract queryAllDevices(): Observable<ServerResponse<any>>;
    abstract updateUserConfiguration(userconfigData: UserConfiguration): Observable<ServerResponse<any>>;
    abstract enableDevice(deviceId: string): Observable<ServerResponse<any>>;
    abstract disableDevice(deviceId: string): Observable<ServerResponse<any>>;
    abstract deleteByUserLogin(login: string): Observable<ServerResponse<any>>;

}
