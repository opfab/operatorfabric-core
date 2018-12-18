/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {CardOperation} from '@ofModel/card-operation.model';
import {LightCard} from '@ofModel/light-card.model';
import {EventSourcePolyfill} from 'ng-event-source';
import {AuthenticationService} from '@core/services/authentication.service';

@Injectable()
export class CardService {
    // TODO create a unique clientId
    private cardOperationsUrl = '/cards/cardOperations?clientId=toBeUniqueSoon&notification=true';
    private cardsUrl = '/cards/cards';

    constructor(private httpClient: HttpClient,
                private authenticationService: AuthenticationService) {
    }

    // TODO paginate
    // Never called yet
    getLightCards(): Observable<Array<LightCard>> {

        return this.httpClient.get <LightCard[]>(this.cardsUrl);
    }

    // Never called yet
    getLightCard(id: string): Observable<LightCard> {
        return this.getLightCards().pipe(
            map(lightCards => lightCards.find(
                lightCard => lightCard.id === id))
        );
    }

    getCardOperation(): Observable<CardOperation> {
        return Observable.create(observer => {
            let eventSource = null;
            try {
                eventSource = new EventSourcePolyfill(
                    this.cardOperationsUrl
                    , this.handleHeaders());
                eventSource.onmessage = message => {
                    if (!message) {
                        return observer.error(message);
                    }
                    return observer.next(JSON.parse(message.data));
                };
                eventSource.onerror = error => observer.error(error);

            } catch (error) {
                observer.error(error);
            }
                return () => {
                    if (eventSource) {
                        eventSource.close();
                    }
                };

        });
    }
// sse request not intercept by core/services/interceptors.services/TokenInjector
    private handleHeaders() {
        return {
            headers:
                {'Authorization': `Bearer ${this.authenticationService.extractToken()}`}
        };
    }
}
