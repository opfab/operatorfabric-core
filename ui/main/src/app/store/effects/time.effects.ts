/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable} from "@angular/core";
import {AppState} from "@ofStore/index";
import {Action, Store} from "@ngrx/store";
import {Actions, Effect, ofType} from "@ngrx/effects";
import {Observable, of} from "rxjs";
import {TimeService} from "@ofServices/time.service";
import {map, switchMap} from "rxjs/operators";
import {Tick} from "@ofActions/time.actions";

import {UserActionsTypes} from '@ofStore/actions/user.actions';

@Injectable()
export class TimeEffects {

    constructor(private store: Store<AppState>,
                private actions$: Actions,
                private service: TimeService
    ) {

    }
    /**
     *This Observable send a tick corresponding to the heart beat of the application.
     *
     */
    @Effect()
    heartBeat: Observable<Action> = this.actions$
        .pipe(
            ofType(UserActionsTypes.UserApplicationRegistered),
            switchMap(() => this.service.pulsate()
                .pipe(map(pulse => {
                        return new Tick(pulse);
                    })
                ))
        );

}
