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
import {Action, Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {catchError, map, switchMap} from 'rxjs/operators';
import {AppState} from "@ofStore/index";
import {ThirdsService} from "@ofServices/thirds.service";
import {
    LoadMenu,
    LoadMenuFailure,
    LoadMenuSuccess,
    MenuActionTypes,
} from "@ofActions/menu.actions";
import {Router} from "@angular/router";

@Injectable()
export class MenuEffects {

    /* istanbul ignore next */
    constructor(private store: Store<AppState>,
                private actions$: Actions,
                private service: ThirdsService,
                private router: Router
    ) {
    }

    @Effect()
    load: Observable<Action> = this.actions$
        .pipe(
            ofType<LoadMenu>(MenuActionTypes.LoadMenu),
            switchMap(action =>  this.service.computeThirdsMenu()),
            map(menu =>
                new LoadMenuSuccess({menu: menu})
            ),
            catchError((err, caught) => {
                console.error(err);
                this.store.dispatch(new LoadMenuFailure(err));
                return caught;
            })
        );



}
