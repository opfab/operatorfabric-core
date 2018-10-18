/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Injectable} from '@angular/core';
import {Actions, Effect} from '@ngrx/effects';
import {Action} from '@ngrx/store';
import {Observable, of} from 'rxjs';
import {CardActionTypes, LoadCard, LoadCardFail, LoadCardsFail, LoadCardsSuccess, LoadCardSuccess} from '@state/card/card.actions';
import {catchError, map, switchMap} from 'rxjs/operators';
import {CardService} from '@core/services/card.service';
import {Card} from '@state/card/card.model';


@Injectable()
export class CardEffects {

  constructor(private actions$: Actions,
              private service: CardService,
              // private store: Store<AppState>
  ) {
  }

  @Effect()
  load: Observable<Action> = this.actions$
    .ofType(CardActionTypes.LoadCards).pipe(
      switchMap(() => this.service.getCards()),
      map((cards: Card[]) => new LoadCardsSuccess({cards: cards})),
      catchError(err => of(new LoadCardsFail()))
    );

  @Effect()
  loadById: Observable<Action> = this.actions$
    .ofType<LoadCard>(CardActionTypes.LoadCard).pipe(
      switchMap(action => this.service.getCard(action.payload.id)),
      map((card: Card) => new LoadCardSuccess({card: card})),
      catchError(err => of(new LoadCardFail()))
    );
}
