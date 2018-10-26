/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {CardOperation} from "@state/card-operation/card-operation.model";
import {Card} from "@state/card/card.model";
import {EventSourcePolyfill} from "ng-event-source";
import {AuthenticationService} from "@core/services/authentication.service";

@Injectable()
export class CardService {
  // TODO other end point or manage different source of cards...
  private cardOperationsUrl = '/cards/cardOperations?clientId=test-2018&test=true';
  private cardsUrl = '/cards/cards';

  constructor(private httpClient: HttpClient,
              private authenticationService: AuthenticationService) {}

  // TODO paginate
  getCards(): Observable<Array<Card>> {

    return this.httpClient.get <Card[]>(this.cardsUrl);
  }

  getCard(id: string): Observable<Card> {
    return this.getCards().pipe(
      map(cards => cards.find(
        card => card.id === id))
    );
  }

  getCardOperations(): Observable<CardOperation[]> {
    return Observable.create(observer => {
      const eventSource = new EventSourcePolyfill(
        this.cardOperationsUrl
        , this.handleHeaders());
      eventSource.onmessage = message =>{
        const cardOperation =new CardOperation(message.data);
        return observer.next(cardOperation)
      };
      eventSource.onerror = error => observer.error(error);
      return () => {
        eventSource.close();
      };
    });
  }

  testCardOperation():Observable<CardOperation>{
    return Observable.create(observer => {
      const eventSource = new EventSourcePolyfill(
        this.cardOperationsUrl
        , this.handleHeaders());
      eventSource.onmessage = message => {
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
