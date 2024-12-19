/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Process} from '@ofServices/processes/model/Processes';
import {ProcessesServer} from '@ofServices/processes/server/ProcessesServer';
import {ServerResponse} from 'app/business/server/serverResponse';
import {Observable, ReplaySubject} from 'rxjs';

export class ProcessesServerMock implements ProcessesServer {
    private processSubject = new ReplaySubject<ServerResponse<Process>>();
    private processesSubject = new ReplaySubject<ServerResponse<Process[]>>();
    private processesWithAllVersionsSubject = new ReplaySubject<ServerResponse<Process[]>>();
    private processGroupsSubject = new ReplaySubject<ServerResponse<any>>();
    private cssSubject = new ReplaySubject<ServerResponse<string>>();

    setResponseForProcessDefinition(process: ServerResponse<Process>) {
        this.processSubject.next(process);
    }
    setResponseForProcessesDefinition(processes: ServerResponse<Process[]>) {
        this.processesSubject.next(processes);
    }
    setResponseForProcessesWithAllVersions(processes: ServerResponse<Process[]>) {
        this.processesWithAllVersionsSubject.next(processes);
    }

    setResponseForProcessGroups(processGroups: ServerResponse<any>) {
        this.processGroupsSubject.next(processGroups);
    }

    setResponseForCss(css: ServerResponse<string>) {
        this.cssSubject.next(css);
    }

    getProcessDefinition(processId: string, processVersion: string): Observable<ServerResponse<Process>> {
        return this.processSubject.asObservable();
    }
    getAllProcessesDefinition(): Observable<ServerResponse<Process[]>> {
        return this.processesSubject.asObservable();
    }
    getAllProcessesWithAllVersions(): Observable<ServerResponse<Process[]>> {
        return this.processesWithAllVersionsSubject.asObservable();
    }
    getProcessGroups(): Observable<ServerResponse<any>> {
        return this.processGroupsSubject.asObservable();
    }
    getCss(processId: string, version: string, cssName: string): Observable<ServerResponse<string>> {
        return this.cssSubject.asObservable();
    }
}
