/* Copyright (c) 2024-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {AlertMessageReceiver, getOneCard} from '@tests/helpers';
import {CardSender} from './cardSender';
import {CardsServerMock} from '@tests/mocks/CardsServer.mock';
import {CardsService} from '@ofServices/cards/CardsService';
import {convertCardToCardForPublishing} from '@ofServices/cards/CardConverter';
import {CardCreationReportData} from '@ofServices/cards/model/CardCreationReportData';
import {MessageLevel} from '@ofServices/alerteMessage/model/Message';
import {ServerResponse, ServerResponseStatus} from 'app/server/ServerResponse';
import {NotificationDecision} from 'app/services/notifications/NotificationDecision';
import {UserCardTemplateGateway} from '@ofServices/templateGateway/UserCardTemplateGateway';
import {CurrentUserCardAPI} from 'app/api/currentusercard.api';

declare const opfab: any;

describe('UserCard CardSender', () => {
    let cardsServerMock: CardsServerMock;
    let cardSender: CardSender;
    const card = getOneCard();
    beforeEach(() => {
        cardsServerMock = new CardsServerMock();
        CardsService.setCardsServer(cardsServerMock);
        cardSender = new CardSender();
        CurrentUserCardAPI.init();
        UserCardTemplateGateway.init();
    });
    describe('Send a card', () => {
        it('Should send to the back end', async () => {
            await cardSender.sendCardAndChildCard(card);
            expect(cardsServerMock.cardsPosted.length).toBe(1);
            expect(cardsServerMock.cardsPosted[0]).toEqual(convertCardToCardForPublishing(card));
        });
        it('Should display a success message to user if card sent', async () => {
            const alertMessageReceiver = new AlertMessageReceiver();
            await cardSender.sendCardAndChildCard(card);
            const alertMessage = await alertMessageReceiver.getMessageReceived();
            expect(alertMessage.i18n.key).toEqual('userCard.cardSendWithNoError');
            expect(alertMessage.level).toEqual(MessageLevel.INFO);
        });
        it('Should display error to user if card not sent', async () => {
            cardsServerMock.setResponseFunctionForPostCard(() => {
                return new ServerResponse(null, ServerResponseStatus.NOT_FOUND, null);
            });
            const alertMessageReceiver = new AlertMessageReceiver();
            await cardSender.sendCardAndChildCard(card);
            const alertMessage = await alertMessageReceiver.getMessageReceived();
            expect(alertMessage.i18n.key).toEqual('userCard.error.impossibleToSendCard');
            expect(alertMessage.level).toEqual(MessageLevel.ERROR);
        });
        it('Should set the card id as last card sent for soundNotification service to not play sound for the card', async () => {
            await cardSender.sendCardAndChildCard(card);
            expect(NotificationDecision.hasSentCard(card.process + '.' + card.processInstanceId)).toBeTrue();
        });

        it('Should set the card id as last card sent for systemNotification service to not play sound for the card', async () => {
            await cardSender.sendCardAndChildCard(card);
            expect(NotificationDecision.hasSentCard(card.process + '.' + card.processInstanceId)).toBeTrue();
        });

        it('Should call the function registered via api.currentUserCard.registerFunctionToBeCalledBeforeCardSending before sending the card', async () => {
            let cardSendToMethod = undefined;
            opfab.currentUserCard.registerFunctionToBeCalledBeforeCardSending(async (cardToBeSent) => {
                cardSendToMethod = cardToBeSent;
            });
            await cardSender.sendCardAndChildCard(card);
            expect(cardSendToMethod).toEqual(convertCardToCardForPublishing(card));
            expect(cardsServerMock.cardsPosted.length).toBe(1);
        });

        it('Should not send the card if the function registered via api.currentUserCard.registerFunctionToBeCalledBeforeCardSending throws an error ', async () => {
            opfab.currentUserCard.registerFunctionToBeCalledBeforeCardSending(async () => {
                throw new Error('Error in function');
            });
            await cardSender.sendCardAndChildCard(card);
            expect(cardsServerMock.cardsPosted.length).toBe(0);
        });
        it('Shoud display the error message if the function registered via api.currentUserCard.registerFunctionToBeCalledBeforeCardSending throws an error', async () => {
            opfab.currentUserCard.registerFunctionToBeCalledBeforeCardSending(async () => {
                throw new Error('Error in function');
            });
            const alertMessageReceiver = new AlertMessageReceiver();
            await cardSender.sendCardAndChildCard(card);
            const alertMessage = await alertMessageReceiver.getMessageReceived();
            expect(alertMessage.message).toEqual('Error in function');
        });
    });
    describe('send a card with a child card', () => {
        const childCard = getOneCard();

        it('Should send child card to the back end', async () => {
            await cardSender.sendCardAndChildCard(card, childCard);
            expect(cardsServerMock.cardsPosted.length).toBe(2);
            expect(cardsServerMock.cardsPosted[1].data).toEqual(childCard.data);
            expect(cardsServerMock.cardsPosted[1].publisher).toEqual(childCard.publisher);
            expect(cardsServerMock.cardsPosted[1].process).toEqual(childCard.process);
        });
        it('Child card should contain child card + cards id and card uid of the parent created card', async () => {
            await cardSender.sendCardAndChildCard(card, childCard);
            expect(cardsServerMock.cardsPosted[1]).toEqual({
                ...convertCardToCardForPublishing(childCard),
                parentCardId: 'cardCreatedId',
                initialParentCardUid: 'cardCreatedUid'
            });
        });
        it('Should display a success message to user if card sent', async () => {
            const alertMessageReceiver = new AlertMessageReceiver();
            await cardSender.sendCardAndChildCard(card, childCard);
            const alertMessage = await alertMessageReceiver.getMessageReceived();
            expect(alertMessage.i18n.key).toEqual('userCard.cardSendWithNoError');
            expect(alertMessage.level).toEqual(MessageLevel.INFO);
        });

        it('Should display error to user if child card not sent', async () => {
            const alertMessageReceiver = new AlertMessageReceiver();
            let methodCallsNumber = 0;
            cardsServerMock.setResponseFunctionForPostCard(() => {
                if (methodCallsNumber === 0) {
                    // first time respond with ok for card
                    methodCallsNumber = 1;
                    return new ServerResponse(new CardCreationReportData('uid', 'id'), ServerResponseStatus.OK, null);
                }
                // second time respond with error for child card
                return new ServerResponse(null, ServerResponseStatus.UNKNOWN_ERROR, null);
            });
            await cardSender.sendCardAndChildCard(card, childCard);
            const alertMessage = await alertMessageReceiver.getMessageReceived();
            expect(alertMessage.i18n.key).toEqual('userCard.error.impossibleToSendCard');
            expect(alertMessage.level).toEqual(MessageLevel.ERROR);
        });
    });
});
