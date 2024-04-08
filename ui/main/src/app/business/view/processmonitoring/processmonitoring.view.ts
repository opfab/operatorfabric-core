/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ProcessesService} from 'app/business/services/businessconfig/processes.service';
import {ProcessGroups, ProcessToMonitor, StatePerProcessToMonitor} from './processmonitoringPage';
import {UserService} from 'app/business/services/users/user.service';
import {Utilities} from 'app/business/common/utilities';
import {Process} from '@ofModel/processes.model';
import {PermissionEnum} from '@ofModel/permission.model';

export class ProcessMonitoringView {
    private processesToMonitor: ProcessToMonitor[] = null;

    public getProcessList(): ProcessToMonitor[] {
        if (this.processesToMonitor == null) {
            this.processesToMonitor = [];
            ProcessesService.getAllProcesses().forEach((process) => {
                if (process.uiVisibility?.processMonitoring) {
                    this.addProcessIfUserHasPermission(process);
                }
            });
            this.processesToMonitor.sort((a, b) => Utilities.compareObj(a.label, b.label));
        }
        return [...this.processesToMonitor]; // Cloning the array
    }

    private addProcessIfUserHasPermission(process: Process) {
        for (const stateId of process.states.keys()) {
            if (UserService.isReceiveRightsForProcessAndState(process.id, stateId)) {
                this.processesToMonitor.push({
                    id: process.id,
                    label: process.name ? process.name : process.id
                });
                break;
            }
        }
    }

    public getStatesPerProcess(processIds: string[]): StatePerProcessToMonitor[] {
        const statesPerProcessToMonitor = [];
        ProcessesService.getAllProcesses().forEach((process) => {
            if (processIds.includes(process.id)) {
                const statesToMonitor = [];
                for (const stateId of process.states.keys()) {
                    if (UserService.isReceiveRightsForProcessAndState(process.id, stateId)) {
                        statesToMonitor.push({
                            id: stateId,
                            label: process.states.get(stateId).name
                        });
                    }
                }
                statesToMonitor.sort((a, b) => Utilities.compareObj(a.label, b.label));
                statesPerProcessToMonitor.push({
                    id: process.id,
                    processName: process.name ? process.name : process.id,
                    states: statesToMonitor
                });
                statesPerProcessToMonitor.sort((a, b) => Utilities.compareObj(a.processName, b.processName));
            }
        });
        return statesPerProcessToMonitor;
    }

    public getProcessGroups(): ProcessGroups[] {
        const processGroups = [];
        const processes = this.getProcessList().map((process) => process.id);
        const processesPerProcessGroups = ProcessesService.getProcessesPerProcessGroups(processes);

        for (const processGroupId of processesPerProcessGroups.keys()) {
            const processGroup = new ProcessGroups();
            processGroup.id = processGroupId;
            processGroup.label = ProcessesService.getProcessGroupName(processGroupId);
            processGroups.push(processGroup);
        }
        return processGroups;
    }

    public getProcessesPerProcessGroups(processGroupIdSelected: string[]): ProcessToMonitor[] {
        const processes = [];
        ProcessesService.getProcessGroups().forEach((processGroup, processGroupId) => {
            if (processGroupIdSelected.includes(processGroupId)) {
                processGroup.processes.forEach((processId) => {
                    const process = this.getProcessList().find((process) => process.id === processId);
                    if (process) {
                        processes.push(process);
                    }
                });
            }
        });
        return processes;
    }

    public mustViewAllCardsFeatureBeDisplayed(): boolean {
        return UserService.hasCurrentUserAnyPermission([
            PermissionEnum.ADMIN,
            PermissionEnum.VIEW_ALL_CARDS,
            PermissionEnum.VIEW_ALL_CARDS_FOR_USER_PERIMETERS
        ]);
    }
}
