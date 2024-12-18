/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {EntitiesTree, State} from '@ofServices/processes/model/Processes';
import {getOneCard, initOpfabAPI, loadWebUIConf, setEntities, setProcessConfiguration} from '@tests/helpers';
import {RecipientsForm} from './recipientsForm';
import {UserCardUIControlMock} from '@tests/userCardView/userCardUIControlMock';
import {Entity} from '@ofModel/entity.model';
import {RolesEnum} from '@ofModel/roles.model';

declare const opfab: any;

async function setProcessConfigWithUserCardConfig(userCardConfig) {
    await setProcessConfiguration([
        {
            id: 'process1',
            version: 'v1',
            name: 'process name 1',
            states: new Map<string, State>([['state1_1', {name: 'State 1_1', userCard: userCardConfig}]])
        }
    ]);
}

async function setEntitiesConfiguration() {
    await setEntities([
        new Entity(
            'ENTITY1',
            'ENTITY1_NAME',
            '',
            [RolesEnum.CARD_SENDER, RolesEnum.CARD_RECEIVER],
            [],
            ['PARENT_ENTITY']
        ),
        new Entity('ENTITY2', 'ENTITY2_NAME', '', [RolesEnum.CARD_RECEIVER], [], ['PARENT_ENTITY']),
        new Entity('ENTITY3', 'ENTITY3_NAME', '', [RolesEnum.ACTIVITY_AREA], [], []),
        new Entity('PARENT_ENTITY', 'PARENT_ENTITY_NAME', '', [RolesEnum.CARD_RECEIVER], [], null),
        new Entity('NO_ROLES_ENTITY', 'NO_ROLES_ENTITY_NAME', '', null, [], null)
    ]);
}

