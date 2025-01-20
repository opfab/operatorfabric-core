/* Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ServerResponse} from 'app/business/server/serverResponse';
import {UserActionLogsServer} from './server/UserActionLogsServer';
import {Observable} from 'rxjs';
import {UserActionLog} from './model/UserActionLog';
import {Page} from 'app/model/Page';

export class UserActionLogsService {
    private static userActionLogsServer: UserActionLogsServer;

    public static setUserActionLogsServer(userActionLogsServer: UserActionLogsServer): void {
        UserActionLogsService.userActionLogsServer = userActionLogsServer;
    }

    public static queryUserActionLogs(filters: Map<string, string[]>): Observable<ServerResponse<Page<UserActionLog>>> {
        return UserActionLogsService.userActionLogsServer.queryUserActionLogs(filters);
    }
}
