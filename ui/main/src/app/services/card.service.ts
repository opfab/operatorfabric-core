/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
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
import {Card, CardData, CardForPublishing} from '@ofModel/card.model';
import {HttpClient, HttpParams, HttpResponse} from '@angular/common/http';
import {environment} from '@env/environment';
import {GuidService} from '@ofServices/guid.service';
import {LightCard} from '@ofModel/light-card.model';
import {Page} from '@ofModel/page.model';
import {AppState} from '@ofStore/index';
import {Store} from '@ngrx/store';
import {CardSubscriptionClosed, CardSubscriptionOpen} from '@ofActions/cards-subscription.actions';
import {catchError, takeUntil} from 'rxjs/operators';
import {RemoveLightCard} from '@ofActions/light-card.actions';
import {BusinessConfigChangeAction} from '@ofStore/actions/processes.actions';
import {UserConfigChangeAction} from '@ofStore/actions/user.actions';
import {LightCardsStoreService} from './lightcards/lightcards-store.service';
import {LoadCard} from '@ofStore/actions/card.actions';
import {I18n} from '@ofModel/i18n.model';
import {FilterService} from '@ofServices/lightcards/filter.service';
import {LogOption, OpfabLoggerService} from './logs/opfab-logger.service';


@Injectable({
    providedIn: 'root'
})
export class CardService {

    private static TWO_MINUTES = 120000;

    readonly cardOperationsUrl: string;
    readonly cardsUrl: string;
    readonly archivesUrl: string;
    readonly cardsPubUrl: string;
    readonly userCardReadUrl: string;
    readonly userCardUrl: string;
    private lastHeardBeatDate = 0;
    private firstSubscriptionInitDone = false;
    public initSubscription = new Subject<void>();
    private unsubscribe$: Subject<void> = new Subject<void>();

    private startOfAlreadyLoadedPeriod: number;
    private endOfAlreadyLoadedPeriod: number;


    private selectedCardId: string = null;

    private receivedAcksSubject = new Subject<{cardUid: string, cardId: string, entitiesAcks: string[]}>();
    private receivedDisconnectedSubject = new Subject<boolean>();

    constructor(private httpClient: HttpClient,
                private guidService: GuidService,
                private store: Store<AppState>,
                private authService: AuthenticationService,
                private lightCardsStoreService: LightCardsStoreService,
                private filterService: FilterService,
                private logger: OpfabLoggerService) {
        const clientId = this.guidService.getCurrentGuidString();
        this.cardOperationsUrl = `${environment.urls.cards}/cardSubscription?clientId=${clientId}`;
        this.cardsUrl = `${environment.urls.cards}/cards`;
        this.archivesUrl = `${environment.urls.cards}/archives`;
        this.cardsPubUrl = `${environment.urls.cardspub}/cards`;
        this.userCardReadUrl = `${environment.urls.cardspub}/cards/userCardRead`;
        this.userCardUrl = `${environment.urls.cardspub}/cards/userCard`;
        this.checkHeartBeatReceive();
    }

    loadCard(id: string): Observable<CardData> {
        return this.httpClient.get<CardData>(`${this.cardsUrl}/${id}`);
    }

    public setSelectedCard(cardId) {
        this.selectedCardId = cardId;
    }


    public initCardSubscription() {

        this.getCardSubscription()
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe( {
                next: operation => {
                    switch (operation.type) {
                        case CardOperationType.ADD:
                            this.logger.info('CardService - Receive card to add id='
                            + operation.card.id
                            + 'with date='
                            + new Date(operation.card.publishDate).toISOString()
                            , LogOption.LOCAL_AND_REMOTE);
                            this.lightCardsStoreService.addOrUpdateLightCard(operation.card);
                            if (operation.card.id === this.selectedCardId) this.store.dispatch(new LoadCard({id: operation.card.id}));
                            break;
                        case CardOperationType.DELETE:
                            this.logger.info(`CardService - Receive card to delete id=` + operation.cardId, LogOption.LOCAL_AND_REMOTE);
                            this.lightCardsStoreService.removeLightCard(operation.cardId);
                            if (operation.cardId === this.selectedCardId) this.store.dispatch(new RemoveLightCard({card: operation.cardId}));
                            break;
                        case CardOperationType.ACK:
                            this.logger.info('CardService - Receive ack on card uid=' + operation.cardUid +
                                ', id=' + operation.cardId, LogOption.LOCAL_AND_REMOTE);
                            this.lightCardsStoreService.addEntitiesAcksForLightCard(operation.cardId, operation.entitiesAcks);
                            this.receivedAcksSubject.next({cardUid: operation.cardUid, cardId: operation.cardId, entitiesAcks: operation.entitiesAcks});
                            break;
                        default:
                            this.logger.info(`CardService - Unknown operation ` + operation.type + ` for card id=` + operation.cardId, LogOption.LOCAL_AND_REMOTE);
                    }
                },
                error: (error) => {
                    console.error('CardService - Error received from  getCardSubscription ', error);
                }
            });
        catchError((error, caught) => {
            console.error('CardService - Global  error in subscription ', error);
            return caught;
        });
        this.listenForFilterChange();
    }

