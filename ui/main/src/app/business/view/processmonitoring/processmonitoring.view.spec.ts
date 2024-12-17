/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Process, State, UiVisibility} from '@ofModel/processes.model';
import {ProcessServerMock} from '@tests/mocks/processServer.mock';
import {ServerResponse, ServerResponseStatus} from 'app/business/server/serverResponse';
import {ProcessesService} from 'app/business/services/businessconfig/processes.service';
import {firstValueFrom} from 'rxjs';
import {ProcessMonitoringView} from './processmonitoring.view';
import {ComputedPerimeter, UserWithPerimeters} from '@ofModel/userWithPerimeters.model';
import {RightsEnum} from '@ofModel/perimeter.model';
import {UserService} from 'app/business/services/users/user.service';
import {UserServerMock} from '@tests/mocks/userServer.mock';
import {PermissionEnum} from '@ofModel/permission.model';
import {TranslationService} from '@ofServices/translation/TranslationService';
import {TranslationLibMock} from '@tests/mocks/TranslationLib.mock';
import {DateTimeFormatterService} from 'app/services/dateTimeFormatter/DateTimeFormatterService';
import {ConfigService} from 'app/services/config/ConfigService';

describe('Process Monitoring view ', () => {
    let processServerMock: ProcessServerMock;
    let userServerMock: UserServerMock;

    async function initProcesses(
        processNames: string[] = ['process name 1', 'process name 2'],
        stateNames: string[] = ['State 1_1', 'State 2_1', 'State 2_2']
    ) {
        const statesForProcess1 = new Map<string, State>();
        const state1_1 = new State();
        state1_1.name = stateNames[0];
        statesForProcess1.set('state1_1', state1_1);

        const statesForProcess2 = new Map<string, State>();
        const state2_1 = new State();
        state2_1.name = stateNames[1];
        statesForProcess2.set('state2_1', state2_1);
        const state2_2 = new State();
        state2_2.name = stateNames[2];
        statesForProcess2.set('state2_2', state2_2);

        const statesForProcess3 = new Map<string, State>();
        const state3_1 = new State();
        state3_1.name = 'State 3_1';
        statesForProcess3.set('state3_1', state3_1);

        const statesForProcessWithNoName = new Map<string, State>();
        const stateNoName_1 = new State();
        stateNoName_1.name = 'State NoName_1';
        statesForProcessWithNoName.set('stateNoName_1', stateNoName_1);

        const processes = [
            new Process(
                'process1',
                'v1',
                processNames[0],
                undefined,
                statesForProcess1,
                new UiVisibility(true, true, true, true)
            ),
            new Process(
                'process2',
                'v2',
                processNames[1],
                undefined,
                statesForProcess2,
                new UiVisibility(true, true, true, true)
            ),
            new Process(
                'process3',
                'v2',
                'process name 3',
                undefined,
                statesForProcess3,
                new UiVisibility(true, false, true, true)
            ),

            new Process('process4', 'v2', 'process name 4', undefined, undefined),
            new Process(
                'processWithNoName',
                'v2',
                '',
                undefined,
                statesForProcessWithNoName,
                new UiVisibility(true, true, true, true)
            )
        ];

        processServerMock = new ProcessServerMock();
        ProcessesService.setProcessServer(processServerMock);
        processServerMock.setResponseForProcessesDefinition(
            new ServerResponse(processes, ServerResponseStatus.OK, null)
        );
        processServerMock.setResponseForProcessesWithAllVersions(
            new ServerResponse(processes, ServerResponseStatus.OK, null)
        );
        await firstValueFrom(ProcessesService.loadAllProcessesWithLatestVersion());
        await firstValueFrom(ProcessesService.loadAllProcessesWithAllVersions());
    }

    async function setDefaultUserPerimeter() {
        await setUserPerimeter([
            new ComputedPerimeter('process1', 'state1_1', RightsEnum.Receive, true),
            new ComputedPerimeter('process2', 'state2_1', RightsEnum.Receive, true),
            new ComputedPerimeter('process2', 'state2_2', RightsEnum.Receive, true)
        ]);
    }

    async function setUserPerimeter(computedPerimeters: ComputedPerimeter[], permissions?: PermissionEnum[]) {
        userServerMock = new UserServerMock();
        UserService.setUserServer(userServerMock);
        const userWithPerimeters = new UserWithPerimeters(null, computedPerimeters, permissions, new Map());
        userServerMock.setResponseForCurrentUserWithPerimeter(
            new ServerResponse(userWithPerimeters, ServerResponseStatus.OK, null)
        );
        await firstValueFrom(UserService.loadUserWithPerimetersData());
    }

    async function initProcessGroups(
        processGroups = {
            groups: [
                {
                    id: 'service1',
                    name: 'Service 1',
                    processes: ['process1', 'process2']
                },
                {
                    id: 'service2',
                    name: 'Service 2',
                    processes: ['processWithNoName']
                }
            ]
        }
    ) {
        processServerMock.setResponseForProcessGroups(new ServerResponse(processGroups, ServerResponseStatus.OK, null));
        await firstValueFrom(ProcessesService.loadProcessGroups());
    }

    describe('get processes', () => {
        it('should return the list of processes that have uiVisibility for monitoring process screen', async () => {
            await initProcesses();
            await setDefaultUserPerimeter();
            const processMonitoringView: ProcessMonitoringView = new ProcessMonitoringView();
            const processList = processMonitoringView.getProcessList();
            expect(processList.length).toBe(2);
            expect(processList[0].id).toBe('process1');
            expect(processList[0].label).toBe('process name 1');
            expect(processList[1].id).toBe('process2');
            expect(processList[1].label).toBe('process name 2');
        });

        it('should return the list of processes sort alphabetical order for monitoring process screen', async () => {
            await initProcesses(['B - process name 1', 'A - process name 2']);
            await setDefaultUserPerimeter();
            const processMonitoringView: ProcessMonitoringView = new ProcessMonitoringView();
            const processList = processMonitoringView.getProcessList();
            expect(processList.length).toBe(2);
            expect(processList[0].id).toBe('process2');
            expect(processList[0].label).toBe('A - process name 2');
            expect(processList[1].id).toBe('process1');
            expect(processList[1].label).toBe('B - process name 1');
        });

        it(' should return an empty process list if the user has no perimeter ', async () => {
            await initProcesses();
            await setUserPerimeter([]);
            const processMonitoringView: ProcessMonitoringView = new ProcessMonitoringView();
            const processList = processMonitoringView.getProcessList();
            expect(processList.length).toBe(0);
        });

        it(' should return process2 when the user has RECEIVE permission for process2 with state2_1', async () => {
            await initProcesses();
            await setUserPerimeter([new ComputedPerimeter('process2', 'state2_1', RightsEnum.Receive, true)]);
            const processMonitoringView: ProcessMonitoringView = new ProcessMonitoringView();
            const processList = processMonitoringView.getProcessList();
            expect(processList.length).toBe(1);
            expect(processList[0].id).toBe('process2');
            expect(processList[0].label).toBe('process name 2');
        });

        it(' should return process2 and process1 when the user has permission for the process1 and process2', async () => {
            await initProcesses();
            await setUserPerimeter([
                new ComputedPerimeter('process2', 'state2_1', RightsEnum.Receive, true),
                new ComputedPerimeter('process1', 'state1_1', RightsEnum.ReceiveAndWrite, true)
            ]);
            const processMonitoringView: ProcessMonitoringView = new ProcessMonitoringView();
            const processList = processMonitoringView.getProcessList();
            expect(processList.length).toBe(2);
            expect(processList[0].id).toBe('process1');
            expect(processList[0].label).toBe('process name 1');
            expect(processList[1].id).toBe('process2');
            expect(processList[1].label).toBe('process name 2');
        });

        it('should return process with name if no process name is defined', async () => {
            await initProcesses();
            await setUserPerimeter([
                new ComputedPerimeter('processWithNoName', 'stateNoName_1', RightsEnum.Receive, true)
            ]);
            const processMonitoringView: ProcessMonitoringView = new ProcessMonitoringView();
            const processList = processMonitoringView.getProcessList();
            expect(processList[0].id).toBe('processWithNoName');
            expect(processList[0].label).toBe('processWithNoName');
        });
    });

    describe('get state per processes', () => {
        it('should return an empty list if no process selected', async () => {
            await initProcesses();
            await setDefaultUserPerimeter();
            const processMonitoringView: ProcessMonitoringView = new ProcessMonitoringView();
            const statePerProcess = processMonitoringView.getStatesPerProcess([]);
            expect(statePerProcess.length).toBe(0);
        });

        it('should return state1_1 if process 1 is selected', async () => {
            await initProcesses();
            await setDefaultUserPerimeter();
            const processMonitoringView: ProcessMonitoringView = new ProcessMonitoringView();
            const statePerProcess = processMonitoringView.getStatesPerProcess(['process1']);
            expect(statePerProcess.length).toBe(1);
            expect(statePerProcess[0].id).toBe('process1');
            expect(statePerProcess[0].processName).toBe('process name 1');
            expect(statePerProcess[0].states.length).toBe(1);
            expect(statePerProcess[0].states[0].id).toBe('state1_1');
            expect(statePerProcess[0].states[0].label).toBe('State 1_1');
        });

        it('should return state1_1,state2_1,state2_2 if process 1 & 2  are selected', async () => {
            await initProcesses();
            await setDefaultUserPerimeter();
            const processMonitoringView: ProcessMonitoringView = new ProcessMonitoringView();
            const statePerProcess = processMonitoringView.getStatesPerProcess(['process1', 'process2']);
            expect(statePerProcess.length).toBe(2);
            expect(statePerProcess[0].id).toBe('process1');
            expect(statePerProcess[0].processName).toBe('process name 1');
            expect(statePerProcess[0].states.length).toBe(1);
            expect(statePerProcess[0].states[0].id).toBe('state1_1');
            expect(statePerProcess[0].states[0].label).toBe('State 1_1');
            expect(statePerProcess[1].id).toBe('process2');
            expect(statePerProcess[1].processName).toBe('process name 2');
            expect(statePerProcess[1].states.length).toBe(2);
            expect(statePerProcess[1].states[0].id).toBe('state2_1');
            expect(statePerProcess[1].states[0].label).toBe('State 2_1');
            expect(statePerProcess[1].states[1].id).toBe('state2_2');
            expect(statePerProcess[1].states[1].label).toBe('State 2_2');
        });

        it('should return process 1 & 2 by alphabetical order', async () => {
            await initProcesses(['B - process name 1', 'A - process name 2']);
            await setDefaultUserPerimeter();
            const processMonitoringView: ProcessMonitoringView = new ProcessMonitoringView();
            const statePerProcess = processMonitoringView.getStatesPerProcess(['process1', 'process2']);
            expect(statePerProcess.length).toBe(2);
            expect(statePerProcess[0].id).toBe('process2');
            expect(statePerProcess[0].processName).toBe('A - process name 2');
            expect(statePerProcess[1].id).toBe('process1');
            expect(statePerProcess[1].processName).toBe('B - process name 1');
        });

        it('should return state 2 & 3 by alphabetical order', async () => {
            await initProcesses(['process 1', 'process 2'], ['State 1', 'State BBB', 'State AAA']);
            await setDefaultUserPerimeter();
            const processMonitoringView: ProcessMonitoringView = new ProcessMonitoringView();
            const statePerProcess = processMonitoringView.getStatesPerProcess(['process1', 'process2']);
            expect(statePerProcess[1].id).toBe('process2');
            expect(statePerProcess[1].states[0].label).toBe('State AAA');
            expect(statePerProcess[1].states[1].label).toBe('State BBB');
        });

        it('should return state 2 & 3 by alphabetical order ignoring emojis', async () => {
            await initProcesses(['process 1', 'process 2'], ['State 1', 'State BBB', 'State 😊AAA']);
            await setDefaultUserPerimeter();
            const processMonitoringView: ProcessMonitoringView = new ProcessMonitoringView();
            const statePerProcess = processMonitoringView.getStatesPerProcess(['process1', 'process2']);
            expect(statePerProcess[1].id).toBe('process2');
            expect(statePerProcess[1].states[0].label).toBe('State 😊AAA');
            expect(statePerProcess[1].states[1].label).toBe('State BBB');
        });

        it('should return state2_1 if process2 is selected and user has no permission on state2_2', async () => {
            await initProcesses();
            await setUserPerimeter([
                new ComputedPerimeter('process2', 'state2_1', RightsEnum.Receive, true),
                new ComputedPerimeter('process1', 'state1_1', RightsEnum.ReceiveAndWrite, true)
            ]);
            const processMonitoringView: ProcessMonitoringView = new ProcessMonitoringView();
            const statePerProcess = processMonitoringView.getStatesPerProcess(['process2']);
            expect(statePerProcess.length).toBe(1);
            expect(statePerProcess[0].id).toBe('process2');
            expect(statePerProcess[0].processName).toBe('process name 2');
            expect(statePerProcess[0].states.length).toBe(1);
            expect(statePerProcess[0].states[0].id).toBe('state2_1');
            expect(statePerProcess[0].states[0].label).toBe('State 2_1');
        });
    });

    describe('get process groups', () => {
        it('should return an empty list if no process groups', async () => {
            await initProcesses();
            await setDefaultUserPerimeter();
            await initProcessGroups({groups: []});
            const processMonitoringView: ProcessMonitoringView = new ProcessMonitoringView();
            const processGroups = processMonitoringView.getProcessGroups();
            expect(processGroups.length).toBe(0);
        });

        it('should return 2 process groups when user has access to process process1, process2 and processWithNoName', async () => {
            await initProcesses();
            await setUserPerimeter([
                new ComputedPerimeter('process1', 'state1_1', RightsEnum.ReceiveAndWrite, true),
                new ComputedPerimeter('process2', 'state2_1', RightsEnum.Receive, true),
                new ComputedPerimeter('processWithNoName', 'stateNoName_1', RightsEnum.ReceiveAndWrite, true)
            ]);
            await initProcessGroups();
            const processMonitoringView: ProcessMonitoringView = new ProcessMonitoringView();
            const processGroups = processMonitoringView.getProcessGroups();
            expect(processGroups[0].id).toBe('service1');
            expect(processGroups[0].label).toBe('Service 1');
            expect(processGroups.length).toBe(2);
        });

        it('should return process 1 & 2 if service 1 is selected', async () => {
            await initProcesses();
            await initProcessGroups();
            await setUserPerimeter([
                new ComputedPerimeter('process1', 'state1_1', RightsEnum.Receive, true),
                new ComputedPerimeter('process2', 'state2_1', RightsEnum.Receive, true),
                new ComputedPerimeter('process2', 'state2_2', RightsEnum.Receive, true),
                new ComputedPerimeter('processWithNoName', 'stateNoName_1', RightsEnum.Receive, true)
            ]);
            const processMonitoringView: ProcessMonitoringView = new ProcessMonitoringView();

            const processes = processMonitoringView.getProcessesPerProcessGroups(['service1']);
            expect(processes.length).toBe(2);
            expect(processes[0].id).toBe('process1');
            expect(processes[0].label).toBe('process name 1');
            expect(processes[1].id).toBe('process2');
            expect(processes[1].label).toBe('process name 2');
        });

        it('should return process 2 if service 1 is selected and user has no permission on process 1', async () => {
            await initProcesses();
            await setUserPerimeter([new ComputedPerimeter('process2', 'state2_1', RightsEnum.Receive, true)]);
            await initProcessGroups();
            const processMonitoringView: ProcessMonitoringView = new ProcessMonitoringView();

            const processes = processMonitoringView.getProcessesPerProcessGroups(['service1']);
            expect(processes.length).toBe(1);
            expect(processes[0].id).toBe('process2');
            expect(processes[0].label).toBe('process name 2');
        });
    });

    describe('get the display (or not) of the checkbox for seeing all cards in the perimeter of the user', () => {
        it('should return false if the user has no permission', async () => {
            await setUserPerimeter([], []);
            const processMonitoringView: ProcessMonitoringView = new ProcessMonitoringView();
            const mustViewAllCardsFeatureBeDisplayed = processMonitoringView.mustViewAllCardsFeatureBeDisplayed();
            expect(mustViewAllCardsFeatureBeDisplayed).toBeFalse();
        });

        it(
            'should return false if the user has permissions but none of VIEW_ALL_CARDS_FOR_USER_PERIMETERS, ' +
                'VIEW_ALL_CARDS and ADMIN',
            async () => {
                await setUserPerimeter([], [PermissionEnum.ADMIN_BUSINESS_PROCESS]);
                const processMonitoringView: ProcessMonitoringView = new ProcessMonitoringView();
                const mustViewAllCardsFeatureBeDisplayed = processMonitoringView.mustViewAllCardsFeatureBeDisplayed();
                expect(mustViewAllCardsFeatureBeDisplayed).toBeFalse();
            }
        );

        it('should return true if the user has permission ADMIN', async () => {
            await setUserPerimeter(
                [],
                [
                    PermissionEnum.ADMIN_BUSINESS_PROCESS,
                    PermissionEnum.VIEW_ALL_CARDS_FOR_USER_PERIMETERS,
                    PermissionEnum.ADMIN
                ]
            );
            const processMonitoringView: ProcessMonitoringView = new ProcessMonitoringView();
            const mustViewAllCardsFeatureBeDisplayed = processMonitoringView.mustViewAllCardsFeatureBeDisplayed();
            expect(mustViewAllCardsFeatureBeDisplayed).toBeTrue();
        });

        it('should return true if the user has permission VIEW_ALL_CARDS', async () => {
            await setUserPerimeter(
                [],
                [
                    PermissionEnum.ADMIN_BUSINESS_PROCESS,
                    PermissionEnum.VIEW_ALL_CARDS_FOR_USER_PERIMETERS,
                    PermissionEnum.VIEW_ALL_CARDS
                ]
            );
            const processMonitoringView: ProcessMonitoringView = new ProcessMonitoringView();
            const mustViewAllCardsFeatureBeDisplayed = processMonitoringView.mustViewAllCardsFeatureBeDisplayed();
            expect(mustViewAllCardsFeatureBeDisplayed).toBeTrue();
        });

        it('should return true if the user has permission VIEW_ALL_CARDS_FOR_USER_PERIMETERS', async () => {
            await setUserPerimeter(
                [],
                [PermissionEnum.ADMIN_BUSINESS_PROCESS, PermissionEnum.VIEW_ALL_CARDS_FOR_USER_PERIMETERS]
            );
            const processMonitoringView: ProcessMonitoringView = new ProcessMonitoringView();
            const mustViewAllCardsFeatureBeDisplayed = processMonitoringView.mustViewAllCardsFeatureBeDisplayed();
            expect(mustViewAllCardsFeatureBeDisplayed).toBeTrue();
        });

        it('should return true if the user has permission VIEW_ALL_CARDS_FOR_USER_PERIMETERS and ADMIN', async () => {
            await setUserPerimeter(
                [],
                [
                    PermissionEnum.ADMIN_BUSINESS_PROCESS,
                    PermissionEnum.VIEW_ALL_CARDS_FOR_USER_PERIMETERS,
                    PermissionEnum.ADMIN
                ]
            );
            const processMonitoringView: ProcessMonitoringView = new ProcessMonitoringView();
            const mustViewAllCardsFeatureBeDisplayed = processMonitoringView.mustViewAllCardsFeatureBeDisplayed();
            expect(mustViewAllCardsFeatureBeDisplayed).toBeTrue();
        });
    });

    describe('get dates after period click if the current day/time is 2024-04-29 15:32 (summer time)', () => {
        beforeEach(() => {
            TranslationService.setTranslationLib(new TranslationLibMock());
            TranslationService.initLocale();
            DateTimeFormatterService.init();
            ConfigService.setConfigValue('settings.locale', 'en');
            jasmine.clock().install();
        });

        afterEach(() => {
            jasmine.clock().uninstall();
        });
        it('should return 2024-01-01T00:00 and 2025-01-01T00:00 if the user clicks on the year button', async () => {
            jasmine.clock().mockDate(new Date(2024, 3, 29, 15, 32));
            const processMonitoringView: ProcessMonitoringView = new ProcessMonitoringView();
            const dates = processMonitoringView.getDatesAfterPeriodClick('year');
            expect(dates).toEqual({activeFrom: '2024-01-01T00:00', activeTo: '2025-01-01T00:00'});
        });

        it('should return 2024-04-01T00:00 and 2024-05-01T00:00 if the user clicks on the month button', async () => {
            jasmine.clock().mockDate(new Date(2024, 3, 29, 15, 32));
            const processMonitoringView: ProcessMonitoringView = new ProcessMonitoringView();
            const dates = processMonitoringView.getDatesAfterPeriodClick('month');
            expect(dates).toEqual({activeFrom: '2024-04-01T00:00', activeTo: '2024-05-01T00:00'});
        });

        it('should return 2024-04-28T00:00 and 2024-05-05T00:00 if the user clicks on the week button', async () => {
            jasmine.clock().mockDate(new Date(2024, 3, 29, 15, 32));
            const processMonitoringView: ProcessMonitoringView = new ProcessMonitoringView();
            const dates = processMonitoringView.getDatesAfterPeriodClick('week');
            expect(dates).toEqual({activeFrom: '2024-04-27T00:00', activeTo: '2024-05-04T00:00'});
        });
    });

    describe('get dates after period click if the current day/time is 2023-12-31 9:18 (winter time)', () => {
        beforeEach(() => {
            TranslationService.setTranslationLib(new TranslationLibMock());
            TranslationService.initLocale();
            DateTimeFormatterService.init();
            ConfigService.setConfigValue('settings.locale', 'en');
            jasmine.clock().install();
        });

        afterEach(() => {
            jasmine.clock().uninstall();
        });
        it('should return 2023-01-01T00:00 and 2024-01-01T00:00 if the user clicks on the year button', async () => {
            jasmine.clock().mockDate(new Date(2023, 11, 31, 9, 18));
            const processMonitoringView: ProcessMonitoringView = new ProcessMonitoringView();
            const dates = processMonitoringView.getDatesAfterPeriodClick('year');
            expect(dates).toEqual({activeFrom: '2023-01-01T00:00', activeTo: '2024-01-01T00:00'});
        });

        it('should return 2023-12-01T00:00 and 2024-01-01T00:00 if the user clicks on the month button', async () => {
            jasmine.clock().mockDate(new Date(2023, 11, 31, 9, 18));
            const processMonitoringView: ProcessMonitoringView = new ProcessMonitoringView();
            const dates = processMonitoringView.getDatesAfterPeriodClick('month');
            expect(dates).toEqual({activeFrom: '2023-12-01T00:00', activeTo: '2024-01-01T00:00'});
        });

        it('should return 2023-12-31T00:00 and 2024-01-07T00:00 if the user clicks on the week button', async () => {
            jasmine.clock().mockDate(new Date(2023, 11, 31, 9, 18));
            const processMonitoringView: ProcessMonitoringView = new ProcessMonitoringView();
            const dates = processMonitoringView.getDatesAfterPeriodClick('week');
            expect(dates).toEqual({activeFrom: '2023-12-30T00:00', activeTo: '2024-01-06T00:00'});
        });
    });

    describe('get dates if the user navigates between dates after period click', () => {
        it('should return 2023-01-01T00:00 and 2024-01-01T00:00 if the user clicks on the year button then navigates backward', async () => {
            const processMonitoringView: ProcessMonitoringView = new ProcessMonitoringView();
            const dates = processMonitoringView.getDatesWhenMoving(
                '2024-01-01T00:00',
                '2025-01-01T00:00',
                false,
                'year'
            );
            expect(dates).toEqual({activeFrom: '2023-01-01T00:00', activeTo: '2024-01-01T00:00'});
        });

        it('should return 2025-01-01T00:00 and 2026-01-01T00:00 if the user clicks on the year button then navigates forward', async () => {
            const processMonitoringView: ProcessMonitoringView = new ProcessMonitoringView();
            const dates = processMonitoringView.getDatesWhenMoving(
                '2024-01-01T00:00',
                '2025-01-01T00:00',
                true,
                'year'
            );
            expect(dates).toEqual({activeFrom: '2025-01-01T00:00', activeTo: '2026-01-01T00:00'});
        });

        it('should return 2024-03-01T00:00 and 2024-04-01T00:00 if the user clicks on the month button then navigates backward', async () => {
            const processMonitoringView: ProcessMonitoringView = new ProcessMonitoringView();
            const dates = processMonitoringView.getDatesWhenMoving(
                '2024-04-01T00:00',
                '2024-05-01T00:00',
                false,
                'month'
            );
            expect(dates).toEqual({activeFrom: '2024-03-01T00:00', activeTo: '2024-04-01T00:00'});
        });

        it('should return 2024-05-01T00:00 and 2024-06-01T00:00 if the user clicks on the year button then navigates forward', async () => {
            const processMonitoringView: ProcessMonitoringView = new ProcessMonitoringView();
            const dates = processMonitoringView.getDatesWhenMoving(
                '2024-04-01T00:00',
                '2024-05-01T00:00',
                true,
                'month'
            );
            expect(dates).toEqual({activeFrom: '2024-05-01T00:00', activeTo: '2024-06-01T00:00'});
        });

        it('should return 2024-04-21T00:00 and 2024-04-28T00:00 if the user clicks on the week button then navigates backward', async () => {
            const processMonitoringView: ProcessMonitoringView = new ProcessMonitoringView();
            const dates = processMonitoringView.getDatesWhenMoving(
                '2024-04-28T00:00',
                '2024-05-05T00:00',
                false,
                'week'
            );
            expect(dates).toEqual({activeFrom: '2024-04-21T00:00', activeTo: '2024-04-28T00:00'});
        });

        it('should return 2024-05-05T00:00 and 2024-05-12T00:00 if the user clicks on the week button then navigates forward', async () => {
            const processMonitoringView: ProcessMonitoringView = new ProcessMonitoringView();
            const dates = processMonitoringView.getDatesWhenMoving(
                '2024-04-28T00:00',
                '2024-05-05T00:00',
                true,
                'week'
            );
            expect(dates).toEqual({activeFrom: '2024-05-05T00:00', activeTo: '2024-05-12T00:00'});
        });
    });

    describe('get dates if the user navigates between dates after setting dates manually', () => {
        it('should return 2024-04-28T00:00 and 2024-05-02T00:00 if the user navigates backward', async () => {
            const processMonitoringView: ProcessMonitoringView = new ProcessMonitoringView();
            const dates = processMonitoringView.getDatesWhenMoving('2024-05-02T00:00', '2024-05-06T00:00', false, '');
            expect(dates).toEqual({activeFrom: '2024-04-28T00:00', activeTo: '2024-05-02T00:00'});
        });

        it('should return 2024-05-06T00:00 and 2024-05-10T00:00 if the user navigates forward', async () => {
            const processMonitoringView: ProcessMonitoringView = new ProcessMonitoringView();
            const dates = processMonitoringView.getDatesWhenMoving('2024-05-02T00:00', '2024-05-06T00:00', true, '');
            expect(dates).toEqual({activeFrom: '2024-05-06T00:00', activeTo: '2024-05-10T00:00'});
        });

        it('should return 2024-04-11T00:00 and 2024-05-01T00:00 if the user navigates backward', async () => {
            const processMonitoringView: ProcessMonitoringView = new ProcessMonitoringView();
            const dates = processMonitoringView.getDatesWhenMoving('2024-05-01T00:00', '2024-05-21T00:00', false, '');
            expect(dates).toEqual({activeFrom: '2024-04-11T00:00', activeTo: '2024-05-01T00:00'});
        });

        it('should return 2024-05-21T00:00 and 2024-06-10T00:00 if the user navigates forward', async () => {
            const processMonitoringView: ProcessMonitoringView = new ProcessMonitoringView();
            const dates = processMonitoringView.getDatesWhenMoving('2024-05-01T00:00', '2024-05-21T00:00', true, '');
            expect(dates).toEqual({activeFrom: '2024-05-21T00:00', activeTo: '2024-06-10T00:00'});
        });
    });
});
