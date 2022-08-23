/* Copyright (c) 2020, RTEi (http://www.rte-international.com)
 * Copyright (c) 2021-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {AlertMessageAction} from '@ofStore/actions/alert.actions';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {MessageLevel} from '@ofModel/message.model';
import {OpfabLoggerService} from './logs/opfab-logger.service';
import {throwError} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';

/** This class describes what errors should be thrown depending on the API `Response`
 * Services requiring this behaviour should extend this class (see `GroupService` for example).
 * Note: This can't be an interface because Typescript doesn't allow default methods.
 */
export abstract class ErrorService {

    constructor(protected store: Store<AppState>, protected loggerService: OpfabLoggerService) {}

    protected handleError(error: HttpErrorResponse) {
        if (error.status === 404) {
            this.store.dispatch(
                new AlertMessageAction({
                    alertMessage: {message: '', i18n: {key: "errors.notFound"}, level: MessageLevel.ERROR}
                })
            );
        }
        if (error.status === 403) {
            this.store.dispatch(
                new AlertMessageAction({
                    alertMessage: {message: '', i18n: {key: "errors.notAllowed"}, level: MessageLevel.ERROR}
                })
            );
        }
        this.loggerService.error(error.status + " " + error.statusText + " " + error.message);
        return throwError(() => error);

    }
}
