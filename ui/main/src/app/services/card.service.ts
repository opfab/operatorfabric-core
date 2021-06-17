/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {Injectable} from '@angular/core';
import {Observable, Subject, timer} from 'rxjs';
import {CardOperation, CardOperationType} from '@ofModel/card-operation.model';
import {EventSourcePolyfill} from 'ng-event-source';
import {AuthenticationService} from './authentication/authentication.service';
import {Card, CardData, CardForPublishing} from '@ofModel/card.model';
import {HttpClient, HttpParams, HttpResponse} from '@angular/common/http';
import {environment} from '@env/environment';
import {GuidService} from '@ofServices/guid.service';
import {LightCard} from '@ofModel/light-card.model';
import {Page} from '@ofModel/page.model';
import {AppState} from '@ofStore/index';
import {Store} from '@ngrx/store';
import {CardSubscriptionClosed, CardSubscriptionOpen} from '@ofActions/cards-subscription.actions';
import {catchError, concatMap, ignoreElements,startWith} from 'rxjs/operators';
import {
    AddLightCardFailure,
    LoadLightCard,
    RemoveLightCard
} from '@ofActions/light-card.actions';
import {BusinessConfigChangeAction} from '@ofStore/actions/processes.actions';
import {UserConfigChangeAction} from '@ofStore/actions/user.actions';


@Injectable()
export class CardService {

    private static TWO_MINUTES = 120000;

    readonly cardOperationsUrl: string;
    readonly cardsUrl: string;
    readonly archivesUrl: string;
    readonly cardsPubUrl: string;
    readonly userCardReadUrl: string;
    readonly userCardUrl: string;
    private lastHeardBeatDate: number;
    private firstSubscriptionInitDone = false;
    public initSubscription = new Subject<void>();

    private startOfAlreadyLoadedPeriod: number;
    private endOfAlreadyLoadedPeriod: number;


    constructor(private httpClient: HttpClient,
        private guidService: GuidService,
        private store: Store<AppState>,
        private authService: AuthenticationService) {

        const clientId = this.guidService.getCurrentGuidString();
        this.cardOperationsUrl = `${environment.urls.cards}/cardSubscription?clientId=${clientId}`;
        this.cardsUrl = `${environment.urls.cards}/cards`;
        this.archivesUrl = `${environment.urls.cards}/archives`;
        this.cardsPubUrl = `${environment.urls.cardspub}/cards`;
        this.userCardReadUrl = `${environment.urls.cardspub}/cards/userCardRead`;
        this.userCardUrl = `${environment.urls.cardspub}/cards/userCard`;
    }

    loadCard(id: string): Observable<CardData> {
        return this.httpClient.get<CardData>(`${this.cardsUrl}/${id}`);
    }


    public initCardSubscription() {

        // The use of concatMap + timer is to avoid having the browser stuck when 
        // a lot of card is arriving. (It allows the browser to execute 
        // other js code in the application while the application is retrieving cards) 
        this.getCardSubscription().pipe( concatMap(value =>
            timer(1).pipe(
              ignoreElements(),
              startWith(value)
            )
          ))
            .subscribe(
                operation => {
                    switch (operation.type) {
                        case CardOperationType.ADD:
                            console.log(new Date().toISOString(), `CardService - Receive card to add id=`, operation.card.id);
                            this.store.dispatch(new LoadLightCard({lightCard: operation.card}));
                            break;
                        case CardOperationType.DELETE:
                            console.log(new Date().toISOString(), `CardService - Receive card to delete id=`, operation.cardId);
                            this.store.dispatch(new RemoveLightCard({card: operation.cardId}));
                            break;
                        default:
                            this.store.dispatch(new AddLightCardFailure(
                                {error: new Error(`unhandled action type '${operation.type}'`)})
                            );
                    }
                }, (error) => {
                    console.error('CardService - Error received from  getCardSubscription ', error);
                    this.store.dispatch(new AddLightCardFailure({error: error}));
                }
            );
        catchError((error, caught) => {
            console.error('CardService - Global  error in subscription ', error);
            return caught;
        });
    }


