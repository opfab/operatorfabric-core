/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {UserServerMock} from '@tests/mocks/userServer.mock';
import {CardBodyView} from './card-body.view';
import {User} from '@ofModel/user.model';
import {UserService} from 'app/business/services/users/user.service';
import {ServerResponse, ServerResponseStatus} from 'app/business/server/serverResponse';
import {UserWithPerimeters} from '@ofModel/userWithPerimeters.model';
import {firstValueFrom} from 'rxjs';
import {getOneCard} from '@tests/helpers';
import {RightsEnum} from '@ofModel/perimeter.model';
import {ProcessServerMock} from '@tests/mocks/processServer.mock';
import {ProcessesService} from 'app/business/services/businessconfig/processes.service';
import {Process, ShowAcknowledgmentFooterEnum, State} from '@ofModel/processes.model';
import {Card} from '@ofModel/card.model';
import {ConfigService} from 'app/services/config/ConfigService';
import {ConfigServerMock} from '@tests/mocks/configServer.mock';

describe('CardBodyView', () => {
    let userServerMock: UserServerMock;
    let configServerMock: ConfigServerMock;
    let user: User;
    let card: Card;
    let cardBodyView: CardBodyView;

    beforeEach(() => {
        mockUserService();
        mockProcessesService();

        ConfigService.reset();
        configServerMock = new ConfigServerMock();
        ConfigService.setConfigServer(configServerMock);
    });

    function mockUserService() {
        userServerMock = new UserServerMock();
        UserService.setUserServer(userServerMock);
    }

    function mockProcessesService() {
        const processServerMock = new ProcessServerMock();
        processServerMock.setResponseForProcessesDefinition(
            new ServerResponse(getTestProcesses(), ServerResponseStatus.OK, '')
        );
        processServerMock.setResponseForProcessesWithAllVersions(
            new ServerResponse(getTestProcesses(), ServerResponseStatus.OK, '')
        );
        ProcessesService.setProcessServer(processServerMock);
        ProcessesService.loadAllProcessesWithLatestVersion().subscribe();
        ProcessesService.loadAllProcessesWithAllVersions().subscribe();
    }

    function getTestProcesses(): Process[] {
        const state1 = new State();

        const state2 = new State();
        state2.showAcknowledgmentFooter = ShowAcknowledgmentFooterEnum.NEVER;

        const state3 = new State();
        state3.showAcknowledgmentFooter = ShowAcknowledgmentFooterEnum.ONLY_FOR_USERS_ALLOWED_TO_EDIT;

        const state4 = new State();
        state4.showAcknowledgmentFooter = ShowAcknowledgmentFooterEnum.FOR_ALL_USERS;

        const statesList = new Map();
        statesList.set('state1', state1);
        statesList.set('state2', state2);
        statesList.set('state3', state3);
        statesList.set('state4', state4);

        const testProcess = new Process('testProcess', '1', null, null, statesList);
        return [testProcess];
    }

    function getUserMemberOfEntity1WithPerimeter(user: User): UserWithPerimeters {
        return new UserWithPerimeters(user, [
            {
                process: 'testProcess',
                state: 'state1',
                rights: RightsEnum.ReceiveAndWrite
            },
            {
                process: 'testProcess',
                state: 'state2',
                rights: RightsEnum.ReceiveAndWrite
            },
            {
                process: 'testProcess',
                state: 'state3',
                rights: RightsEnum.ReceiveAndWrite
            },
            {
                process: 'testProcess',
                state: 'state4',
                rights: RightsEnum.ReceiveAndWrite
            }
        ]);
    }

    function getUserWithPerimeters(userEntities: string[]) {
        user = new User('currentUser', 'firstname', 'lastname', null, [], userEntities);
        userServerMock.setResponseForUser(new ServerResponse(user, ServerResponseStatus.OK, null));
        const userForPerimeter = new User('currentUser', 'firstname', 'lastname', null, [], userEntities);
        return getUserMemberOfEntity1WithPerimeter(userForPerimeter);
    }

    it('GIVEN a card WHEN publisher is not an entity THEN acknowledgement footer is not shown', async () => {
        const userWithPerimeters = getUserWithPerimeters(['ENTITY1']);
        card = getOneCard({
            publisher: 'publisher_test',
            process: 'testProcess',
            processVersion: '1',
            state: 'state1',
            entityRecipients: ['ENTITY1', 'ENTITY2', 'ENTITY_FR']
        });
        cardBodyView = new CardBodyView(card, userWithPerimeters);

        expect(cardBodyView.isCardAcknowledgedFooterVisible()).toBeFalse();
    });

    it('GIVEN a card WHEN publisher is not an entity AND settings.showAcknowledgmentFooter is true THEN acknowledgement footer is shown', async () => {
        const userWithPerimeters = getUserWithPerimeters(['ENTITY1']);

        configServerMock.setResponseForWebUIConfiguration(new ServerResponse({}, ServerResponseStatus.OK, null));
        await firstValueFrom(ConfigService.loadWebUIConfiguration());
        ConfigService.setConfigValue('settings.showAcknowledgmentFooter', true);
        card = getOneCard({
            publisher: 'publisher_test',
            process: 'testProcess',
            processVersion: '1',
            state: 'state1',
            entityRecipients: ['ENTITY1', 'ENTITY2', 'ENTITY_FR']
        });
        cardBodyView = new CardBodyView(card, userWithPerimeters);

        expect(cardBodyView.isCardAcknowledgedFooterVisible()).toBeTrue();
    });

    it('GIVEN a card WHEN publisher is an entity AND user is part of publisher entity THEN acknowledgement footer is shown', async () => {
        const userWithPerimeters = getUserWithPerimeters(['ENTITY1']);
        card = getOneCard({
            publisher: 'ENTITY1',
            publisherType: 'ENTITY',
            process: 'testProcess',
            processVersion: '1',
            state: 'state1',
            entityRecipients: ['ENTITY1', 'ENTITY2', 'ENTITY_FR']
        });
        cardBodyView = new CardBodyView(card, userWithPerimeters);

        expect(cardBodyView.isCardAcknowledgedFooterVisible()).toBeTrue();
    });

    it('GIVEN a card WHEN publisher is an entity AND user is not part of publisher entity THEN acknowledgement footer is not shown', async () => {
        const userWithPerimeters = getUserWithPerimeters(['ENTITY2']);
        card = getOneCard({
            publisher: 'ENTITY1',
            publisherType: 'ENTITY',
            process: 'testProcess',
            processVersion: '1',
            state: 'state1',
            entityRecipients: ['ENTITY1', 'ENTITY2', 'ENTITY_FR']
        });
        cardBodyView = new CardBodyView(card, userWithPerimeters);

        expect(cardBodyView.isCardAcknowledgedFooterVisible()).toBeFalse();
    });

    it('GIVEN a card WHEN publisher is an entity AND user is not part of publisher entity AND settings.showAcknowledgmentFooter is true THEN acknowledgement footer is shown', async () => {
        const userWithPerimeters = getUserWithPerimeters(['ENTITY2']);

        configServerMock.setResponseForWebUIConfiguration(new ServerResponse({}, ServerResponseStatus.OK, null));
        await firstValueFrom(ConfigService.loadWebUIConfiguration());
        ConfigService.setConfigValue('settings.showAcknowledgmentFooter', true);
        card = getOneCard({
            publisher: 'ENTITY1',
            publisherType: 'ENTITY',
            process: 'testProcess',
            processVersion: '1',
            state: 'state1',
            entityRecipients: ['ENTITY1', 'ENTITY2', 'ENTITY_FR']
        });
        cardBodyView = new CardBodyView(card, userWithPerimeters);

        expect(cardBodyView.isCardAcknowledgedFooterVisible()).toBeTrue();
    });

    it('GIVEN a card published by an entity WHEN process.state.showAcknowledgementFooter == NEVER AND  settings.showAcknowledgmentFooter is true THEN acknowledgement footer is not shown', async () => {
        const userWithPerimeters = getUserWithPerimeters(['ENTITY1']);

        configServerMock.setResponseForWebUIConfiguration(new ServerResponse({}, ServerResponseStatus.OK, null));
        await firstValueFrom(ConfigService.loadWebUIConfiguration());

        ConfigService.setConfigValue('settings.showAcknowledgmentFooter', true);
        card = getOneCard({
            publisher: 'ENTITY1',
            publisherType: 'ENTITY',
            process: 'testProcess',
            processVersion: '1',
            state: 'state2',
            entityRecipients: ['ENTITY1', 'ENTITY2', 'ENTITY_FR']
        });
        cardBodyView = new CardBodyView(card, userWithPerimeters);

        expect(cardBodyView.isCardAcknowledgedFooterVisible()).toBeFalse();
    });

    it('GIVEN a card published by another entity WHEN process.state.showAcknowledgementFooter == ONLY_FOR_USERS_ALLOWED_TO_EDIT AND user part of entities allowed to edit THEN acknowledgement footer is shown', async () => {
        const userWithPerimeters = getUserWithPerimeters(['ENTITY2']);

        configServerMock.setResponseForWebUIConfiguration(new ServerResponse({}, ServerResponseStatus.OK, null));
        await firstValueFrom(ConfigService.loadWebUIConfiguration());

        ConfigService.setConfigValue('settings.showAcknowledgmentFooter', false);
        card = getOneCard({
            publisher: 'ENTITY1',
            publisherType: 'ENTITY',
            process: 'testProcess',
            processVersion: '1',
            state: 'state3',
            entityRecipients: ['ENTITY1', 'ENTITY2', 'ENTITY_FR'],
            entitiesAllowedToEdit: ['ENTITY2']
        });
        cardBodyView = new CardBodyView(card, userWithPerimeters);

        expect(cardBodyView.isCardAcknowledgedFooterVisible()).toBeTrue();
    });

    it('GIVEN a card published by another entity WHEN process.state.showAcknowledgementFooter == ONLY_FOR_USERS_ALLOWED_TO_EDIT AND settings.showAcknowledgmentFooter is false THEN acknowledgement footer is not shown', async () => {
        const userWithPerimeters = getUserWithPerimeters(['ENTITY2']);

        configServerMock.setResponseForWebUIConfiguration(new ServerResponse({}, ServerResponseStatus.OK, null));
        await firstValueFrom(ConfigService.loadWebUIConfiguration());

        ConfigService.setConfigValue('settings.showAcknowledgmentFooter', false);
        card = getOneCard({
            publisher: 'ENTITY1',
            publisherType: 'ENTITY',
            process: 'testProcess',
            processVersion: '1',
            state: 'state3',
            entityRecipients: ['ENTITY1', 'ENTITY2', 'ENTITY_FR']
        });
        cardBodyView = new CardBodyView(card, userWithPerimeters);

        expect(cardBodyView.isCardAcknowledgedFooterVisible()).toBeFalse();
    });

    it('GIVEN a card published by another entity WHEN process.state.showAcknowledgementFooter = ONLY_FOR_USERS_ALLOWED_TO_EDIT and settings.showAcknowledgmentFooter is true THEN acknowledgement footer is shown', async () => {
        const userWithPerimeters = getUserWithPerimeters(['ENTITY2']);

        configServerMock.setResponseForWebUIConfiguration(new ServerResponse({}, ServerResponseStatus.OK, null));
        await firstValueFrom(ConfigService.loadWebUIConfiguration());

        ConfigService.setConfigValue('settings.showAcknowledgmentFooter', true);
        card = getOneCard({
            publisher: 'ENTITY1',
            publisherType: 'ENTITY',
            process: 'testProcess',
            processVersion: '1',
            state: 'state3',
            entityRecipients: ['ENTITY1', 'ENTITY2', 'ENTITY_FR']
        });
        cardBodyView = new CardBodyView(card, userWithPerimeters);

        expect(cardBodyView.isCardAcknowledgedFooterVisible()).toBeTrue();
    });

    it('GIVEN a card publishe by another entity WHEN process.state.showAcknowledgementFooter == FOR_ALL_USERS AND settings.showAcknowledgmentFooter is false THEN acknowledgement footer is shown', async () => {
        const userWithPerimeters = getUserWithPerimeters(['ENTITY2']);

        configServerMock.setResponseForWebUIConfiguration(new ServerResponse({}, ServerResponseStatus.OK, null));
        await firstValueFrom(ConfigService.loadWebUIConfiguration());

        ConfigService.setConfigValue('settings.showAcknowledgmentFooter', false);
        card = getOneCard({
            publisher: 'ENTITY1',
            publisherType: 'ENTITY',
            process: 'testProcess',
            processVersion: '1',
            state: 'state4',
            entityRecipients: ['ENTITY1', 'ENTITY2', 'ENTITY_FR']
        });
        cardBodyView = new CardBodyView(card, userWithPerimeters);

        expect(cardBodyView.isCardAcknowledgedFooterVisible()).toBeTrue();
    });

    it('GIVEN a card published by another entity WHEN process.state.showAcknowledgementFooter == FOR_ALL_USERS and settings.showAcknowledgmentFooter is true THEN acknowledgement footer is shown', async () => {
        const userWithPerimeters = getUserWithPerimeters(['ENTITY2']);

        configServerMock.setResponseForWebUIConfiguration(new ServerResponse({}, ServerResponseStatus.OK, null));
        await firstValueFrom(ConfigService.loadWebUIConfiguration());

        ConfigService.setConfigValue('settings.showAcknowledgmentFooter', true);
        card = getOneCard({
            publisher: 'ENTITY1',
            publisherType: 'ENTITY',
            process: 'testProcess',
            processVersion: '1',
            state: 'state4',
            entityRecipients: ['ENTITY1', 'ENTITY2', 'ENTITY_FR']
        });
        cardBodyView = new CardBodyView(card, userWithPerimeters);

        expect(cardBodyView.isCardAcknowledgedFooterVisible()).toBeTrue();
    });

    it('GIVEN a card THEN next card to open after aknowledgment is the following card in the feed', async () => {
        const userWithPerimeters = getUserWithPerimeters(['ENTITY2']);

        const card1 = getOneCard({
            id: 'card1',
            publisher: 'ENTITY1',
            publisherType: 'ENTITY',
            process: 'testProcess',
            processVersion: '1',
            state: 'state4',
            entityRecipients: ['ENTITY1', 'ENTITY2', 'ENTITY_FR']
        });

        const card2 = getOneCard({
            id: 'card2',
            publisher: 'ENTITY1',
            publisherType: 'ENTITY',
            process: 'testProcess',
            processVersion: '1',
            state: 'state4',
            entityRecipients: ['ENTITY1', 'ENTITY2', 'ENTITY_FR']
        });

        const card3 = getOneCard({
            id: 'card3',
            publisher: 'ENTITY1',
            publisherType: 'ENTITY',
            process: 'testProcess',
            processVersion: '1',
            state: 'state4',
            entityRecipients: ['ENTITY1', 'ENTITY2', 'ENTITY_FR']
        });

        cardBodyView = new CardBodyView(card2, userWithPerimeters);
        cardBodyView.setCards([card1, card2, card3]);

        expect(cardBodyView.getNextCardIdToOpenAfterAck()).toEqual('card3');
    });

    it('GIVEN a card WHEN it is the last card in the feed THEN next card to open after aknowledgment is the previous card in the feed', async () => {
        const userWithPerimeters = getUserWithPerimeters(['ENTITY2']);

        const card1 = getOneCard({
            id: 'card1',
            publisher: 'ENTITY1',
            publisherType: 'ENTITY',
            process: 'testProcess',
            processVersion: '1',
            state: 'state4',
            entityRecipients: ['ENTITY1', 'ENTITY2', 'ENTITY_FR']
        });

        const card2 = getOneCard({
            id: 'card2',
            publisher: 'ENTITY1',
            publisherType: 'ENTITY',
            process: 'testProcess',
            processVersion: '1',
            state: 'state4',
            entityRecipients: ['ENTITY1', 'ENTITY2', 'ENTITY_FR']
        });

        const card3 = getOneCard({
            id: 'card3',
            publisher: 'ENTITY1',
            publisherType: 'ENTITY',
            process: 'testProcess',
            processVersion: '1',
            state: 'state4',
            entityRecipients: ['ENTITY1', 'ENTITY2', 'ENTITY_FR']
        });

        cardBodyView = new CardBodyView(card3, userWithPerimeters);
        cardBodyView.setCards([card1, card2, card3]);

        expect(cardBodyView.getNextCardIdToOpenAfterAck()).toEqual('card2');
    });

    it('GIVEN a card WHEN it is the only card in the feed THEN getNextCardIdToOpenAfterAck() returns undefined', async () => {
        const userWithPerimeters = getUserWithPerimeters(['ENTITY2']);

        const card1 = getOneCard({
            id: 'card1',
            publisher: 'ENTITY1',
            publisherType: 'ENTITY',
            process: 'testProcess',
            processVersion: '1',
            state: 'state4',
            entityRecipients: ['ENTITY1', 'ENTITY2', 'ENTITY_FR']
        });

        cardBodyView = new CardBodyView(card1, userWithPerimeters);
        cardBodyView.setCards([card1]);

        expect(cardBodyView.getNextCardIdToOpenAfterAck()).toBeUndefined();
    });

    it('GIVEN a card WHEN there are no cards in the feed THEN getNextCardIdToOpenAfterAck() returns undefined', async () => {
        const userWithPerimeters = getUserWithPerimeters(['ENTITY2']);

        const card1 = getOneCard({
            id: 'card1',
            publisher: 'ENTITY1',
            publisherType: 'ENTITY',
            process: 'testProcess',
            processVersion: '1',
            state: 'state4',
            entityRecipients: ['ENTITY1', 'ENTITY2', 'ENTITY_FR']
        });

        cardBodyView = new CardBodyView(card1, userWithPerimeters);
        cardBodyView.setCards([]);

        expect(cardBodyView.getNextCardIdToOpenAfterAck()).toBeUndefined();
    });
});
