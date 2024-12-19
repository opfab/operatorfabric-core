/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ProcessesService} from '@ofServices/processes/ProcessesService';
import {InputFieldName, UserCardUIControl} from '../userCard.model';
import {UserService} from 'app/business/services/users/user.service';
import {EntitiesService} from '@ofServices/entities/EntitiesService';
import {Card} from '@ofModel/card.model';

class ProcessGroupForUserCard {
    constructor(
        readonly id: string,
        readonly label: string,
        readonly processes: ProcessForUserCard[]
    ) {}
}

class ProcessForUserCard {
    constructor(
        readonly id: string,
        readonly label: string,
        readonly states: StateForUserCard[]
    ) {}
}

class StateForUserCard {
    constructor(
        readonly id: string,
        readonly label: string
    ) {}
}

export class ProcessStatesForm {
    private processGroups: ProcessGroupForUserCard[] = [];
    private currentProcessList: ProcessForUserCard[] = [];
    private selectedProcessGroupId: string;
    private selectedProcessId: string;
    private selectedStateId: string;
    private currentCard: Card;

    constructor(private readonly userCardUIControl: UserCardUIControl) {}

    init(card: Card = undefined) {
        this.currentCard = card;
        this.processGroups = this.buildProcessStateTree();
        if (this.processGroups.length === 0) {
            return;
        }
        let selected = this.processGroups[0].id;
        if (card) {
            const processGroup = this.processGroups.find((processGroup) =>
                processGroup.processes.some((process) => process.id === card.process)
            );
            if (processGroup) {
                selected = processGroup.id;
            }
        }
        if (this.processGroups.length === 1) {
            this.userCardUIControl.setInputVisibility(InputFieldName.ProcessGroup, false);
        } else {
            this.userCardUIControl.setProcessGroupList(
                this.processGroups.map(({id, label}) => ({id, label})),
                selected
            );
            this.userCardUIControl.setInputVisibility(InputFieldName.ProcessGroup, true);
        }
        this.userClickOnProcessGroup(selected);
        if (card) this.userCardUIControl.lockProcessAndProcessGroupSelection(true);
    }

    private buildProcessStateTree(): ProcessGroupForUserCard[] {
        const processList: ProcessForUserCard[] = [];
        ProcessesService.getAllProcesses().forEach((process) => {
            const stateList: StateForUserCard[] = [];
            process.states.forEach((state, stateId) => {
                if (
                    state.userCard &&
                    UserService.isWriteRightsForProcessAndState(process.id, stateId) &&
                    this.checkIfUserHasAtLeastOneEntityAllowedToSendCard(process.id, stateId)
                ) {
                    stateList.push(new StateForUserCard(stateId, state.name || stateId));
                    this.sortListByLabel(stateList);
                }
            });
            if (stateList.length > 0) {
                processList.push(new ProcessForUserCard(process.id, process.name || process.id, stateList));
            }
            this.sortListByLabel(processList);
        });
        const processGroupList: ProcessGroupForUserCard[] = [];
        ProcessesService.getProcessGroups().forEach((processGroup, processGroupId) => {
            const processesInGroup = processList.filter((process) => processGroup.processes.includes(process.id));
            if (processesInGroup.length > 0) {
                processGroupList.push(
                    new ProcessGroupForUserCard(processGroupId, processGroup.name || processGroupId, processesInGroup)
                );
            }
        });

        const processNotInProcessGroups = this.getProcessesForUserCardNotInProcessGroupsForProcessList(processList);
        if (processNotInProcessGroups.length > 0) {
            processGroupList.push(new ProcessGroupForUserCard('--', '--', processNotInProcessGroups));
        }
        this.sortListByLabel(processGroupList);
        return processGroupList;
    }

    private checkIfUserHasAtLeastOneEntityAllowedToSendCard(processId: string, stateId: string): boolean {
        const userEntities = UserService.getCurrentUserWithPerimeters().userData?.entities;
        const publisherList = ProcessesService.getProcess(processId).states.get(stateId).userCard?.publisherList;
        if (userEntities.length === 0) return false;
        if (userEntities && publisherList?.length > 0) {
            const entityIds = EntitiesService.resolveEntities(publisherList).map((entity) => entity.id);
            return entityIds.some((entityId) => userEntities.includes(entityId));
        }
        return true;
    }

    private sortListByLabel(list: {label: string}[]): void {
        list.sort((a, b) => a.label.localeCompare(b.label));
    }

    private getProcessesForUserCardNotInProcessGroupsForProcessList(
        processes: ProcessForUserCard[]
    ): ProcessForUserCard[] {
        const processGroups = Array.from(ProcessesService.getProcessGroups().keys());
        const processesNotInProcessGroups: ProcessForUserCard[] = [];
        processes.forEach((process) => {
            if (
                !processGroups.some((processGroupId) => {
                    return ProcessesService.getProcessGroups().get(processGroupId).processes.includes(process.id);
                })
            ) {
                processesNotInProcessGroups.push(process);
            }
        });
        return processesNotInProcessGroups;
    }

    private setSelectProcessGroup(processGroupId: string) {
        const newProcessGroup = this.processGroups.find((processGroup) => processGroup.id === processGroupId);
        if (newProcessGroup != null) {
            this.currentProcessList = newProcessGroup.processes;
            this.selectedProcessGroupId = processGroupId;
            const selected = this.currentCard?.process ?? this.currentProcessList[0].id;

            this.userCardUIControl.setProcessList(
                this.currentProcessList.map(({id, label}) => ({id, label})),
                selected
            );
            this.userCardUIControl.setInputVisibility(InputFieldName.Process, true);

            this.userClickOnProcess(selected);
        }
    }

    private setSelectProcess(processId: string) {
        const newProcess = this.currentProcessList.find((process) => process.id === processId);
        if (newProcess != null) {
            this.selectedProcessId = processId;
            const states = newProcess.states;
            const selected = this.currentCard?.state ?? states[0].id;
            if (states.length === 1) {
                this.userCardUIControl.setInputVisibility(InputFieldName.State, false);
            } else {
                this.userCardUIControl.setStatesList(
                    states.map(({id, label}) => ({id, label})),
                    selected
                );
                this.userCardUIControl.setInputVisibility(InputFieldName.State, true);
            }
            this.selectedStateId = selected;
        }
    }

    public userClickOnProcessGroup(processGroupId: string) {
        if (processGroupId === this.selectedProcessGroupId) return;
        this.setSelectProcessGroup(processGroupId);
    }

    public userClickOnProcess(processId: string) {
        if (processId === this.selectedProcessId) return;
        this.setSelectProcess(processId);
    }

    public getSelectedProcessState(): {processId: string; stateId: string; processVersion: string} {
        return {
            processId: this.selectedProcessId,
            stateId: this.selectedStateId,
            processVersion: ProcessesService.getProcess(this.selectedProcessId).version
        };
    }

    public hasAtLeastOneStateAllowedToSendCard(): boolean {
        return this.selectedStateId !== undefined;
    }

    public getSelectedProcessGroupId(): string {
        return this.selectedProcessGroupId;
    }

    public userClicksOnState(stateId: string) {
        this.selectedStateId = stateId;
    }
}
