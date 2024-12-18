/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {UserCardUIControlMock} from '@tests/userCardView/userCardUIControlMock';
import {PublisherForm} from './publisherForm';
import {Entity} from '@ofModel/entity.model';
import {RolesEnum} from '@ofModel/roles.model';
import {getOneCard, initOpfabAPI, setEntities, setProcessConfiguration, setUserPerimeter} from '@tests/helpers';
import {EditionMode, InputFieldName} from '../userCard.model';
import {EntitiesTree, State} from '@ofServices/processes/model/Processes';

declare const opfab: any;

describe('UserCard PublisherForm', () => {
    let userCardUIControl: UserCardUIControlMock;
    let publisherForm: PublisherForm;

    beforeAll(async () => {
        await setEntitiesConfiguration();
    });

    beforeEach(async () => {
        initOpfabAPI();
        userCardUIControl = new UserCardUIControlMock();
        publisherForm = new PublisherForm(userCardUIControl);
    });

    async function setEntitiesConfiguration() {
        await setEntities([
            new Entity(
                'ENTITY1',
                'ENTITY1_NAME',
                '',
                [RolesEnum.ACTIVITY_AREA, RolesEnum.CARD_SENDER],
                [],
                ['PARENT_ENTITY']
            ),
            new Entity('ENTITY2', 'ENTITY2_NAME', '', [RolesEnum.CARD_SENDER], [], ['PARENT_ENTITY']),
            new Entity('ENTITY3', 'ENTITY3_NAME', '', [RolesEnum.ACTIVITY_AREA], [], []),
            new Entity('ENTITY4', 'ENTITY4_NAME', '', [RolesEnum.CARD_SENDER], [], []),
            new Entity('ENTITY_WITH_NO_NAME', '', '', [RolesEnum.CARD_SENDER], [], []),
            new Entity('PARENT_ENTITY', 'PARENT_ENTITY_NAME', '', [RolesEnum.CARD_SENDER], [], null),
            new Entity('NO_ROLES_ENTITY', 'NO_ROLES_ENTITY_NAME', '', null, [], null)
        ]);
    }

    async function setUserWithEntities(entities: string[]) {
        await setUserPerimeter({
            computedPerimeters: [],
            userData: {
                login: 'test',
                firstName: 'test',
                lastName: 'test',
                entities
            }
        });
    }

    async function setProcessConfigWithUserCardConfig(userCardConfig) {
        await setProcessConfiguration([
            {
                id: 'testProcessId',
                version: 'v1',
                name: 'process name 1',
                states: new Map<string, State>([['testStateId', {name: 'testState', userCard: userCardConfig}]])
            }
        ]);
    }
    describe('Set process and state', () => {
        describe('With no restriction on publisher list in state definition', () => {
            beforeEach(async () => {
                await setProcessConfigWithUserCardConfig({});
            });
            it('Should hide publisher multiselect if user has only one entity that can send the card', async () => {
                await setUserWithEntities(['ENTITY1']);
                publisherForm.setProcessAndState('testProcessId', 'testStateId');
                expect(userCardUIControl.inputVisibility_FctCalls[InputFieldName.Publisher]).toBe(false);
            });
            it('Should show publisher multiselect if user has more than one entity that can send the card', async () => {
                await setUserWithEntities(['ENTITY1', 'ENTITY2']);
                publisherForm.setProcessAndState('testProcessId', 'testStateId');
                expect(userCardUIControl.inputVisibility_FctCalls[InputFieldName.Publisher]).toBe(true);
            });
            it('Should set a list of 2 publishers to the userCardUIControl if user has 2 entities to send card', async () => {
                await setUserWithEntities(['ENTITY1', 'ENTITY2']);
                publisherForm.setProcessAndState('testProcessId', 'testStateId');
                expect(userCardUIControl.publishers).toEqual([
                    {id: 'ENTITY1', label: 'ENTITY1_NAME'},
                    {id: 'ENTITY2', label: 'ENTITY2_NAME'}
                ]);
            });
            it('Should set a list of 2 publishers to the userCardUIControl if user has 2 entities to send card and one entity with no roles', async () => {
                await setUserWithEntities(['ENTITY1', 'ENTITY2', 'NO_ROLES_ENTITY']);
                publisherForm.setProcessAndState('testProcessId', 'testStateId');
                expect(userCardUIControl.publishers).toEqual([
                    {id: 'ENTITY1', label: 'ENTITY1_NAME'},
                    {id: 'ENTITY2', label: 'ENTITY2_NAME'}
                ]);
            });
            it('Should set a list of 2 publishers by alphabetical order', async () => {
                await setUserWithEntities(['ENTITY2', 'ENTITY1']);
                publisherForm.setProcessAndState('testProcessId', 'testStateId');
                expect(userCardUIControl.publishers).toEqual([
                    {id: 'ENTITY1', label: 'ENTITY1_NAME'},
                    {id: 'ENTITY2', label: 'ENTITY2_NAME'}
                ]);
            });
            it('Should set entity label as entity id if entity has no name', async () => {
                await setUserWithEntities(['ENTITY1', 'ENTITY_WITH_NO_NAME']);
                publisherForm.setProcessAndState('testProcessId', 'testStateId');
                expect(userCardUIControl.publishers).toEqual([
                    {id: 'ENTITY_WITH_NO_NAME', label: 'ENTITY_WITH_NO_NAME'},
                    {id: 'ENTITY1', label: 'ENTITY1_NAME'}
                ]);
            });
            it('Should set the first entity as selected in the publisher multiselect', async () => {
                await setUserWithEntities(['ENTITY1', 'ENTITY2']);
                publisherForm.setProcessAndState('testProcessId', 'testStateId');
                expect(userCardUIControl.selectedPublisher).toBe('ENTITY1');
                expect(publisherForm.getSelectedPublisher()).toEqual('ENTITY1');
            });
            it('Should set the first entity by alphabetical order as selected in the publisher multiselect', async () => {
                await setUserWithEntities(['ENTITY2', 'ENTITY1']);
                publisherForm.setProcessAndState('testProcessId', 'testStateId');
                expect(userCardUIControl.selectedPublisher).toBe('ENTITY1');
                expect(publisherForm.getSelectedPublisher()).toEqual('ENTITY1');
            });
            it('Should send to template the selected publisher via opfabAPI', async () => {
                await setUserWithEntities(['ENTITY1', 'ENTITY2']);
                let entitySelectedReceiveByTemplate;
                opfab.currentUserCard.listenToEntityUsedForSendingCard((entity) => {
                    entitySelectedReceiveByTemplate = entity;
                });
                publisherForm.setProcessAndState('testProcessId', 'testStateId');
                expect(entitySelectedReceiveByTemplate).toEqual('ENTITY1');
            });
            it('Should set the selected publisher as the entity allowed to send card if only one entity is possible', async () => {
                await setUserWithEntities(['ENTITY1']);
                publisherForm.setProcessAndState('testProcessId', 'testStateId');
                expect(publisherForm.getSelectedPublisher()).toEqual('ENTITY1');
            });
            it('Should set the selected publisher as the entity allowed to send card to template via opfabAPI if only one entity is possible', async () => {
                await setUserWithEntities(['ENTITY1']);
                let entitySelectedReceiveByTemplate;
                opfab.currentUserCard.listenToEntityUsedForSendingCard((entity) => {
                    entitySelectedReceiveByTemplate = entity;
                });
                publisherForm.setProcessAndState('testProcessId', 'testStateId');
                expect(entitySelectedReceiveByTemplate).toEqual('ENTITY1');
            });
            it('Should not add entity3 in the list of publishers as entity3 has no role CARD_SENDER', async () => {
                await setUserWithEntities(['ENTITY1', 'ENTITY2', 'ENTITY3']);
                publisherForm.setProcessAndState('testProcessId', 'testStateId');
                expect(userCardUIControl.publishers).toEqual([
                    {id: 'ENTITY1', label: 'ENTITY1_NAME'},
                    {id: 'ENTITY2', label: 'ENTITY2_NAME'}
                ]);
            });
        });
        describe('With restriction on publisher list in state definition (userCard.publisherList field)', () => {
            it('Should not have ENTITY1 in the list of publishers as it is not in state definition publisher list', async () => {
                await setUserWithEntities(['ENTITY1', 'ENTITY2', 'ENTITY4']);
                await setProcessConfigWithUserCardConfig({
                    publisherList: [new EntitiesTree('ENTITY2'), new EntitiesTree('ENTITY4')]
                });
                publisherForm.setProcessAndState('testProcessId', 'testStateId');
                expect(userCardUIControl.publishers).toEqual([
                    {id: 'ENTITY2', label: 'ENTITY2_NAME'},
                    {id: 'ENTITY4', label: 'ENTITY4_NAME'}
                ]);
            });
            it('Should not have ENTITY4 in the list of publishers as it is not a child of ENTITY_PARENT that is in state definition publisher list', async () => {
                await setUserWithEntities(['ENTITY1', 'ENTITY2', 'ENTITY4']);
                await setProcessConfigWithUserCardConfig({
                    publisherList: [new EntitiesTree('PARENT_ENTITY', [1])]
                });
                publisherForm.setProcessAndState('testProcessId', 'testStateId');
                expect(userCardUIControl.publishers).toEqual([
                    {id: 'ENTITY1', label: 'ENTITY1_NAME'},
                    {id: 'ENTITY2', label: 'ENTITY2_NAME'}
                ]);
            });
        });
        describe('In card edition or copy mode', () => {
            it('Should select publisher of existing card in edit mode if user is member of the publishing entity', async () => {
                await setUserWithEntities(['ENTITY1', 'ENTITY2', 'ENTITY4']);
                await setProcessConfigWithUserCardConfig({});
                const card = getOneCard({publisher: 'ENTITY4'});
                publisherForm.setProcessAndState('testProcessId', 'testStateId', card, EditionMode.EDITION);
                expect(publisherForm.getSelectedPublisher()).toEqual('ENTITY4');
            });
            it('Should not select publisher of existing card in edit mode if user is not member of the publishing entity', async () => {
                await setUserWithEntities(['ENTITY1', 'ENTITY2', 'ENTITY4']);
                await setProcessConfigWithUserCardConfig({});
                const card = getOneCard({
                    publisher: 'ENTITY3'
                });
                publisherForm.setProcessAndState('testProcessId', 'testStateId', card, EditionMode.EDITION);
                expect(publisherForm.getSelectedPublisher()).toEqual('ENTITY1');
            });
            it('Should not select publisher of existing card in copy mode if user is member of the publishing entity', async () => {
                await setUserWithEntities(['ENTITY1', 'ENTITY2', 'ENTITY4']);
                await setProcessConfigWithUserCardConfig({});
                const card = getOneCard({publisher: 'ENTITY4'});
                publisherForm.setProcessAndState('testProcessId', 'testStateId', card, EditionMode.COPY);
                expect(publisherForm.getSelectedPublisher()).toEqual('ENTITY1');
            });
        });
    });
    describe('User selects publisher on UI', () => {
        it('Should set selected publisher', async () => {
            publisherForm.userSelectsPublisher('ENTITY2');
            expect(publisherForm.getSelectedPublisher()).toEqual('ENTITY2');
        });
        it('Should ignore publisher if publisher null, undefined or empty  ', async () => {
            publisherForm.userSelectsPublisher('ENTITY2');
            publisherForm.userSelectsPublisher(null);
            expect(publisherForm.getSelectedPublisher()).toEqual('ENTITY2');
            publisherForm.userSelectsPublisher(undefined);
            expect(publisherForm.getSelectedPublisher()).toEqual('ENTITY2');
            publisherForm.userSelectsPublisher('');
            expect(publisherForm.getSelectedPublisher()).toEqual('ENTITY2');
        });
        it('Should send selected publisher to template via opfabAPI ', async () => {
            let entitySelectedReceiveByTemplate;
            opfab.currentUserCard.listenToEntityUsedForSendingCard((entity) => {
                entitySelectedReceiveByTemplate = entity;
            });
            publisherForm.userSelectsPublisher('ENTITY2');
            expect(entitySelectedReceiveByTemplate).toEqual('ENTITY2');
        });
    });
});
