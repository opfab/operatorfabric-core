/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from '@angular/core';
import {AppState} from '@ofStore/index';
import {ProcessesService} from '@ofServices/processes.service';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Action, Store} from '@ngrx/store';
import {Observable} from 'rxjs';
import {LoadAllProcesses, ProcessActionType} from '@ofActions/process.action';
import {map, switchMap} from 'rxjs/operators';
import {Process} from '@ofModel/processes.model';

@Injectable()
export class ProcessEffects {
    constructor(private store: Store<AppState>, private action$: Actions, private service: ProcessesService) {
    }

    @Effect()
    loadAllProcesses: Observable<Action> = this.action$.pipe(
        ofType(ProcessActionType.QueryAllProcesses),
        switchMap(() => this.service.queryAllProcesses()),
        map((allProcesses: Process[]) => new LoadAllProcesses({processes: allProcesses}))
    );
}
