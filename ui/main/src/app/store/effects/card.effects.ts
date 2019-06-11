 /* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Action, Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {catchError, map, switchMap} from 'rxjs/operators';
import {CardService} from '@ofServices/card.service';
import {AppState} from "@ofStore/index";
import {CardActionTypes, LoadCard, LoadCardFailure, LoadCardSuccess} from "@ofActions/card.actions";
import {Card} from "@ofModel/card.model";

// those effects are unused for the moment
@Injectable()
export class CardEffects {

    /* istanbul ignore next */
    constructor(private store: Store<AppState>,
                private actions$: Actions,
                private service: CardService
    ) {
    }

    @Effect()
    loadById: Observable<Action> = this.actions$
        .pipe(
            ofType<LoadCard>(CardActionTypes.LoadCard),
            switchMap(action => this.service.loadCard(action.payload.id)),
            map((card: Card) => {
                return new LoadCardSuccess({card: card});
            }),
            catchError((err, caught) => {
                this.store.dispatch(new LoadCardFailure(err));
                return caught;
            })
        );
}
