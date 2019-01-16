/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {CardService} from '@ofServices/card.service';
import {Observable} from 'rxjs';
import {catchError, map, switchMap} from 'rxjs/operators';
import {
    AddLightCardFailure,
    HandleUnexpectedError,
    LightCardActions,
    LoadLightCardsSuccess
} from '@ofActions/light-card.actions';
import {AuthenticationActionTypes} from '@ofActions/authentication.actions';
import {Store} from "@ngrx/store";
import {AppState} from "@ofStore/index";

@Injectable()
export class CardOperationEffects {

    /* istanbul ignore next */
    constructor(private store: Store<AppState>,
                private actions$: Actions,
                private service: CardService) {
    }

    @Effect()
    getCardOperations: Observable<LightCardActions> = this.actions$
        .pipe(
            // loads card operations only after authentication of a default user ok.
            ofType(AuthenticationActionTypes.AcceptLogIn),
            switchMap(() => this.service.getCardOperation()
                .pipe(
                    map(operation => {
                        if (operation.type && operation.type.toString() === 'ADD') {
                            const opCards = operation.cards;
                            return new LoadLightCardsSuccess({lightCards: opCards});
                        }
                        return new AddLightCardFailure(
                            {
                                error:
                                    new Error(`unhandled action type '${operation.type}'`)
                            });
                    }),
                    catchError((error, caught) => {
                        this.store.dispatch(new AddLightCardFailure({error: error}));
                        return caught;
                    })
                )
            ),

            catchError((error,caught )=> {
                this.store.dispatch(new HandleUnexpectedError({error: error}))
                return caught;
            }));

}
