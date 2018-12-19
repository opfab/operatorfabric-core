/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Action, Store} from '@ngrx/store';
import {Observable, of} from 'rxjs';
import {
    LightCardActionTypes,
    LoadLightCard,
    LoadLightCardFailure,
    LoadLightCardsFailure,
    LoadLightCardsSuccess,
    LoadLightCardSuccess
} from '@ofActions/light-card.actions';
import {catchError, map, switchMap} from 'rxjs/operators';
import {CardService} from '@ofServices/card.service';
import {LightCard} from '@ofModel/light-card.model';
import {AppState} from "@ofStore/index";

// those effects are unused for the moment
@Injectable()
export class LightCardEffects {

    constructor(private actions$: Actions,
                private store: Store<AppState>,
                private service: CardService
    ) {
    }

    @Effect()
    load: Observable<Action> = this.actions$
        .pipe(
            ofType(LightCardActionTypes.LoadLightCards),
            switchMap(() => this.service.getLightCards()),
            map((lightCards: LightCard[]) => {
                return new LoadLightCardsSuccess({lightCards: lightCards});
            }),
            catchError((err, caught) => {
                    this.store.dispatch(new LoadLightCardsFailure(err));
                    return caught;

                }
            ));

    @Effect()
    loadById: Observable<Action> = this.actions$
        .pipe(
            ofType<LoadLightCard>(LightCardActionTypes.LoadLightCard),
            switchMap(action => this.service.getLightCard(action.payload.id)),
            map((lightCard: LightCard) => {
                return new LoadLightCardSuccess({lightCard: lightCard});
            }),
            catchError((err, caught) => {
                this.store.dispatch(new LoadLightCardFailure(err));
                return caught;
            })
        );
}
