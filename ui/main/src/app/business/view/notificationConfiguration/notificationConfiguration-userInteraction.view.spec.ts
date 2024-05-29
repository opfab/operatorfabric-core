/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {State} from '@ofModel/processes.model';
import {NotificationConfigurationView} from './notificationConfiguration.view';
import {UserServerMock} from '@tests/mocks/userServer.mock';
import {ServerResponse, ServerResponseStatus} from 'app/business/server/serverResponse';
import {firstValueFrom} from 'rxjs';
import {RightsEnum} from '@ofModel/perimeter.model';
import {ComputedPerimeter} from '@ofModel/userWithPerimeters.model';
import {UserService} from 'app/business/services/users/user.service';
import {SettingsServerMock} from '@tests/mocks/settingsServer.mock';
import {SettingsService} from 'app/business/services/users/settings.service';
import {
    getModalServerMock,
    getOneLightCard,
    setProcessConfiguration,
    setUserPerimeter,
    waitForAllPromises
} from '@tests/helpers';
import {TranslationServiceMock} from '@tests/mocks/translation.service.mock';
import {Severity} from '@ofModel/light-card.model';
import {OpfabEventStreamServerMock} from '@tests/mocks/opfab-event-stream.server.mock';
import {OpfabEventStreamService} from 'app/business/services/events/opfabEventStream.service';
import {OpfabStore} from 'app/business/store/opfabStore';
import {NotificationConfigurationPage} from './notificationConfigurationPage';
import {ModalServerMock} from '@tests/mocks/modalServer.mock';
import {I18n} from '@ofModel/i18n.model';

