/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {Action} from '@ngrx/store';
import {Observable} from 'rxjs';
import {catchError, map, switchMap} from 'rxjs/operators';
import {LoadMenu, LoadMenuSuccess, MenuActionTypes,} from '@ofActions/menu.actions';
import {ConfigService} from '@ofServices/config.service';

@Injectable()
export class MenuEffects {


    constructor(
                private actions$: Actions,
                private service: ConfigService
    ) {
    }

    
    load: Observable<Action> = createEffect(() => this.actions$
        .pipe(
            ofType<LoadMenu>(MenuActionTypes.LoadMenu),
            switchMap(action =>  this.service.computeMenu()),
            map(menu =>
                new LoadMenuSuccess({menu: menu})
            ),
            catchError((err, caught) => {
                console.error(new Date().toISOString(),err);
                return caught;
            })
        ));



}
