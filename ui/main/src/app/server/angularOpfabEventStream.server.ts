/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {environment} from '@env/environment';
import {LogOption, OpfabLoggerService} from 'app/business/services/logs/opfab-logger.service';
import {OpfabEventStreamServer} from 'app/business/server/opfabEventStream.server';
import {ServerResponse} from 'app/business/server/serverResponse';
import {GuidService} from 'app/business/services/guid.service';
import {EventSourcePolyfill} from 'ng-event-source';
import {Observable, Subject} from 'rxjs';
import packageInfo from '../../../package.json';
import {AngularServer} from './angular.server';
import {CurrentUserStore} from 'app/business/store/current-user.store';

@Injectable()
export class AngularOpfabEventStreamServer extends AngularServer implements OpfabEventStreamServer {
    private static TWO_MINUTES = 120000;
    private eventStreamUrl: string;
    private closeEventStreamUrl: string;

    private businessEvents = new Subject<any>();
    private streamInitDoneEvent = new Subject<void>();
    private streamStatusEvents = new Subject<string>();

    private lastHeardBeatDate = 0;
    private firstSubscriptionInitDone = false;
    private eventSource;

    constructor(
        private currentUserStore: CurrentUserStore,
        guidService: GuidService,
        private logger: OpfabLoggerService,
        private httpClient: HttpClient
    ) {
        super();
        const clientId = guidService.getCurrentGuidString();
        this.eventStreamUrl = `${environment.urls.cards}/cardSubscription?clientId=${clientId}&version=${packageInfo.opfabVersion}`;
        this.closeEventStreamUrl = `${environment.urls.cards}/cardSubscription?clientId=${clientId}`;
    }

    public initStream() {
        // security header needed here as SSE request are not intercepted by our angular header interceptor
        let securityHeader;
        if (this.currentUserStore.doesAuthenticationUseToken()) {
            securityHeader = {Authorization: `Bearer ${this.currentUserStore.getToken()}`}
        }
        this.eventSource = new EventSourcePolyfill(`${this.eventStreamUrl}&notification=true`, {
            headers: securityHeader
            // if necessary, we can set here internal heartbeatTimeout: xxx (in ms)
        });

        this.checkHeartBeatReceive();

        this.eventSource.onmessage = (message) => {
            if (message.data === 'HEARTBEAT') {
                this.lastHeardBeatDate = new Date().valueOf();
                this.logger.info(`EventStreamServer - HEARTBEAT received - Connection alive `, LogOption.LOCAL);
            } else {
                if (message.data === 'INIT') {
                    if (this.firstSubscriptionInitDone) {
                        this.recoverAnyLostCardWhenConnectionHasBeenReset();
                        // process or user config may have change during connection loss
                        // so reload both configuration
                        this.businessEvents.next({data: 'BUSINESS_CONFIG_CHANGE'});
                        this.businessEvents.next({data: 'USER_CONFIG_CHANGE'});
                    } else {
                        this.firstSubscriptionInitDone = true;
                        this.streamInitDoneEvent.next();
                        this.streamInitDoneEvent.complete();
                        this.lastHeardBeatDate = new Date().valueOf();
                    }
                } else this.businessEvents.next(message);
            }
        };
        this.eventSource.onerror = (error) => {
            this.streamStatusEvents.next('close');
            console.error(new Date().toISOString(), 'EventStreamServer - Error event in card subscription:', error);
        };
        this.eventSource.onopen = (open) => {
            this.streamStatusEvents.next('open');
            this.sendHeartBeat();
            console.log(new Date().toISOString(), `EventStreamServer - Open card subscription`);
        };
    }

    private checkHeartBeatReceive() {
        setInterval(() => {
            this.logger.info(
                'EventStreamServer - Last heart beat received ' +
                    (new Date().valueOf() - this.lastHeardBeatDate) +
                    'ms ago',
                LogOption.LOCAL_AND_REMOTE
            );
        }, 60000);
    }

    private sendHeartBeat() {
        setInterval(() => {
            this.logger.info(
                'EventStreamServer - Heartbeat sent ',
                LogOption.LOCAL_AND_REMOTE
            );
            this.processHttpResponse(this.httpClient.post(this.eventStreamUrl, "TEST"))
        }, 60000);
    }

    private recoverAnyLostCardWhenConnectionHasBeenReset() {
        // Subtracts two minutes from the last heart beat to avoid loosing card due to latency, buffering and not synchronized clock
        const dateForRecovering = this.lastHeardBeatDate - AngularOpfabEventStreamServer.TWO_MINUTES;
        this.logger.info(
            `EventStreamServer - Card subscription has been init again , recover any lost card from date ` +
                new Date(dateForRecovering),
            LogOption.LOCAL_AND_REMOTE
        );
        this.httpClient.post<any>(`${this.eventStreamUrl}`, {publishFrom: dateForRecovering}).subscribe();
    }

    public getStreamInitDone(): Observable<void> {
        return this.streamInitDoneEvent.asObservable();
    }

    public closeStream() {
        this.httpClient.delete<any>(`${this.closeEventStreamUrl}`).subscribe();
        if (this.eventSource && this.eventSource.readyState !== this.eventSource.CLOSED) {
            this.eventSource.close();
        }
    }
    public getEvents(): Observable<any> {
        return this.businessEvents.asObservable();
    }
    public getStreamStatus(): Observable<any> {
        return this.streamStatusEvents.asObservable();
    }

    public setBusinessPeriod(startDate: number, endDate: number): Observable<ServerResponse<any>> {
        return this.processHttpResponse(
            this.httpClient.post<any>(`${this.eventStreamUrl}`, {rangeStart: startDate, rangeEnd: endDate})
        );
    }
}
