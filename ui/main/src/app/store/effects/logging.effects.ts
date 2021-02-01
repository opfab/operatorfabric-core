/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from '@angular/core';
import {CardService} from '@ofServices/card.service';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {AppState} from '@ofStore/index';
import {Action, Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {catchError, map, switchMap, withLatestFrom} from 'rxjs/operators';
import {Page} from '@ofModel/page.model';
import {
    LoggingActionType,
    LoggingQuerySuccess,
    SendLoggingQuery,
    UpdateLoggingFilter,
    UpdateLoggingPage
} from '@ofActions/logging.actions';
import {LineOfLoggingResult} from '@ofModel/line-of-logging-result.model';
import {selectLoggingFilter} from '@ofSelectors/logging.selectors';


@Injectable()
export class LoggingEffects {
    constructor(private store: Store<AppState>, private actions$: Actions, private service: CardService) {
    }

    @Effect()
    queryLoggingCards: Observable<Action> = this.actions$.pipe(
        ofType(LoggingActionType.SendLoggingQuery),
        // update the filter state and the archive list
        switchMap((action: SendLoggingQuery) => {
            const {params} = action.payload;
            this.store.dispatch(new UpdateLoggingFilter({filters: params}));
            return this.service.fetchLoggingResults(new Map(params));
        }),
        map((resultPage: Page<LineOfLoggingResult>) => new LoggingQuerySuccess({resultPage})),
        catchError((error, caught) => {
            console.log("error when query logging card  ",error);
            return caught;
        })
    );

    @Effect()
    queryLoggingPage: Observable<Action> = this.actions$.pipe(
        ofType(LoggingActionType.UpdateLoggingPage),
        withLatestFrom(this.store.select(selectLoggingFilter)),
        map(([action, filters]) => {
            const page = (action as UpdateLoggingPage).payload.page;
            filters.set('page', [page.toString()]);
            return new SendLoggingQuery({params: filters});
        }),
        catchError((error, caught) => {
            console.log("error when query logging page ",error);
            return caught;
        })
    );

}
