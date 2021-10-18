/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {Action, Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {catchError, map, switchMap} from 'rxjs/operators';
import {CardService} from '@ofServices/card.service';
import {AppState} from '@ofStore/index';
import {
    CardActionTypes,
    ClearCard,
    LoadCard,
    LoadCardFailure,
    LoadCardSuccess
} from '@ofActions/card.actions';
import {ClearLightCardSelection, LightCardActionTypes} from '@ofStore/actions/light-card.actions';


@Injectable()
export class CardEffects {


    constructor(private store: Store<AppState>,
                private actions$: Actions,
                private service: CardService) {}

    
    loadById: Observable<Action> = createEffect(() => this.actions$.pipe(
        ofType<LoadCard>(CardActionTypes.LoadCard),
        switchMap(action => this.service.loadCard(action.payload.id)),
        map(cardData => new LoadCardSuccess({card: cardData.card, childCards: cardData.childCards})),
        catchError((err, caught) => {
            this.store.dispatch(new LoadCardFailure(err));
            return caught;
        })
    ));

    
    clearCardSelection: Observable<Action> = createEffect(() => this.actions$.pipe(
        ofType<ClearLightCardSelection>(LightCardActionTypes.ClearLightCardSelection),
        map(() => {
            this.service.setSelectedCard(null);
            return new ClearCard();
        })
    ));
}
