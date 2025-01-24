/* Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
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
import {LogOption, LoggerService as logger} from 'app/services/logs/LoggerService';
import {OpfabEventStreamServer} from '@ofServices/events/server/OpfabEventStreamServer';
import {ServerResponse} from 'app/server/ServerResponse';
import {EventSourcePolyfill} from 'ng-event-source';
import {Observable, Subject} from 'rxjs';
import packageInfo from '../../../../../package.json';
import {AngularServer} from '../../../server/AngularServer';
import {CurrentUserStore} from '../../../store/current-user.store';
import {ConfigService} from 'app/services/config/ConfigService';
import {Guid} from 'guid-typescript';

@Injectable()
export class AngularOpfabEventStreamServer extends AngularServer implements OpfabEventStreamServer {
    private static readonly TWO_MINUTES = 120000;
    private readonly eventStreamUrl: string;
    private readonly closeEventStreamUrl: string;
    private readonly heartbeatUrl: string;
    private isHeartbeatRunning: boolean;
    private heartbeatSendingIntervalId;
    private heartbeatSendingIntervalSeconds;
    private heartbeatReceptionIntervalId;

    private readonly businessEvents = new Subject<any>();
    private readonly streamInitDoneEvent = new Subject<void>();
    private readonly streamStatusEvents = new Subject<string>();

    private lastheartbeatDate = 0;
    private firstSubscriptionInitDone = false;
    private eventSource;

    constructor(private readonly httpClient: HttpClient) {
        super();
        const subscriptionClientId = Guid.create().toString();
        this.eventStreamUrl = `${environment.url}cards-consultation/cardSubscription?clientId=${subscriptionClientId}&version=${packageInfo.opfabVersion}`;
        this.closeEventStreamUrl = `${environment.url}cards-consultation/cardSubscription?clientId=${subscriptionClientId}`;
        this.heartbeatUrl = `${environment.url}cards-consultation/cardSubscriptionHeartbeat?clientId=${subscriptionClientId}`;
        this.isHeartbeatRunning = false;
    }

    public initStream() {
        this.heartbeatSendingIntervalSeconds = ConfigService.getConfigValue('heartbeatSendingInterval', 30);

        // security header needed here as SSE request are not intercepted by our angular header interceptor
        let securityHeader;
        if (CurrentUserStore.doesAuthenticationUseToken()) {
            securityHeader = {Authorization: `Bearer ${CurrentUserStore.getToken()}`};
        }
        this.eventSource = new EventSourcePolyfill(`${this.eventStreamUrl}&notification=true`, {
            headers: securityHeader
            // if necessary, we can set here internal heartbeatTimeout: xxx (in ms)
        });

        this.checkHeartBeatReceive();

        this.eventSource.onmessage = (message) => {
            if (message.data === 'HEARTBEAT') {
                this.lastheartbeatDate = new Date().valueOf();
                logger.info(`EventStreamServer - HEARTBEAT received - Connection alive `, LogOption.LOCAL);
            } else if (message.data === 'INIT') {
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
                    this.lastheartbeatDate = new Date().valueOf();
                }
            } else this.businessEvents.next(message);
        };
        this.eventSource.onerror = (error) => {
            this.streamStatusEvents.next('close');
            logger.error('EventStreamServer - Error event in card subscription: ' + JSON.stringify(error));
        };
        this.eventSource.onopen = (open) => {
            this.streamStatusEvents.next('open');
            if (!this.isHeartbeatRunning) {
                this.sendHeartBeat();
            }
            logger.info(`EventStreamServer - Open card subscription`);
        };
    }

    private checkHeartBeatReceive() {
        this.heartbeatReceptionIntervalId = setInterval(() => {
            logger.info(
                'EventStreamServer - Last heart beat received ' +
                    (new Date().valueOf() - this.lastheartbeatDate) +
                    'ms ago',
                LogOption.LOCAL_AND_REMOTE
            );
        }, 60000);
    }

    private sendHeartBeat() {
        this.isHeartbeatRunning = true;
        this.heartbeatSendingIntervalId = setInterval(() => {
            this.httpClient.get(`${this.heartbeatUrl}`).subscribe();
            logger.info('EventStreamServer - Heartbeat sent to the server', LogOption.LOCAL_AND_REMOTE);
        }, this.heartbeatSendingIntervalSeconds * 1000);
    }

    private recoverAnyLostCardWhenConnectionHasBeenReset() {
        // Subtracts two minutes from the last heart beat to avoid losing card due to latency, buffering and not synchronized clock
        const dateForRecovering = this.lastheartbeatDate - AngularOpfabEventStreamServer.TWO_MINUTES;
        logger.info(
            `EventStreamServer - Card subscription has been init again , recover any lost card from date ` +
                new Date(dateForRecovering),
            LogOption.LOCAL_AND_REMOTE
        );
        this.httpClient.post<any>(`${this.eventStreamUrl}`, {updatedFrom: dateForRecovering}).subscribe();
    }

    public getStreamInitDone(): Observable<void> {
        return this.streamInitDoneEvent.asObservable();
    }

    public closeStream() {
        this.httpClient.delete<any>(`${this.closeEventStreamUrl}`).subscribe();
        clearInterval(this.heartbeatSendingIntervalId);
        clearInterval(this.heartbeatReceptionIntervalId);
        this.isHeartbeatRunning = false;
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
