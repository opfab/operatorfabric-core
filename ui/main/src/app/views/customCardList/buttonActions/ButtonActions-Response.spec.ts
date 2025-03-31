/* Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {CustomScreenDefinition} from '@ofServices/customScreen/model/CustomScreenDefinition';
import {CustomScreenService} from '@ofServices/customScreen/CustomScreenService';
import {
    getOneLightCard,
    mockTranslation,
    sendLightCards,
    setEntities,
    setProcessConfiguration,
    setUserPerimeter
} from '@tests/helpers';
import {RoleEnum} from '@ofServices/entities/model/RoleEnum';
import {RightEnum} from '@ofServices/perimeters/model/Perimeter';
import {ComputedPerimeter} from '@ofServices/users/model/UserWithPerimeters';
import {Process, State} from '@ofServices/processes/model/Processes';
import {ServerResponse, ServerResponseStatus} from 'app/server/ServerResponse';
import {CardsServerMock} from '@tests/mocks/CardsServer.mock';
import {CardsService} from '@ofServices/cards/CardsService';
import {NotificationDecision} from '@ofServices/notifications/NotificationDecision';
import {ReplaySubject, firstValueFrom} from 'rxjs';
import {CardTemplateGateway} from '@ofServices/templateGateway/CardTemplateGateway';
import {Message, MessageLevel} from '@ofServices/alerteMessage/model/Message';
import {AlertMessageService} from '@ofServices/alerteMessage/AlertMessageService';
import {ButtonActions} from './ButtonActions';

describe('CustomCardListView - Button actions - Responses', () => {
    beforeAll(() => {
        mockTranslation();
        NotificationDecision.init();
        CardTemplateGateway.init();
        CardTemplateGateway.initTemplateFunctions();
    });

    beforeEach(() => {
        CustomScreenService.clearCustomScreenDefinitions();
    });
    const customScreenDefinition = getCustomScreenDefinitionExample();

    function getCustomScreenDefinitionExample(): CustomScreenDefinition {
        return {
            id: 'testId',
            name: 'name',
            processIds: [],
            headerFilters: [],
            results: {
                columns: []
            },
            responseButtons: [
                {
                    id: 'button1',
                    label: 'label1',
                    getUserResponses: (cards: any[], responsesData: Map<string, any>) => {
                        const responseCards = [];
                        cards.forEach((card: any) => {
                            const userInputs = responsesData.get(card.id);
                            let comment = '';
                            if (userInputs) {
                                comment = userInputs.comment ?? '';
                            }
                            responseCards.push({data: {parentCard: card.id, comment: comment}});
                        });
                        return {valid: true, errorMsg: '', responseCards: responseCards};
                    }
                },
                {
                    id: 'button2',
                    label: 'label2',
                    getUserResponses: (_cards: any) => {
                        return {valid: false, errorMsg: 'Error test', responseCards: {}};
                    }
                }
            ]
        };
    }

    describe('When get responses buttons', () => {
        it('should get button list', () => {
            const buttonActions = new ButtonActions(customScreenDefinition);

            const result = buttonActions.getResponseButtons();
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
            const buttonActions = new ButtonActions(noButtonsCustomScreenDefinition);

            const result = buttonActions.getResponseButtons();
            expect(result).toEqual([]);
        });
    });

    describe('Response card should', () => {
        let buttonActions: ButtonActions;
        let cardServerMock: CardsServerMock;
        beforeEach(async () => {
            buttonActions = new ButtonActions(customScreenDefinition);

            cardServerMock = new CardsServerMock();
            cardServerMock.setResponseFunctionForPostCard(
                () => new ServerResponse(undefined, ServerResponseStatus.OK, '')
            );
            CardsService.setCardsServer(cardServerMock);

            await configureProcesses();
            await configureEntities();
            await configureUserPerimeter();
            sendTwoCards();

            async function configureUserPerimeter() {
                await setUserPerimeter({
                    computedPerimeters: [new ComputedPerimeter('myProcess', 'myState', RightEnum.ReceiveAndWrite)],
                    userData: {
                        login: 'test',
                        firstName: 'firstName',
                        lastName: 'lastName',
                        entities: ['entity1']
                    }
                });
            }

            async function configureEntities() {
                await setEntities([
                    {
                        id: 'entity1',
                        name: 'entity1 name',
                        roles: [RoleEnum.CARD_SENDER]
                    }
                ]);
            }

            async function configureProcesses() {
                const myState = new State();
                myState.response = {state: 'myState'};

                const statesList = new Map();
                statesList.set('myState', myState);

                const process = [new Process('myProcess', '1', 'my process label', null, statesList)];
                await setProcessConfiguration(process);
            }

            function sendTwoCards() {
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
                sendLightCards([card, card2]);
            }
        });
        it('be send', async () => {
            const responseData = new Map<string, any>();
            responseData.set('id1', {});
            responseData.set('id2', {});
            const result = await buttonActions.sendResponsesWhenUserClicksOnResponseButton('button1', responseData);

            expect(result).toBe(true);
            expect(cardServerMock.cardsPosted[0].process).toBe('myProcess');
            expect(cardServerMock.cardsPosted[0].state).toBe('myState');
            expect(cardServerMock.cardsPosted[0].data).toEqual({parentCard: 'id1', comment: ''});
            expect(cardServerMock.cardsPosted[0].parentCardId).toBe('id1');
            expect(cardServerMock.cardsPosted[1].process).toBe('myProcess');
            expect(cardServerMock.cardsPosted[1].state).toBe('myState');
            expect(cardServerMock.cardsPosted[1].data).toEqual({parentCard: 'id2', comment: ''});
            expect(cardServerMock.cardsPosted[1].parentCardId).toBe('id2');
        });

        it('be send with confirmation message for user', async () => {
            const responseData = new Map<string, any>();
            responseData.set('id1', {});
            responseData.set('id2', {});

            const alertSubject = new ReplaySubject<Message>();
            AlertMessageService.getAlertMessage().subscribe((Message) => {
                alertSubject.next(Message);
            });

            const result = await buttonActions.sendResponsesWhenUserClicksOnResponseButton('button1', responseData);

            expect(result).toBe(true);

            const message = await firstValueFrom(alertSubject.asObservable());
            expect(message.i18n.key).toEqual('response.submitSuccess');
            expect(message.level).toEqual(MessageLevel.INFO);
        });

        it('be sent with user input', async () => {
            const responseData = new Map<string, any>();
            responseData.set('id1', {comment: 'comment1'});
            responseData.set('id2', {comment: 'comment2'});
            await buttonActions.sendResponsesWhenUserClicksOnResponseButton('button1', responseData);

            expect(cardServerMock.cardsPosted[0].process).toBe('myProcess');
            expect(cardServerMock.cardsPosted[0].state).toBe('myState');
            expect(cardServerMock.cardsPosted[0].data).toEqual({parentCard: 'id1', comment: 'comment1'});
            expect(cardServerMock.cardsPosted[0].parentCardId).toBe('id1');
            expect(cardServerMock.cardsPosted[1].process).toBe('myProcess');
            expect(cardServerMock.cardsPosted[1].state).toBe('myState');
            expect(cardServerMock.cardsPosted[1].data).toEqual({parentCard: 'id2', comment: 'comment2'});
            expect(cardServerMock.cardsPosted[1].parentCardId).toBe('id2');
        });
        it('not be sent and should show alert to user if custom code return an error', async () => {
            const responseData = new Map<string, any>();
            responseData.set('id1', {comment: 'comment1'});
            responseData.set('id2', {comment: 'comment2'});

            const alertSubject = new ReplaySubject<Message>();
            AlertMessageService.getAlertMessage().subscribe((Message) => {
                alertSubject.next(Message);
            });

            const result = await buttonActions.sendResponsesWhenUserClicksOnResponseButton('button2', responseData);
            expect(result).toBe(false);

            const message = await firstValueFrom(alertSubject.asObservable());
            expect(message.message).toEqual('Error test');
            expect(message.level).toEqual(MessageLevel.ERROR);

            expect(cardServerMock.cardsPosted.length).toBe(0);
        });
    });
});
