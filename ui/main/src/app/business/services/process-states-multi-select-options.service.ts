/* Copyright (c) 2021-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {ProcessesService} from 'app/business/services/businessconfig/processes.service';
import {UserService} from 'app/business/services/users/user.service';
import {MultiSelectOption} from '@ofModel/multiselect.model';

/** This class contains functions to get the list of process and states for filters in UI */

@Injectable({
    providedIn: 'root'
})
export class ProcessStatesMultiSelectOptionsService {
    constructor(private translate: TranslateService) {}

    getStatesMultiSelectOptionsPerProcess(
        isAdminModeAndUserHasRightToSeeAllStates: boolean,
        hideChildStates: boolean
    ): any[] {
        const statesMultiSelectOptionsPerProcess: Array<MultiSelectOption> = [];
        ProcessesService.getAllProcesses().forEach((process) => {
            const stateOptions = new MultiSelectOption(process.id, process.name);
            stateOptions.options = [];
            process.states.forEach((state, stateid) => {
                if (
                    this.doesStateHaveToBeDisplayedInFilters(
                        hideChildStates,
                        state.isOnlyAChildState,
                        process.id,
                        stateid,
                        isAdminModeAndUserHasRightToSeeAllStates
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
        isAdminModeAndUserHasRightToSeeAllStates: boolean
    ): boolean {
        return (
            !(hideChildStates && isOnlyAChildState) &&
            (isAdminModeAndUserHasRightToSeeAllStates ||
                UserService.isReceiveRightsForProcessAndState(processId, stateId))
        );
    }

    getProcessesWithoutProcessGroupMultiSelectOptions(
        isAdminModeAndUserHasRightToSeeAllStates: boolean,
        processesFilter?: string[]
    ): any[] {
        const processesWithoutProcessGroupMultiSelectOptions: Array<MultiSelectOption> = [];

        ProcessesService.getProcessesWithoutProcessGroup(processesFilter).forEach((process) => {
            if (isAdminModeAndUserHasRightToSeeAllStates || UserService.isReceiveRightsForProcess(process.id))
                processesWithoutProcessGroupMultiSelectOptions.push(new MultiSelectOption(process.id, process.name));
        });
        return processesWithoutProcessGroupMultiSelectOptions;
    }

    getProcessesMultiSelectOptionsPerProcessGroup(
        isAdminModeAndUserHasRightToSeeAllStates: boolean,
        processesFilter?: string[]
    ): Map<string, any[]> {
        const processMultiSelectOptionsPerProcessGroups =
            ProcessesService.getProcessesPerProcessGroups(processesFilter);

        processMultiSelectOptionsPerProcessGroups.forEach((processList, processGroupId) => {
            if (!isAdminModeAndUserHasRightToSeeAllStates) {
                processList = processList.filter((processData) =>
                    UserService.isReceiveRightsForProcess(processData.value)
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
        const processesGroups = ProcessesService.getProcessGroups();

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
