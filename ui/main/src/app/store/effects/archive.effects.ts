/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {CardService} from '@ofServices/card.service';
import {Observable} from 'rxjs';
import {catchError, map, switchMap, withLatestFrom} from 'rxjs/operators';
import {Action, Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {
    ArchiveActionTypes,
    ArchiveQuerySuccess,
    HandleUnexpectedError,
    SendArchiveQuery,
    UpdateArchivePage
} from '@ofActions/archive.actions';
import {LightCard} from '@ofModel/light-card.model';
import {selectArchiveFilters} from '@ofSelectors/archive.selectors';
import {Page} from '@ofModel/page.model';
import {UpdateArchiveFilter} from '../actions/archive.actions';

@Injectable()
export class ArchiveEffects {

    /* istanbul ignore next */
    constructor(private store: Store<AppState>, private actions$: Actions, private service: CardService) {
    }

    @Effect()
    queryArchivedCards: Observable<Action> = this.actions$.pipe(
        ofType(ArchiveActionTypes.SendArchiveQuery),
        // update the filter state and the archive list
        switchMap((action: SendArchiveQuery) => {
            const {params} = action.payload;
            this.store.dispatch(new UpdateArchiveFilter({filters: params}));
            return this.service.fetchArchivedCards(new Map(params));
        }),
        map((resultPage: Page<LightCard>) => new ArchiveQuerySuccess({resultPage})),
        catchError((error, caught) => {
            this.store.dispatch(new HandleUnexpectedError({error: error}));
            return caught;
        })
    );
    @Effect()
    queryArchivedCardsPage: Observable<Action> = this.actions$.pipe(
        ofType(ArchiveActionTypes.UpdateArchivePage),
        withLatestFrom(this.store.select(selectArchiveFilters)),
        map(([action, filters]) => {
            // get the current page
            const page = (action as UpdateArchivePage).payload.page;
            // modify the filters page
            filters.set('page', [page.toString()]);
            return new SendArchiveQuery({params: filters});
        }),
        catchError((error, caught) => {
            this.store.dispatch(new HandleUnexpectedError({error: error}));
            return caught;
        })
    );


}
