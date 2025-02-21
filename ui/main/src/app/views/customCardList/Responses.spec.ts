/* Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {CustomScreenService} from '@ofServices/customScreen/CustomScreenService';
import {OpfabEventStreamServerMock} from '@tests/mocks/opfab-event-stream.server.mock';
import {OpfabEventStreamService} from '@ofServices/events/OpfabEventStreamService';
import {OpfabStore} from '@ofStore/OpfabStore';
import {RealTimeDomainService} from '@ofServices/realTimeDomain/RealTimeDomainService';
import {TranslationService} from '@ofServices/translation/TranslationService';
import {TranslationLibMock} from '@tests/mocks/TranslationLib.mock';
import {ConfigService} from '@ofServices/config/ConfigService';
import {DateTimeFormatterService} from '@ofServices/dateTimeFormatter/DateTimeFormatterService';
import {ConfigServerMock} from '@tests/mocks/configServer.mock';
import {FilteredLightCardsStore} from '@ofStore/lightcards/FilteredLightcardsStore';
import {getOneLightCard, setEntities, setProcessConfiguration, setUserPerimeter} from '@tests/helpers';
import {RoleEnum} from '@ofServices/entities/model/RoleEnum';
import {RightEnum} from '@ofServices/perimeters/model/Perimeter';
import {ComputedPerimeter} from '@ofServices/users/model/UserWithPerimeters';
import {Process, State} from '@ofServices/processes/model/Processes';
import {NotificationDecision} from '@ofServices/notifications/NotificationDecision';
import {firstValueFrom} from 'rxjs';
import {CardTemplateGateway} from '@ofServices/templateGateway/CardTemplateGateway';
import {Responses} from './Responses';

describe('CustomCardListView - Response possible', () => {
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
        RealTimeDomainService.setStartAndEndPeriod(0, Date.now() + 1000);
        filteredLightCardStore = OpfabStore.getFilteredLightCardStore();
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
                getUserResponses: (cards: any) => {
                    const responseCards = [];
                    cards.forEach((card: any) => {
                        responseCards.push({data: card.id});
                    });
                    return {valid: true, errorMsg: '', responseCards: responseCards};
                }
            },
            {
                id: 'button2',
                label: 'label2',
                getUserResponses: (_cards: any) => {
                    return {valid: true, errorMsg: '', responseCards: {}};
                }
            }
        ]
    };

    it('should be true if user is allowed to respond ', async () => {
        const responses = new Responses(customScreenDefinition);

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

        const resultTable = responses.addIsResponsePossibleForCardToResults([{cardId: 'id1'}]);
        expect(resultTable).toEqual([{cardId: 'id1', isResponsePossible: true}]);
    });
    it('should be false if user is not allowed to respond ', async () => {
        const responses = new Responses(customScreenDefinition);

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

        const resultTable = responses.addIsResponsePossibleForCardToResults([{cardId: 'id1'}]);
        expect(resultTable).toEqual([{cardId: 'id1', isResponsePossible: false}]);
    });
});
