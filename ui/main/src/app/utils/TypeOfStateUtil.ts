/* Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {TypeOfStateEnum} from '@ofServices/processes/model/Processes';
import {Card} from 'app/model/Card';
import {Severity} from 'app/model/Severity';

export function getTypeOfStateColor(processStatus: TypeOfStateEnum, card: Card, childCards: Card[]): string {
    switch (processStatus) {
        case TypeOfStateEnum.CANCELED:
            return 'red';
        case TypeOfStateEnum.INPROGRESS:
            return 'darker-orange';
        case TypeOfStateEnum.FINISHED: {
            if (!card?.entitiesRequiredToRespond) {
                return 'green';
            }
            // Check if all responses have been provided
            const allResponsesProvided = card?.entitiesRequiredToRespond.every((entity) =>
                childCards?.some((childCard) => childCard.publisher === entity)
            );
            // Check if there is any alarm severity
            const hasAlarmSeverity = childCards?.some((childCard) => {
                return childCard.severity === Severity.ALARM;
            });
            if (allResponsesProvided && !hasAlarmSeverity) {
                return 'green';
            }
            if (allResponsesProvided && hasAlarmSeverity) {
                return 'red';
            }
            return 'darker-orange';
        }
        default:
            return 'grey';
    }
}
