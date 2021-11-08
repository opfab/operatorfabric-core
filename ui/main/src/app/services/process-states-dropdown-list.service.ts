/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from '@angular/core';
import {ProcessesService} from "@ofServices/processes.service";
import {UserService} from "@ofServices/user.service";

/** This class contains functions to get the list of process and states for filters in UI */

@Injectable({
    providedIn: 'root'
})
export class ProcessStatesDropdownListService {

    constructor(private processesService: ProcessesService,
                private userService: UserService) { }

    computeStatesDropdownListPerProcess(hideChildStates: boolean): Map<string, any[]> {
        const statesDropdownListPerProcess = new Map();

        this.processesService.getAllProcesses().forEach(process => {
            const statesDropdownList = [];
            for (const state in process.states) {

                if (!(hideChildStates && process.states[state].isOnlyAChildState) &&
                    this.userService.isReceiveRightsForProcessAndState(process.id, state)) {
                    statesDropdownList.push({
                      id: process.id + '.' + state,
                      itemName: process.states[state].name,
                      itemCategory: process.name
                    });
                }
            }
            if (statesDropdownList.length)
                statesDropdownListPerProcess.set(process.id, statesDropdownList);
        });
        return statesDropdownListPerProcess;
    }

    computeProcessesWithoutProcessGroupDropdownList(processesFilter?: string[]): any[] {

        let processesWithoutProcessGroupDropdownList = this.processesService.getProcessesWithoutProcessGroup(processesFilter);

        processesWithoutProcessGroupDropdownList = processesWithoutProcessGroupDropdownList.filter(processData =>
            this.userService.isReceiveRightsForProcess(processData.id));

        return processesWithoutProcessGroupDropdownList;
    }

    computeProcessesDropdownListPerProcessGroup(processesFilter?: string[]): Map<string, any[]> {

        const processesDropdownListPerProcessGroups = this.processesService.getProcessesPerProcessGroups(processesFilter);

        processesDropdownListPerProcessGroups.forEach((processList, processGroupId) => {
            processList = processList.filter(processData => this.userService.isReceiveRightsForProcess(processData.id));
            if (! processList.length)
                processesDropdownListPerProcessGroups.delete(processGroupId);
            else
                processesDropdownListPerProcessGroups.set(processGroupId, processList);
        });
        return processesDropdownListPerProcessGroups;
    }

    computeProcessGroupsDropdownList(processesWithoutProcessGroupDropdownList: any[],
                                     processesDropdownListPerProcessGroups: Map<string, any[]>): any[] {

        const processGroupsDropdownList = [];
        const processesGroups = this.processesService.getProcessGroups();

        if (processesWithoutProcessGroupDropdownList.length > 0)
            processGroupsDropdownList.push({ id: '--', itemName: 'processGroup.defaultLabel' });

        const processGroupIds = Array.from(processesDropdownListPerProcessGroups.keys());
        processGroupIds.forEach(processGroupId =>
            processGroupsDropdownList.push({ id: processGroupId, itemName: processesGroups.get(processGroupId).name }));

        return processGroupsDropdownList;
    }
}
