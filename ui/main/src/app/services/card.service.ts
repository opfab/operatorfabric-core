/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {CardOperation, CardOperationType} from '@ofModel/card-operation.model';
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
import {catchError, map} from 'rxjs/operators';
import * as moment from 'moment';
import {I18n} from '@ofModel/i18n.model';
import {LineOfMonitoringResult} from '@ofModel/line-of-monitoring-result.model';
import {
    AddLightCardFailure,
    HandleUnexpectedError,
    LoadLightCardsSuccess,
    RemoveLightCard
} from '@ofActions/light-card.actions';

@Injectable()
export class CardService {
    private static MINIMUM_DELAY_FOR_SUBSCRIPTION = 2000;
    readonly cardOperationsUrl: string;
    readonly cardsUrl: string;
    readonly archivesUrl: string;
    readonly cardsPubUrl: string;
    readonly userAckUrl: string;
    readonly userCardReadUrl: string;
    public initSubscription = new Subject<void>();

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
        this.userCardReadUrl = `${environment.urls.cardspub}/cards/userCardRead`;
    }

    loadCard(id: string): Observable<CardData> {
        return this.httpClient.get<CardData>(`${this.cardsUrl}/${id}`);
    }


    public initCardSubscription() {
        this.getCardSubscription()
            .subscribe(
                operation => {
                    switch (operation.type) {
                        case CardOperationType.ADD:
                            this.store.dispatch(new LoadLightCardsSuccess({lightCards: operation.cards}));
                            break;
                        case CardOperationType.DELETE:
                            this.store.dispatch(new RemoveLightCard({cards: operation.cardIds}));
                            break;
                        default:
                            this.store.dispatch(new AddLightCardFailure(
                                {error: new Error(`unhandled action type '${operation.type}'`)})
                            );
                    }
                }, (error) => {
                    this.store.dispatch(new AddLightCardFailure({error: error}));
                }
            );
        catchError((error, caught) => {
            this.store.dispatch(new HandleUnexpectedError({error: error}));
            return caught;
        });
    }


    private getCardSubscription(): Observable<CardOperation> {
        // security header needed here as SSE request are not intercepted by our header interceptor
        const oneYearInMilliseconds = 31536000000;
        const eventSource = new EventSourcePolyfill(
            `${this.cardOperationsUrl}&notification=true`
            , {
                headers: this.authService.getSecurityHeader(),
                /** We loose sometimes cards when reconnecting after a heartbeat timeout
                 * ..there 's no way to inhibit this heartbeat timeout
                 * so putting it to 31536000000 milliseconds make it sufficiently long (1 year)
                 * Anyway the token will expire long before and the connection will restart
                 */
                heartbeatTimeout: oneYearInMilliseconds
            });
        return Observable.create(observer => {
            try {
                eventSource.onmessage = message => {
                    this.notifyService.createNotification(`New cards are being pushed`);
                    if (!message) {
                        return observer.error(message);
                    }
                    if (message.data === 'INIT') {
                        console.log(new Date().toISOString(), `Card subscription initialized`);
                        this.initSubscription.next();
                        this.initSubscription.complete();
                    } else {
                        return observer.next(JSON.parse(message.data, CardOperation.convertTypeIntoEnum));
                    }
                };
                eventSource.onerror = error => {
                    this.store.dispatch(new CardSubscriptionClosed());
                    console.error(new Date().toISOString(), 'Error occurred in card subscription:', error);
                };
                eventSource.onopen = open => {
                    this.store.dispatch(new CardSubscriptionOpen());
                    console.log(new Date().toISOString(), `Open card subscription`);
                };

            } catch (error) {
                console.error(new Date().toISOString(), 'an error occurred', error);
                return observer.error(error);
            }
            return () => {
                if (eventSource && eventSource.readyState !== eventSource.CLOSED) {
                    eventSource.close();
                }
            };
        });
    }


    public setSubscriptionDates(rangeStart: number, rangeEnd: number) {

        console.log(new Date().toISOString(), 'Set subscription date', new Date(rangeStart), ' -', new Date(rangeEnd));
        this.httpClient.post<any>(
            `${this.cardOperationsUrl}`,
            {rangeStart: rangeStart, rangeEnd: rangeEnd}).subscribe();

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

    postResponseCard(card: Card): any {
        const headers = this.authService.getSecurityHeader();
        return this.httpClient.post<Card>(`${this.cardsPubUrl}/userCard`, card, {headers});
    }

    postUserAcnowledgement(card: Card): Observable<HttpResponse<void>> {
        return this.httpClient.post<void>(`${this.userAckUrl}/${card.uid}`, null, {observe: 'response'});
    }

    deleteUserAcnowledgement(card: Card): Observable<HttpResponse<void>> {
        return this.httpClient.delete<void>(`${this.userAckUrl}/${card.uid}`, {observe: 'response'});
    }

    postUserCardRead(card: Card): Observable<HttpResponse<void>> {
        return this.httpClient.post<void>(`${this.userCardReadUrl}/${card.uid}`, null, {observe: 'response'});
    }

    fetchLoggingResults(filters: Map<string, string[]>): Observable<Page<LineOfLoggingResult>> {
        return this.fetchArchivedCards(filters).pipe(
            map((page: Page<LightCard>) => {
                const cards = page.content;
                const lines = cards.map((card: LightCard) => {
                    const i18nPrefix = `${card.process}.${card.processVersion}.`;
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
        return {...initialI18n, key: i18nPrefix + initialI18n.key} as I18n;
    }

    fetchMonitoringResults(filters: Map<string, string[]>): Observable<Page<LineOfMonitoringResult>> {
        return null;
    }
}
