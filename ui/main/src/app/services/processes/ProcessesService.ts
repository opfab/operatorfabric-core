/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Observable, of} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {
    ConsideredAcknowledgedForUserWhenEnum,
    Process,
    ShowAcknowledgmentFooterEnum,
    TypeOfStateEnum
} from '@ofServices/processes/model/Processes';
import {Card} from '@ofModel/card.model';
import {LightCard} from '@ofModel/light-card.model';
import {ProcessesServer} from '@ofServices/processes/server/ProcessesServer';
import {ServerResponseStatus} from '../../business/server/serverResponse';
import {LoggerService as logger} from 'app/services/logs/LoggerService';

export class ProcessesService {
    private static processesServer: ProcessesServer;
    private static readonly processesWithAllVersionsCache = new Map();
    private static processesWithLatestVersionOnly: Process[];
    private static processesWithAllVersions: Process[];
    private static readonly processGroups = new Map<string, {name: string; processes: string[]}>();

    private static typeOfStatesPerProcessAndState: Map<string, TypeOfStateEnum>;

    public static setProcessServer(processesServer: ProcessesServer) {
        this.processesServer = processesServer;
    }

    public static loadAllProcessesWithLatestVersion(): Observable<any> {
        return ProcessesService.queryAllProcesses().pipe(
            map((processesLoaded) => {
                if (processesLoaded) {
                    ProcessesService.processesWithLatestVersionOnly = processesLoaded;
                    if (ProcessesService.processesWithLatestVersionOnly.length === 0) {
                        logger.warn('No processes configured');
                    } else {
                        logger.info('List of processes loaded');
                    }
                }
            }),
            catchError((error) => {
                logger.error('An error occurred when loading all processes ' + JSON.stringify(error));
                return of(error);
            })
        );
    }

    public static loadAllProcessesWithAllVersions(): Observable<any> {
        return ProcessesService.queryAllProcessesWithAllVersions().pipe(
            map((processesLoaded) => {
                if (processesLoaded) {
                    ProcessesService.processesWithAllVersions = processesLoaded;
                    if (ProcessesService.processesWithAllVersions.length === 0) {
                        logger.warn('No processes configured');
                    } else {
                        ProcessesService.loadAllProcessesWithAllVersionsInCache();
                        logger.info('List of all versions of processes loaded');
                    }
                }
            }),
            catchError((error) => {
                logger.error('An error occurred when loading all versions of processes' + JSON.stringify(error));
                return of(error);
            })
        );
    }

    public static loadProcessGroups(): Observable<any> {
        return ProcessesService.queryProcessGroups().pipe(
            map((response) => {
                const processGroupsFile = response.data;
                if (processGroupsFile) {
                    const processGroupsList = processGroupsFile.groups;
                    if (processGroupsList) {
                        ProcessesService.processGroups.clear();
                        processGroupsList.forEach((processGroup) => {
                            ProcessesService.processGroups.set(processGroup.id, {
                                name: processGroup.name,
                                processes: processGroup.processes
                            });
                        });
                    }
                    logger.info('List of process groups loaded');
                }
                if (response.status !== ServerResponseStatus.OK)
                    logger.error('An error occurred when loading processGroups');
                return '';
            })
        );
    }

    private static loadAllProcessesWithAllVersionsInCache() {
        ProcessesService.processesWithAllVersions.forEach((processInSomeVersion) => {
            ProcessesService.processesWithAllVersionsCache.set(
                `${processInSomeVersion.id}.${processInSomeVersion.version}`,
                Object.setPrototypeOf(processInSomeVersion, Process.prototype)
            );
        });
    }

    public static getAllProcesses(): Process[] {
        return ProcessesService.processesWithLatestVersionOnly;
    }

    public static getProcessGroups(): Map<string, {name: string; processes: string[]}> {
        return ProcessesService.processGroups;
    }

    public static getProcessGroupName(id: string) {
        const processGroup = ProcessesService.processGroups.get(id);
        if (processGroup) return processGroup.name;
        return '';
    }

    public static getProcess(processId: string): Process {
        return ProcessesService.processesWithLatestVersionOnly.find((process) => processId === process.id);
    }

    public static getProcessWithVersion(processId: string, processVersion: string): Process {
        return ProcessesService.processesWithAllVersionsCache.get(processId + '.' + processVersion);
    }

    public static getProcessGroupsAndLabels(): {
        groupId: string;
        groupLabel: string;
        processes: {
            processId: string;
            processLabel: string;
        }[];
    }[] {
        const processGroupsAndLabels = [];

        ProcessesService.getProcessGroups().forEach((group, groupId) => {
            const processIdAndLabels = [];

            group.processes.forEach((processId) => {
                const processDefinition = ProcessesService.getProcess(processId);

                if (processDefinition)
                    processIdAndLabels.push({
                        processId: processId,
                        processLabel: processDefinition.name ? processDefinition.name : processDefinition.id
                    });
                else processIdAndLabels.push({processId: processId, processLabel: ''});
            });

            processGroupsAndLabels.push({
                groupId: groupId,
                groupLabel: group.name ? group.name : groupId,
                processes: processIdAndLabels
            });
        });
        return processGroupsAndLabels;
    }

    public static queryProcessFromCard(card: Card): Observable<Process> {
        return ProcessesService.queryProcess(card.process, card.processVersion);
    }