    private getCardSubscription(): Observable<CardOperation> {
        // security header needed here as SSE request are not intercepted by our header interceptor
        let securityHeader;
        if (!this.authService.isAuthModeNone()) {
            securityHeader = this.authService.getSecurityHeader();
        }
        const eventSource = new EventSourcePolyfill(
            `${this.cardOperationsUrl}&notification=true`
            , {
                headers: securityHeader,
                // if necessary , we cans set here  heartbeatTimeout: xxx (in ms)
            });
        return Observable.create(observer => {
            try {
                eventSource.onmessage = message => {
                    if (!message) {
                        return observer.error(message);
                    }
                    switch (message.data) {
                        case 'INIT':
                            console.log(new Date().toISOString(), `CardService - Card subscription initialized`);
                            this.initSubscription.next();
                            this.initSubscription.complete();
                            if (this.firstSubscriptionInitDone) this.recoverAnyLostCardWhenConnectionHasBeenReset();
                            else this.firstSubscriptionInitDone = true;
                            break;
                        case 'HEARTBEAT':
                            this.lastHeardBeatDate = new Date().valueOf();
                            console.log(new Date().toISOString(), `CardService - HEARTBEAT received - Connection alive `);
                            break;
                        case 'RESTORE':
                            console.log(new Date().toISOString(), `CardService - Subscription restored with server`);
                            break;
                        case 'BUSINESS_CONFIG_CHANGE':
                            this.store.dispatch(new BusinessConfigChangeAction());
                            console.log(new Date().toISOString(), `CardService - BUSINESS_CONFIG_CHANGE received`);
                            break;
                        case 'USER_CONFIG_CHANGE':
                                this.store.dispatch(new UserConfigChangeAction());
                                console.log(new Date().toISOString(), `CardService - USER_CONFIG_CHANGE received`);
                                break;
                        default :
                            return observer.next(JSON.parse(message.data, CardOperation.convertTypeIntoEnum));
                    }
                };
                eventSource.onerror = error => {
                    this.store.dispatch(new CardSubscriptionClosed());
                    console.error(new Date().toISOString(), 'CardService - Error event in card subscription:', error);
                };
                eventSource.onopen = open => {
                    this.store.dispatch(new CardSubscriptionOpen());
                    console.log(new Date().toISOString(), `CardService- Open card subscription`);
                };

            } catch (error) {
                console.error(new Date().toISOString(), 'CardService - Error in interpreting message from subscription', error);
                return observer.error(error);
            }
            return () => {
                if (eventSource && eventSource.readyState !== eventSource.CLOSED) {
                    eventSource.close();
                }
            };
        });
    }


    private recoverAnyLostCardWhenConnectionHasBeenReset() {

        // Subtracts two minutes from the last heard beat to avoid loosing card due to latency, buffering and not synchronized clock
        const dateForRecovering = this.lastHeardBeatDate - CardService.TWO_MINUTES;

        console.log(new Date().toISOString(), `CardService - Card subscription has been init again , recover any lost card from date `
            + new Date(dateForRecovering));
        this.httpClient.post<any>(
            `${this.cardOperationsUrl}`,
            {publishFrom: dateForRecovering}).subscribe();

    }

    public resetStartOfAlreadyLoadedPeriod() {
        this.startOfAlreadyLoadedPeriod = null;
    }

    public setSubscriptionDates(start: number, end: number) {
        console.log(new Date().toISOString(), 'CardService - Set subscription date', new Date(start), ' -', new Date(end));
        if (!this.startOfAlreadyLoadedPeriod) { // First loading , no card loaded yet
            this.askCardsForPeriod(start, end);
            return;
        }
        if ((start < this.startOfAlreadyLoadedPeriod) && (end > this.endOfAlreadyLoadedPeriod)) {
            this.askCardsForPeriod(start, end);
            return;
        }
        if (start < this.startOfAlreadyLoadedPeriod) {
            this.askCardsForPeriod(start, this.startOfAlreadyLoadedPeriod);
            return;
        }
        if (end > this.endOfAlreadyLoadedPeriod) {
            this.askCardsForPeriod(this.endOfAlreadyLoadedPeriod, end);
            return;
        }
        console.log(new Date().toISOString(), 'CardService - Card already loaded for the chosen period');
    }

    private askCardsForPeriod(start: number, end: number) {
        console.log(new Date().toISOString(), 'CardService - Need to load card for period '
            , new Date(start), ' -', new Date(end));
        this.httpClient.post<any>(
            `${this.cardOperationsUrl}`,
            { rangeStart: start, rangeEnd: end }).subscribe(result => {
                if ((!this.startOfAlreadyLoadedPeriod) || (start < this.startOfAlreadyLoadedPeriod))
                    this.startOfAlreadyLoadedPeriod = start;
                if ((!this.endOfAlreadyLoadedPeriod) || (end > this.endOfAlreadyLoadedPeriod)) this.endOfAlreadyLoadedPeriod = end;

            });

    }

    loadArchivedCard(id: string): Observable<Card> {
        return this.httpClient.get<Card>(`${this.archivesUrl}/${id}`);
    }

    fetchArchivedCards(filters: Map<string, string[]>): Observable<Page<LightCard>> {
        const params = this.convertFiltersIntoHttpParams(filters);
        return this.httpClient.get<Page<LightCard>>(`${this.archivesUrl}/`, {params});
    }

    convertFiltersIntoHttpParams(filters: Map<string, string[]>): HttpParams {
        let params = new HttpParams();
        filters.forEach((values, key) => values.forEach(value => params = params.append(key, value)));
        return params;
    }

    postCard(card: CardForPublishing): any {
        return this.httpClient.post<CardForPublishing>(`${this.cardsPubUrl}/userCard`, card, {observe: 'response'});
    }

    deleteCard(card: Card): Observable<HttpResponse<void>> {
        return this.httpClient.delete<void>(`${this.userCardUrl}/${card.id}`, {observe: 'response'});
    }

    postUserCardRead(cardUid: string): Observable<HttpResponse<void>> {
        return this.httpClient.post<void>(`${this.userCardReadUrl}/${cardUid}`, null, {observe: 'response'});
    }

    deleteUserCardRead(cardUid: string): Observable<HttpResponse<void>> {
        return this.httpClient.delete<void>(`${this.userCardReadUrl}/${cardUid}`, {observe: 'response'});
    }


}
