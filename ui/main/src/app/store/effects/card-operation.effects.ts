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
import {catchError, filter, map, switchMap, takeUntil} from 'rxjs/operators';
import {
    AddLightCardFailure,
    HandleUnexpectedError,
    LightCardActions,
    LoadLightCardsSuccess,
    UpdatedSubscription
} from '@ofActions/light-card.actions';
import {AuthenticationActionTypes} from '@ofActions/authentication.actions';
import {Store} from "@ngrx/store";
import {AppState} from "@ofStore/index";
import {ApplyFilter, FeedActionTypes} from "@ofActions/feed.actions";
import {FilterType} from "@ofServices/filter.service";

@Injectable()
export class CardOperationEffects {

    /* istanbul ignore next */
    constructor(private store: Store<AppState>,
                private actions$: Actions,
                private service: CardService) {
    }

    @Effect()
    subscribe: Observable<LightCardActions> = this.actions$
        .pipe(
            // loads card operations only after authentication of a default user ok.
            ofType(AuthenticationActionTypes.AcceptLogIn),
            switchMap(() => this.service.getCardOperation()
                .pipe(
                    takeUntil(this.service.unsubscribe$),
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
                this.store.dispatch(new HandleUnexpectedError({error: error}));
                return caught;
            }));

    @Effect()
    updateSubscription: Observable<LightCardActions> = this.actions$
        .pipe(
            // loads card operations only after authentication of a default user ok.
            ofType(FeedActionTypes.ApplyFilter),
            filter((af:ApplyFilter)=>af.payload.name == FilterType.TIME_FILTER),
            switchMap((af:ApplyFilter) => this.service.updateCardSubscriptionWithDates(af.payload.status.start,af.payload.status.end)
                .pipe(
                    map(()=> {
                        return new UpdatedSubscription();
                    })
                )
            ),
            catchError((error,caught )=> {
                this.store.dispatch(new HandleUnexpectedError({error: error}))
                return caught;
            })
        );

}
