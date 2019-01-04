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

@Injectable()
export class CardService {
    readonly cardOperationsUrl: string;

    constructor(private httpClient: HttpClient,
                private authenticationService: AuthenticationService) {
    }

    loadCard(id: string): Observable<Card> {
        return this.httpClient.get<Card>(`${this.cardsUrl}/${id}`);
    }

    getCardOperation(): Observable<CardOperation> {
        return this.fetchCardOperation(new EventSourcePolyfill(
            this.cardOperationsUrl
            , this.handleHeaders()));
    }

    fetchCardOperation(eventSource: EventSourcePolyfill): Observable<CardOperation> {
        let now = new Date()
        let plusTwentyFourHour = new Date(now.valueOf()+24*60*60*1000);
        return Observable.create(observer => {
            try {
                eventSource = new EventSourcePolyfill(
                    `${this.cardOperationsUrl}&rangeStart=${now.valueOf()}&rangeEnd=${plusTwentyFourHour.valueOf()}`
                    , this.handleHeaders());
                eventSource.onmessage = message => {
                    if (!message) {
                        return observer.error(message);
                    }
                    return observer.next(JSON.parse(message.data));
                };
                eventSource.onerror = error => observer.error(error);

            } catch (error) {
                return observer.error(error);
            }
            return () => {
                if (eventSource) {
                    eventSource.close();
                }
            };
        })
    }

// sse request not intercepted by core/services/interceptors.services/TokenInjector
    private handleHeaders() {
        return {headers: this.authenticationService.getSecurityHeader()}
            ;
    }
}
