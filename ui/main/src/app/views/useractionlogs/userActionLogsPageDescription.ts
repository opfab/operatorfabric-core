/* Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ActionTypeEnum} from '@ofServices/userActionLogs/model/UserActionLog';

export class UserActionLogsPageDescription {
    pageTitle: string;
    pageNotAllowedMessage: string;
    isUserAuthorized: boolean;
    initialFromDate: Date;
    actionList = Object.values(ActionTypeEnum);
    columnTitle: {
        date: string;
        action: string;
        login: string;
        entities: string;
        cardUid: string;
        comment: string;
    };
}
