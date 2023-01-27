/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from '@angular/core';
import {HttpParams, HttpUrlEncodingCodec} from '@angular/common/http';
import {environment} from '@env/environment';
import {Observable, of} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {
    ConsideredAcknowledgedForUserWhenEnum,
    Process,
    ShowAcknowledgmentFooterEnum,
    TypeOfStateEnum
} from '@ofModel/processes.model';
import {MonitoringConfig} from '@ofModel/monitoringConfig.model';
import {Card} from '@ofModel/card.model';
import {UserService} from '@ofServices/user.service';
import {LightCard} from '@ofModel/light-card.model';
import {ProcessServer} from 'app/business/server/process.server';
import {ConfigServer} from 'app/business/server/config.server';
import {ServerResponseStatus} from '../server/serverResponse';

@Injectable({
    providedIn: 'root'
})
export class ProcessesService {
    readonly processesUrl: string;
    readonly processGroupsUrl: string;
    readonly monitoringConfigUrl: string;
    private urlCleaner: HttpUrlEncodingCodec;
    private processCache = new Map();
    private processes: Process[];
    private processGroups = new Map<string, {name: string; processes: string[]}>();
    private monitoringConfig: MonitoringConfig;

    private typeOfStatesPerProcessAndState: Map<string, TypeOfStateEnum>;

    constructor(
        private userService: UserService,
        private processServer: ProcessServer,
        private configServer: ConfigServer
    ) {
        this.urlCleaner = new HttpUrlEncodingCodec();
        this.processesUrl = `${environment.urls.processes}`;
        this.processGroupsUrl = `${environment.urls.processGroups}`;
        this.monitoringConfigUrl = `${environment.urls.monitoringConfig}`;
    }

    public loadAllProcesses(): Observable<any> {
        return this.queryAllProcesses().pipe(
            map((processesLoaded) => {
                if (!!processesLoaded) {
                    this.processes = processesLoaded;
                    if (this.processes.length === 0) {
                        console.log(new Date().toISOString(), 'WARNING : no processes configured');
                    } else {
                        this.loadAllProcessesInCache();
                        console.log(new Date().toISOString(), 'List of processes loaded');
                    }
                }
            }),
            catchError((error) => {
                console.error(new Date().toISOString(), 'An error occurred when loading all processes', error);
                return of(error);
            })
        );
    }

    public loadProcessGroups(): Observable<any> {
        return this.queryProcessGroups().pipe(
            map((response) => {
                const processGroupsFile = response.data;
                if (!!processGroupsFile) {
                    const processGroupsList = processGroupsFile.groups;
                    if (!!processGroupsList)
                        processGroupsList.forEach((processGroup) => {
                            this.processGroups.set(processGroup.id, {
                                name: processGroup.name,
                                processes: processGroup.processes
                            });
                        });
                    console.log(new Date().toISOString(), 'List of process groups loaded');
                }
                if (response.status!==ServerResponseStatus.OK) console.error(new Date().toISOString(), 'An error occurred when loading processGroups');
                return "";
            })
        );
    }

    private loadAllProcessesInCache() {
        this.processes.forEach((process) => {
            this.processCache.set(
                `${process.id}.${process.version}`,
                Object.setPrototypeOf(process, Process.prototype)
            );
        });
    }

    public loadMonitoringConfig(): Observable<MonitoringConfig> {
        return this.configServer.getMonitoringConfiguration().pipe(
            map((serverResponse) => {
                const monitoringConfig = serverResponse.data;
                if (!!monitoringConfig) {
                    this.monitoringConfig = monitoringConfig;
                    console.log(new Date().toISOString(), 'Monitoring config loaded');
                } else console.log(new Date().toISOString(), 'No monitoring config to load');
                if (serverResponse.status!==ServerResponseStatus.OK)  console.error(new Date().toISOString(), 'An error occurred when loading monitoringConfig');
                return monitoringConfig;
            })
        );
    }

    public getAllProcesses(): Process[] {
        return this.processes;
    }

    public getProcessGroups(): Map<string, {name: string; processes: string[]}> {
        return this.processGroups;
    }

    public getProcessGroupName(id: string) {
        const processGroup = this.processGroups.get(id);
        if (!!processGroup) return processGroup.name;
        return '';
    }

    public getMonitoringConfig(): any {
        return this.monitoringConfig;
    }

    public getProcess(processId: string): Process {
        return this.processes.find((process) => processId === process.id);
    }

    public getProcessGroupsAndLabels(): {
        groupId: string;
        groupLabel: string;
        processes: {
            processId: string;
            processLabel: string;
        }[];
    }[] {
        const processGroupsAndLabels = [];

        this.getProcessGroups().forEach((group, groupId) => {
            const processIdAndLabels = [];

            group.processes.forEach((processId) => {
                const processDefinition = this.getProcess(processId);

                if (processDefinition)
                    processIdAndLabels.push({
                        processId: processId,
                        processLabel: !!processDefinition.name ? processDefinition.name : processDefinition.id
                    });
                else processIdAndLabels.push({processId: processId, processLabel: ''});
            });

            processGroupsAndLabels.push({
                groupId: groupId,
                groupLabel: !!group.name ? group.name : groupId,
                processes: processIdAndLabels
            });
        });
        return processGroupsAndLabels;
    }

    queryProcessFromCard(card: Card): Observable<Process> {
        return this.queryProcess(card.process, card.processVersion);
    }

