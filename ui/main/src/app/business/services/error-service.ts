/* Copyright (c) 2020, RTEi (http://www.rte-international.com)
 * Copyright (c) 2021-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {MessageLevel} from '@ofServices/alerteMessage/model/Message';
import {LoggerService as logger} from 'app/services/logs/LoggerService';
import {throwError} from 'rxjs';
import {ServerResponse, ServerResponseStatus} from 'app/business/server/serverResponse';
import {AlertMessageService} from '../../services/alerteMessage/AlertMessageService';
import {I18n} from '@ofModel/i18n.model';

export class ErrorService {
    public static handleServerResponseError(error: ServerResponse<any>, errorMessage?: I18n) {
        if (error.status === ServerResponseStatus.NOT_FOUND) {
            AlertMessageService.sendAlertMessage({
                message: '',
                i18n: errorMessage ?? {key: 'errors.notFound'},
                level: MessageLevel.ERROR
            });
        }
        if (error.status === ServerResponseStatus.FORBIDDEN) {
            AlertMessageService.sendAlertMessage({
                message: '',
                i18n: errorMessage ?? {key: 'errors.notAllowed'},
                level: MessageLevel.ERROR
            });
        }
        if (error.status === ServerResponseStatus.BAD_REQUEST) {
            const statusMessage = error.statusMessage ?? '';

            AlertMessageService.sendAlertMessage({
                message: '',
                i18n: errorMessage ?? {key: 'errors.badRequest', parameters: {badRequestMessage: statusMessage}},
                level: MessageLevel.ERROR
            });
        }
        logger.error(error.status + ' ' + error.statusMessage);
        return throwError(() => error);
    }
}
