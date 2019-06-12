/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {AuthenticationActionTypes} from '@ofActions/authentication.actions';
import {Store} from "@ngrx/store";
import {AppState} from "@ofStore/index";
import {FilterService} from "@ofServices/filter.service";
import {FeedActions, InitFilters} from "@ofActions/feed.actions";

@Injectable()
export class FeedFiltersEffects {

    /* istanbul ignore next */
    constructor(private store: Store<AppState>,
                private actions$: Actions,
                private service: FilterService) {
    }

    @Effect()
    loadFeedFilterOnAuthenticationSuccess: Observable<FeedActions> = this.actions$
        .pipe(
            // loads card operations only after authentication of a default user ok.
            ofType(AuthenticationActionTypes.AcceptLogIn),
            map((action) => {
                return new InitFilters({filters:this.service.defaultFilters});
            }));

}
