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
import {catchError, map, switchMap} from 'rxjs/operators';
import {AppState} from "@ofStore/index";
import {
    AddThirdActions,
    LightCardActionTypes,
    LoadLightCardsExtendedData,
    LoadLightCardsSuccess, UpdateALightCard
} from "@ofActions/light-card.actions";
import {ThirdsService} from "@ofServices/thirds.service";
import {tap} from "rxjs/internal/operators/tap";
import {LightCard} from "@ofModel/light-card.model";

// those effects are unused for the moment
@Injectable()
export class LightCardEffects {

    /* istanbul ignore next */
    constructor(private store: Store<AppState>,
                private actions$: Actions,
                private thirdService: ThirdsService
    ) {
    }

    @Effect()
    loadById: Observable<Action> = this.actions$
        .pipe(
            ofType<LoadLightCardsSuccess>(LightCardActionTypes.LoadLightCardsSuccess),
            switchMap((action: LoadLightCardsSuccess) =>
                this.thirdService.loadI18nForLightCards(action.payload.lightCards)
                    .pipe(
                        catchError((err, caught) => {
                            console.error(`i18 loading failed for card publishers`, err);
                            return of(false);
                        })
                    )),
            map(
                () => {
                    return new LoadLightCardsExtendedData();
                }
            )
        );
    @Effect()
    updateThirdActions: Observable<Action> = this.actions$
        .pipe(
            ofType<AddThirdActions>(LightCardActionTypes.AddThirdActions),
            map((action: AddThirdActions) => {
                const card = action.payload.card;
                const actions = action.payload.actions;
                const updateCard = {
                    id: card.id,
                    changes:{actions:actions}
                }
                return new UpdateALightCard({card: updateCard});
            })
        );

}
