/* Copyright (c) 2021-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {ProcessesService} from 'app/business/services/processes.service';
import {UserService} from 'app/business/services/users/user.service';
import {MultiSelectOption} from '@ofModel/multiselect.model';

/** This class contains functions to get the list of process and states for filters in UI */

@Injectable({
    providedIn: 'root'
})
export class ProcessStatesMultiSelectOptionsService {
    constructor(
        private processesService: ProcessesService,
        private userService: UserService,
        private translate: TranslateService
    ) {}

    getStatesMultiSelectOptionsPerProcess(isAdminMode: boolean, hideChildStates: boolean): any[] {
        const statesMultiSelectOptionsPerProcess: Array<MultiSelectOption> = [];
        this.processesService.getAllProcesses().forEach((process) => {
            const stateOptions = new MultiSelectOption(process.id, process.name);
            stateOptions.options = [];
            process.states.forEach((state, stateid) => {
                if (
                    this.doesStateHaveToBeDisplayedInFilters(
                        hideChildStates,
                        state.isOnlyAChildState,
                        process.id,
                        stateid,
                        isAdminMode
                    )
                ) {
                    stateOptions.options.push(new MultiSelectOption(process.id + '.' + stateid, state.name));
                }
            });
            if (stateOptions.options.length > 0) statesMultiSelectOptionsPerProcess.push(stateOptions);
        });
        return statesMultiSelectOptionsPerProcess;
    }

    private doesStateHaveToBeDisplayedInFilters(
        hideChildStates: boolean,
        isOnlyAChildState: boolean,
        processId: string,
        stateId: string,
        isAdminMode: boolean
    ): boolean {
        return (
            !(hideChildStates && isOnlyAChildState) &&
            (isAdminMode || this.userService.isReceiveRightsForProcessAndState(processId, stateId))
        );
    }

    getProcessesWithoutProcessGroupMultiSelectOptions(isAdminMode: boolean, processesFilter?: string[]): any[] {
        const processesWithoutProcessGroupMultiSelectOptions: Array<MultiSelectOption> = [];

        this.processesService.getProcessesWithoutProcessGroup(processesFilter).forEach((process) => {
            if (isAdminMode || this.userService.isReceiveRightsForProcess(process.id))
                processesWithoutProcessGroupMultiSelectOptions.push(new MultiSelectOption(process.id, process.name));
        });
        return processesWithoutProcessGroupMultiSelectOptions;
    }

    getProcessesMultiSelectOptionsPerProcessGroup(
        isAdminMode: boolean,
        processesFilter?: string[]
    ): Map<string, any[]> {
        const processMultiSelectOptionsPerProcessGroups =
            this.processesService.getProcessesPerProcessGroups(processesFilter);

        processMultiSelectOptionsPerProcessGroups.forEach((processList, processGroupId) => {
            if (!isAdminMode) {
                processList = processList.filter((processData) =>
                    this.userService.isReceiveRightsForProcess(processData.value)
                );
            }

            if (!processList.length) {
                processMultiSelectOptionsPerProcessGroups.delete(processGroupId);
            } else {
                const options: Array<MultiSelectOption> = [];
                processList.forEach((process) => options.push(new MultiSelectOption(process.value, process.label)));
                processMultiSelectOptionsPerProcessGroups.set(processGroupId, options);
            }
        });
        return processMultiSelectOptionsPerProcessGroups;
    }

    getProcessGroupsMultiSelectOptions(
        processesWithoutProcessGroupMultiSelectOptions: any[],
        processMultiSelectOptionsPerProcessGroups: Map<string, any[]>
    ): any[] {
        const processGroupsMultiSelectOptions = [];
        const processesGroups = this.processesService.getProcessGroups();

        if (processesWithoutProcessGroupMultiSelectOptions.length > 0)
            processGroupsMultiSelectOptions.push(
                new MultiSelectOption('--', this.translate.instant('processGroup.defaultLabel'))
            );

        const processGroupIds = Array.from(processMultiSelectOptionsPerProcessGroups.keys());
        processGroupIds.forEach((processGroupId) =>
            processGroupsMultiSelectOptions.push(
                new MultiSelectOption(processGroupId, processesGroups.get(processGroupId).name)
            )
        );

        return processGroupsMultiSelectOptions;
    }
}
