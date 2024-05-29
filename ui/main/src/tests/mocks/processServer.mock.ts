/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Process} from '@ofModel/processes.model';
import {ProcessServer} from 'app/business/server/process.server';
import {ServerResponse, ServerResponseStatus} from 'app/business/server/serverResponse';
import {Observable, ReplaySubject, of} from 'rxjs';

export class ProcessServerMock implements ProcessServer {
    private processSubject = new ReplaySubject<ServerResponse<Process>>();
    private processesSubject = new ReplaySubject<ServerResponse<Process[]>>();
    private processesWithAllVersionsSubject = new ReplaySubject<ServerResponse<Process[]>>();
    private processGroupsSubject = new ReplaySubject<ServerResponse<any>>();
    private cssSubject = new ReplaySubject<ServerResponse<string>>();

    private templateString = 'Data:{{card.data}}';
    private prefixWithParamsFormMethodCall = true;

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

    setResponseTemplateForGetTemplate(template: string, prefixWithParamsFormMethodCall: boolean = false) {
        this.templateString = template;
    }

    setTemplateResponseWithParamFromMethodCall(addParam: boolean) {
        this.prefixWithParamsFormMethodCall = addParam;
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
    getTemplate(processid: string, processVersion: string, templateName: string): Observable<ServerResponse<string>> {
        let response = '';
        if (this.prefixWithParamsFormMethodCall) {
            response = `process:${processid},version:${processVersion},template:${templateName},`;
        }
        response += this.templateString;
        return of(new ServerResponse(response, ServerResponseStatus.OK, null));
    }
    getCss(processId: string, version: string, cssName: string): Observable<ServerResponse<string>> {
        return this.cssSubject.asObservable();
    }
}