    public static queryAllProcesses(): Observable<Process[]> {
        return ProcessesService.processesServer.getAllProcessesDefinition().pipe(
            map((response) => {
                if (response.status !== ServerResponseStatus.OK) {
                    logger.error('An error occurred when loading processes configuration');
                    return new Array<Process>();
                }
                return response.data;
            })
        );
    }

    public static queryAllProcessesWithAllVersions(): Observable<Process[]> {
        return ProcessesService.processesServer.getAllProcessesWithAllVersions().pipe(
            map((response) => {
                if (response.status !== ServerResponseStatus.OK) {
                    logger.error('An error occurred when loading all versions of processes');
                    return new Array<Process>();
                }
                return response.data;
            })
        );
    }

    public static queryProcessGroups(): Observable<any> {
        return ProcessesService.processesServer.getProcessGroups();
    }

    public static queryProcess(id: string, version: string): Observable<Process> {
        const key = `${id}.${version}`;
        const process = ProcessesService.processesWithAllVersionsCache.get(key);
        if (process) {
            return of(process);
        }
        return ProcessesService.processesServer.getProcessDefinition(id, version).pipe(
            map((response) => {
                if (response.status === ServerResponseStatus.OK && response.data)
                    ProcessesService.processesWithAllVersionsCache.set(key, response.data);
                else logger.warn(`Process ` + ` ${id} with version ${version} does not exist.`);
                return response.data;
            })
        );
    }

    public static findProcessGroupIdForProcessId(processId: string): string {
        const data = ProcessesService.findProcessGroupForProcess(processId);

        if (data) {
            return data.id;
        }
        return null;
    }

    public static findProcessGroupForProcess(processId: string) {
        for (const [groupId, group] of ProcessesService.processGroups) {
            if (group.processes.find((process) => process === processId))
                return {id: groupId, name: group.name, processes: group.processes};
        }
        return null;
    }

    public static getProcessesPerProcessGroups(processIds?: string[]): Map<any, any> {
        const processesPerProcessGroups = new Map();

        ProcessesService.getAllProcesses().forEach((process) => {
            if (!processIds || processIds.includes(process.id)) {
                const processGroup = ProcessesService.findProcessGroupForProcess(process.id);
                if (processGroup) {
                    const processes = processesPerProcessGroups.get(processGroup.id)
                        ? processesPerProcessGroups.get(processGroup.id)
                        : [];
                    processes.push({
                        value: process.id,
                        label: process.name
                    });
                    processesPerProcessGroups.set(processGroup.id, processes);
                }
            }
        });
        return processesPerProcessGroups;
    }

    public static getProcessesWithoutProcessGroup(processesFilter?: string[]): Process[] {
        const processesWithoutProcessGroup = [];

        ProcessesService.getAllProcesses().forEach((process) => {
            if (!processesFilter || processesFilter.includes(process.id)) {
                const processGroup = ProcessesService.findProcessGroupForProcess(process.id);
                if (!processGroup) processesWithoutProcessGroup.push(process);
            }
        });
        return processesWithoutProcessGroup;
    }

    public static findProcessGroupLabelForProcess(processId: string): string {
        const processGroup = ProcessesService.findProcessGroupForProcess(processId);
        return processGroup ? processGroup.name : 'processGroup.defaultLabel';
    }

    private static loadTypeOfStatesPerProcessAndState() {
        ProcessesService.typeOfStatesPerProcessAndState = new Map();

        for (const process of ProcessesService.processesWithLatestVersionOnly) {
            process.states.forEach((state, stateid) => {
                ProcessesService.typeOfStatesPerProcessAndState.set(process.id + '.' + stateid, state.type);
            });
        }
    }

    public static getTypeOfStatesPerProcessAndState(): Map<string, TypeOfStateEnum> {
        if (!ProcessesService.typeOfStatesPerProcessAndState) ProcessesService.loadTypeOfStatesPerProcessAndState();
        return ProcessesService.typeOfStatesPerProcessAndState;
    }

    public static getConsideredAcknowledgedForUserWhenForALightCard(
        lightCard: LightCard
    ): ConsideredAcknowledgedForUserWhenEnum {
        let consideredAcknowledgedForUserWhen = ConsideredAcknowledgedForUserWhenEnum.USER_HAS_ACKNOWLEDGED;

        const processDef = ProcessesService.getProcessWithVersion(lightCard.process, lightCard.processVersion);

        if (processDef) {
            const state = processDef.states.get(lightCard.state);
            if (state?.consideredAcknowledgedForUserWhen) {
                consideredAcknowledgedForUserWhen = state.consideredAcknowledgedForUserWhen;
            }
        }

        return consideredAcknowledgedForUserWhen;
    }

    public static getShowAcknowledgmentFooterForACard(card: Card): ShowAcknowledgmentFooterEnum {
        let showAcknowledgmentFooter = ShowAcknowledgmentFooterEnum.ONLY_FOR_EMITTING_ENTITY;

        const processDef = ProcessesService.getProcessWithVersion(card.process, card.processVersion);

        if (processDef) {
            const state = processDef.states.get(card.state);
            if (state?.showAcknowledgmentFooter) {
                showAcknowledgmentFooter = state.showAcknowledgmentFooter;
            }
        }

        return showAcknowledgmentFooter;
    }
}
