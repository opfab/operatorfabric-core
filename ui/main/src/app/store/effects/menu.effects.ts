/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Action, Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {catchError, map, switchMap} from 'rxjs/operators';
import {CardService} from '@ofServices/card.service';
import {AppState} from "@ofStore/index";
import {CardActionTypes, LoadCard, LoadCardFailure, LoadCardSuccess} from "@ofActions/card.actions";
import {Card} from "@ofModel/card.model";
import {ThirdsService} from "@ofServices/thirds.service";
import {LoadMenu, LoadMenuFailure, LoadMenuSuccess, MenuActions, MenuActionTypes} from "@ofActions/menu.actions";
import {ThirdMenu} from "@ofModel/thirds.model";

// those effects are unused for the moment
@Injectable()
export class MenuEffects {

    /* istanbul ignore next */
    constructor(private store: Store<AppState>,
                private actions$: Actions,
                private service: ThirdsService
    ) {
    }

    @Effect()
    load: Observable<Action> = this.actions$
        .pipe(
            ofType<LoadCard>(MenuActionTypes.LoadMenu),
            switchMap(action => this.service.computeThirdsMenu()),
            map((menu: ThirdMenu[]) => {
                return new LoadMenuSuccess({menu: menu});
            }),
            catchError((err, caught) => {
                this.store.dispatch(new LoadMenuFailure(err));
                return caught;
            })
        );
}
