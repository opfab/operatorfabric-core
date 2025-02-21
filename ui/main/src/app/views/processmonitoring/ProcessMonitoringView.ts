/* Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ProcessesService} from '@ofServices/processes/ProcessesService';
import {ProcessGroups, ProcessToMonitor, StatePerProcessToMonitor} from './ProcessMonitoringPage';
import {UsersService} from '@ofServices/users/UsersService';
import {Utilities} from '../../utils/Utilities';
import {Process} from '@ofServices/processes/model/Processes';
import {PermissionEnum} from '@ofServices/groups/model/PermissionEnum';
import {add, endOfWeek, format, parse, startOfWeek, sub} from 'date-fns';
import {DateTimeFormatterService} from 'app/services/dateTimeFormatter/DateTimeFormatterService';

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
            if (UsersService.isReceiveRightsForProcessAndState(process.id, stateId)) {
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
                    if (UsersService.isReceiveRightsForProcessAndState(process.id, stateId)) {
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
        return UsersService.hasCurrentUserAnyPermission([
            PermissionEnum.ADMIN,
            PermissionEnum.VIEW_ALL_CARDS,
            PermissionEnum.VIEW_ALL_CARDS_FOR_USER_PERIMETERS
        ]);
    }

    private getDatesWhenMovingWithPeriodClicked(
        activeFrom: string,
        activeTo: string,
        isForward: boolean,
        periodClicked: string
    ): {activeFrom: any; activeTo: any} {
        if (periodClicked === 'year') {
            return this.getDatesWhenMovingWithYearPeriodClicked(activeFrom, activeTo, isForward);
        }
        if (periodClicked === 'month') {
            return this.getDatesWhenMovingWithMonthPeriodClicked(activeFrom, activeTo, isForward);
        }
        if (periodClicked === 'week') {
            return this.getDatesWhenMovingWithWeekPeriodClicked(activeFrom, activeTo, isForward);
        }
        return null;
    }

    private getDatesWhenMovingWithYearPeriodClicked(
        activeFrom: string,
        activeTo: string,
        isForward: boolean
    ): {activeFrom: any; activeTo: any} {
        const activeFromDateFormat = new Date(activeFrom);
        const activeToDateFormat = new Date(activeTo);

        if (isForward) {
            return {
                activeFrom: activeFromDateFormat.getFullYear() + 1 + '-01-01T00:00',
                activeTo: activeToDateFormat.getFullYear() + 1 + '-01-01T00:00'
            };
        } else {
            return {
                activeFrom: activeFromDateFormat.getFullYear() - 1 + '-01-01T00:00',
                activeTo: activeToDateFormat.getFullYear() - 1 + '-01-01T00:00'
            };
        }
    }

    private getDatesWhenMovingWithMonthPeriodClicked(
        activeFrom: string,
        activeTo: string,
        isForward: boolean
    ): {activeFrom: any; activeTo: any} {
        const activeFromDateFormat = new Date(activeFrom);
        const activeToDateFormat = new Date(activeTo);

        if (isForward) {
            return {
                activeFrom:
                    activeFromDateFormat.getMonth() + 1 === 12
                        ? activeFromDateFormat.getFullYear() + 1 + '-01-01T00:00'
                        : activeFromDateFormat.getFullYear() +
                          '-' +
                          String(activeFromDateFormat.getMonth() + 2).padStart(2, '0') +
                          '-01T00:00',
                activeTo:
                    activeToDateFormat.getMonth() + 1 === 12
                        ? activeToDateFormat.getFullYear() + 1 + '-01-01T00:00'
                        : activeToDateFormat.getFullYear() +
                          '-' +
                          String(activeToDateFormat.getMonth() + 2).padStart(2, '0') +
                          '-01T00:00'
            };
        } else {
            return {
                activeFrom:
                    activeFromDateFormat.getMonth() === 0
                        ? activeFromDateFormat.getFullYear() - 1 + '-12-01T00:00'
                        : activeFromDateFormat.getFullYear() +
                          '-' +
                          String(activeFromDateFormat.getMonth()).padStart(2, '0') +
                          '-01T00:00',
                activeTo:
                    activeToDateFormat.getMonth() === 0
                        ? activeToDateFormat.getFullYear() - 1 + '-12-01T00:00'
                        : activeToDateFormat.getFullYear() +
                          '-' +
                          String(activeToDateFormat.getMonth()).padStart(2, '0') +
                          '-01T00:00'
            };
        }
    }

    private getDatesWhenMovingWithWeekPeriodClicked(
        activeFrom: string,
        activeTo: string,
        isForward: boolean
    ): {activeFrom: any; activeTo: any} {
        if (isForward) {
            return {
                activeFrom: format(
                    add(parse(activeFrom, "yyyy-MM-dd'T'HH:mm", new Date()), {days: 7}),
                    "yyyy-MM-dd'T'HH:mm"
                ),
                activeTo: format(
                    add(parse(activeTo, "yyyy-MM-dd'T'HH:mm", new Date()), {days: 7}),
                    "yyyy-MM-dd'T'HH:mm"
                )
            };
        } else {
            return {
                activeFrom: format(
                    sub(parse(activeFrom, "yyyy-MM-dd'T'HH:mm", new Date()), {days: 7}),
                    "yyyy-MM-dd'T'HH:mm"
                ),
                activeTo: format(
                    sub(parse(activeTo, "yyyy-MM-dd'T'HH:mm", new Date()), {days: 7}),
                    "yyyy-MM-dd'T'HH:mm"
                )
            };
        }
    }

    public getDatesWhenMoving(
        activeFrom: string,
        activeTo: string,
        isForward: boolean,
        periodClicked: string
    ): {activeFrom: any; activeTo: any} {
        if (periodClicked !== '') {
            return this.getDatesWhenMovingWithPeriodClicked(activeFrom, activeTo, isForward, periodClicked);
        }

        const activeFromDateFormat = new Date(activeFrom);
        const activeToDateFormat = new Date(activeTo);

        let newActiveFromDate: Date, newActiveToDate: Date;
        if (isForward) {
            newActiveFromDate = new Date(
                activeFromDateFormat.getTime() + (activeToDateFormat.getTime() - activeFromDateFormat.getTime())
            );
            newActiveToDate = new Date(
                activeToDateFormat.getTime() + (activeToDateFormat.getTime() - activeFromDateFormat.getTime())
            );
        } else {
            newActiveFromDate = new Date(
                activeFromDateFormat.getTime() - (activeToDateFormat.getTime() - activeFromDateFormat.getTime())
            );
            newActiveToDate = new Date(
                activeToDateFormat.getTime() - (activeToDateFormat.getTime() - activeFromDateFormat.getTime())
            );
        }
        return {
            activeFrom: this.formatDateObjectForInput(newActiveFromDate),
            activeTo: this.formatDateObjectForInput(newActiveToDate)
        };
    }

    private formatDateObjectForInput(date: Date): string {
        return (
            date.getFullYear() +
            '-' +
            String(date.getMonth() + 1).padStart(2, '0') +
            '-' +
            String(date.getDate()).padStart(2, '0') +
            'T' +
            String(date.getHours()).padStart(2, '0') +
            ':' +
            String(date.getMinutes()).padStart(2, '0')
        );
    }

    public getDatesAfterPeriodClick(periodClicked: string): {activeFrom: any; activeTo: any} {
        if (periodClicked === 'year') {
            return {
                activeFrom: new Date().getFullYear() + '-01-01T00:00',
                activeTo: new Date().getFullYear() + 1 + '-01-01T00:00'
            };
        }
        if (periodClicked === 'month') {
            return {
                activeFrom:
                    new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0') + '-01T00:00',
                activeTo:
                    new Date().getMonth() === 11
                        ? new Date().getFullYear() + 1 + '-01-01T00:00'
                        : new Date().getFullYear() +
                          '-' +
                          String(new Date().getMonth() + 2).padStart(2, '0') +
                          '-01T00:00'
            };
        }
        if (periodClicked === 'week') {
            const localeOption = DateTimeFormatterService.getDateFnsLocaleOption();

            const startOfWeekDate = startOfWeek(new Date(), localeOption);
            const endOfWeekDate = add(endOfWeek(new Date(), localeOption), {days: 1});
            return {
                activeFrom:
                    startOfWeekDate.getFullYear() +
                    '-' +
                    String(startOfWeekDate.getMonth() + 1).padStart(2, '0') +
                    '-' +
                    String(startOfWeekDate.getDate()).padStart(2, '0') +
                    'T00:00',
                activeTo:
                    endOfWeekDate.getFullYear() +
                    '-' +
                    String(endOfWeekDate.getMonth() + 1).padStart(2, '0') +
                    '-' +
                    String(endOfWeekDate.getDate()).padStart(2, '0') +
                    'T00:00'
            };
        }
        return null;
    }
}
