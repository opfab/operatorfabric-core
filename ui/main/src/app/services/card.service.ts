/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {CardOperation} from '@ofModel/card-operation.model';
import {EventSourcePolyfill} from 'ng-event-source';
import {AuthenticationService} from './authentication.service';
import {Card} from "@ofModel/card.model";
import {HttpClient} from "@angular/common/http";
import {environment} from "@env/environment";
import {GuidService} from "@ofServices/guid.service";

@Injectable()
export class CardService {
    readonly cardOperationsUrl: string;
    readonly cardsUrl: string;

    constructor(private httpClient:HttpClient, private authenticationService: AuthenticationService,private guidService: GuidService) {
        const clientId = this.guidService.getCurrentGuidString();
        this.cardOperationsUrl = `${environment.urls.cards}/cardSubscription?clientId=${clientId}&notification=true`;
        this.cardsUrl = `${environment.urls.cards}/cards`;
    }

    loadCard(id: string): Observable<Card> {
        return this.httpClient.get<Card>(`${this.cardsUrl}/${id}`);
    }

    getCardOperation(): Observable<CardOperation> {
        let now = new Date()
        let plusTwentyFourHour = new Date(now.valueOf()+24*60*60*1000);
        return this.fetchCardOperation(new EventSourcePolyfill(
            `${this.cardOperationsUrl}&rangeStart=${now.valueOf()}&rangeEnd=${plusTwentyFourHour.valueOf()}`
            , this.handleHeaders()));
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

// sse request not intercepted by core/services/interceptors.services/TokenInjector
    private handleHeaders() {
        return {headers: this.authenticationService.getSecurityHeader(),
            heartbeatTimeout: 600000}
            ;
    }
}
