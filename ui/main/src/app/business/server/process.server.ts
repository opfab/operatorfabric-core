/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {Process} from '@ofModel/processes.model';
import {Observable} from 'rxjs';

export abstract class ProcessServer {
    abstract getProcessDefinition(processId:string,processVersion:string): Observable<Process>;
    abstract getAllProcessesDefinition(): Observable<Process[]>;
    abstract getI18N(processId: string, locale: string,version: string): Observable<any>;
    abstract getProcessGroups() : Observable<any>;
    abstract getTemplate(processid:string,processVersion:string,templateName:string) : Observable<string>;
    abstract getCss(processId:string,version:string,cssName:string) : Observable<string>;
}