describe('Notification configuration view - User interaction ', () => {
    const translationServiceMock = new TranslationServiceMock();
    let notificationConfigurationView: NotificationConfigurationView;
    let notificationConfigurationPage: NotificationConfigurationPage;
    let modalServerMock: ModalServerMock;
    let settingsServerMock: SettingsServerMock;
    let statesCheckboxActivated = '';
    let processesCheckboxActivated = '';
    let processesGroupCheckboxActivated = '';
    let emailEnabledActivated = '';

    function getSettingsServerMock(): SettingsServerMock {
        const settingsServerMock = new SettingsServerMock();
        settingsServerMock.setResponseForPatchUserSettings(new ServerResponse(null, ServerResponseStatus.OK, null));
        SettingsService.setSettingsServer(settingsServerMock);
        return settingsServerMock;
    }

    function initFunctionsToSet() {
        statesCheckboxActivated = '';
        processesCheckboxActivated = '';
        processesGroupCheckboxActivated = '';
        emailEnabledActivated = '';
        notificationConfigurationView.setFunctionToSetProcessStateCheckBoxValue((processId, stateId, value) => {
            statesCheckboxActivated += 'p:' + processId + ',s:' + stateId + ',v:' + value + ';';
        });
        notificationConfigurationView.setFunctionToSetProcessCheckBoxValue((processId, value) => {
            processesCheckboxActivated += 'p:' + processId + ',v:' + value + ';';
        });
        notificationConfigurationView.setFunctionToSetProcessGroupCheckBoxValue((processGroupId, value) => {
            processesGroupCheckboxActivated += 'p:' + processGroupId + ',v:' + value + ';';
        });
        notificationConfigurationView.setFunctionToSetEmailEnabled((processId, stateId, value) => {
            emailEnabledActivated += 'p:' + processId + ',s:' + stateId + ',v:' + value + ';';
        });
    }

    describe('manageNotNotifiedStatesWithFilteringNotificationNotAllowed ', () => {
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
            settingsServerMock = getSettingsServerMock();
            modalServerMock = getModalServerMock();
            notificationConfigurationView = new NotificationConfigurationView(translationServiceMock);
        });
        it('should popup a message when filteringNotificationAllowed is false and state is not checked', async () => {
            notificationConfigurationView.manageNotNotifiedStatesWithFilteringNotificationNotAllowed();
            expect(modalServerMock.modalConfigReceived).toBeDefined();
            expect(modalServerMock.modalConfigReceived.message).toContain(
                'notificationConfiguration.youAreUnsubscribedFrom'
            );
            expect(modalServerMock.modalConfigReceived.message).toContain(
                'notificationConfiguration.youWillBeSubscribedAgain'
            );
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
            notificationConfigurationView.manageNotNotifiedStatesWithFilteringNotificationNotAllowed();
            expect(modalServerMock.modalConfigReceived.message).toContain('process name 1 / State 1_2');
            expect(modalServerMock.modalConfigReceived.message).toContain('process name 1 / State 1_3');
            await waitForAllPromises();
            modalServerMock.clickOnButton('ok');
            await waitForAllPromises();
            modalServerMock.clickOnButton('ok');
        });

        it(' should check states where filteringNotificationAllowed is false and states are not checked', async () => {
            initFunctionsToSet();
            notificationConfigurationView.manageNotNotifiedStatesWithFilteringNotificationNotAllowed();
            notificationConfigurationPage = notificationConfigurationView.getNotificationConfigurationPage();
            expect(notificationConfigurationPage.processesWithNoProcessGroup[0].states[1].checked).toBeTrue();
            expect(notificationConfigurationPage.processesWithNoProcessGroup[0].states[2].checked).toBeTrue();
            // all state are activated so process checkbox shall be activated
            expect(processesCheckboxActivated).toEqual('p:process1,v:true;p:process1,v:true;');
            expect(statesCheckboxActivated).toEqual('p:process1,s:state1_2,v:true;p:process1,s:state1_3,v:true;');
            modalServerMock.clickOnButton('ok');
            modalServerMock.clickOnButton('ok');
        });
        it('should save config if filteringNotification is false and states are not checked', async () => {
            notificationConfigurationView.manageNotNotifiedStatesWithFilteringNotificationNotAllowed();
            modalServerMock.clickOnButton('ok');
            await waitForAllPromises();
            expect(settingsServerMock.numberOfCallsToPatchUserSettings).toEqual(1);
            expect(settingsServerMock.settingsPatch.processesStatesNotNotified).toEqual({});
            modalServerMock.clickOnButton('ok');
        });
    });

    describe('User click ', () => {
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
                undefined,
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

            notificationConfigurationView = new NotificationConfigurationView(translationServiceMock);
            initFunctionsToSet();
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

            it('should not check process group checkbox if two process unchecked and one process rechecked', async () => {
                notificationConfigurationView.clickOnProcess('process1'); // uncheck process1
                notificationConfigurationView.clickOnProcess('process2'); // uncheck process2
                notificationConfigurationView.clickOnProcess('process1'); // recheck process1
                expect(processesGroupCheckboxActivated).toEqual(
                    'p:service1,v:false;p:service1,v:false;p:service1,v:false;'
                );
            });
            it('should set email notification disable for all states if user uncheck process', async () => {
                notificationConfigurationView.clickOnStateNotificationByEmail('process1', 'state1_1');
                notificationConfigurationView.clickOnStateNotificationByEmail('process1', 'state1_2');
                emailEnabledActivated = '';
                notificationConfigurationView.clickOnProcess('process1');
                expect(emailEnabledActivated).toEqual('p:process1,s:state1_1,v:false;p:process1,s:state1_2,v:false;');
                expect(
                    notificationConfigurationView.getNotificationConfigurationPage().processGroups[0].processes[0]
                        .states[0].notificationByEmail
                ).toBeFalse();
                expect(
                    notificationConfigurationView.getNotificationConfigurationPage().processGroups[0].processes[0]
                        .states[1].notificationByEmail
                ).toBeFalse();
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
            it('should set email notification disable if user uncheck state', async () => {
                notificationConfigurationView.clickOnStateNotificationByEmail('process1', 'state1_1');
                emailEnabledActivated = '';
                notificationConfigurationView.clickOnState('process1', 'state1_1');
                expect(emailEnabledActivated).toEqual('p:process1,s:state1_1,v:false;');
                expect(
                    notificationConfigurationView.getNotificationConfigurationPage().processGroups[0].processes[0]
                        .states[0].notificationByEmail
                ).toBeFalse();
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
            it('should set email notification disable for all states if user uncheck processGroup', async () => {
                notificationConfigurationView.clickOnStateNotificationByEmail('process1', 'state1_1');
                notificationConfigurationView.clickOnStateNotificationByEmail('process2', 'state2_1');
                emailEnabledActivated = '';
                notificationConfigurationView.clickOnProcessGroup('service1');
                expect(emailEnabledActivated).toEqual('p:process1,s:state1_1,v:false;p:process2,s:state2_1,v:false;');
                expect(
                    notificationConfigurationView.getNotificationConfigurationPage().processGroups[0].processes[0]
                        .states[0].notificationByEmail
                ).toBeFalse();
                expect(
                    notificationConfigurationView.getNotificationConfigurationPage().processGroups[0].processes[0]
                        .states[1].notificationByEmail
                ).toBeFalse();
            });
        });
        describe('Email icon click', () => {
            it('should set state notification by email if user click on email icon', async () => {
                notificationConfigurationView.clickOnStateNotificationByEmail('process1', 'state1_1');
                expect(emailEnabledActivated).toEqual('p:process1,s:state1_1,v:true;');
            });
            it('should unset state notification by email if user click two times email icon', async () => {
                notificationConfigurationView.clickOnStateNotificationByEmail('process1', 'state1_1');
                emailEnabledActivated = '';
                notificationConfigurationView.clickOnStateNotificationByEmail('process1', 'state1_1');
                expect(emailEnabledActivated).toEqual('p:process1,s:state1_1,v:false;');
            });
            it('should not set state notification by email if notification is not set for state', async () => {
                notificationConfigurationView.clickOnState('process1', 'state1_2');
                notificationConfigurationView.clickOnStateNotificationByEmail('process1', 'state1_2');
                expect(emailEnabledActivated).toEqual('');
            });
        });
        describe('User click on save button', () => {
            beforeEach(async () => {
                settingsServerMock = getSettingsServerMock();
                modalServerMock = getModalServerMock();
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
                expect(modalServerMock.modalConfigReceived.message).toEqual(new I18n('settings.settingsSaved'));
                await waitForAllPromises();
                modalServerMock.clickOnButton('ok');
            });

            it('should open information modal with error if saved is in error', async () => {
                settingsServerMock.setResponseForPatchUserSettings(
                    new ServerResponse(null, ServerResponseStatus.BAD_REQUEST, null)
                );
                notificationConfigurationView.clickOnSaveButton();
                await waitForAllPromises();
                expect(modalServerMock.isOpenedModalOfInformationType()).toBeTrue();
                expect(modalServerMock.modalConfigReceived.message).toEqual(
                    new I18n('shared.error.impossibleToSaveSettings')
                );
                await waitForAllPromises();
                modalServerMock.clickOnButton('ok');
            });

            it('should clear lightcard store if save is successful', async () => {
                const opfabEventStreamServerMock = new OpfabEventStreamServerMock();
                OpfabEventStreamService.setEventStreamServer(opfabEventStreamServerMock);
                OpfabStore.reset();
                const card = getOneLightCard({
                    process: 'process1',
                    state: 'state1',
                    severity: Severity.ALARM
                });
                opfabEventStreamServerMock.sendLightCard(card);
                notificationConfigurationView.clickOnSaveButton();
                await waitForAllPromises();
                modalServerMock.clickOnButton('ok');
                const lightCards = await firstValueFrom(OpfabStore.getLightCardStore().getLightCards());
                expect(lightCards).toEqual([]);
            });

            it('should reload user perimeter if save is successful', async () => {
                const userServerMock = new UserServerMock();
                UserService.setUserServer(userServerMock);
                userServerMock.setResponseForCurrentUserWithPerimeter(
                    new ServerResponse(
                        {
                            computedPerimeters: [],
                            userData: null
                        },
                        ServerResponseStatus.OK,
                        null
                    )
                );
                notificationConfigurationView.clickOnSaveButton();
                await waitForAllPromises();
                modalServerMock.clickOnButton('ok');
                expect(userServerMock.numberOfCallsToCurrentUserWithPerimeter).toEqual(1);
            });
        });
    });

    describe('User want to  exit', () => {
        beforeEach(async () => {
            modalServerMock = getModalServerMock();
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
                undefined,
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
            notificationConfigurationView = new NotificationConfigurationView(translationServiceMock);
        });
        it('should exit if nothing to saved as configuration has not changed', async () => {
            let canUserExit;
            notificationConfigurationView.canUserExit().then((value) => {
                canUserExit = value;
            });
            await waitForAllPromises();
            expect(canUserExit).toBeTrue();
            expect(modalServerMock.modalConfigReceived).toBeUndefined();
        });

        it('should open confirmation modal if configuration for notification has changed', async () => {
            notificationConfigurationView.clickOnProcess('process1');
            notificationConfigurationView.canUserExit();
            expect(modalServerMock.ispOpenedModalOfSaveBeforeExitType()).toBeTrue();
            modalServerMock.clickOnButton('cancel');
        });

        it('should open confirmation modal if configuration for notification by email has changed', async () => {
            notificationConfigurationView.clickOnStateNotificationByEmail('process1', 'state1_1');
            notificationConfigurationView.canUserExit();
            expect(modalServerMock.ispOpenedModalOfSaveBeforeExitType()).toBeTrue();
            modalServerMock.clickOnButton('cancel');
        });

        it('should not exit if user click cancel on confirmation modal', async () => {
            notificationConfigurationView.clickOnProcess('process1');
            let canUserExit;
            notificationConfigurationView.canUserExit().then((value) => {
                canUserExit = value;
            });
            modalServerMock.clickOnButton('cancel');
            await waitForAllPromises();
            expect(canUserExit).toBeFalse();
        });

        it('should exit and not save if user click doNotSaved on confirmation modal', async () => {
            const settingsServerMock = getSettingsServerMock();
            notificationConfigurationView.clickOnProcess('process1');
            let canUserExit;
            notificationConfigurationView.canUserExit().then((value) => {
                canUserExit = value;
            });
            modalServerMock.clickOnButton('doNotSave');
            await waitForAllPromises();
            expect(settingsServerMock.numberOfCallsToPatchUserSettings).toEqual(0);
            expect(canUserExit).toBeTrue();
        });

        it('should save configuration and exit if user click save on confirmation modal', async () => {
            const settingsServerMock = getSettingsServerMock();
            notificationConfigurationView.clickOnProcess('process1');
            let canUserExit;
            notificationConfigurationView.canUserExit().then((value) => {
                canUserExit = value;
            });
            modalServerMock.clickOnButton('save');
            await waitForAllPromises();
            modalServerMock.clickOnButton('ok'); // close information modal
            await waitForAllPromises();
            expect(settingsServerMock.numberOfCallsToPatchUserSettings).toEqual(1);
            expect(canUserExit).toBeTrue();
        });

        it('should exit without confirmation if nothing to saved as configuration has not changed', async () => {
            notificationConfigurationView.canUserExit();
            expect(modalServerMock.modalConfigReceived).toBeUndefined();
        });
    });
});
