/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {Injectable} from '@angular/core';
import {Observable, of, Subject} from 'rxjs';
import {CardOperation} from '@ofModel/card-operation.model';
import {EventSourcePolyfill} from 'ng-event-source';
import {AuthenticationService} from './authentication/authentication.service';
import {Card, CardData} from '@ofModel/card.model';
import {HttpClient, HttpParams, HttpResponse} from '@angular/common/http';
import {environment} from '@env/environment';
import {GuidService} from '@ofServices/guid.service';
import {LightCard} from '@ofModel/light-card.model';
import {Page} from '@ofModel/page.model';
import {NotifyService} from '@ofServices/notify.service';
import {AppState} from '@ofStore/index';
import {Store} from '@ngrx/store';
import {CardSubscriptionClosed, CardSubscriptionOpen} from '@ofActions/cards-subscription.actions';
import {LineOfLoggingResult} from '@ofModel/line-of-logging-result.model';
import {map} from 'rxjs/operators';
import * as moment from 'moment';
import {I18n} from '@ofModel/i18n.model';
import {LineOfMonitoringResult} from '@ofModel/line-of-monitoring-result.model';

@Injectable()
export class CardService {
    private static MINIMUM_DELAY_FOR_SUBSCRIPTION = 1000;
    readonly unsubscribe$ = new Subject<void>();
    readonly cardOperationsUrl: string;
    readonly cardsUrl: string;
    readonly archivesUrl: string;
    readonly cardsPubUrl: string;
    readonly userAckUrl: string;
    private subscriptionTime = 0;

    constructor(private httpClient: HttpClient,
                private notifyService: NotifyService,
                private guidService: GuidService,
                private store: Store<AppState>,
                private authService: AuthenticationService) {
        const clientId = this.guidService.getCurrentGuidString();
        this.cardOperationsUrl = `${environment.urls.cards}/cardSubscription?clientId=${clientId}`;
        this.cardsUrl = `${environment.urls.cards}/cards`;
        this.archivesUrl = `${environment.urls.cards}/archives`;
        this.cardsPubUrl = `${environment.urls.cardspub}/cards`;
        this.userAckUrl = `${environment.urls.cardspub}/cards/userAcknowledgement`;
    }

    loadCard(id: string): Observable<CardData> {
        return this.httpClient.get<CardData>(`${this.cardsUrl}/${id}`);
    }

    getCardOperation(): Observable<CardOperation> {
        const oneHourInMilliseconds = 60 * 60 * 1000;
        const minus2Hour = new Date(new Date().valueOf() - 2 * oneHourInMilliseconds);
        const plus48Hours = new Date(minus2Hour.valueOf() + 48 * oneHourInMilliseconds);
        // security header needed here as SSE request are not intercepted by our header interceptor
        const oneYearInMilliseconds = 31536000000;
        return this.fetchCardOperation(new EventSourcePolyfill(
            `${this.cardOperationsUrl}&notification=true&rangeStart=${minus2Hour.valueOf()}&rangeEnd=${plus48Hours.valueOf()}`
            , {
                headers: this.authService.getSecurityHeader(),
                /** We loose sometimes cards when reconnecting after a heartbeat timeout
                 * ..there 's no way to inhibit this heartbeat timeout
                 * so putting it to 31536000000 milliseconds make it sufficiently long (1 year)
                 * Anyway the token will expire long before and the connection will restart
                 */
                heartbeatTimeout: oneYearInMilliseconds
            }));
    }


    unsubscribeCardOperation() {
        this.unsubscribe$.next();
    }

    fetchCardOperation(eventSource: EventSourcePolyfill): Observable<CardOperation> {
        this.subscriptionTime = new Date().getTime();
        console.log(new Date().toISOString()
            , 'BUG OC-604 card.services.ts fetch card set subscription time to '
            , this.subscriptionTime);
        return Observable.create(observer => {
            try {
                eventSource.onmessage = message => {
                    this.notifyService.createNotification(`New cards are being pushed`);
                    if (!message) {
                        return observer.error(message);
                    }
                    return observer.next(JSON.parse(message.data, CardOperation.convertTypeIntoEnum));
                };
                eventSource.onerror = error => {
                    this.store.dispatch(new CardSubscriptionClosed());
                    console.error('error occurred in card subscription:', error);
                };
                eventSource.onopen = open => {
                    this.store.dispatch(new CardSubscriptionOpen());
                    console.log(`open card subscription`);
                };


            } catch (error) {
                console.error('an error occurred', error);
                return observer.error(error);
            }
            return () => {
                if (eventSource && eventSource.readyState !== eventSource.CLOSED) {
                    eventSource.close();
                }
            };
        });
    }

