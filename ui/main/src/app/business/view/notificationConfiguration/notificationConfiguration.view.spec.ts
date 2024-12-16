/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Process, State} from '@ofModel/processes.model';
import {NotificationConfigurationView} from './notificationConfiguration.view';
import {RightsEnum} from '@ofModel/perimeter.model';
import {ComputedPerimeter} from '@ofModel/userWithPerimeters.model';
import {ConfigService} from 'app/services/config/ConfigService';
import {loadWebUIConf, setProcessConfiguration, setUserPerimeter} from '@tests/helpers';
import {TranslationServiceMock} from '@tests/mocks/translation.service.mock';
import {NotificationConfigurationPage} from './notificationConfigurationPage';

describe('Notification configuration view ', () => {
    const translationServiceMock = new TranslationServiceMock();
    let notificationConfigurationPage: NotificationConfigurationPage;
    const defaultProcesses: Process[] = [
        {
            id: 'process1',
            version: 'v1',
            name: 'process name 1',
            states: new Map<string, State>([['state1_1', {name: 'State 1_1'}]])
        },
        {
            id: 'process2',
            version: 'v2',
            name: 'process name 2',
            states: new Map<string, State>([
                ['state2_1', {name: 'State 2_1'}],
                ['state2_2', {name: 'State 2_2'}],
                ['onlyChildState', {name: 'State 2_3', isOnlyAChildState: true}]
            ])
        },
        {
            id: 'process3',
            version: 'v2',
            name: 'process name 3',
            states: new Map<string, State>([['state3_1', {name: 'State 3_1'}]])
        },
        {
            id: 'process4',
            version: 'v2',
            name: 'process name 4'
        },
        {
            id: 'processWithNoName',
            version: 'v2',
            name: '',
            states: new Map<string, State>([['stateNoName_1', {name: 'State NoName_1'}]])
        }
    ];

    async function setDefaultUserPerimeter() {
        await setUserPerimeter({
            computedPerimeters: [
                new ComputedPerimeter('process1', 'state1_1', RightsEnum.Receive, true),
                new ComputedPerimeter('process2', 'state2_1', RightsEnum.Receive, true),
                new ComputedPerimeter('process2', 'state2_2', RightsEnum.Receive, true),
                new ComputedPerimeter('process2', 'onlyChildState', RightsEnum.Receive, true),
                new ComputedPerimeter('processWithNoName', 'stateNoName_1', RightsEnum.Receive, true)
            ],
            userData: null
        });
    }

    function getNotificationConfigurationPage() {
        return new NotificationConfigurationView(translationServiceMock).getNotificationConfigurationPage();
    }

    describe('getNotificationConfigurationPage with no processGroup ', () => {
        beforeAll(async () => {
            await setProcessConfiguration(defaultProcesses);
            await setDefaultUserPerimeter();
            notificationConfigurationPage = getNotificationConfigurationPage();
        });

        it('should return no process group ', () => {
            expect(notificationConfigurationPage.processGroups).toHaveSize(0);
        });

        it('should return processes user has access', () => {
            expect(notificationConfigurationPage.processesWithNoProcessGroup).toHaveSize(3);
            expect(notificationConfigurationPage.processesWithNoProcessGroup[0].id).toEqual('process1');
            expect(notificationConfigurationPage.processesWithNoProcessGroup[0].label).toEqual('process name 1');
            expect(notificationConfigurationPage.processesWithNoProcessGroup[1].id).toEqual('process2');
            expect(notificationConfigurationPage.processesWithNoProcessGroup[1].label).toEqual('process name 2');
        });

        it('should get process id as label if process name is empty', () => {
            expect(notificationConfigurationPage.processesWithNoProcessGroup[2].id).toEqual('processWithNoName');
            expect(notificationConfigurationPage.processesWithNoProcessGroup[2].label).toEqual('processWithNoName');
        });

        it('should return states user has access', () => {
            expect(notificationConfigurationPage.processesWithNoProcessGroup[0].states).toHaveSize(1);
            expect(notificationConfigurationPage.processesWithNoProcessGroup[0].states[0].id).toEqual('state1_1');
            expect(notificationConfigurationPage.processesWithNoProcessGroup[0].states[0].label).toEqual('State 1_1');
            expect(notificationConfigurationPage.processesWithNoProcessGroup[1].states[0].id).toEqual('state2_1');
            expect(notificationConfigurationPage.processesWithNoProcessGroup[1].states[0].label).toEqual('State 2_1');
            expect(notificationConfigurationPage.processesWithNoProcessGroup[1].states[1].id).toEqual('state2_2');
            expect(notificationConfigurationPage.processesWithNoProcessGroup[1].states[1].label).toEqual('State 2_2');
            expect(notificationConfigurationPage.processesWithNoProcessGroup[2].states[0].id).toEqual('stateNoName_1');
            expect(notificationConfigurationPage.processesWithNoProcessGroup[2].states[0].label).toEqual(
                'State NoName_1'
            );
        });

        it('should exclude state if state is only child state (isOnlyChildState = true)', () => {
            expect(notificationConfigurationPage.processesWithNoProcessGroup[1].states).toHaveSize(2);
        });
    });

    describe('getNotificationConfigurationPage with all processes in processGroups ', () => {
        const processGroups = {
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
                },
                {
                    id: 'serviceNotVisibleForUser',
                    name: 'Service Not Visible For User',
                    processes: ['process4']
                }
            ]
        };

        beforeAll(async () => {
            await setProcessConfiguration(defaultProcesses, undefined, processGroups);
            await setDefaultUserPerimeter();
            notificationConfigurationPage = getNotificationConfigurationPage();
        });

        it('should return process groups', async () => {
            expect(notificationConfigurationPage.processGroups[0].id).toEqual('service1');
            expect(notificationConfigurationPage.processGroups[0].label).toEqual('Service 1');
            expect(notificationConfigurationPage.processGroups[1].id).toEqual('service2');
            expect(notificationConfigurationPage.processGroups[1].label).toEqual('Service 2');
        });
        it('should return processes in process groups', async () => {
            expect(notificationConfigurationPage.processGroups[0].processes).toHaveSize(2);
            expect(notificationConfigurationPage.processGroups[0].processes[0].id).toEqual('process1');
            expect(notificationConfigurationPage.processGroups[0].processes[0].label).toEqual('process name 1');
            expect(notificationConfigurationPage.processGroups[0].processes[1].id).toEqual('process2');
            expect(notificationConfigurationPage.processGroups[0].processes[1].label).toEqual('process name 2');
            expect(notificationConfigurationPage.processGroups[1].processes[0].id).toEqual('processWithNoName');
            expect(notificationConfigurationPage.processGroups[1].processes[0].label).toEqual('processWithNoName');
        });

        it('should return states user has access', () => {
            expect(notificationConfigurationPage.processGroups[0].processes[0].states[0].id).toEqual('state1_1');
            expect(notificationConfigurationPage.processGroups[0].processes[0].states[0].label).toEqual('State 1_1');
            expect(notificationConfigurationPage.processGroups[0].processes[1].states[0].id).toEqual('state2_1');
            expect(notificationConfigurationPage.processGroups[0].processes[1].states[0].label).toEqual('State 2_1');
        });

        it('should return no processes with no process group', async () => {
            expect(notificationConfigurationPage.processesWithNoProcessGroup).toHaveSize(0);
        });

        it('should not return process group with no process visible for user', async () => {
            expect(notificationConfigurationPage.processGroups).not.toContain(
                jasmine.objectContaining({id: 'serviceNotVisibleForUser'})
            );
        });
    });

    describe('getNotificationConfigurationPage with some processes in processGroups ', () => {
        const processGroups = {
            groups: [
                {
                    id: 'service1',
                    name: 'Service 1',
                    processes: ['process1']
                },
                {
                    id: 'service2',
                    name: 'Service 2',
                    processes: ['processWithNoName']
                }
            ]
        };

        beforeAll(async () => {
            await setProcessConfiguration(defaultProcesses, undefined, processGroups);
            await setDefaultUserPerimeter();
            notificationConfigurationPage = getNotificationConfigurationPage();
        });

        it('should return process groups', async () => {
            expect(notificationConfigurationPage.processGroups[0].id).toEqual('service1');
            expect(notificationConfigurationPage.processGroups[0].label).toEqual('Service 1');
            expect(notificationConfigurationPage.processGroups[1].id).toEqual('service2');
            expect(notificationConfigurationPage.processGroups[1].label).toEqual('Service 2');
        });

        it('should return processes in process groups', async () => {
            expect(notificationConfigurationPage.processGroups[0].processes).toHaveSize(1);
            expect(notificationConfigurationPage.processGroups[0].processes[0].id).toEqual('process1');
            expect(notificationConfigurationPage.processGroups[0].processes[0].label).toEqual('process name 1');
            expect(notificationConfigurationPage.processGroups[1].processes[0].id).toEqual('processWithNoName');
            expect(notificationConfigurationPage.processGroups[1].processes[0].label).toEqual('processWithNoName');
        });

        it('should return states user has access', () => {
            expect(notificationConfigurationPage.processGroups[0].processes[0].states[0].id).toEqual('state1_1');
            expect(notificationConfigurationPage.processGroups[0].processes[0].states[0].label).toEqual('State 1_1');
        });

        it('should return processes with no process group', async () => {
            expect(notificationConfigurationPage.processesWithNoProcessGroup).toHaveSize(1);
            expect(notificationConfigurationPage.processesWithNoProcessGroup[0].id).toEqual('process2');
            expect(notificationConfigurationPage.processesWithNoProcessGroup[0].label).toEqual('process name 2');
        });
    });

    describe('getNotificationConfigurationPage - process groups, processes and states checkbox status ', () => {
        beforeAll(async () => {
            await setProcessConfiguration(
                [
                    {
                        id: 'process1',
                        version: 'v1',
                        name: 'process name 1',
                        states: new Map<string, State>([
                            ['state1_1', {name: 'State 1_1'}],
                            ['state1_2', {name: 'State 1_2'}]
                        ])
                    },
                    {
                        id: 'process2',
                        version: 'v2',
                        name: 'process name 2',
                        states: new Map<string, State>([
                            ['state2_1', {name: 'State 2_1'}],
                            ['state2_2', {name: 'State 2_2'}]
                        ])
                    },
                    {
                        id: 'process3',
                        version: 'v2',
                        name: 'process name 3',
                        states: new Map<string, State>([
                            ['state3_1', {name: 'State 3_1'}],
                            ['state3_2', {name: 'State 3_2'}]
                        ])
                    },
                    {
                        id: 'process4',
                        version: 'v2',
                        name: 'process name 4',
                        states: new Map<string, State>([
                            ['state4_1', {name: 'State 4_1'}],
                            ['state4_2', {name: 'State 4_2'}]
                        ])
                    }
                ],
                undefined,
                {
                    groups: [
                        {
                            id: 'service1',
                            name: 'Service 1',
                            processes: ['process1', 'process2']
                        },
                        {
                            id: 'service2',
                            name: 'Service 2',
                            processes: ['process3', 'process4']
                        }
                    ]
                }
            );
            await setUserPerimeter({
                computedPerimeters: [
                    new ComputedPerimeter('process1', 'state1_1', RightsEnum.Receive, true),
                    new ComputedPerimeter('process1', 'state1_2', RightsEnum.Receive, true),
                    new ComputedPerimeter('process2', 'state2_1', RightsEnum.Receive, true),
                    new ComputedPerimeter('process2', 'state2_2', RightsEnum.Receive, true),
                    new ComputedPerimeter('process3', 'state3_1', RightsEnum.Receive, true),
                    new ComputedPerimeter('process3', 'state3_2', RightsEnum.Receive, true),
                    new ComputedPerimeter('process4', 'state4_1', RightsEnum.Receive, true),
                    new ComputedPerimeter('process4', 'state4_2', RightsEnum.Receive, true)
                ],
                userData: null,
                processesStatesNotNotified: new Map<string, Array<string>>([['process2', ['state2_1']]])
            });
            notificationConfigurationPage = getNotificationConfigurationPage();
        });

        it('state should be checked if state is not in list of users states not notified', () => {
            expect(notificationConfigurationPage.processGroups[0].processes[0].states[0].checked).toBeTrue();
            expect(notificationConfigurationPage.processGroups[0].processes[0].states[1].checked).toBeTrue();
            expect(notificationConfigurationPage.processGroups[0].processes[1].states[1].checked).toBeTrue();
        });

        it('state should not be checked if state is in list of users states not notified', () => {
            expect(notificationConfigurationPage.processGroups[0].processes[1].states[0].checked).toBeFalse();
        });

        it('process should be checked if all states are checked', () => {
            expect(notificationConfigurationPage.processGroups[0].processes[0].checked).toBeTrue();
        });

        it('process should not be checked if all states are not checked', () => {
            expect(notificationConfigurationPage.processGroups[0].processes[1].checked).toBeFalse();
        });

        it('process group should be checked if all process are checked', () => {
            expect(notificationConfigurationPage.processGroups[1].checked).toBeTrue();
        });

        it('process group should not be checked if all process are not checked', () => {
            expect(notificationConfigurationPage.processGroups[0].checked).toBeFalse();
        });
    });

    describe('getNotificationConfigurationPage - email notification enabled values ', () => {
        beforeAll(async () => {
            await loadWebUIConf({});
            await setProcessConfiguration([
                {
                    id: 'process1',
                    version: 'v1',
                    name: 'process name 1',
                    states: new Map<string, State>([
                        ['state1_1', {name: 'State 1_1'}],
                        ['state1_2', {name: 'State 1_2'}]
                    ])
                },
                {
                    id: 'process2',
                    version: 'v2',
                    name: 'process name 2',
                    states: new Map<string, State>([
                        ['state2_1', {name: 'State 2_1'}],
                        ['state2_2', {name: 'State 2_2'}]
                    ])
                }
            ]);
            await setUserPerimeter({
                computedPerimeters: [
                    new ComputedPerimeter('process1', 'state1_1', RightsEnum.Receive, true),
                    new ComputedPerimeter('process1', 'state1_2', RightsEnum.Receive, true),
                    new ComputedPerimeter('process2', 'state2_1', RightsEnum.Receive, true),
                    new ComputedPerimeter('process2', 'state2_2', RightsEnum.Receive, true)
                ],
                userData: null,
                processesStatesNotifiedByEmail: new Map<string, Array<string>>([
                    ['process1', ['state1_1']],
                    ['process2', ['state2_1']]
                ])
            });
        });

        it('email configuration should be enabled if sendCardsByEmail and email set', () => {
            ConfigService.setConfigValue('settings.sendCardsByEmail', true);
            ConfigService.setConfigValue('settings.email', 'test@mail');
            notificationConfigurationPage = getNotificationConfigurationPage();
            expect(notificationConfigurationPage.isEmailEnabled).toBeTrue();
        });

        it('email configuration should be enabled if sendDailyEmail and email set', () => {
            ConfigService.setConfigValue('settings.sendDailyEmail', true);
            ConfigService.setConfigValue('settings.email', 'test@mail');
            notificationConfigurationPage = getNotificationConfigurationPage();
            expect(notificationConfigurationPage.isEmailEnabled).toBeTrue();
        });

        it('email configuration should not be enabled if email is not set', () => {
            ConfigService.setConfigValue('settings.sendCardsByEmail', true);
            ConfigService.setConfigValue('settings.sendDailyEmail', true);
            ConfigService.setConfigValue('settings.email', '');
            notificationConfigurationPage = getNotificationConfigurationPage();
            expect(notificationConfigurationPage.isEmailEnabled).toBeFalse();
        });

        it('mail configuration should not be enabled if sendCardsByEmail and sendDailyEmail are false', () => {
            ConfigService.setConfigValue('settings.sendCardsByEmail', false);
            ConfigService.setConfigValue('settings.sendDailyEmail', false);
            ConfigService.setConfigValue('settings.email', 'test@mail');
            notificationConfigurationPage = getNotificationConfigurationPage();
            expect(notificationConfigurationPage.isEmailEnabled).toBeFalse();
        });

        it('state should be notified by email if state is in list of states notified by email', () => {
            notificationConfigurationPage = getNotificationConfigurationPage();
            expect(
                notificationConfigurationPage.processesWithNoProcessGroup[0].states[0].notificationByEmail
            ).toBeTrue();
            expect(
                notificationConfigurationPage.processesWithNoProcessGroup[1].states[0].notificationByEmail
            ).toBeTrue();
        });

        it('state should not be notified by email if state is not in list of states notified by email', () => {
            notificationConfigurationPage = getNotificationConfigurationPage();
            expect(
                notificationConfigurationPage.processesWithNoProcessGroup[0].states[1].notificationByEmail
            ).toBeFalse();
            expect(
                notificationConfigurationPage.processesWithNoProcessGroup[1].states[1].notificationByEmail
            ).toBeFalse();
        });
    });

    describe('getNotificationConfigurationPage - filtering notification allowed value', () => {
        beforeEach(async () => {
            await setProcessConfiguration([
                {
                    id: 'process1',
                    version: 'v1',
                    name: 'process name 1',
                    states: new Map<string, State>([
                        ['state1_1', {name: 'State 1_1'}],
                        ['state1_2', {name: 'State 1_2'}],
                        ['state1_3', {name: 'State 1_3'}]
                    ])
                }
            ]);
            await setUserPerimeter({
                computedPerimeters: [
                    new ComputedPerimeter('process1', 'state1_1', RightsEnum.Receive, true),
                    new ComputedPerimeter('process1', 'state1_2', RightsEnum.Receive, false),
                    new ComputedPerimeter('process1', 'state1_3', RightsEnum.Receive, false)
                ],
                userData: null,
                processesStatesNotNotified: new Map<string, Array<string>>([['process1', ['state1_2', 'state1_3']]])
            });
        });
        it('should be true for state if perimeter filteringNotificationAllowed is true', () => {
            notificationConfigurationPage = getNotificationConfigurationPage();
            expect(
                notificationConfigurationPage.processesWithNoProcessGroup[0].states[0].filteringNotificationAllowed
            ).toBeTrue();
        });
        it('should be false for state if perimeter filteringNotificationAllowed is false', () => {
            notificationConfigurationPage = getNotificationConfigurationPage();
            expect(
                notificationConfigurationPage.processesWithNoProcessGroup[0].states[1].filteringNotificationAllowed
            ).toBeFalse();
        });

        it('should be true for process if at least a state has filteringNotificationAllowed set to true', () => {
            notificationConfigurationPage = getNotificationConfigurationPage();
            expect(
                notificationConfigurationPage.processesWithNoProcessGroup[0].filteringNotificationAllowed
            ).toBeTrue();
        });

        it('should be false for process if all process states filteringNotificationAllowed is false', async () => {
            await setUserPerimeter({
                computedPerimeters: [
                    new ComputedPerimeter('process1', 'state1_1', RightsEnum.Receive, false),
                    new ComputedPerimeter('process1', 'state1_2', RightsEnum.Receive, false),
                    new ComputedPerimeter('process1', 'state1_3', RightsEnum.Receive, false)
                ],
                userData: null
            });
            notificationConfigurationPage = getNotificationConfigurationPage();
            expect(
                notificationConfigurationPage.processesWithNoProcessGroup[0].filteringNotificationAllowed
            ).toBeFalse();
        });
    });

    describe('getNotificationConfigurationPage - isThereProcessStatesToDisplay ', () => {
        it('should return true if there is at least on state available for user ', async () => {
            await setProcessConfiguration(defaultProcesses);
            await setDefaultUserPerimeter();
            notificationConfigurationPage = getNotificationConfigurationPage();
            expect(notificationConfigurationPage.isThereProcessStatesToDisplay).toBeTrue();
        });

        it('should return false if there is no state available for user ', async () => {
            await setProcessConfiguration(defaultProcesses);
            await setUserPerimeter({
                computedPerimeters: [],
                userData: null
            });
            notificationConfigurationPage = getNotificationConfigurationPage();
            expect(notificationConfigurationPage.isThereProcessStatesToDisplay).toBeFalse();
        });
    });
});
