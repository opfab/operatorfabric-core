/* Copyright (c) 2024-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {InputFieldName} from '../userCard.model';
import {State} from '@ofServices/processes/model/Processes';
import {getOneCard, setEntities, setProcessConfiguration, setUserPerimeter} from '@tests/helpers';
import {ComputedPerimeter} from '@ofServices/users/model/UserWithPerimeters';
import {RightEnum} from '@ofServices/perimeters/model/Perimeter';
import {ProcessStatesForm} from './processStatesForm';
import {User} from '@ofServices/users/model/User';
import {PermissionEnum} from '@ofServices/groups/model/PermissionEnum';
import {UserCardUIControlMock} from '@tests/userCardView/userCardUIControlMock';
import {getProcessConfigWith} from '@tests/userCardView/helpers';
import {Entity} from '@ofServices/entities/model/Entity';
import {RoleEnum} from '@ofServices/entities/model/RoleEnum';
import {Card} from '@ofServices/cards/model/Card';
import {EntitiesTree} from '@ofServices/entities/model/EntitiesTree';

describe('UserCard ProcessStateForm ', () => {
    let processStateForm: ProcessStatesForm;
    let userCardUIControlMock: UserCardUIControlMock;

    function initView(card: Card = undefined) {
        userCardUIControlMock = new UserCardUIControlMock();
        userCardUIControlMock.initMock();
        processStateForm = new ProcessStatesForm(userCardUIControlMock);
        processStateForm.init(card);
    }

    async function setUserRights(
        computedPerimeters: ComputedPerimeter[],
        userData: User = {
            login: 'test',
            firstName: 'test',
            lastName: 'test',
            entities: ['ENTITY1', 'ENTITY2']
        },
        permissions: Array<PermissionEnum> = null
    ) {
        await setUserPerimeter({
            computedPerimeters,
            userData: userData,
            permissions: permissions
        });
    }

    async function setEntitiesConfiguration() {
        await setEntities([
            new Entity(
                'ENTITY1',
                'ENTITY1_NAME',
                '',
                [RoleEnum.ACTIVITY_AREA, RoleEnum.CARD_SENDER],
                [],
                ['PARENT_ENTITY']
            ),
            new Entity('ENTITY2', 'ENTITY2_NAME', '', [RoleEnum.CARD_SENDER], [], ['PARENT_ENTITY']),
            new Entity('ENTITY3', 'ENTITY3_NAME', '', [RoleEnum.ACTIVITY_AREA], [], []),
            new Entity('ENTITY4', 'ENTITY4_NAME', '', [RoleEnum.CARD_SENDER], [], []),
            new Entity('PARENT_ENTITY', 'PARENT_ENTITY_NAME', '', [RoleEnum.CARD_SENDER], [], null)
        ]);
    }

    describe('Set processes on init ', () => {
        it('Should set process list for multiselect', async () => {
            await setProcessConfiguration(getProcessConfigWith(3, 2));
            await setUserRights([
                new ComputedPerimeter('process0', 'state0_0', RightEnum.ReceiveAndWrite),
                new ComputedPerimeter('process1', 'state1_0', RightEnum.ReceiveAndWrite),
                new ComputedPerimeter('process2', 'state2_1', RightEnum.ReceiveAndWrite)
            ]);
            initView();

            expect(userCardUIControlMock.processes[0]).toEqual({id: 'process0', label: 'process name 0'});
            expect(userCardUIControlMock.processes[1]).toEqual({id: 'process1', label: 'process name 1'});
            expect(userCardUIControlMock.processes[2]).toEqual({id: 'process2', label: 'process name 2'});
        });
        it('Should not have process1 in process list if process1 has no states with receiveAndWrite permission', async () => {
            await setProcessConfiguration(getProcessConfigWith(3, 2));
            await setUserRights([
                new ComputedPerimeter('process0', 'state0_1', RightEnum.ReceiveAndWrite),
                new ComputedPerimeter('process1', 'state1_0', RightEnum.ReceiveAndWrite),
                new ComputedPerimeter('process2', 'state2_1', RightEnum.Receive)
            ]);
            initView();

            expect(userCardUIControlMock.processes.length).toEqual(2);
            expect(userCardUIControlMock.processes[0]).toEqual({id: 'process0', label: 'process name 0'});
            expect(userCardUIControlMock.processes[1]).toEqual({id: 'process1', label: 'process name 1'});
        });
        it('Should show process multiselect if only one process is available for current user', async () => {
            await setProcessConfiguration(getProcessConfigWith(1, 2));
            await setUserRights([new ComputedPerimeter('process0', 'state0_0', RightEnum.ReceiveAndWrite, true)]);
            initView();
            expect(userCardUIControlMock.inputVisibility_FctCalls[InputFieldName.Process]).toEqual(true);
            expect(userCardUIControlMock.processes[0]).toEqual({id: 'process0', label: 'process name 0'});
        });
        it('Should show process multiselect if more than one process is visible for current user', async () => {
            await setProcessConfiguration(getProcessConfigWith(2, 2));
            await setUserRights([
                new ComputedPerimeter('process0', 'state0_0', RightEnum.ReceiveAndWrite, true),
                new ComputedPerimeter('process1', 'state1_0', RightEnum.ReceiveAndWrite, true)
            ]);
            initView();
            expect(userCardUIControlMock.inputVisibility_FctCalls[InputFieldName.Process]).toEqual(true);
        });
        it('Should use process id as process name if there is no process label', async () => {
            await setProcessConfiguration(
                getProcessConfigWith(1, 2).concat({
                    id: 'processWithNoName',
                    version: 'v2',
                    name: '',
                    states: new Map<string, State>([['stateNoName_1', {name: 'State NoName_1', userCard: {}}]])
                })
            );
            await setUserRights([
                new ComputedPerimeter('process0', 'state0_1', RightEnum.ReceiveAndWrite),
                new ComputedPerimeter('processWithNoName', 'stateNoName_1', RightEnum.ReceiveAndWrite)
            ]);
            initView();
            expect(userCardUIControlMock.processes[1]).toEqual({id: 'processWithNoName', label: 'processWithNoName'});
        });
        it('Should select first process in process list', async () => {
            await setProcessConfiguration(getProcessConfigWith(2, 2));
            await setUserRights([
                new ComputedPerimeter('process0', 'state0_0', RightEnum.ReceiveAndWrite),
                new ComputedPerimeter('process1', 'state1_0', RightEnum.ReceiveAndWrite)
            ]);
            initView();
            expect(userCardUIControlMock.selectedProcess).toEqual('process0');
            expect(processStateForm.getSelectedProcessState().processId).toEqual('process0');
        });
        it('Process version should be current version', async () => {
            await setProcessConfiguration(getProcessConfigWith(2, 2));
            await setUserRights([
                new ComputedPerimeter('process0', 'state0_0', RightEnum.ReceiveAndWrite),
                new ComputedPerimeter('process1', 'state1_0', RightEnum.ReceiveAndWrite)
            ]);
            initView();
            expect(processStateForm.getSelectedProcessState().processVersion).toEqual('v1');
        });
    });

    describe('Set states on init ', () => {
        it('Should set state list for multiselect ', async () => {
            await setProcessConfiguration(getProcessConfigWith(2, 2));
            await setUserRights([
                new ComputedPerimeter('process0', 'state0_0', RightEnum.ReceiveAndWrite, true),
                new ComputedPerimeter('process0', 'state0_1', RightEnum.ReceiveAndWrite, true),
                new ComputedPerimeter('process1', 'state1_0', RightEnum.ReceiveAndWrite, true)
            ]);
            initView();
            expect(userCardUIControlMock.states[0]).toEqual({id: 'state0_0', label: 'State 0_0'});
            expect(userCardUIControlMock.states[1]).toEqual({id: 'state0_1', label: 'State 0_1'});
        });
        it('Should ignore states with no userCard configuration', async () => {
            const processConfig = getProcessConfigWith(2, 3);
            processConfig[0].states.get('state0_1').userCard = undefined;
            await setProcessConfiguration(processConfig);
            await setUserRights([
                new ComputedPerimeter('process0', 'state0_0', RightEnum.ReceiveAndWrite, true),
                new ComputedPerimeter('process0', 'state0_1', RightEnum.ReceiveAndWrite, true),
                new ComputedPerimeter('process0', 'state0_2', RightEnum.ReceiveAndWrite, true),
                new ComputedPerimeter('process1', 'state1_0', RightEnum.ReceiveAndWrite, true)
            ]);
            initView();
            expect(userCardUIControlMock.states.length).toEqual(2);
            expect(userCardUIControlMock.states[0]).toEqual({id: 'state0_0', label: 'State 0_0'});
            expect(userCardUIControlMock.states[1]).toEqual({id: 'state0_2', label: 'State 0_2'});
        });
        it('Should select first state of first process', async () => {
            await setProcessConfiguration(getProcessConfigWith(2, 2));
            await setUserRights([
                new ComputedPerimeter('process0', 'state0_0', RightEnum.ReceiveAndWrite, true),
                new ComputedPerimeter('process0', 'state0_1', RightEnum.ReceiveAndWrite, true),
                new ComputedPerimeter('process1', 'state1_0', RightEnum.ReceiveAndWrite, true)
            ]);
            initView();
            expect(userCardUIControlMock.selectedState).toEqual('state0_0');
            expect(processStateForm.getSelectedProcessState()).toEqual({
                processId: 'process0',
                stateId: 'state0_0',
                processVersion: 'v1'
            });
        });
        it('Should not have state0_0 in list if state0_0 has not ReceiveAndWrite permission', async () => {
            await setProcessConfiguration(getProcessConfigWith(2, 3));
            await setUserRights([
                new ComputedPerimeter('process0', 'state0_0', RightEnum.Receive, true),
                new ComputedPerimeter('process0', 'state0_1', RightEnum.ReceiveAndWrite, true),
                new ComputedPerimeter('process0', 'state0_2', RightEnum.ReceiveAndWrite, true),
                new ComputedPerimeter('process1', 'state1_0', RightEnum.ReceiveAndWrite, true)
            ]);
            initView();
            expect(userCardUIControlMock.states.length).toEqual(2);
            expect(userCardUIControlMock.states[0]).toEqual({id: 'state0_1', label: 'State 0_1'});
            expect(userCardUIControlMock.states[1]).toEqual({id: 'state0_2', label: 'State 0_2'});
        });
        it('Should not have state0_0 in list as user is not member of ENTITY3 allowed to send card for state0_0', async () => {
            await setEntitiesConfiguration();
            const processConfig = getProcessConfigWith(2, 3);
            processConfig[0].states.get('state0_0').userCard = {
                publisherList: [new EntitiesTree('ENTITY3')]
            };
            await setProcessConfiguration(processConfig);
            await setUserRights([
                new ComputedPerimeter('process0', 'state0_0', RightEnum.ReceiveAndWrite, true),
                new ComputedPerimeter('process0', 'state0_1', RightEnum.ReceiveAndWrite, true),
                new ComputedPerimeter('process0', 'state0_2', RightEnum.ReceiveAndWrite, true)
            ]);
            initView();
            expect(userCardUIControlMock.states.length).toEqual(2);
            expect(userCardUIControlMock.states[0]).toEqual({id: 'state0_1', label: 'State 0_1'});
            expect(userCardUIControlMock.states[1]).toEqual({id: 'state0_2', label: 'State 0_2'});
        });
        it('Should have state0_0 in list as user is member of ENTITY1 child of PARENT_ENTITY allowed to send card for state0_0', async () => {
            await setEntitiesConfiguration();
            const processConfig = getProcessConfigWith(2, 3);
            processConfig[0].states.get('state0_0').userCard = {
                publisherList: [new EntitiesTree('PARENT_ENTITY', [1])]
            };
            await setProcessConfiguration(processConfig);
            await setUserRights([
                new ComputedPerimeter('process0', 'state0_0', RightEnum.ReceiveAndWrite, true),
                new ComputedPerimeter('process0', 'state0_1', RightEnum.ReceiveAndWrite, true),
                new ComputedPerimeter('process0', 'state0_2', RightEnum.ReceiveAndWrite, true)
            ]);
            initView();
            expect(userCardUIControlMock.states.length).toEqual(3);
            expect(userCardUIControlMock.states[0]).toEqual({id: 'state0_0', label: 'State 0_0'});
            expect(userCardUIControlMock.states[1]).toEqual({id: 'state0_1', label: 'State 0_1'});
            expect(userCardUIControlMock.states[2]).toEqual({id: 'state0_2', label: 'State 0_2'});
        });

        it('Should hide state multiselect if only one state is visible for current user', async () => {
            await setProcessConfiguration(getProcessConfigWith(2, 2));
            await setUserRights([
                new ComputedPerimeter('process0', 'state0_0', RightEnum.ReceiveAndWrite, true),
                new ComputedPerimeter('process1', 'state1_0', RightEnum.ReceiveAndWrite, true)
            ]);
            initView();
            expect(userCardUIControlMock.inputVisibility_FctCalls[InputFieldName.State]).toEqual(false);
            expect(userCardUIControlMock.states).toBeUndefined();
        });
        it('Should show state multiselect if more than one state is visible for current user', async () => {
            await setProcessConfiguration(getProcessConfigWith(2, 2));
            await setUserRights([
                new ComputedPerimeter('process0', 'state0_0', RightEnum.ReceiveAndWrite, true),
                new ComputedPerimeter('process0', 'state0_1', RightEnum.ReceiveAndWrite, true),
                new ComputedPerimeter('process1', 'state1_0', RightEnum.ReceiveAndWrite, true)
            ]);
            initView();
            expect(userCardUIControlMock.inputVisibility_FctCalls[InputFieldName.State]).toEqual(true);
        });
    });

    describe('Set processGroups on init', () => {
        it('Should set processGroup list for multiselect', async () => {
            await setProcessConfiguration(getProcessConfigWith(3, 2), undefined, {
                groups: [
                    {
                        id: 'service0',
                        name: 'Service 0',
                        processes: ['process0', 'process2']
                    },
                    {
                        id: 'service1',
                        name: 'Service 1',
                        processes: ['process1']
                    }
                ]
            });
            await setUserRights([
                new ComputedPerimeter('process0', 'state0_0', RightEnum.ReceiveAndWrite),
                new ComputedPerimeter('process1', 'state1_0', RightEnum.ReceiveAndWrite),
                new ComputedPerimeter('process2', 'state2_1', RightEnum.ReceiveAndWrite)
            ]);
            initView();
            expect(userCardUIControlMock.processGroups[0]).toEqual({id: 'service0', label: 'Service 0'});
            expect(userCardUIControlMock.processGroups[1]).toEqual({id: 'service1', label: 'Service 1'});
        });
        it('Should hide processGroup list if only one processGroup is visible for current user', async () => {
            await setProcessConfiguration(getProcessConfigWith(3, 2), undefined, {
                groups: [
                    {
                        id: 'service0',
                        name: 'Service 0',
                        processes: ['process0', 'process2']
                    },
                    {
                        id: 'service1',
                        name: 'Service 1',
                        processes: ['process1']
                    }
                ]
            });
            await setUserRights([
                new ComputedPerimeter('process0', 'state0_0', RightEnum.ReceiveAndWrite),
                new ComputedPerimeter('process2', 'state2_1', RightEnum.ReceiveAndWrite)
            ]);
            initView();
            expect(userCardUIControlMock.processGroups).toBeUndefined();
            expect(userCardUIControlMock.inputVisibility_FctCalls[InputFieldName.ProcessGroup]).toEqual(false);
        });
        it('Should show processGroup list if more than one processGroup is visible for current user', async () => {
            await setProcessConfiguration(getProcessConfigWith(3, 2), undefined, {
                groups: [
                    {
                        id: 'service0',
                        name: 'Service 0',
                        processes: ['process0', 'process2']
                    },
                    {
                        id: 'service1',
                        name: 'Service 1',
                        processes: ['process1']
                    }
                ]
            });
            await setUserRights([
                new ComputedPerimeter('process0', 'state0_0', RightEnum.ReceiveAndWrite),
                new ComputedPerimeter('process1', 'state1_0', RightEnum.ReceiveAndWrite),
                new ComputedPerimeter('process2', 'state2_1', RightEnum.ReceiveAndWrite)
            ]);
            initView();
            expect(userCardUIControlMock.inputVisibility_FctCalls[InputFieldName.ProcessGroup]).toEqual(true);
        });
        it('Should select first processGroup in processGroup list', async () => {
            await setProcessConfiguration(getProcessConfigWith(3, 2), undefined, {
                groups: [
                    {
                        id: 'service0',
                        name: 'Service 0',
                        processes: ['process0', 'process2']
                    },
                    {
                        id: 'service1',
                        name: 'Service 1',
                        processes: ['process1']
                    }
                ]
            });
            await setUserRights([
                new ComputedPerimeter('process0', 'state0_0', RightEnum.ReceiveAndWrite),
                new ComputedPerimeter('process1', 'state1_0', RightEnum.ReceiveAndWrite),
                new ComputedPerimeter('process2', 'state2_1', RightEnum.ReceiveAndWrite)
            ]);
            initView();
            expect(userCardUIControlMock.selectedProcessGroup).toEqual('service0');
        });
        it('Should select show process list in selected processGroup ', async () => {
            await setProcessConfiguration(getProcessConfigWith(3, 2), undefined, {
                groups: [
                    {
                        id: 'service0',
                        name: 'Service 0',
                        processes: ['process0', 'process2']
                    },
                    {
                        id: 'service1',
                        name: 'Service 1',
                        processes: ['process1']
                    }
                ]
            });
            await setUserRights([
                new ComputedPerimeter('process0', 'state0_0', RightEnum.ReceiveAndWrite),
                new ComputedPerimeter('process1', 'state1_0', RightEnum.ReceiveAndWrite),
                new ComputedPerimeter('process2', 'state2_1', RightEnum.ReceiveAndWrite)
            ]);
            initView();
            expect(userCardUIControlMock.processes.length).toEqual(2);
            expect(userCardUIControlMock.processes[0]).toEqual({id: 'process0', label: 'process name 0'});
            expect(userCardUIControlMock.processes[1]).toEqual({id: 'process2', label: 'process name 2'});
        });
        it('Should put processes with no process group in a default processGroup named --', async () => {
            await setProcessConfiguration(getProcessConfigWith(4, 2), undefined, {
                groups: [
                    {
                        id: 'service0',
                        name: 'Service 0',
                        processes: ['process0', 'process2']
                    }
                ]
            });
            await setUserRights([
                new ComputedPerimeter('process0', 'state0_0', RightEnum.ReceiveAndWrite),
                new ComputedPerimeter('process1', 'state1_0', RightEnum.ReceiveAndWrite),
                new ComputedPerimeter('process2', 'state2_0', RightEnum.ReceiveAndWrite),
                new ComputedPerimeter('process3', 'state3_0', RightEnum.ReceiveAndWrite)
            ]);
            initView();
            expect(userCardUIControlMock.processGroups[0]).toEqual({id: '--', label: '--'});
            expect(userCardUIControlMock.processGroups[1]).toEqual({id: 'service0', label: 'Service 0'});
            expect(userCardUIControlMock.selectedProcessGroup).toEqual('--');
            expect(userCardUIControlMock.selectedProcess).toEqual('process1');
        });
    });

    describe('Set configuration card on edit or copy mode', () => {
        it('Should set process and state of card on edit mode when no processGroup', async () => {
            await setProcessConfiguration(getProcessConfigWith(3, 2));
            await setUserRights([
                new ComputedPerimeter('process0', 'state0_0', RightEnum.ReceiveAndWrite),
                new ComputedPerimeter('process1', 'state1_0', RightEnum.ReceiveAndWrite),
                new ComputedPerimeter('process1', 'state1_1', RightEnum.ReceiveAndWrite)
            ]);
            initView(getOneCard({process: 'process1', state: 'state1_1'}));
            expect(userCardUIControlMock.selectedProcess).toEqual('process1');
            expect(userCardUIControlMock.selectedState).toEqual('state1_1');
        });
        it('Should set process and state of card on edit mode with processGroup', async () => {
            await setProcessConfiguration(getProcessConfigWith(3, 2), undefined, {
                groups: [
                    {
                        id: 'service0',
                        name: 'Service 0',
                        processes: ['process0']
                    },
                    {
                        id: 'service1',
                        name: 'Service 1',
                        processes: ['process1', 'process2']
                    }
                ]
            });
            await setUserRights([
                new ComputedPerimeter('process0', 'state0_0', RightEnum.ReceiveAndWrite),
                new ComputedPerimeter('process1', 'state1_0', RightEnum.ReceiveAndWrite),
                new ComputedPerimeter('process1', 'state1_1', RightEnum.ReceiveAndWrite),
                new ComputedPerimeter('process2', 'state2_1', RightEnum.ReceiveAndWrite)
            ]);
            initView(getOneCard({process: 'process1', state: 'state1_1'}));
            expect(userCardUIControlMock.selectedProcessGroup).toEqual('service1');
            expect(userCardUIControlMock.selectedProcess).toEqual('process1');
            expect(userCardUIControlMock.selectedState).toEqual('state1_1');
        });
        it('Should lock process and processGroup on edit mode', async () => {
            await setProcessConfiguration(getProcessConfigWith(2, 2));
            await setUserRights([
                new ComputedPerimeter('process0', 'state0_0', RightEnum.ReceiveAndWrite),
                new ComputedPerimeter('process1', 'state1_0', RightEnum.ReceiveAndWrite),
                new ComputedPerimeter('process1', 'state1_1', RightEnum.ReceiveAndWrite)
            ]);
            initView(getOneCard({process: 'process1', state: 'state1_1'}));
            expect(userCardUIControlMock.processAndProcessGroupLocked).toEqual(true);
        });
    });

    describe('User click on state', () => {
        it('Should select clicked state', async () => {
            await setProcessConfiguration(getProcessConfigWith(2, 2));
            await setUserRights([
                new ComputedPerimeter('process0', 'state0_0', RightEnum.ReceiveAndWrite),
                new ComputedPerimeter('process0', 'state0_1', RightEnum.ReceiveAndWrite),
                new ComputedPerimeter('process1', 'state1_0', RightEnum.ReceiveAndWrite)
            ]);
            initView();
            processStateForm.userClicksOnState('state0_1');
            expect(processStateForm.getSelectedProcessState().stateId).toEqual('state0_1');
        });
    });

    describe('User click on process', () => {
        it('should updated state list', async () => {
            await setProcessConfiguration(getProcessConfigWith(3, 2));
            await setUserRights([
                new ComputedPerimeter('process0', 'state0_0', RightEnum.ReceiveAndWrite),
                new ComputedPerimeter('process1', 'state1_0', RightEnum.ReceiveAndWrite),
                new ComputedPerimeter('process1', 'state1_1', RightEnum.ReceiveAndWrite)
            ]);
            initView();
            processStateForm.userClickOnProcess('process1');
            expect(userCardUIControlMock.states.length).toEqual(2);
            expect(userCardUIControlMock.states[0]).toEqual({id: 'state1_0', label: 'State 1_0'});
            expect(userCardUIControlMock.states[1]).toEqual({id: 'state1_1', label: 'State 1_1'});
            expect(userCardUIControlMock.inputVisibility_FctCalls[InputFieldName.State]).toEqual(true);
        });
        it('should select first state of new process', async () => {
            await setProcessConfiguration(getProcessConfigWith(3, 2));
            await setUserRights([
                new ComputedPerimeter('process0', 'state0_0', RightEnum.ReceiveAndWrite),
                new ComputedPerimeter('process1', 'state1_0', RightEnum.ReceiveAndWrite),
                new ComputedPerimeter('process1', 'state1_1', RightEnum.ReceiveAndWrite)
            ]);
            initView();
            processStateForm.userClickOnProcess('process1');
            expect(userCardUIControlMock.selectedState).toEqual('state1_0');
        });
        it('should hide state list if only one state is available with new process for current user', async () => {
            await setProcessConfiguration(getProcessConfigWith(3, 2));
            await setUserRights([
                new ComputedPerimeter('process0', 'state0_0', RightEnum.ReceiveAndWrite),
                new ComputedPerimeter('process1', 'state1_0', RightEnum.ReceiveAndWrite)
            ]);
            initView();
            processStateForm.userClickOnProcess('process1');
            expect(userCardUIControlMock.inputVisibility_FctCalls[InputFieldName.State]).toEqual(false);
        });
        it('should get new process and new state', async () => {
            await setProcessConfiguration(getProcessConfigWith(3, 2));
            await setUserRights([
                new ComputedPerimeter('process0', 'state0_0', RightEnum.ReceiveAndWrite),
                new ComputedPerimeter('process1', 'state1_0', RightEnum.ReceiveAndWrite)
            ]);
            initView();
            processStateForm.userClickOnProcess('process1');
            expect(processStateForm.getSelectedProcessState()).toEqual({
                processId: 'process1',
                stateId: 'state1_0',
                processVersion: 'v1'
            });
        });
        it('should not change state list if process already selected', async () => {
            await setProcessConfiguration(getProcessConfigWith(3, 2));
            await setUserRights([
                new ComputedPerimeter('process0', 'state0_0', RightEnum.ReceiveAndWrite),
                new ComputedPerimeter('process0', 'state0_1', RightEnum.ReceiveAndWrite),
                new ComputedPerimeter('process1', 'state1_0', RightEnum.ReceiveAndWrite)
            ]);
            initView();
            userCardUIControlMock.initMock();
            processStateForm.userClickOnProcess('process0');
            expect(userCardUIControlMock.states).toBeUndefined();
            expect(userCardUIControlMock.inputVisibility_FctCalls[InputFieldName.State]).toEqual(undefined);
        });
    });
    describe('User clicks on processGroup', () => {
        it('should update process list', async () => {
            await setProcessConfiguration(getProcessConfigWith(4, 2), undefined, {
                groups: [
                    {
                        id: 'service0',
                        name: 'Service 0',
                        processes: ['process0', 'process1']
                    },
                    {
                        id: 'service1',
                        name: 'Service 1',
                        processes: ['process2', 'process3']
                    }
                ]
            });
            await setUserRights([
                new ComputedPerimeter('process0', 'state0_0', RightEnum.ReceiveAndWrite),
                new ComputedPerimeter('process1', 'state1_0', RightEnum.ReceiveAndWrite),
                new ComputedPerimeter('process2', 'state2_1', RightEnum.ReceiveAndWrite),
                new ComputedPerimeter('process3', 'state3_1', RightEnum.ReceiveAndWrite)
            ]);
            initView();
            processStateForm.userClickOnProcessGroup('service1');
            expect(userCardUIControlMock.processes.length).toEqual(2);
            expect(userCardUIControlMock.processes[0]).toEqual({id: 'process2', label: 'process name 2'});
            expect(userCardUIControlMock.processes[1]).toEqual({id: 'process3', label: 'process name 3'});
        });
        it('should select first process and first state of new processGroup', async () => {
            await setProcessConfiguration(getProcessConfigWith(4, 2), undefined, {
                groups: [
                    {
                        id: 'service0',
                        name: 'Service 0',
                        processes: ['process0', 'process1']
                    },
                    {
                        id: 'service1',
                        name: 'Service 1',
                        processes: ['process2', 'process3']
                    }
                ]
            });
            await setUserRights([
                new ComputedPerimeter('process0', 'state0_0', RightEnum.ReceiveAndWrite),
                new ComputedPerimeter('process1', 'state1_0', RightEnum.ReceiveAndWrite),
                new ComputedPerimeter('process2', 'state2_0', RightEnum.ReceiveAndWrite),
                new ComputedPerimeter('process2', 'state2_1', RightEnum.ReceiveAndWrite),
                new ComputedPerimeter('process3', 'state3_1', RightEnum.ReceiveAndWrite)
            ]);
            initView();
            userCardUIControlMock.initMock();
            processStateForm.userClickOnProcessGroup('service1');
            expect(userCardUIControlMock.selectedProcess).toEqual('process2');
            expect(userCardUIControlMock.selectedState).toEqual('state2_0');
        });
        it('Should show process list with one choice if one process is available for current user', async () => {
            await setProcessConfiguration(getProcessConfigWith(4, 2), undefined, {
                groups: [
                    {
                        id: 'service0',
                        name: 'Service 0',
                        processes: ['process0', 'process1']
                    },
                    {
                        id: 'service1',
                        name: 'Service 1',
                        processes: ['process2', 'process3']
                    }
                ]
            });
            await setUserRights([
                new ComputedPerimeter('process0', 'state0_0', RightEnum.ReceiveAndWrite),
                new ComputedPerimeter('process1', 'state1_0', RightEnum.ReceiveAndWrite),
                new ComputedPerimeter('process2', 'state2_0', RightEnum.ReceiveAndWrite)
            ]);
            initView();
            processStateForm.userClickOnProcessGroup('service1');
            expect(userCardUIControlMock.inputVisibility_FctCalls[InputFieldName.Process]).toEqual(true);
            expect(userCardUIControlMock.processes[0]).toEqual({id: 'process2', label: 'process name 2'});
        });
        it('Should get new process and new state', async () => {
            await setProcessConfiguration(getProcessConfigWith(4, 2), undefined, {
                groups: [
                    {
                        id: 'service0',
                        name: 'Service 0',
                        processes: ['process0', 'process1']
                    },
                    {
                        id: 'service1',
                        name: 'Service 1',
                        processes: ['process2', 'process3']
                    }
                ]
            });
            await setUserRights([
                new ComputedPerimeter('process0', 'state0_0', RightEnum.ReceiveAndWrite),
                new ComputedPerimeter('process1', 'state1_0', RightEnum.ReceiveAndWrite),
                new ComputedPerimeter('process2', 'state2_0', RightEnum.ReceiveAndWrite)
            ]);
            initView();
            processStateForm.userClickOnProcessGroup('service1');
            expect(processStateForm.getSelectedProcessState()).toEqual({
                processId: 'process2',
                stateId: 'state2_0',
                processVersion: 'v1'
            });
        });
        it('Should not change process list if processGroup already selected', async () => {
            await setProcessConfiguration(getProcessConfigWith(4, 2), undefined, {
                groups: [
                    {
                        id: 'service0',
                        name: 'Service 0',
                        processes: ['process0', 'process1']
                    },
                    {
                        id: 'service1',
                        name: 'Service 1',
                        processes: ['process2', 'process3']
                    }
                ]
            });
            await setUserRights([
                new ComputedPerimeter('process0', 'state0_0', RightEnum.ReceiveAndWrite),
                new ComputedPerimeter('process1', 'state1_0', RightEnum.ReceiveAndWrite),
                new ComputedPerimeter('process2', 'state2_1', RightEnum.ReceiveAndWrite),
                new ComputedPerimeter('process3', 'state3_1', RightEnum.ReceiveAndWrite)
            ]);
            initView();
            userCardUIControlMock.initMock();
            processStateForm.userClickOnProcessGroup('service0');
            expect(userCardUIControlMock.processes).toBeUndefined();
            expect(userCardUIControlMock.inputVisibility_FctCalls[InputFieldName.Process]).toEqual(undefined);
        });
    });
});