describe('UserCard RecipientsForm', () => {
    let recipientsForm: RecipientsForm;
    let userCardUIControl: UserCardUIControlMock;
    beforeEach(async () => {
        initOpfabAPI();
        await loadWebUIConf({});
        userCardUIControl = new UserCardUIControlMock();
        recipientsForm = new RecipientsForm(userCardUIControl);
    });
    describe('Recipients multiselect', () => {
        describe('Visibility', () => {
            it(`Should be set to true if recipient visibility set visible in state configuration`, async () => {
                await setProcessConfigWithUserCardConfig({recipientVisible: true});
                recipientsForm.setProcessAndState('process1', 'state1_1');
                expect(recipientsForm.isRecipientVisible()).toEqual(true);
                expect(userCardUIControl.inputVisibility_FctCalls['recipients']).toEqual(true);
            });
            it(`Should be set to false if recipient visibility set invisible in state configuration`, async () => {
                await setProcessConfigWithUserCardConfig({recipientVisible: false});
                recipientsForm.setProcessAndState('process1', 'state1_1');
                expect(recipientsForm.isRecipientVisible()).toEqual(false);
                expect(userCardUIControl.inputVisibility_FctCalls['recipients']).toEqual(false);
            });
            it(`Should be set to true if recipient visibility is not defined in state configuration`, async () => {
                await setProcessConfigWithUserCardConfig({});
                recipientsForm.setProcessAndState('process1', 'state1_1');
                expect(recipientsForm.isRecipientVisible()).toEqual(true);
                expect(userCardUIControl.inputVisibility_FctCalls['recipients']).toEqual(true);
            });
        });
        describe('Option list', () => {
            it(`Should contain all entities with Role CARD_RECEIVER`, async () => {
                await setProcessConfigWithUserCardConfig({});
                await setEntitiesConfiguration();
                recipientsForm.setProcessAndState('process1', 'state1_1');
                expect(userCardUIControl.recipients).toEqual([
                    {id: 'ENTITY1', label: 'ENTITY1_NAME'},
                    {id: 'ENTITY2', label: 'ENTITY2_NAME'},
                    {id: 'PARENT_ENTITY', label: 'PARENT_ENTITY_NAME'}
                ]);
            });
            it('Should use entity description as label if usercard.useDescriptionFieldForEntityList is true in web-ui config', async () => {
                await setEntities([
                    new Entity('ENTITY1', 'ENTITY1_NAME', 'ENTITY1_DESCRIPTION', [RolesEnum.CARD_RECEIVER], [], null),
                    new Entity('ENTITY2', 'ENTITY1_NAME', 'ENTITY2_DESCRIPTION', [RolesEnum.CARD_RECEIVER], [], null),
                    new Entity(
                        'PARENT_ENTITY',
                        'PARENT_ENTITY_NAME',
                        'PARENT_ENTITY_DESCRIPTION',
                        [RolesEnum.CARD_RECEIVER],
                        [],
                        null
                    )
                ]);
                await loadWebUIConf({usercard: {useDescriptionFieldForEntityList: true}});
                await setProcessConfigWithUserCardConfig({});
                recipientsForm = new RecipientsForm(userCardUIControl);
                recipientsForm.setProcessAndState('process1', 'state1_1');
                expect(userCardUIControl.recipients).toEqual([
                    {id: 'ENTITY1', label: 'ENTITY1_DESCRIPTION'},
                    {id: 'ENTITY2', label: 'ENTITY2_DESCRIPTION'},
                    {id: 'PARENT_ENTITY', label: 'PARENT_ENTITY_DESCRIPTION'}
                ]);
            });
            it(`Should contain all entities by label alphabetical order`, async () => {
                await setEntities([
                    new Entity('ENTITY1', 'AAA', '', [RolesEnum.CARD_RECEIVER], [], null),
                    new Entity('ENTITY2', 'aaa', '', [RolesEnum.CARD_RECEIVER], [], null),
                    new Entity('ENTITY3', 'BBB', '', [RolesEnum.CARD_RECEIVER], [], null),
                    new Entity('ENTITY4', 'bbb', '', [RolesEnum.CARD_RECEIVER], [], null),
                    new Entity('ENTITY5', '123', '', [RolesEnum.CARD_RECEIVER], [], null)
                ]);
                await setProcessConfigWithUserCardConfig({});
                recipientsForm.setProcessAndState('process1', 'state1_1');
                expect(userCardUIControl.recipients).toEqual([
                    {id: 'ENTITY5', label: '123'},
                    {id: 'ENTITY1', label: 'AAA'},
                    {id: 'ENTITY3', label: 'BBB'},
                    {id: 'ENTITY2', label: 'aaa'},
                    {id: 'ENTITY4', label: 'bbb'}
                ]);
            });
            it('Should use entity id if entity name is not defined', async () => {
                await setEntities([
                    new Entity('ENTITY1', '', '', [RolesEnum.CARD_RECEIVER], [], null),
                    new Entity('ENTITY2', '', '', [RolesEnum.CARD_RECEIVER], [], null)
                ]);
                await setProcessConfigWithUserCardConfig({});
                recipientsForm.setProcessAndState('process1', 'state1_1');
                expect(userCardUIControl.recipients).toEqual([
                    {id: 'ENTITY1', label: 'ENTITY1'},
                    {id: 'ENTITY2', label: 'ENTITY2'}
                ]);
            });
            it(`Should be initialized from template if template calls method setDropdownEntityRecipientList`, async () => {
                await setProcessConfigWithUserCardConfig({});
                await setEntitiesConfiguration();
                recipientsForm.setProcessAndState('process1', 'state1_1');
                opfab.currentUserCard.setDropdownEntityRecipientList([
                    new EntitiesTree('ENTITY1'),
                    new EntitiesTree('ENTITY2')
                ]);
                expect(userCardUIControl.recipients).toEqual([
                    {id: 'ENTITY1', label: 'ENTITY1_NAME'},
                    {id: 'ENTITY2', label: 'ENTITY2_NAME'}
                ]);
            });
            it(`Should be initialized from template with child entities if template calls method setDropdownEntityRecipientList`, async () => {
                await setProcessConfigWithUserCardConfig({});
                await setEntitiesConfiguration();
                recipientsForm.setProcessAndState('process1', 'state1_1');
                opfab.currentUserCard.setDropdownEntityRecipientList([new EntitiesTree('PARENT_ENTITY', [1])]);
                expect(userCardUIControl.recipients).toEqual([
                    {id: 'ENTITY1', label: 'ENTITY1_NAME'},
                    {id: 'ENTITY2', label: 'ENTITY2_NAME'}
                ]);
            });
        });
        describe('Selected recipients', () => {
            it('Should be empty  by default', async () => {
                await setProcessConfigWithUserCardConfig({});
                await setEntitiesConfiguration();
                recipientsForm.setProcessAndState('process1', 'state1_1');
                expect(userCardUIControl.selectedRecipients).toEqual([]);
            });
            it('Should be recipients of existing card if editing or copying a card', async () => {
                await setProcessConfigWithUserCardConfig({});
                await setEntitiesConfiguration();
                const card = getOneCard({entityRecipients: ['ENTITY1', 'PARENT_ENTITY']});
                recipientsForm.setProcessAndState('process1', 'state1_1', card);
                expect(userCardUIControl.selectedRecipients).toEqual(['ENTITY1', 'PARENT_ENTITY']);
            });
            it('Should be recipients of existing card excluding recipients for information if editing or copying a card', async () => {
                await setProcessConfigWithUserCardConfig({});
                await setEntitiesConfiguration();
                const card = getOneCard({
                    entityRecipients: ['ENTITY1', 'ENTITY2', 'PARENT_ENTITY'],
                    entityRecipientsForInformation: ['ENTITY2']
                });
                recipientsForm.setProcessAndState('process1', 'state1_1', card);
                expect(userCardUIControl.selectedRecipients).toEqual(['ENTITY1', 'PARENT_ENTITY']);
            });
            it(`Should be set by template if template calls method setSelectedRecipients`, async () => {
                await setProcessConfigWithUserCardConfig({});
                await setEntitiesConfiguration();
                recipientsForm.setProcessAndState('process1', 'state1_1');
                opfab.currentUserCard.setSelectedRecipients(['ENTITY1', 'ENTITY2']);
                expect(userCardUIControl.selectedRecipients).toEqual(['ENTITY1', 'ENTITY2']);
                expect(recipientsForm.getSelectedRecipients()).toEqual(['ENTITY1', 'ENTITY2']);
            });
            it(`Should be set by template if template calls method setInitialSelectedRecipients`, async () => {
                await setProcessConfigWithUserCardConfig({});
                await setEntitiesConfiguration();
                recipientsForm.setProcessAndState('process1', 'state1_1');
                opfab.currentUserCard.setInitialSelectedRecipients(['ENTITY1', 'ENTITY2']);
                expect(userCardUIControl.selectedRecipients).toEqual(['ENTITY1', 'ENTITY2']);
                expect(recipientsForm.getSelectedRecipients()).toEqual(['ENTITY1', 'ENTITY2']);
            });
            it(`Should not be set by template if template calls method setInitialSelectedRecipients when in edition or copy mode `, async () => {
                await setProcessConfigWithUserCardConfig({});
                await setEntitiesConfiguration();
                recipientsForm.setProcessAndState('process1', 'state1_1', getOneCard({entityRecipients: ['ENTITY1']}));
                opfab.currentUserCard.setInitialSelectedRecipients(['ENTITY1', 'ENTITY2']);
                expect(userCardUIControl.selectedRecipients).toEqual(['ENTITY1']);
                expect(recipientsForm.getSelectedRecipients()).toEqual(['ENTITY1']);
            });
            it('Should be available in the template via method opfab.currentUserCard.getSelectedEntityRecipients', async () => {
                await setProcessConfigWithUserCardConfig({});
                await setEntitiesConfiguration();
                const card = getOneCard({entityRecipients: ['ENTITY1', 'PARENT_ENTITY']});
                recipientsForm.setProcessAndState('process1', 'state1_1', card);
                expect(recipientsForm.getSelectedRecipients()).toEqual(['ENTITY1', 'PARENT_ENTITY']);
            });
        });
        describe('User select', () => {
            it('Should get recipients selected by user', async () => {
                await setProcessConfigWithUserCardConfig({});
                await setEntitiesConfiguration();
                recipientsForm.setProcessAndState('process1', 'state1_1');
                recipientsForm.setSelectedRecipients(['ENTITY1', 'ENTITY2']);
                expect(recipientsForm.getSelectedRecipients()).toEqual(['ENTITY1', 'ENTITY2']);
            });
            it('Template should be able to get selected recipients via method opfab.currentUserCard.getSelectedEntityRecipients', async () => {
                await setProcessConfigWithUserCardConfig({});
                await setEntitiesConfiguration();
                recipientsForm.setProcessAndState('process1', 'state1_1');
                recipientsForm.setSelectedRecipients(['ENTITY1', 'ENTITY2']);
                expect(opfab.currentUserCard.getSelectedEntityRecipients()).toEqual(['ENTITY1', 'ENTITY2']);
            });
        });
    });
    describe('RecipientsForInformation multiselect', () => {
        describe('Visibility', () => {
            it(`Should be set to true if recipientForInformation visibility set visible in state configuration`, async () => {
                await setProcessConfigWithUserCardConfig({recipientForInformationVisible: true});
                recipientsForm.setProcessAndState('process1', 'state1_1');
                expect(recipientsForm.isRecipientForInformationVisible()).toEqual(true);
                expect(userCardUIControl.inputVisibility_FctCalls['recipientsForInformation']).toEqual(true);
            });
            it(`Should be set to false if recipientForInformation visibility set invisible in state configuration`, async () => {
                await setProcessConfigWithUserCardConfig({recipientForInformationVisible: false});
                recipientsForm.setProcessAndState('process1', 'state1_1');
                expect(recipientsForm.isRecipientForInformationVisible()).toEqual(false);
                expect(userCardUIControl.inputVisibility_FctCalls['recipientsForInformation']).toEqual(false);
            });
            it(`Should be set to false  if recipientForInformation visibility is not defined in state configuration`, async () => {
                await setProcessConfigWithUserCardConfig({});
                recipientsForm.setProcessAndState('process1', 'state1_1');
                expect(recipientsForm.isRecipientForInformationVisible()).toEqual(false);
                expect(userCardUIControl.inputVisibility_FctCalls['recipientsForInformation']).toEqual(false);
            });
        });
        describe('Option list', () => {
            it(`Should contain all entities with Role CARD_RECEIVER`, async () => {
                await setProcessConfigWithUserCardConfig({});
                await setEntitiesConfiguration();
                recipientsForm.setProcessAndState('process1', 'state1_1');
                expect(userCardUIControl.recipientsForInformation).toEqual([
                    {id: 'ENTITY1', label: 'ENTITY1_NAME'},
                    {id: 'ENTITY2', label: 'ENTITY2_NAME'},
                    {id: 'PARENT_ENTITY', label: 'PARENT_ENTITY_NAME'}
                ]);
            });
            it('Should use entity description as label if usercard.useDescriptionFieldForEntityList is true in web-ui config', async () => {
                await setEntities([
                    new Entity('ENTITY1', 'ENTITY1_NAME', 'ENTITY1_DESCRIPTION', [RolesEnum.CARD_RECEIVER], [], null),
                    new Entity('ENTITY2', 'ENTITY1_NAME', 'ENTITY2_DESCRIPTION', [RolesEnum.CARD_RECEIVER], [], null),
                    new Entity(
                        'PARENT_ENTITY',
                        'PARENT_ENTITY_NAME',
                        'PARENT_ENTITY_DESCRIPTION',
                        [RolesEnum.CARD_RECEIVER],
                        [],
                        null
                    )
                ]);
                await loadWebUIConf({usercard: {useDescriptionFieldForEntityList: true}});
                await setProcessConfigWithUserCardConfig({});
                recipientsForm = new RecipientsForm(userCardUIControl);
                recipientsForm.setProcessAndState('process1', 'state1_1');
                expect(userCardUIControl.recipientsForInformation).toEqual([
                    {id: 'ENTITY1', label: 'ENTITY1_DESCRIPTION'},
                    {id: 'ENTITY2', label: 'ENTITY2_DESCRIPTION'},
                    {id: 'PARENT_ENTITY', label: 'PARENT_ENTITY_DESCRIPTION'}
                ]);
            });
            it(`Should contain all entities by label alphabetical order`, async () => {
                await setEntities([
                    new Entity('ENTITY1', 'AAA', '', [RolesEnum.CARD_RECEIVER], [], null),
                    new Entity('ENTITY2', 'aaa', '', [RolesEnum.CARD_RECEIVER], [], null),
                    new Entity('ENTITY3', 'BBB', '', [RolesEnum.CARD_RECEIVER], [], null),
                    new Entity('ENTITY4', 'bbb', '', [RolesEnum.CARD_RECEIVER], [], null),
                    new Entity('ENTITY5', '123', '', [RolesEnum.CARD_RECEIVER], [], null)
                ]);
                await setProcessConfigWithUserCardConfig({});
                recipientsForm.setProcessAndState('process1', 'state1_1');
                expect(userCardUIControl.recipientsForInformation).toEqual([
                    {id: 'ENTITY5', label: '123'},
                    {id: 'ENTITY1', label: 'AAA'},
                    {id: 'ENTITY3', label: 'BBB'},
                    {id: 'ENTITY2', label: 'aaa'},
                    {id: 'ENTITY4', label: 'bbb'}
                ]);
            });
            it(`Should be initialized from template if template calls method setDropdownEntityRecipientForInformationList`, async () => {
                await setProcessConfigWithUserCardConfig({});
                await setEntitiesConfiguration();
                recipientsForm.setProcessAndState('process1', 'state1_1');
                opfab.currentUserCard.setDropdownEntityRecipientForInformationList([
                    new EntitiesTree('ENTITY1'),
                    new EntitiesTree('ENTITY2')
                ]);
                expect(userCardUIControl.recipientsForInformation).toEqual([
                    {id: 'ENTITY1', label: 'ENTITY1_NAME'},
                    {id: 'ENTITY2', label: 'ENTITY2_NAME'}
                ]);
            });
            it(`Should be initialized from template with child entities if template calls method setDropdownEntityRecipientForInformationList`, async () => {
                await setProcessConfigWithUserCardConfig({});
                await setEntitiesConfiguration();
                recipientsForm.setProcessAndState('process1', 'state1_1');
                opfab.currentUserCard.setDropdownEntityRecipientForInformationList([
                    new EntitiesTree('PARENT_ENTITY', [1])
                ]);
                expect(userCardUIControl.recipientsForInformation).toEqual([
                    {id: 'ENTITY1', label: 'ENTITY1_NAME'},
                    {id: 'ENTITY2', label: 'ENTITY2_NAME'}
                ]);
            });
        });
        describe('Selected recipients for information', () => {
            it('Should be empty by default', async () => {
                await setProcessConfigWithUserCardConfig({});
                await setEntitiesConfiguration();
                recipientsForm.setProcessAndState('process1', 'state1_1');
                expect(userCardUIControl.selectedRecipientsForInformation).toEqual([]);
            });
            it('Should be recipientsForInformation of existing card if editing or copying a card', async () => {
                await setProcessConfigWithUserCardConfig({});
                await setEntitiesConfiguration();
                const card = getOneCard({entityRecipientsForInformation: ['ENTITY1', 'PARENT_ENTITY']});
                recipientsForm.setProcessAndState('process1', 'state1_1', card);
                expect(userCardUIControl.selectedRecipientsForInformation).toEqual(['ENTITY1', 'PARENT_ENTITY']);
            });
            it(`Should be set by template if template calls method setSelectedRecipientsForInformation`, async () => {
                await setProcessConfigWithUserCardConfig({});
                await setEntitiesConfiguration();
                recipientsForm.setProcessAndState('process1', 'state1_1');
                opfab.currentUserCard.setSelectedRecipientsForInformation(['ENTITY1', 'ENTITY2']);
                expect(userCardUIControl.selectedRecipientsForInformation).toEqual(['ENTITY1', 'ENTITY2']);
                expect(recipientsForm.getSelectedRecipientsForInformation()).toEqual(['ENTITY1', 'ENTITY2']);
            });
            it(`Should be set by template if template calls method setInitialSelectedRecipientsForInformation`, async () => {
                await setProcessConfigWithUserCardConfig({});
                await setEntitiesConfiguration();
                recipientsForm.setProcessAndState('process1', 'state1_1');
                opfab.currentUserCard.setInitialSelectedRecipientsForInformation(['ENTITY1', 'ENTITY2']);
                expect(userCardUIControl.selectedRecipientsForInformation).toEqual(['ENTITY1', 'ENTITY2']);
                expect(recipientsForm.getSelectedRecipientsForInformation()).toEqual(['ENTITY1', 'ENTITY2']);
            });
            it(`Should not be set by template if template calls method setInitialSelectedRecipientsForInformation when in edition or copy mode `, async () => {
                await setProcessConfigWithUserCardConfig({});
                await setEntitiesConfiguration();
                recipientsForm.setProcessAndState(
                    'process1',
                    'state1_1',
                    getOneCard({entityRecipientsForInformation: ['ENTITY1']})
                );
                opfab.currentUserCard.setInitialSelectedRecipientsForInformation(['ENTITY1', 'ENTITY2']);
                expect(userCardUIControl.selectedRecipientsForInformation).toEqual(['ENTITY1']);
            });
            it('Should be available in the template via method opfab.currentUserCard.getSelectedEntityRecipientsForInformation', async () => {
                await setProcessConfigWithUserCardConfig({});
                await setEntitiesConfiguration();
                const card = getOneCard({entityRecipientsForInformation: ['ENTITY1', 'PARENT_ENTITY']});
                recipientsForm.setProcessAndState('process1', 'state1_1', card);
                expect(recipientsForm.getSelectedRecipientsForInformation()).toEqual(['ENTITY1', 'PARENT_ENTITY']);
            });
        });
        describe('User select', () => {
            it('Should get recipients selected by user', async () => {
                await setProcessConfigWithUserCardConfig({});
                await setEntitiesConfiguration();
                recipientsForm.setProcessAndState('process1', 'state1_1');
                recipientsForm.setSelectedRecipients(['ENTITY1', 'ENTITY2']);
                expect(recipientsForm.getSelectedRecipients()).toEqual(['ENTITY1', 'ENTITY2']);
            });
            it('Template should be able to get selected recipients via method opfab.currentUserCard.getSelectedEntityRecipients', async () => {
                await setProcessConfigWithUserCardConfig({});
                await setEntitiesConfiguration();
                recipientsForm.setProcessAndState('process1', 'state1_1');
                recipientsForm.setSelectedRecipients(['ENTITY1', 'ENTITY2']);
                expect(opfab.currentUserCard.getSelectedEntityRecipients()).toEqual(['ENTITY1', 'ENTITY2']);
            });
        });
    });
});
