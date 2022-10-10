/* Copyright (c) 2021-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {Observable, timer} from 'rxjs';
import {ProcessesActionTypes} from '@ofActions/processes.actions';
import {catchError, debounce, map} from 'rxjs/operators';
import {ProcessesService} from '@ofServices/processes.service';
import {HandlebarsService} from 'app/modules/cards/services/handlebars.service';
import {TemplateCssService} from '@ofServices/template-css.service';

@Injectable()
export class ProcessesEffects {
    constructor(
        private actions$: Actions,
        private processService: ProcessesService,
        private handlebarsService: HandlebarsService,
        private templateCssService: TemplateCssService
    ) {}

    updateBusinessConfig: Observable<any> = createEffect(
        () =>
            this.actions$.pipe(
                ofType(ProcessesActionTypes.BusinessConfigChange),
                debounce(() => timer(5000 + Math.floor(Math.random() * 5000))), // use a random  part to avoid all UI to access at the same time the server
                map(() => {
                    this.handlebarsService.clearCache();
                    this.templateCssService.clearCache();
                    this.processService.loadAllProcesses().subscribe();
                    this.processService.loadProcessGroups().subscribe();
                }),
                catchError((error, caught) => {
                    console.error('ProcessesEffects - Error in update business config ', error);
                    return caught;
                })
            ),
        {dispatch: false}
    );
}
