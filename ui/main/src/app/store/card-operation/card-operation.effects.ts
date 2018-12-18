/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {CardService} from '@core/services/card.service';
import {Observable, of} from 'rxjs';
import {catchError, map, switchMap} from 'rxjs/operators';
import {
    AddLightCardFailure,
    HandleUnexpectedError,
    LightCardActions,
    LoadLightCardsSuccess
} from '@ofStore/light-card/light-card.actions';
import {AuthenticationActionTypes} from '@ofStore/actions/authentication.actions';

@Injectable()
export class CardOperationEffects {

    constructor(private actions$: Actions
        , private service: CardService) {
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
                    catchError(error => of(new AddLightCardFailure({error: error})))
                )
            ),
            catchError(error => of(new HandleUnexpectedError({error: error})))
        );

}