    public updateCardSubscriptionWithDates(rangeStart: number, rangeEnd: number): Observable<any> {

        /**
         * Hack to solve OC 604 bug
         * Depending on the network conditions, it may appends that the subscription is not totally configured
         * in the backend when we try to update it.
         * To solve this , we wait a minimum delay after subscription creation request  to make an updateSubscribe request
         *
         * It as well possible to have a update subscription ask form NGRX before the create subscription,
         * in this case we wait 2 times the minimum delay
         *
         * This solution should be replace with a more robust one (the backend should be modify to send
         * an information saying the subscription is OK )
         */
        let timeout = 0;
        const currentTime = new Date().getTime();
        if (this.subscriptionTime === 0) {
            timeout = CardService.MINIMUM_DELAY_FOR_SUBSCRIPTION * 2;
        } else {
            const delayAfterSubscription = currentTime - this.subscriptionTime;
            if (delayAfterSubscription < CardService.MINIMUM_DELAY_FOR_SUBSCRIPTION) {
                timeout = CardService.MINIMUM_DELAY_FOR_SUBSCRIPTION - delayAfterSubscription;
            }
        }
        console.log(new Date().toISOString()
            , `BUG OC-604 card.services.ts send  updateCardSubscriptionWithDates in ${timeout} ms`);
        setTimeout(() => {
            this.httpClient.post<any>(
                `${this.cardOperationsUrl}`,
                {rangeStart: rangeStart, rangeEnd: rangeEnd}).subscribe();
        }, timeout);

        return of();
    }

    loadArchivedCard(id: string): Observable<Card> {
        return this.httpClient.get<Card>(`${this.archivesUrl}/${id}`);
    }

    fetchArchivedCards(filters: Map<string, string[]>): Observable<Page<LightCard>> {
        const params = this.convertFiltersIntoHttpParams(filters);
        // const tmp = new HttpParams().set('publisher', 'defaultPublisher').set('size', '10');
        return this.httpClient.get<Page<LightCard>>(`${this.archivesUrl}/`, {params});
    }

    convertFiltersIntoHttpParams(filters: Map<string, string[]>): HttpParams {
        let params = new HttpParams();
        filters.forEach((values, key) => values.forEach(value => params = params.append(key, value)));
        return params;
    }

    postResponseCard(card: Card) {
        const headers = this.authService.getSecurityHeader();
        return this.httpClient.post<Card>(`${this.cardsPubUrl}/userCard`, card, {headers});
    }

    postUserAcnowledgement(card: Card): Observable<HttpResponse<void>> {
        return this.httpClient.post<void>(`${this.userAckUrl}/${card.uid}`, null, {observe: 'response'});
    }

    deleteUserAcnowledgement(card: Card): Observable<HttpResponse<void>> {
        return this.httpClient.delete<void>(`${this.userAckUrl}/${card.uid}`, {observe: 'response'});
    }

    fetchLoggingResults(filters: Map<string, string[]>): Observable<Page<LineOfLoggingResult>> {
        return this.fetchArchivedCards(filters).pipe(
            map((page: Page<LightCard>) => {
                const cards = page.content;
                const lines = cards.map((card: LightCard) => {
                    const i18nPrefix = `${card.publisher}.${card.processVersion}.`;
                    return ({
                        cardType: card.severity.toLowerCase(),
                        businessDate: moment(card.startDate),
                        i18nKeyForProcessName: this.addPrefix(i18nPrefix, card.title),
                        i18nKeyForDescription: this.addPrefix(i18nPrefix, card.summary),
                        sender: card.publisher
                    } as LineOfLoggingResult);
                });
                return {
                    totalPages: page.totalPages,
                    totalElements: page.totalElements,
                    content: lines
                } as Page<LineOfLoggingResult>;
            })
        );
    }

    addPrefix(i18nPrefix: string, initialI18n: I18n): I18n {
        return { ...initialI18n, key: i18nPrefix + initialI18n.key} as I18n;
    }

    fetchMonitoringResults(filters: Map<string, string[]>): Observable<Page<LineOfMonitoringResult>> {
        return null;
    }
}
