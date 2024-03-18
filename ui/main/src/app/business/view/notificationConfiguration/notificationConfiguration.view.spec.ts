/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Process, State} from '@ofModel/processes.model';
import {NotificationConfigurationView} from './notificationConfiguration.view';
import {ProcessServerMock} from '@tests/mocks/processServer.mock';
import {ProcessesService} from 'app/business/services/businessconfig/processes.service';
import {UserServerMock} from '@tests/mocks/userServer.mock';
import {ServerResponse, ServerResponseStatus} from 'app/business/server/serverResponse';
import {firstValueFrom} from 'rxjs';
import {RightsEnum} from '@ofModel/perimeter.model';
import {ComputedPerimeter, UserWithPerimeters} from '@ofModel/userWithPerimeters.model';
import {UserService} from 'app/business/services/users/user.service';
import {ConfigServerMock} from '@tests/mocks/configServer.mock';
import {ConfigService} from 'app/business/services/config.service';
import {SettingsServerMock} from '@tests/mocks/settingsServer.mock';
import {SettingsService} from 'app/business/services/users/settings.service';
import {setProcessConfiguration, setUserPerimeter, waitForAllPromises} from '@tests/helpers';
import {ModalService} from 'app/business/services/modal.service';
import {ModalServerMock} from '@tests/mocks/modalServer.mock';
import {TranslationServiceMock} from '@tests/mocks/translation.service.mock';

