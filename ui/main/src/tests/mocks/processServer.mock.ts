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
import {Observable, ReplaySubject} from 'rxjs';

export class ProcessServerMock implements ProcessServer {
    private processSubject = new ReplaySubject<Process>();
    private allProcessSubject = new ReplaySubject<Process[]>();
    private i18nSubject = new ReplaySubject<any>();
    private processGroupsSubject = new ReplaySubject<any>();
    private templateSubject = new ReplaySubject<string>();
    private cssSubject = new ReplaySubject<string>();

    setProcessDefinition(process: Process) {
        this.processSubject.next(process);
    }
    setAllProcessDefinition(processes: Process[]) {
        this.allProcessSubject.next(processes);
    }
    setI18N(i18n: any) {
        this.i18nSubject.next(i18n);
    }
    setProcessGroups(processGroups: any) {
        this.processGroupsSubject.next(processGroups);
    }

    setTemplate(template: string) {
        this.templateSubject.next(template);
    }

    setCss(css: string) {
        this.cssSubject.next(css);
    }

    getProcessDefinition(processId: string, processVersion: string): Observable<Process> {
        return this.processSubject.asObservable();
    }
    getAllProcessesDefinition(): Observable<Process[]> {
        return this.allProcessSubject.asObservable();
    }
    getI18N(processId: string, version: string): Observable<any> {
        return this.i18nSubject.asObservable();
    }
    getProcessGroups(): Observable<any> {
        return this.processGroupsSubject.asObservable();
    }
    getTemplate(processid: string, processVersion: string, templateName: string): Observable<string> {
        return this.templateSubject.asObservable();
    }
    getCss(processId: string, version: string, cssName: string): Observable<string> {
        return this.cssSubject.asObservable();
    }
}
