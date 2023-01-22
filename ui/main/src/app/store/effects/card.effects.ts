/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
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
    ClearCardAction,
    LoadCardAction,
    LoadCardFailureAction,
    LoadCardSuccessAction
} from '@ofActions/card.actions';
import {ClearLightCardSelectionAction, LightCardActionTypes} from '@ofStore/actions/light-card.actions';
import {LightCardsStoreService} from '@ofServices/lightcards/lightcards-store.service';

@Injectable()
export class CardEffects {
    constructor(private store: Store<AppState>, private actions$: Actions, private service: CardService,private lightCardsStoreService: LightCardsStoreService) {}

    loadById: Observable<Action> = createEffect(() =>
        this.actions$.pipe(
            ofType<LoadCardAction>(CardActionTypes.LoadCard),
            switchMap((action) => this.service.loadCard(action.payload.id)),
            map((cardData) => new LoadCardSuccessAction({card: cardData.card, childCards: cardData.childCards})),
            catchError((err, caught) => {
                this.store.dispatch(new LoadCardFailureAction(err));
                return caught;
            })
        )
    );

    clearCardSelection: Observable<Action> = createEffect(() =>
        this.actions$.pipe(
            ofType<ClearLightCardSelectionAction>(LightCardActionTypes.ClearLightCardSelection),
            map(() => {
                this.lightCardsStoreService.setSelectedCard(null);
                return new ClearCardAction();
            })
        )
    );
}
