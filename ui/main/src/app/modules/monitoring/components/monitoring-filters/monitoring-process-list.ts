/* Copyright (c) 2022-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from '@angular/core';
import {Process} from '@ofServices/processes/model/Processes';
import {ProcessesService} from '@ofServices/processes/ProcessesService';
import {UserService} from 'app/business/services/users/user.service';

export const DEFAULT_PROCESS_GROUP_ID = '--';

@Injectable({
    providedIn: 'root'
})
export class MonitoringProcessList {
    private readonly processList: Array<Process> = [];
    private readonly processByProcessGroup: Map<string, Process[]> = new Map();
    private processGroups: Array<any>;

    constructor() {
        this.loadVisibleProcessesForCurrentUser();
        this.loadProcessByProcessGroupMap();
        this.loadProcessGroups();
    }

    private loadVisibleProcessesForCurrentUser() {
        ProcessesService.getAllProcesses().forEach((process) => {
            if (process.uiVisibility?.monitoring && UserService.isReceiveRightsForProcess(process.id)) {
                this.processList.push(process);
            }
        });
    }

    private loadProcessByProcessGroupMap() {
        this.processList.forEach((process) => {
            const processGroupId = this.getProcessGroupIdForProcess(process.id);
            this.addProcess_In_ProcessByProcessGroupMap(process, processGroupId);
        });
    }

    private getProcessGroupIdForProcess(processId): string {
        const processGroup = ProcessesService.findProcessGroupForProcess(processId);
        if (processGroup) return processGroup.id;
        return DEFAULT_PROCESS_GROUP_ID;
    }

    private addProcess_In_ProcessByProcessGroupMap(process, processGroupId) {
        let processes = this.processByProcessGroup.get(processGroupId);
        if (!processes) processes = [];
        processes.push(process);
        this.processByProcessGroup.set(processGroupId, processes);
    }

    private loadProcessGroups() {
        this.processGroups = [];
        for (const processGroup of this.processByProcessGroup.keys()) {
            this.processGroups.push({
                id: processGroup,
                name: ProcessesService.getProcessGroupName(processGroup)
            });
        }
    }

    public getProcesses(): Array<Process> {
        return this.processList;
    }

    public getProcessGroups(): Array<any> {
        return this.processGroups;
    }

    public getProcessesForProcessGroup(processGroupId: string): Array<Process> {
        return this.processByProcessGroup.get(processGroupId);
    }

    public getProcessesIdForProcessGroups(processGroupIds: string[]): string[] {
        const processesId = [];
        processGroupIds.forEach((processGroupId) => {
            this.processByProcessGroup.get(processGroupId).forEach((process) => processesId.push(process.id));
        });
        return processesId;
    }
}
