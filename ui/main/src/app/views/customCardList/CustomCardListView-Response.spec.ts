/* Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {CustomScreenDefinition} from '@ofServices/customScreen/model/CustomScreenDefinition';
import {CustomCardListView} from './CustomCardListView';
import {CustomScreenService} from '@ofServices/customScreen/CustomScreenService';
import {OpfabEventStreamServerMock} from '@tests/mocks/opfab-event-stream.server.mock';
import {OpfabEventStreamService} from '@ofServices/events/OpfabEventStreamService';
import {OpfabStore} from '@ofStore/opfabStore';
import {RealTimeDomainService} from '@ofServices/realTimeDomain/RealTimeDomainService';
import {TranslationService} from '@ofServices/translation/TranslationService';
import {TranslationLibMock} from '@tests/mocks/TranslationLib.mock';
import {ConfigService} from '@ofServices/config/ConfigService';
import {DateTimeFormatterService} from '@ofServices/dateTimeFormatter/DateTimeFormatterService';
import {ConfigServerMock} from '@tests/mocks/configServer.mock';
import {FilteredLightCardsStore} from '@ofStore/lightcards/lightcards-feed-filter-store';
import {getOneLightCard, setEntities, setProcessConfiguration, setUserPerimeter} from '@tests/helpers';
import {RoleEnum} from '@ofServices/entities/model/RoleEnum';
import {RightEnum} from '@ofServices/perimeters/model/Perimeter';
import {ComputedPerimeter} from '@ofServices/users/model/UserWithPerimeters';
import {Process, State} from '@ofServices/processes/model/Processes';
import {ServerResponse, ServerResponseStatus} from 'app/server/ServerResponse';
import {CardsServerMock} from '@tests/mocks/CardsServer.mock';
import {CardsService} from '@ofServices/cards/CardsService';
import {NotificationDecision} from '@ofServices/notifications/NotificationDecision';
import {firstValueFrom} from 'rxjs';
import {CardTemplateGateway} from '@ofServices/templateGateway/CardTemplateGateway';

describe('CustomScreenView - Responses', () => {
    let opfabEventStreamServerMock: OpfabEventStreamServerMock;
    let filteredLightCardStore: FilteredLightCardsStore;

    beforeAll(() => {
        TranslationService.setTranslationLib(new TranslationLibMock());
        ConfigService.setConfigServer(new ConfigServerMock());
        DateTimeFormatterService.init();
        NotificationDecision.init();
        CardTemplateGateway.init();
        CardTemplateGateway.initTemplateFunctions();
    });

    beforeEach(() => {
        CustomScreenService.clearCustomScreenDefinitions();
        opfabEventStreamServerMock = new OpfabEventStreamServerMock();
        OpfabEventStreamService.setEventStreamServer(opfabEventStreamServerMock);
        OpfabStore.reset();
        RealTimeDomainService.init();
        RealTimeDomainService.setStartAndEndPeriod(0, new Date().valueOf() + 1000);
        filteredLightCardStore = OpfabStore.getFilteredLightCardStore();
    });
    const customScreenDefinition = {
        id: 'testId',
        name: 'name',
        cardProcessIds: [],
        headerFilters: [],
        results: {
            columns: []
        },
        responseButtons: [
            {
                id: 'button1',
                label: 'label1',
                getUserResponses: (cards) => {
                    const responseCards = [];
                    cards.forEach((card) => {
                        responseCards.push({responseCardData: card.id});
                    });
                    return {valid: true, errorMsg: '', responseCards: responseCards};
                }
            },
            {
                id: 'button2',
                label: 'label2',
                getUserResponses: (cards) => {
                    return {valid: true, errorMsg: '', responseCards: {}};
                }
            }
        ]
    };

    it('should get button list', () => {
        CustomScreenService.addCustomScreenDefinition(customScreenDefinition);
        const view = new CustomCardListView('testId');

        const result = view.getResponseButtons();
        expect(result).toEqual([
            {
                id: 'button1',
                label: 'label1'
            },
            {
                id: 'button2',
                label: 'label2'
            }
        ]);
    });
    it('should get empty button list if no button list defined', () => {
        const noButtonsCustomScreenDefinition = new CustomScreenDefinition();
        noButtonsCustomScreenDefinition.id = 'testId';
        noButtonsCustomScreenDefinition.name = 'testName';

        CustomScreenService.addCustomScreenDefinition(noButtonsCustomScreenDefinition);
        const view = new CustomCardListView('testId');

        const result = view.getResponseButtons();
        expect(result).toEqual([]);
    });

    it('response possible should be true if user is allowed to respond ', async () => {
        CustomScreenService.addCustomScreenDefinition(customScreenDefinition);
        const view = new CustomCardListView('testId');

        const myState = new State();
        myState.response = {state: 'myState'};

        const statesList = new Map();
        statesList.set('myState', myState);

        const process = [new Process('myProcess', '1', 'my process label', null, statesList)];
        setProcessConfiguration(process);

        setEntities([
            {
                id: 'entity1',
                name: 'entity1 name',
                roles: [RoleEnum.CARD_SENDER]
            }
        ]);

        await setUserPerimeter({
            computedPerimeters: [new ComputedPerimeter('myProcess', 'myState', RightEnum.ReceiveAndWrite)],
            userData: {
                login: 'test',
                firstName: 'firstName',
                lastName: 'lastName',
                entities: ['entity1']
            }
        });

        const card = getOneLightCard({
            publisher: 'entity0',
            publisherType: 'ENTITY',
            process: 'myProcess',
            state: 'myState',
            entitiesAllowedToRespond: ['entity1'],
            id: 'id1'
        });
        opfabEventStreamServerMock.sendLightCard(card);

        await firstValueFrom(filteredLightCardStore.getFilteredLightCards());

        const responsePossible = view.isResponsePossibleForCard('id1');
        expect(responsePossible).toBeTrue();
    });
    it('response possible should be false if user is not allowed to respond ', async () => {
        CustomScreenService.addCustomScreenDefinition(customScreenDefinition);
        const view = new CustomCardListView('testId');

        const myState = new State();
        myState.response = {state: 'myState'};

        const statesList = new Map();
        statesList.set('myState', myState);

        const process = [new Process('myProcess', '1', 'my process label', null, statesList)];
        setProcessConfiguration(process);

        setEntities([
            {
                id: 'entity1',
                name: 'entity1 name',
                roles: [RoleEnum.CARD_SENDER]
            }
        ]);

        await setUserPerimeter({
            computedPerimeters: [],
            userData: {
                login: 'test',
                firstName: 'firstName',
                lastName: 'lastName',
                entities: ['entity1']
            }
        });

        const card = getOneLightCard({
            publisher: 'entity0',
            publisherType: 'ENTITY',
            process: 'myProcess',
            state: 'myState',
            entitiesAllowedToRespond: ['entity1'],
            id: 'id1'
        });
        opfabEventStreamServerMock.sendLightCard(card);

        await firstValueFrom(filteredLightCardStore.getFilteredLightCards());

        const responsePossible = view.isResponsePossibleForCard('id1');
        expect(responsePossible).toBeFalse();
    });

    it('should send response card', async () => {
        CustomScreenService.addCustomScreenDefinition(customScreenDefinition);
        const view = new CustomCardListView('testId');

        const cardServerMock = new CardsServerMock();
        cardServerMock.setResponseFunctionForPostCard(() => new ServerResponse(undefined, ServerResponseStatus.OK, ''));
        CardsService.setCardsServer(cardServerMock);

        const myState = new State();
        myState.response = {state: 'myState'};

        const statesList = new Map();
        statesList.set('myState', myState);

        const process = [new Process('myProcess', '1', 'my process label', null, statesList)];
        setProcessConfiguration(process);

        setEntities([
            {
                id: 'entity1',
                name: 'entity1 name',
                roles: [RoleEnum.CARD_SENDER]
            }
        ]);

        await setUserPerimeter({
            computedPerimeters: [new ComputedPerimeter('myProcess', 'myState', RightEnum.ReceiveAndWrite)],
            userData: {
                login: 'test',
                firstName: 'firstName',
                lastName: 'lastName',
                entities: ['entity1']
            }
        });

        const card = getOneLightCard({
            publisher: 'entity0',
            publisherType: 'ENTITY',
            process: 'myProcess',
            state: 'myState',
            entitiesAllowedToRespond: ['entity1'],
            id: 'id1'
        });

        const card2 = getOneLightCard({
            publisher: 'entity0',
            publisherType: 'ENTITY',
            process: 'myProcess',
            state: 'myState',
            entitiesAllowedToRespond: ['entity1'],
            id: 'id2'
        });
        opfabEventStreamServerMock.sendLightCard(card);
        opfabEventStreamServerMock.sendLightCard(card2);

        await firstValueFrom(filteredLightCardStore.getFilteredLightCards());

        await view.clickOnButton('button1', ['id1', 'id2']);

        expect(cardServerMock.cardsPosted[0].process).toBe('myProcess');
        expect(cardServerMock.cardsPosted[0].state).toBe('myState');
        expect(cardServerMock.cardsPosted[0].data).toBe('id1');
        expect(cardServerMock.cardsPosted[0].parentCardId).toBe('id1');
        expect(cardServerMock.cardsPosted[1].process).toBe('myProcess');
        expect(cardServerMock.cardsPosted[1].state).toBe('myState');
        expect(cardServerMock.cardsPosted[1].data).toBe('id2');
        expect(cardServerMock.cardsPosted[1].parentCardId).toBe('id2');
    });
});
