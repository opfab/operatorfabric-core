/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {CardOperation} from '@state/card-operation/card-operation.model';
import {LightCard} from '@state/light-card/light-card.model';
import {EventSourcePolyfill} from 'ng-event-source';
import {AuthenticationService} from '@core/services/authentication.service';

@Injectable()
export class CardService {
    // TODO other end point or manage different source of cards...
    private cardOperationsUrl = '/cards/cardOperations?clientId=clientIdPassword&test=true';
    private cardsUrl = '/cards/cards';

    constructor(private httpClient: HttpClient,
                private authenticationService: AuthenticationService) {
    }

    // TODO paginate
    getLightCards(): Observable<Array<LightCard>> {

        return this.httpClient.get <LightCard[]>(this.cardsUrl);
    }

    getLightCard(id: string): Observable<LightCard> {
        return this.getLightCards().pipe(
            map(lightCards => lightCards.find(
                lightCard => lightCard.id === id))
        );
    }

    testCardOperation(): Observable<CardOperation> {
        return Observable.create(observer => {
            const eventSource = new EventSourcePolyfill(
                this.cardOperationsUrl
                , this.handleHeaders());
            eventSource.onmessage = message => {
                if (!message) {
                    return observer.error(message);
                }
                return observer.next(JSON.parse(message.data));
            };
            eventSource.onerror = error => observer.error(error);
            return () => {
                eventSource.close();
            };
        });
    }

    private handleHeaders() {
        return {
            headers:
                {'Authorization': `Bearer ${this.authenticationService.extractToken()}`}
        };
    }
}
