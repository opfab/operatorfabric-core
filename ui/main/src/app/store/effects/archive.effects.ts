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
import {catchError, map, switchMap, withLatestFrom} from 'rxjs/operators';
import {Action, Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {
    ArchiveActionTypes,
    ArchiveQuerySuccess,
    HandleUnexpectedError,
    SendArchiveQuery, UpdateArchivePage
} from "@ofActions/archive.actions";
import {LightCard} from "@ofModel/light-card.model";
import {selectArchiveFilters} from "@ofSelectors/archive.selectors";
import {Page} from "@ofModel/page.model";
import { UpdateArchiveFilter } from '../actions/archive.actions';

@Injectable()
export class ArchiveEffects {

    /* istanbul ignore next */
    constructor(private store: Store<AppState>, private actions$: Actions, private service: CardService) {
    }

    @Effect()
    queryArchivedCards: Observable<Action> = this.actions$
        .pipe(
            ofType(ArchiveActionTypes.SendArchiveQuery),
            switchMap((action: SendArchiveQuery) => this.service.fetchArchivedCards(action.payload.params)),
            map((resultPage: Page<LightCard>) => {
                return new ArchiveQuerySuccess({resultPage: resultPage});
            }),
            catchError((error, caught) => {
                this.store.dispatch(new HandleUnexpectedError({error: error}));
                return caught;
            }));

    @Effect()
    queryArchivedCardsPage: Observable<Action> = this.actions$ //TODO Maybe it's not necessary anymore to have a distinct action for the page button, search & pages trigger the same
        .pipe(
            ofType<UpdateArchivePage>(ArchiveActionTypes.UpdateArchivePage),
            withLatestFrom(this.store.select(selectArchiveFilters)),
            map(([action, filters]) => {
                filters.pageNumber = (action.payload.pageNumber).toString();
                return new UpdateArchiveFilter({filters});
            }),
            //
            catchError((error, caught) => {
                this.store.dispatch(new HandleUnexpectedError({error: error}));
                return caught;
            }));


}
