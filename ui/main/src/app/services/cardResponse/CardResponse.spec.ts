import {Card} from '@ofServices/cards/model/Card';
/* Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Entity} from '@ofServices/entities/model/Entity';
import {RoleEnum} from '@ofServices/entities/model/RoleEnum';
import {RightEnum} from '@ofServices/perimeters/model/Perimeter';
import {Process, State} from '@ofServices/processes/model/Processes';
import {User} from '@ofServices/users/model/User';
import {UserWithPerimeters} from '@ofServices/users/model/UserWithPerimeters';
import {getOneCard, setEntities, setProcessConfiguration, setUserPerimeter} from '@tests/helpers';
import {ServerResponse, ServerResponseStatus} from 'app/business/server/serverResponse';
import {CardResponseService} from './CardResponseService';
import {CardsService} from '@ofServices/cards/CardsService';
import {CardsServerMock} from '@tests/mocks/CardsServer.mock';
import {CardTemplateGateway} from '@ofServices/templateGateway/CardTemplateGateway';
import {NotificationDecision} from '@ofServices/notifications/NotificationDecision';
import {CardAction} from '@ofModel/light-card.model';

describe('Card response service', () => {
    let card: Card;
    let cardServerMock: CardsServerMock;

    beforeEach(() => {
        initEnitiesService();
        initProcessService();
        initUser();
        CardTemplateGateway.init();
        CardTemplateGateway.initTemplateFunctions();
        NotificationDecision.init();

        card = getOneCard({
            process: 'testProcess',
            publisherType: 'ENTITY',
            processVersion: '1',
            state: 'state1',
            entitiesAllowedToRespond: ['ENTITY2', 'ENTITY1'],
            startDate: 1,
            endDate: 2,
            expirationDate: 3,
            userRecipients: ['user1', 'user2'],
            groupRecipients: ['group1']
        });

        cardServerMock = new CardsServerMock();
        cardServerMock.setResponseFunctionForPostCard(() => new ServerResponse(undefined, ServerResponseStatus.OK, ''));
        CardsService.setCardsServer(cardServerMock);
    });

    function initEnitiesService() {
        setEntities([
            new Entity('ENTITY1', 'ENTITY 1', '', [RoleEnum.CARD_SENDER], null, null),
            new Entity('ENTITY2', 'ENTITY 2', '', [RoleEnum.CARD_SENDER], null, null),
            new Entity('ENTITY3', 'ENTITY 3', '', [RoleEnum.CARD_SENDER], null, null)
        ]);
    }

    function initProcessService() {
        const state1 = new State();
        state1.response = {state: 'state2', externalRecipients: ['externalRecipient']};
        const state2 = new State();

        const statesList = new Map();
        statesList.set('state1', state1);
        statesList.set('state2', state2);

        const testProcess = new Process('testProcess', '1', null, null, statesList);
        setProcessConfiguration([testProcess]);
    }

    function initUser() {
        setUserPerimeter(
            new UserWithPerimeters(
                new User('user1', 'firstName', 'lastName', null, ['group1'], ['ENTITY2', 'ENTITY1']),
                [
                    {
                        process: 'testProcess',
                        state: 'state1',
                        rights: RightEnum.ReceiveAndWrite,
                        filteringNotificationAllowed: true
                    },
                    {
                        process: 'testProcess',
                        state: 'state2',
                        rights: RightEnum.ReceiveAndWrite,
                        filteringNotificationAllowed: true
                    }
                ]
            )
        );
    }

    it('Should not send card if user is not allowed to respond', async () => {
        let exceptionThrow = false;
        try {
            await CardResponseService.sendResponse(card, {publisher: 'ENTITY3'});
        } catch (e) {
            exceptionThrow = true;
        }
        expect(exceptionThrow).toBeTrue();
    });

    it('Should send card if user is allowed to respond', async () => {
        let exceptionThrow = false;
        try {
            await CardResponseService.sendResponse(card, {publisher: 'ENTITY1'});
        } catch (e) {
            exceptionThrow = true;
        }
        expect(exceptionThrow).toBeFalse();
    });

    it('Should add publisher to entity recipients if not already present', async () => {
        await CardResponseService.sendResponse(card, {publisher: 'ENTITY1'});
        expect(cardServerMock.cardsPosted[0].entityRecipients).toContain('ENTITY1');
    });

    it("Should set publihser to first entity user allowed to respond if publisher isn't provided", async () => {
        await CardResponseService.sendResponse(card, {});
        expect(cardServerMock.cardsPosted[0].publisher).toBe('ENTITY1');
    });

    it('Should avoid sound notification for current user as the user is the publisher', async () => {
        await CardResponseService.sendResponse(card, {publisher: 'ENTITY1'});
        const cardRef = card.process + '.' + card.processInstanceId + '_ENTITY1';
        expect(NotificationDecision.hasSentCard(cardRef)).toBeTrue();
    });

    it('Should set response card severity to INFORMATION', async () => {
        await CardResponseService.sendResponse(card, {publisher: 'ENTITY1'});
        expect(cardServerMock.cardsPosted[0].severity).toBe('INFORMATION');
    });

    it('Should set response card state to responseData.responseState if provided', async () => {
        await CardResponseService.sendResponse(card, {publisher: 'ENTITY1', responseState: 'state3'});
        expect(cardServerMock.cardsPosted[0].state).toBe('state3');
    });

    it('Should set response card state to response.state define in state definition if responseData.responseState is not provided', async () => {
        await CardResponseService.sendResponse(card, {publisher: 'ENTITY1'});
        expect(cardServerMock.cardsPosted[0].state).toBe('state2');
    });
    it('Should set reponse card date to parent card dates', async () => {
        await CardResponseService.sendResponse(card, {publisher: 'ENTITY1'});
        expect(cardServerMock.cardsPosted[0].startDate).toBe(card.startDate);
        expect(cardServerMock.cardsPosted[0].endDate).toBe(card.endDate);
        expect(cardServerMock.cardsPosted[0].expirationDate).toBe(card.expirationDate);
    });
    it('Should set response card process to parent card process', async () => {
        await CardResponseService.sendResponse(card, {publisher: 'ENTITY1'});
        expect(cardServerMock.cardsPosted[0].process).toBe(card.process);
        expect(cardServerMock.cardsPosted[0].processVersion).toBe(card.processVersion);
    });
    it('Should set response card title and summary to parent card title and summary', async () => {
        await CardResponseService.sendResponse(card, {publisher: 'ENTITY1'});
        expect(cardServerMock.cardsPosted[0].title).toBe(card.title);
        expect(cardServerMock.cardsPosted[0].summary).toBe(card.summary);
    });
    it('Should set response card publisherType to ENTITY', async () => {
        await CardResponseService.sendResponse(card, {publisher: 'ENTITY1'});
        expect(cardServerMock.cardsPosted[0].publisherType).toBe('ENTITY');
    });
    it('Should set externalRecipients to externalRecipients define in processState', async () => {
        await CardResponseService.sendResponse(card, {publisher: 'ENTITY1'});
        expect(cardServerMock.cardsPosted[0].externalRecipients).toEqual(['externalRecipient']);
    });
    it('Should set user and group recipients to parent card user and group recipients', async () => {
        await CardResponseService.sendResponse(card, {publisher: 'ENTITY1'});
        expect(cardServerMock.cardsPosted[0].userRecipients).toEqual(card.userRecipients);
        expect(cardServerMock.cardsPosted[0].groupRecipients).toEqual(card.groupRecipients);
    });
    it('Should set data and actions from responseData', async () => {
        await CardResponseService.sendResponse(card, {
            publisher: 'ENTITY1',
            responseCardData: {test: 'data'},
            actions: [CardAction.PROPAGATE_READ_ACK_TO_PARENT_CARD]
        });
        expect(cardServerMock.cardsPosted[0].data).toEqual({test: 'data'});
        expect(cardServerMock.cardsPosted[0].actions).toEqual([CardAction.PROPAGATE_READ_ACK_TO_PARENT_CARD]);
    });
});
