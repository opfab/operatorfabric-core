/* Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Process} from '@ofServices/processes/model/Processes';
import {Observable} from 'rxjs';
import {ServerResponse} from '../../../server/ServerResponse';

export abstract class ProcessesServer {
    abstract getProcessDefinition(processId: string, processVersion: string): Observable<ServerResponse<Process>>;
    abstract getAllProcessesWithAllVersions(): Observable<ServerResponse<Process[]>>;
    abstract getAllProcessesDefinition(): Observable<ServerResponse<Process[]>>;
    abstract getProcessGroups(): Observable<ServerResponse<any>>;
    abstract getCss(processId: string, version: string, cssName: string): Observable<ServerResponse<string>>;
}
