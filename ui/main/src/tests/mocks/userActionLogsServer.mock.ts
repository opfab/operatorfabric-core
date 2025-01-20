/* Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ServerResponse} from 'app/business/server/serverResponse';
import {Observable, ReplaySubject} from 'rxjs';
import {UserActionLogsServer} from '@ofServices/userActionLogs/server/UserActionLogsServer';
import {Page} from 'app/model/Page';
import {UserActionLog} from '@ofServices/userActionLogs/model/UserActionLog';

export class UserActionLogsServerMock implements UserActionLogsServer {
    private logsSubject: ReplaySubject<ServerResponse<any>>;
    private filters: Map<string, string[]>;

    queryUserActionLogs(filters: Map<string, string[]>): Observable<ServerResponse<Page<UserActionLog>>> {
        this.filters = filters;
        return this.logsSubject.asObservable();
    }

    setResponse(logs: ServerResponse<any>) {
        this.logsSubject = new ReplaySubject<ServerResponse<any>>();
        this.logsSubject.next(logs);
        this.logsSubject.complete();
    }

    getFilters(): Map<string, string[]> {
        return this.filters;
    }
}
