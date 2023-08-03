/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Process} from '@ofModel/processes.model';
import {ProcessServer} from 'app/business/server/process.server';
import {ServerResponse} from 'app/business/server/serverResponse';
import {Observable, ReplaySubject} from 'rxjs';

export class ProcessServerMock implements ProcessServer {
    private processSubject = new ReplaySubject<ServerResponse<Process>>();
    private allProcessSubject = new ReplaySubject<ServerResponse<Process[]>>();
    private processGroupsSubject = new ReplaySubject<ServerResponse<any>>();
    private templateSubject = new ReplaySubject<ServerResponse<string>>();
    private cssSubject = new ReplaySubject<ServerResponse<string>>();

    setResponseForProcessDefinition(process: ServerResponse<Process>) {
        this.processSubject.next(process);
    }
    setResponseForAllProcessDefinition(processes: ServerResponse<Process[]>) {
        this.allProcessSubject.next(processes);
    }

    setResponseForProcessGroups(processGroups: ServerResponse<any>) {
        this.processGroupsSubject.next(processGroups);
    }

    setResponseForTemplate(template: ServerResponse<string>) {
        this.templateSubject.next(template);
    }

    setResponseForCss(css: ServerResponse<string>) {
        this.cssSubject.next(css);
    }

    getProcessDefinition(processId: string, processVersion: string): Observable<ServerResponse<Process>> {
        return this.processSubject.asObservable();
    }
    getAllProcessesDefinition(): Observable<ServerResponse<Process[]>> {
        return this.allProcessSubject.asObservable();
    }
    getAllProcessesWithAllVersions(): Observable<ServerResponse<Process[]>> {
        return this.allProcessSubject.asObservable();
    }
    getProcessGroups(): Observable<ServerResponse<any>> {
        return this.processGroupsSubject.asObservable();
    }
    getTemplate(processid: string, processVersion: string, templateName: string): Observable<ServerResponse<string>> {
        return this.templateSubject.asObservable();
    }
    getCss(processId: string, version: string, cssName: string): Observable<ServerResponse<string>> {
        return this.cssSubject.asObservable();
    }
}