    queryAllProcesses(): Observable<Process[]> {
        return this.processServer.getAllProcessesDefinition().pipe(
            map(response => {
                if (response.status!==ServerResponseStatus.OK)  {
                    console.error(new Date().toISOString(), 'An error occurred when loading processes configuration');
                    return new Array<Process>();
                }
                return response.data;
            })
        );
    }

    queryProcessGroups(): Observable<any> {
        return this.processServer.getProcessGroups();
    }

    queryProcess(id: string, version: string): Observable<Process> {
        const key = `${id}.${version}`;
        const process = this.processCache.get(key);
        if (process) {
            return of(process);
        }
        return this.processServer.getProcessDefinition(id, version).pipe(
            map( response => {
                if ((response.status===ServerResponseStatus.OK) && (response.data)) this.processCache.set(key, response.data);
                else   console.log(
                    new Date().toISOString(),
                    `WARNING process ` +
                        ` ${id} with version ${version} does not exist.`);
                return response.data
            }));
    }

    fetchHbsTemplate(process: string, version: string, name: string): Observable<string> {
        return this.processServer.getTemplate(process,version,name).pipe(
            map( serverResponse => {
                if (serverResponse.status !== ServerResponseStatus.OK) throw new Error("Template not available");
                return serverResponse.data;
            })
        );
    }

    computeBusinessconfigCssUrl(process: string, styleName: string, version: string) {
        // manage url character encoding
        const resourceUrl = this.urlCleaner.encodeValue(`${this.processesUrl}/${process}/css/${styleName}`);
        const versionParam = new HttpParams().set('version', version);
        return `${resourceUrl}?${versionParam.toString()}`;
    }


    public findProcessGroupIdForProcessId(processId: string): string {
        const data = this.findProcessGroupForProcess(processId);

        if (!! data) {
            return data.id;
        }
        return null;
    }

    public findProcessGroupForProcess(processId: string) {
        for (let [groupId, group] of this.processGroups) {
            if (group.processes.find((process) => process === processId))
                return {id: groupId, name: group.name, processes: group.processes};
        }
        return null;
    }

    public getProcessesPerProcessGroups(processesFilter?: string[]): Map<any, any> {
        const processesPerProcessGroups = new Map();

        this.getAllProcesses().forEach((process) => {
            if (!processesFilter || processesFilter.includes(process.id)) {
                const processGroup = this.findProcessGroupForProcess(process.id);
                if (!!processGroup) {
                    const processes = !!processesPerProcessGroups.get(processGroup.id)
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

    public getProcessesWithoutProcessGroup(processesFilter?: string[]): Process[] {
        const processesWithoutProcessGroup = [];

        this.getAllProcesses().forEach((process) => {
            if (!processesFilter || processesFilter.includes(process.id)) {
                const processGroup = this.findProcessGroupForProcess(process.id);
                if (!processGroup) processesWithoutProcessGroup.push(process);
            }
        });
        return processesWithoutProcessGroup;
    }

    public findProcessGroupLabelForProcess(processId: string): string {
        const processGroup = this.findProcessGroupForProcess(processId);
        return !!processGroup ? processGroup.name : 'processGroup.defaultLabel';
    }

    private loadTypeOfStatesPerProcessAndState() {
        this.typeOfStatesPerProcessAndState = new Map();

        for (const process of this.processes) {
            for (const state in process.states)
                this.typeOfStatesPerProcessAndState.set(process.id + '.' + state, process.states[state].type);
        }
    }

    public getTypeOfStatesPerProcessAndState(): Map<string, TypeOfStateEnum> {
        if (!this.typeOfStatesPerProcessAndState) this.loadTypeOfStatesPerProcessAndState();
        return this.typeOfStatesPerProcessAndState;
    }

    public getStatesListPerProcess(isAdminMode: boolean, hideChildStates: boolean): Map<string, any[]> {
        const statesListPerProcess = new Map();

        this.getAllProcesses().forEach((process) => {
            const statesDropdownList = [];
            for (const state in process.states) {
                if (
                    !(hideChildStates && process.states[state].isOnlyAChildState) &&
                    (isAdminMode || this.userService.isReceiveRightsForProcessAndState(process.id, state))
                ) {
                    statesDropdownList.push({
                        id: process.id + '.' + state
                    });
                }
            }
            if (statesDropdownList.length) statesListPerProcess.set(process.id, statesDropdownList);
        });
        return statesListPerProcess;
    }

    public getConsideredAcknowledgedForUserWhenForALightCard(
        lightCard: LightCard
    ): ConsideredAcknowledgedForUserWhenEnum {
        let consideredAcknowledgedForUserWhen = ConsideredAcknowledgedForUserWhenEnum.USER_HAS_ACKNOWLEDGED;

        this.queryProcess(lightCard.process, lightCard.processVersion).subscribe((process) => {
            const state = process.extractState(lightCard);
            if (!!state.consideredAcknowledgedForUserWhen)
                consideredAcknowledgedForUserWhen = state.consideredAcknowledgedForUserWhen;
        });
        return consideredAcknowledgedForUserWhen;
    }

    public getShowAcknowledgmentFooterForACard(card: Card): ShowAcknowledgmentFooterEnum {
        let showAcknowledgmentFooter = ShowAcknowledgmentFooterEnum.ONLY_FOR_EMITTING_ENTITY;

        this.queryProcess(card.process, card.processVersion).subscribe((process) => {
            const state = process.extractState(card);
            if (!!state.showAcknowledgmentFooter)
                showAcknowledgmentFooter = state.showAcknowledgmentFooter;
        });
        return showAcknowledgmentFooter;
    }
}
