/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {environment} from '@env/environment';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {catchError} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {ErrorService} from '@ofServices/error-service';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {OpfabLoggerService} from './logs/opfab-logger.service';

@Injectable({
    providedIn: 'root'
})
export class PushNotificationService extends ErrorService {
    readonly pushNotificationServiceUrl: string;

    /**
     * @constructor
     * @param httpClient - Angular build-in
     */
    constructor(protected store: Store<AppState>, private httpClient: HttpClient, protected loggerService: OpfabLoggerService) {
        super(store, loggerService);
        this.pushNotificationServiceUrl = `${environment.urls.pushNotification}`;
    }


    public sendSubscriptionToServer(subscription: PushSubscription) {

        // Get public key and user auth from the subscription object
        var key = subscription.getKey('p256dh') ? subscription.getKey('p256dh') : '';
        var auth = subscription.getKey('auth') ? subscription.getKey('auth') : '';

        const subscriptionObject = new SubscriptionObject();
        subscriptionObject.endpoint = subscription.endpoint;

        subscriptionObject.key = subscription.getKey('p256dh')? btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh')))) : ''
        subscriptionObject.auth = subscription.getKey('auth')? btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth')))) : ''
        console.log("Send subscription to server " + subscriptionObject);
        return this.httpClient
            .post<SubscriptionObject>(`${this.pushNotificationServiceUrl}/subscription`, subscriptionObject)
            .pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
    }

    public deleteSubscription(subscription: PushSubscription) {
        const encodedEndpoint = this.toBase64(subscription.endpoint);
        const url = `${this.pushNotificationServiceUrl}/subscription/${encodedEndpoint}`;
        return this.httpClient.delete(url).pipe(
            catchError((error: HttpErrorResponse) => this.handleError(error))
        );
    }

    private toBase64(str) {
        return window.btoa(encodeURIComponent(str));
    }

}

class SubscriptionObject {
    public endpoint: string;
    public key: string;
    public auth: string;
}