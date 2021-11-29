/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {environment} from '@env/environment';
import {HttpClient} from '@angular/common/http';
import {catchError} from 'rxjs/operators';
import {Observable, Subject} from 'rxjs';
import {Notification} from "@ofModel/external-devices.model";
import {Injectable} from '@angular/core';
import {ErrorService} from "@ofServices/error-service";

@Injectable({
    providedIn: 'root'
})
export class ExternalDevicesService extends ErrorService {

    readonly externalDevicesUrl: string;
    readonly notificationsUrl: string;
    private ngUnsubscribe$ = new Subject<void>();
    /**
     * @constructor
     * @param httpClient - Angular build-in
     */
    constructor(private httpClient: HttpClient) {
        super();
        this.externalDevicesUrl = `${environment.urls.externalDevices}`;
        this.notificationsUrl = this.externalDevicesUrl+'/notifications';
    }

    sendNotification(notification: Notification): Observable<any> {
        return this.httpClient.post<Notification>(`${this.notificationsUrl}`, notification).pipe(
            catchError((error: Response) => this.handleError(error))
        );
    }

}
