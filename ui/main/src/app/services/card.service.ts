/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {CardOperation} from '@ofModel/card-operation.model';
import {EventSourcePolyfill} from 'ng-event-source';
import {AuthenticationService} from './authentication.service';
import {Card} from "@ofModel/card.model";
import {HttpClient} from "@angular/common/http";
import {environment} from "@env/environment";
import {GuidService} from "@ofServices/guid.service";

@Injectable()
export class CardService {
    readonly unsubscribe$ = new Subject<void>();
    readonly cardOperationsUrl: string;
    readonly cardsUrl: string;

    constructor(private httpClient:HttpClient, private authenticationService: AuthenticationService,private guidService: GuidService) {
        const clientId = this.guidService.getCurrentGuidString();
        this.cardOperationsUrl = `${environment.urls.cards}/cardSubscription?clientId=${clientId}`;
        this.cardsUrl = `${environment.urls.cards}/cards`;
    }

    loadCard(id: string): Observable<Card> {
        return this.httpClient.get<Card>(`${this.cardsUrl}/${id}`);
    }

    getCardOperation(): Observable<CardOperation> {
        let minus2Hour = new Date(new Date().valueOf()-2*60*60*1000);
        let plus48Hours = new Date(minus2Hour.valueOf()+48*60*60*1000);
        //security header needed here as SSE request are not intercepted by our header interceptor
        return this.fetchCardOperation(new EventSourcePolyfill(
            `${this.cardOperationsUrl}&notification=true&rangeStart=${minus2Hour.valueOf()}&rangeEnd=${plus48Hours.valueOf()}`
            , {headers: AuthenticationService.getSecurityHeader(),
                heartbeatTimeout: 600000}));
    }

    unsubscribeCardOperation(){
        this.unsubscribe$.next();
    }

    fetchCardOperation(eventSource: EventSourcePolyfill): Observable<CardOperation> {
        return Observable.create(observer => {
            try {
                eventSource.onmessage = message => {
                    if (!message) {
                        return observer.error(message);
                    }
                    return observer.next(JSON.parse(message.data));
                };
                eventSource.onerror = error => {
                    console.error(`error occured from ES: ${error.toString()}`)
                }

            } catch (error) {
                return observer.error(error);
            }
            return () => {
                if (eventSource && eventSource.readyState !== eventSource.CLOSED) {
                    eventSource.close();
                }
            };
        })
    }

    public updateCardSubscriptionWithDates(rangeStart:number,rangeEnd:number):Observable<any>{
        return this.httpClient.post<any>(
            `${this.cardOperationsUrl}`,
            {rangeStart:rangeStart,rangeEnd: rangeEnd});
    }
}