    private listenForFilterChange() {
        this.filterService.getBusinessDateFilterChanges().subscribe((filter) => {
            this.setSubscriptionDates(filter.status.start, filter.status.end);
        });
    }


    public closeSubscription() {
        this.logger.info('Closing subscription', LogOption.LOCAL_AND_REMOTE);
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
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
                // if necessary, we can set here heartbeatTimeout: xxx (in ms)
            });
        return new Observable(observer => {
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
                            if (this.firstSubscriptionInitDone) {
                                this.recoverAnyLostCardWhenConnectionHasBeenReset();
                                // process or user config may have change during connection loss
                                // so reload both configuration
                                this.store.dispatch(new BusinessConfigChangeAction());
                                this.store.dispatch(new UserConfigChangeAction());
                            } else {
                                this.firstSubscriptionInitDone = true;
                                this.lastHeardBeatDate = new Date().valueOf();
                            }
                            break;
                        case 'HEARTBEAT':
                            this.lastHeardBeatDate = new Date().valueOf();
                            this.logger.info( `CardService - HEARTBEAT received - Connection alive `, LogOption.LOCAL);
                            break;
                        case 'BUSINESS_CONFIG_CHANGE':
                            this.store.dispatch(new BusinessConfigChangeAction());
                            this.logger.info(`CardService - BUSINESS_CONFIG_CHANGE received`);
                            break;
                        case 'USER_CONFIG_CHANGE':
                            this.store.dispatch(new UserConfigChangeAction());
                            this.logger.info(`CardService - USER_CONFIG_CHANGE received`);
                            break;
                        case 'DISCONNECT_USER_DUE_TO_NEW_CONNECTION':
                            this.logger.info("CardService - Disconnecting user because a new connection is being opened for this account")
                            this.closeSubscription();
                            this.receivedDisconnectedSubject.next(true);
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

    private checkHeartBeatReceive() {
        setInterval(() => {
            this.logger.info('Last heart beat received ' +
                (new Date().valueOf() - this.lastHeardBeatDate) +
                'ms ago', LogOption.LOCAL_AND_REMOTE);
        }
            , 60000);
    }

    private recoverAnyLostCardWhenConnectionHasBeenReset() {

        // Subtracts two minutes from the last heart beat to avoid loosing card due to latency, buffering and not synchronized clock
        const dateForRecovering = this.lastHeardBeatDate - CardService.TWO_MINUTES;
        this.logger.info( `CardService - Card subscription has been init again , recover any lost card from date `
            + new Date(dateForRecovering), LogOption.LOCAL_AND_REMOTE);
        this.httpClient.post<any>(
            `${this.cardOperationsUrl}`,
            {publishFrom: dateForRecovering}).subscribe();
    }

    public removeAllLightCardFromMemory() {
        this.startOfAlreadyLoadedPeriod = null;
        this.lightCardsStoreService.removeAllLightCards();
    }

    private setSubscriptionDates(start: number, end: number) {
        this.logger.info( 'CardService - Set subscription date' + new Date(start) + ' -' +  new Date(end), LogOption.LOCAL_AND_REMOTE);
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
        this.logger.info('CardService - Card already loaded for the chosen period', LogOption.LOCAL_AND_REMOTE);
    }

    private askCardsForPeriod(start: number, end: number) {
        this.logger.info('CardService - Need to load card for period ' + new Date(start) + ' -' + new Date(end),
            LogOption.LOCAL_AND_REMOTE);
        this.httpClient.post<any>(
            `${this.cardOperationsUrl}`,
            { rangeStart: start, rangeEnd: end }).subscribe(result => {
                if ((!this.startOfAlreadyLoadedPeriod) || (start < this.startOfAlreadyLoadedPeriod))
                    this.startOfAlreadyLoadedPeriod = start;
                if ((!this.endOfAlreadyLoadedPeriod) || (end > this.endOfAlreadyLoadedPeriod)) this.endOfAlreadyLoadedPeriod = end;

            });

    }

    loadArchivedCard(id: string): Observable<CardData> {
        return this.httpClient.get<CardData>(`${this.archivesUrl}/${id}`);
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

    postTranslateCardField(processId: string, processVersion: string, i18nValue: I18n): any {
        const fieldToTranslate = {process: processId, processVersion: processVersion, i18nValue: i18nValue};
        return this.httpClient.post<any>(`${this.cardsPubUrl}/translateCardField`, fieldToTranslate, {observe: 'response'});
    }

    getReceivedAcks(): Observable<{cardUid: string, cardId: string, entitiesAcks: string[]}> {
        return this.receivedAcksSubject.asObservable();
    }

    getReceivedDisconnectUser(): Observable<boolean> {
        return this.receivedDisconnectedSubject.asObservable();
    }

}