describe('Notification configuration view ', () => {
    const translationServiceMock = new TranslationServiceMock();
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

    describe('getNotificationConfigurationPage with no processGroup ', () => {
        let notificationConfigurationPage;
        beforeAll(async () => {
            await setProcessConfiguration(defaultProcesses);
            await setDefaultUserPerimeter();
            notificationConfigurationPage = new NotificationConfigurationView(
                translationServiceMock
            ).getNotificationConfigurationPage();
        });

        it('should return no process group ', () => {
            expect(notificationConfigurationPage.processGroups).toHaveSize(0);
        });

        it('should return processes user has access', () => {
            expect(notificationConfigurationPage.processWithNoProcessGroup).toHaveSize(3);
            expect(notificationConfigurationPage.processWithNoProcessGroup[0].id).toEqual('process1');
            expect(notificationConfigurationPage.processWithNoProcessGroup[0].label).toEqual('process name 1');
            expect(notificationConfigurationPage.processWithNoProcessGroup[1].id).toEqual('process2');
            expect(notificationConfigurationPage.processWithNoProcessGroup[1].label).toEqual('process name 2');
        });

        it('should get process id as label if process name is empty', () => {
            expect(notificationConfigurationPage.processWithNoProcessGroup[2].id).toEqual('processWithNoName');
            expect(notificationConfigurationPage.processWithNoProcessGroup[2].label).toEqual('processWithNoName');
        });

        it('should return states user has access', () => {
            expect(notificationConfigurationPage.processWithNoProcessGroup[0].states).toHaveSize(1);
            expect(notificationConfigurationPage.processWithNoProcessGroup[0].states[0].id).toEqual('state1_1');
            expect(notificationConfigurationPage.processWithNoProcessGroup[0].states[0].label).toEqual('State 1_1');
            expect(notificationConfigurationPage.processWithNoProcessGroup[1].states[0].id).toEqual('state2_1');
            expect(notificationConfigurationPage.processWithNoProcessGroup[1].states[0].label).toEqual('State 2_1');
            expect(notificationConfigurationPage.processWithNoProcessGroup[1].states[1].id).toEqual('state2_2');
            expect(notificationConfigurationPage.processWithNoProcessGroup[1].states[1].label).toEqual('State 2_2');
            expect(notificationConfigurationPage.processWithNoProcessGroup[2].states[0].id).toEqual('stateNoName_1');
            expect(notificationConfigurationPage.processWithNoProcessGroup[2].states[0].label).toEqual(
                'State NoName_1'
            );
        });

        it('should exclude state if state is only child state (isOnlyChildState = true)', () => {
            expect(notificationConfigurationPage.processWithNoProcessGroup[1].states).toHaveSize(2);
        });
    });
    describe('getNotificationConfigurationPage with all processes in processGroups ', () => {
        let notificationConfigurationPage;
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
            await setProcessConfiguration(defaultProcesses, processGroups);
            await setDefaultUserPerimeter();
            notificationConfigurationPage = new NotificationConfigurationView(
                translationServiceMock
            ).getNotificationConfigurationPage();
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
            expect(notificationConfigurationPage.processWithNoProcessGroup).toHaveSize(0);
        });

        it('should not return process group with no process visible for user', async () => {
            expect(notificationConfigurationPage.processGroups).not.toContain(
                jasmine.objectContaining({id: 'serviceNotVisibleForUser'})
            );
        });
    });

    describe('getNotificationConfigurationPage with some processes in processGroups ', () => {
        let notificationConfigurationPage;
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
            await setProcessConfiguration(defaultProcesses, processGroups);
            await setDefaultUserPerimeter();
            notificationConfigurationPage = new NotificationConfigurationView(
                translationServiceMock
            ).getNotificationConfigurationPage();
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
            expect(notificationConfigurationPage.processWithNoProcessGroup).toHaveSize(1);
            expect(notificationConfigurationPage.processWithNoProcessGroup[0].id).toEqual('process2');
            expect(notificationConfigurationPage.processWithNoProcessGroup[0].label).toEqual('process name 2');
        });
    });

    describe('Process groups, Process and state checked ', () => {
        let notificationConfigurationPage;
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
            notificationConfigurationPage = new NotificationConfigurationView(
                translationServiceMock
            ).getNotificationConfigurationPage();
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

    describe('Mail checked ', () => {
        let notificationConfigurationPage;
        beforeAll(async () => {
            const configServerMock = new ConfigServerMock();
            ConfigService.setConfigServer(configServerMock);
            configServerMock.setResponseForWebUIConfiguration(new ServerResponse({}, ServerResponseStatus.OK, null));
            await firstValueFrom(ConfigService.loadWebUIConfiguration());
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

        it('mail configuration should be enabled if sendCardsByEmail and email set', () => {
            ConfigService.setConfigValue('settings.sendCardsByEmail', true);
            ConfigService.setConfigValue('settings.email', 'test@mail');
            notificationConfigurationPage = new NotificationConfigurationView(
                translationServiceMock
            ).getNotificationConfigurationPage();
            expect(notificationConfigurationPage.isMailEnabled).toBeTrue();
        });

        it('mail configuration should not be enabled if email is not set', () => {
            ConfigService.setConfigValue('settings.sendCardsByEmail', true);
            ConfigService.setConfigValue('settings.email', '');
            notificationConfigurationPage = new NotificationConfigurationView(
                translationServiceMock
            ).getNotificationConfigurationPage();
            expect(notificationConfigurationPage.isMailEnabled).toBeFalse();
        });

        it('mail configuration should not be enabled if sendCardsByEmail is false', () => {
            ConfigService.setConfigValue('settings.sendCardsByEmail', false);
            ConfigService.setConfigValue('settings.email', 'test@mail');
            notificationConfigurationPage = new NotificationConfigurationView(
                translationServiceMock
            ).getNotificationConfigurationPage();
            expect(notificationConfigurationPage.isMailEnabled).toBeFalse();
        });

        it('state should be notified by email if state is in list of states notified by email', () => {
            notificationConfigurationPage = new NotificationConfigurationView(
                translationServiceMock
            ).getNotificationConfigurationPage();
            expect(notificationConfigurationPage.processWithNoProcessGroup[0].states[0].notificationByEmail).toBeTrue();
            expect(notificationConfigurationPage.processWithNoProcessGroup[1].states[0].notificationByEmail).toBeTrue();
        });

        it('state should not be notified by email if state is not in list of states notified by email', () => {
            notificationConfigurationPage = new NotificationConfigurationView(
                translationServiceMock
            ).getNotificationConfigurationPage();
            expect(
                notificationConfigurationPage.processWithNoProcessGroup[0].states[1].notificationByEmail
            ).toBeFalse();
            expect(
                notificationConfigurationPage.processWithNoProcessGroup[1].states[1].notificationByEmail
            ).toBeFalse();
        });
    });

    describe('Filtering notification Allowed ', () => {
        let notificationConfigurationPage;
        let modalServerMock;
        let settingsServerMock;
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
            settingsServerMock = new SettingsServerMock();
            settingsServerMock.setResponseForPatchUserSettings(new ServerResponse(null, ServerResponseStatus.OK, null));
            SettingsService.setSettingsServer(settingsServerMock);
            modalServerMock = new ModalServerMock();
            ModalService.setModalServer(modalServerMock);
            ModalService.setTranslationService(new TranslationServiceMock());
            notificationConfigurationPage = new NotificationConfigurationView(
                translationServiceMock
            ).getNotificationConfigurationPage();
        });
        it('should be true if perimeter filteringNotificationAllowed is true', () => {
            expect(
                notificationConfigurationPage.processWithNoProcessGroup[0].states[0].filteringNotificationAllowed
            ).toBeTrue();
        });
        it('should be false if perimeter filteringNotificationAllowed is false', () => {
            expect(
                notificationConfigurationPage.processWithNoProcessGroup[0].states[1].filteringNotificationAllowed
            ).toBeFalse();
        });

        it('should popup a message when filteringNotificationAllowed is false and state is not checked', async () => {
            new NotificationConfigurationView(
                translationServiceMock
            ).manageNotNotifiedStatesWithFilteringNotificationNotAllowed();
            expect(modalServerMock.modalConfigReceived).toBeDefined();
            expect(modalServerMock.modalConfigReceived.message).toContain('feedConfiguration.youAreUnsubscribedFrom');
            expect(modalServerMock.modalConfigReceived.message).toContain('feedConfiguration.youWillBeSubscribedAgain');
            await waitForAllPromises();
            modalServerMock.clickOnButton('ok');
            await waitForAllPromises();
            modalServerMock.clickOnButton('ok');
        });

        it('should not popup a message when filteringNotificationAllowed is false and state is checked', async () => {
            await setUserPerimeter({
                computedPerimeters: [
                    new ComputedPerimeter('process1', 'state1_1', RightsEnum.Receive, true),
                    new ComputedPerimeter('process1', 'state1_2', RightsEnum.Receive, false)
                ],
                userData: null
            });
            new NotificationConfigurationView(
                translationServiceMock
            ).manageNotNotifiedStatesWithFilteringNotificationNotAllowed();
            expect(modalServerMock.modalConfigReceived).toBeUndefined();
        });

        it('should popup the process/state list concerned when filteringNotificationAllowed is false and states are not checked', async () => {
            new NotificationConfigurationView(
                translationServiceMock
            ).manageNotNotifiedStatesWithFilteringNotificationNotAllowed();
            expect(modalServerMock.modalConfigReceived.message).toContain('process name 1 / State 1_2');
            expect(modalServerMock.modalConfigReceived.message).toContain('process name 1 / State 1_3');
            await waitForAllPromises();
            modalServerMock.clickOnButton('ok');
            await waitForAllPromises();
            modalServerMock.clickOnButton('ok');
        });

        it(' should check states where filteringNotificationAllowed is false and states are not checked', async () => {
            let processesCheckboxActivated = '';
            const notificationConfigurationView = new NotificationConfigurationView(translationServiceMock);
            notificationConfigurationView.setFunctionToSetProcessCheckBoxValue((processId, value) => {
                processesCheckboxActivated = 'p:' + processId + ',v:' + value;
            });
            notificationConfigurationView.manageNotNotifiedStatesWithFilteringNotificationNotAllowed();
            notificationConfigurationPage = notificationConfigurationView.getNotificationConfigurationPage();
            expect(notificationConfigurationPage.processWithNoProcessGroup[0].states[1].checked).toBeTrue();
            expect(notificationConfigurationPage.processWithNoProcessGroup[0].states[2].checked).toBeTrue();
            // all state are activated so process checkbox shall be activated
            expect(processesCheckboxActivated).toEqual('p:process1,v:true');
            modalServerMock.clickOnButton('ok');
            modalServerMock.clickOnButton('ok');
        });
        it('should save config if filteringNotification is false and states are not checked', async () => {
            const notificationConfigurationView = new NotificationConfigurationView(translationServiceMock);
            notificationConfigurationView.manageNotNotifiedStatesWithFilteringNotificationNotAllowed();
            modalServerMock.clickOnButton('ok');
            await waitForAllPromises();
            expect(settingsServerMock.numberOfCallsToPatchUserSettings).toEqual(1);
            expect(settingsServerMock.settingsPatch.processesStatesNotNotified).toEqual({});
            modalServerMock.clickOnButton('ok');
        });
    });

    describe('User click ', () => {
        let notificationConfigurationView;
        let statesCheckboxActivated = '';
        let processesCheckboxActivated = '';
        let processesGroupCheckboxActivated = '';

        beforeEach(async () => {
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
                        version: 'v1',
                        name: 'process name 2',
                        states: new Map<string, State>([
                            ['state2_1', {name: 'State 2_1'}],
                            ['state2_2', {name: 'State 2_2'}]
                        ])
                    }
                ],
                {
                    groups: [
                        {
                            id: 'service1',
                            name: 'Service 1',
                            processes: ['process1', 'process2']
                        }
                    ]
                }
            );
            await setUserPerimeter({
                computedPerimeters: [
                    new ComputedPerimeter('process1', 'state1_1', RightsEnum.Receive, true),
                    new ComputedPerimeter('process1', 'state1_2', RightsEnum.Receive, true),
                    new ComputedPerimeter('process2', 'state2_1', RightsEnum.Receive, true),
                    new ComputedPerimeter('process2', 'state2_2', RightsEnum.Receive, false)
                ],
                userData: null
            });
            statesCheckboxActivated = '';
            processesCheckboxActivated = '';
            processesGroupCheckboxActivated = '';
            notificationConfigurationView = new NotificationConfigurationView(translationServiceMock);
            notificationConfigurationView.setFunctionToSetProcessStateCheckBoxValue((processId, stateId, value) => {
                statesCheckboxActivated += 'p:' + processId + ',s:' + stateId + ',v:' + value + ';';
            });
            notificationConfigurationView.setFunctionToSetProcessCheckBoxValue((processId, value) => {
                processesCheckboxActivated += 'p:' + processId + ',v:' + value + ';';
            });
            notificationConfigurationView.setFunctionToSetProcessGroupCheckBoxValue((processGroupId, value) => {
                processesGroupCheckboxActivated += 'p:' + processGroupId + ',v:' + value + ';';
            });
        });

        describe('Process checkbox click', () => {
            it('should uncheck all state checkboxes if process checkbox is unchecked ', async () => {
                notificationConfigurationView.clickOnProcess('process1');
                expect(statesCheckboxActivated).toEqual('p:process1,s:state1_1,v:false;p:process1,s:state1_2,v:false;');
            });

            it('should check all states checkboxes if process checkbox is checked', async () => {
                notificationConfigurationView.clickOnProcess('process1'); // uncheck process1
                statesCheckboxActivated = '';
                notificationConfigurationView.clickOnProcess('process1'); // re-check process1
                expect(statesCheckboxActivated).toEqual('p:process1,s:state1_1,v:true;p:process1,s:state1_2,v:true;');
            });

            it('should not uncheck state checkbox  with filteringNotificationAllowed = false if process checkbox is unchecked', async () => {
                notificationConfigurationView.clickOnProcess('process2');
                expect(statesCheckboxActivated).toEqual('p:process2,s:state2_1,v:false;');
            });
            it('should check process group checkbox if all process are checked', async () => {
                notificationConfigurationView.clickOnProcess('process1'); // uncheck process1
                processesGroupCheckboxActivated = '';
                notificationConfigurationView.clickOnProcess('process1'); // re-check process1
                expect(processesGroupCheckboxActivated).toEqual('p:service1,v:true;');
            });
            it('should uncheck process group checkbox if on process is unchecked', async () => {
                notificationConfigurationView.clickOnProcess('process1'); // uncheck process1
                expect(processesGroupCheckboxActivated).toEqual('p:service1,v:false;');
            });
        });
        describe('State checkbox click', () => {
            it('should uncheck process checkbox when user unchecks one checkbox state ', async () => {
                notificationConfigurationView.clickOnState('process1', 'state1_1');
                expect(processesCheckboxActivated).toEqual('p:process1,v:false;');
            });
            it('should check process checkbox when user checks all checkbox state', async () => {
                notificationConfigurationView.clickOnState('process1', 'state1_1'); // uncheck state1
                processesCheckboxActivated = '';
                notificationConfigurationView.clickOnState('process1', 'state1_1'); // re-check state1
                expect(processesCheckboxActivated).toEqual('p:process1,v:true;');
            });
            it('should check process group checkbox if all states are checked', async () => {
                notificationConfigurationView.clickOnState('process1', 'state1_1'); // uncheck state1
                processesGroupCheckboxActivated = '';
                notificationConfigurationView.clickOnState('process1', 'state1_1'); // re-check state1
                expect(processesGroupCheckboxActivated).toEqual('p:service1,v:true;');
            });
            it('should uncheck process group checkbox if one states is unchecked', async () => {
                notificationConfigurationView.clickOnState('process1', 'state1_1'); // uncheck state1
                expect(processesGroupCheckboxActivated).toEqual('p:service1,v:false;');
            });
        });
        describe('Process group checkbox click', () => {
            it('should uncheck all process checkboxes if process group checkbox is unchecked ', async () => {
                notificationConfigurationView.clickOnProcessGroup('service1');
                expect(processesCheckboxActivated).toEqual('p:process1,v:false;p:process2,v:false;');
            });

            it('should check all process checkboxes if process group checkbox is checked', async () => {
                notificationConfigurationView.clickOnProcessGroup('service1'); // uncheck process group
                processesCheckboxActivated = '';
                notificationConfigurationView.clickOnProcessGroup('service1'); // re-check process group
                expect(processesCheckboxActivated).toEqual('p:process1,v:true;p:process2,v:true;');
            });
            it(`should check all states checkboxes with filteringNotificationAllowed to true 
                if process group checkbox is checked`, async () => {
                notificationConfigurationView.clickOnProcessGroup('service1'); // uncheck process group
                statesCheckboxActivated = '';
                notificationConfigurationView.clickOnProcessGroup('service1'); // re-check process group
                expect(statesCheckboxActivated).toEqual(
                    'p:process1,s:state1_1,v:true;p:process1,s:state1_2,v:true;p:process2,s:state2_1,v:true;'
                );
            });
        });
        describe('User click on save button', () => {
            let settingsServerMock;
            let modalServerMock;
            beforeEach(async () => {
                settingsServerMock = new SettingsServerMock();
                settingsServerMock.setResponseForPatchUserSettings(
                    new ServerResponse(null, ServerResponseStatus.OK, null)
                );
                SettingsService.setSettingsServer(settingsServerMock);
                modalServerMock = new ModalServerMock();
                ModalService.setModalServer(modalServerMock);
                ModalService.setTranslationService(new TranslationServiceMock());
            });

            it('should save settings with processesStatesNotNotified to {}  if no state checked', async () => {
                notificationConfigurationView.clickOnSaveButton();
                expect(settingsServerMock.numberOfCallsToPatchUserSettings).toEqual(1);
                expect(settingsServerMock.settingsPatch.processesStatesNotNotified).toEqual({});
                await waitForAllPromises();
                modalServerMock.clickOnButton('ok');
            });

            it('should save settings with processesStatesNotNotified process1.state1_1 if state1_1 unchecked', async () => {
                notificationConfigurationView.clickOnState('process1', 'state1_1');
                notificationConfigurationView.clickOnSaveButton();
                expect(settingsServerMock.numberOfCallsToPatchUserSettings).toEqual(1);
                expect(settingsServerMock.settingsPatch.processesStatesNotNotified).toEqual({process1: ['state1_1']});
                await waitForAllPromises();
                modalServerMock.clickOnButton('ok');
            });

            it(`should save settings with processesStatesNotNotified containing process1.state1_1 and process2.state2_2  
                if state1_1 and state2_2 unchecked`, async () => {
                notificationConfigurationView.clickOnState('process1', 'state1_1');
                notificationConfigurationView.clickOnState('process2', 'state2_2');
                notificationConfigurationView.clickOnSaveButton();
                expect(settingsServerMock.numberOfCallsToPatchUserSettings).toEqual(1);
                expect(settingsServerMock.settingsPatch.processesStatesNotNotified).toEqual({
                    process1: ['state1_1'],
                    process2: ['state2_2']
                });
                await waitForAllPromises();
                modalServerMock.clickOnButton('ok');
            });

            it(`should save settings with processesStatesNotifiedByEmail to {} if no state checked for email notification`, async () => {
                notificationConfigurationView.clickOnSaveButton();
                expect(settingsServerMock.numberOfCallsToPatchUserSettings).toEqual(1);
                expect(settingsServerMock.settingsPatch.processesStatesNotifiedByEmail).toEqual({});
                await waitForAllPromises();
                modalServerMock.clickOnButton('ok');
            });

            it(`should save settings with processesStatesNotifiedByEmail containing process1.state1_1 and process2.state2_1
                if state1_1 and state2_1 checked for email notification`, async () => {
                notificationConfigurationView.clickOnStateNotificationByEmail('process1', 'state1_1');
                notificationConfigurationView.clickOnStateNotificationByEmail('process2', 'state2_1');
                notificationConfigurationView.clickOnSaveButton();
                expect(settingsServerMock.numberOfCallsToPatchUserSettings).toEqual(1);
                expect(settingsServerMock.settingsPatch.processesStatesNotifiedByEmail).toEqual({
                    process1: ['state1_1'],
                    process2: ['state2_1']
                });
                await waitForAllPromises();
                modalServerMock.clickOnButton('ok');
            });

            it('should open information modal when saved has been done successfully', async () => {
                notificationConfigurationView.clickOnSaveButton();
                await waitForAllPromises();
                expect(modalServerMock.isOpenedModalOfInformationType()).toBeTrue();
                expect(modalServerMock.modalConfigReceived.message).toContain('settings.settingsSaved');
                await waitForAllPromises();
                modalServerMock.clickOnButton('ok');
            });
        });
    });
});
