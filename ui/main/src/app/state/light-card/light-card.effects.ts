/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable} from '@angular/core';
import {Actions, Effect} from '@ngrx/effects';
import {Action, select, Store} from '@ngrx/store';
import {Observable, of} from 'rxjs';
import {
    LightCardActionTypes,
    LoadLightCard,
    LoadLightCardFail,
    LoadLightCardsFail,
    LoadLightCardsSuccess,
    LoadLightCardSuccess
} from '@state/light-card/light-card.actions';
import {catchError, map, switchMap} from 'rxjs/operators';
import {CardService} from '@core/services/card.service';
import {LightCard} from '@state/light-card/light-card.model';
import {AppState} from '@state/app.interface';
import * as fromStore from '@state/light-card/index';


@Injectable()
export class LightCardEffects {

    constructor(private actions$: Actions,
                private service: CardService
    ) {
    }

    @Effect()
    load: Observable<Action> = this.actions$
        .ofType(LightCardActionTypes.LoadLightCards).pipe(
            switchMap(() => this.service.getLightCards()),
            map((lightCards: LightCard[]) => {
                return new LoadLightCardsSuccess({lightCards: lightCards});
            }),
            catchError(err => of(new LoadLightCardsFail()))
        );

    @Effect()
    loadById: Observable<Action> = this.actions$
        .ofType<LoadLightCard>(LightCardActionTypes.LoadLightCard).pipe(
            switchMap(action => this.service.getLightCard(action.payload.id)),
            map((lightCard: LightCard) => {
                return new LoadLightCardSuccess({lightCard: lightCard});
            }),
            catchError(err => of(new LoadLightCardFail()))
        );
}
