/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Injectable} from '@angular/core';
import {Actions, Effect} from '@ngrx/effects';
import {CardService} from "@core/services/card.service";
import {Observable, of} from "rxjs";
import {Action} from "@ngrx/store";
import {
  CardOperationActionTypes,
  LoadCardOperationsFail,
  LoadCardOperationsSuccess
} from "@state/card-operation/card-operation.actions";
import {catchError, map, switchMap} from "rxjs/operators";
import {CardOperation, CardOperationType} from "@state/card-operation/card-operation.model";
import {AddCard, AddCardFailure} from "@state/card/card.actions";
import {Card} from '@state/card/card.model';

@Injectable()
export class CardOperationEffects {

  constructor(private actions$: Actions
  , private service: CardService) {}

  @Effect()
  load: Observable<Action> = this.actions$
    .ofType(CardOperationActionTypes.LoadCardOperations)
    .pipe(
      switchMap(()=> this.service.getCardOperations()),
      map((operations: CardOperation[])=>
        new LoadCardOperationsSuccess({cardOperations:operations})),
      catchError(err => of(new LoadCardOperationsFail()))

    );
  @Effect()
  testTruc = this.service.testCardOperation().pipe(

    map((operation:CardOperation) => {
      if(operation.type === CardOperationType.ADD){
        const cardF= operation.cards[0];
        const card = new Card(cardF.id
          ,cardF.startDate,cardF.endDate,cardF.severity,cardF.ittd,cardF.processId,
          cardF.media, cardF.tags );
        return new AddCard({card: card});
      }
      return new AddCardFailure({error: new Error(`unhandled action type '${operation.type}'`)});
    }),
    catchError(error => of(new AddCardFailure(error))

    )
  );
}
