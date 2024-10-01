/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {AlertMessageReceiver, getOneCard} from '@tests/helpers';
import {CardSender} from './cardSender';
import {CardServerMock} from '@tests/mocks/cardServer.mock';
import {CardService} from 'app/business/services/card/card.service';
import {CardCreationReportData, fromCardToCardForPublishing} from '@ofModel/card.model';
import {MessageLevel} from '@ofModel/message.model';
import {ServerResponse, ServerResponseStatus} from 'app/business/server/serverResponse';
import {NotificationDecision} from 'app/business/services/notifications/notification-decision';

describe('UserCard CardSender', () => {
    let cardServerMock: CardServerMock;
    let cardSender: CardSender;
    const card = getOneCard();
    beforeEach(() => {
        cardServerMock = new CardServerMock();
        CardService.setCardServer(cardServerMock);
        cardSender = new CardSender();
    });
    describe('Send a card', () => {
        it('Should send to the back end', async () => {
            await cardSender.sendCardAndChildCard(card);
            expect(cardServerMock.cardsPosted.length).toBe(1);
            expect(cardServerMock.cardsPosted[0]).toEqual(fromCardToCardForPublishing(card));
        });
        it('Should display a success message to user if card sent', async () => {
            const alertMessageReceiver = new AlertMessageReceiver();
            await cardSender.sendCardAndChildCard(card);
            const alertMessage = await alertMessageReceiver.getMessageReceived();
            expect(alertMessage.i18n.key).toEqual('userCard.cardSendWithNoError');
            expect(alertMessage.level).toEqual(MessageLevel.INFO);
        });
        it('Should display error to user if card not sent', async () => {
            cardServerMock.setResponseFunctionForPostCard(() => {
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
            expect(NotificationDecision.hasSentCard(card.process + '.' + card.processInstanceId)).toBeTruthy();
        });

        it('Should set the card id as last card sent for systemNotification service to not play sound for the card', async () => {
            await cardSender.sendCardAndChildCard(card);
            expect(NotificationDecision.hasSentCard(card.process + '.' + card.processInstanceId)).toBeTruthy();
        });
    });
    describe('send a card with a child card', () => {
        const childCard = getOneCard();

        it('Should send child card to the back end', async () => {
            await cardSender.sendCardAndChildCard(card, childCard);
            expect(cardServerMock.cardsPosted.length).toBe(2);
            expect(cardServerMock.cardsPosted[1].data).toEqual(childCard.data);
            expect(cardServerMock.cardsPosted[1].publisher).toEqual(childCard.publisher);
            expect(cardServerMock.cardsPosted[1].process).toEqual(childCard.process);
        });
        it('Child card should contain child card + cards id and card uid of the parent created card', async () => {
            await cardSender.sendCardAndChildCard(card, childCard);
            expect(cardServerMock.cardsPosted[1]).toEqual({
                ...fromCardToCardForPublishing(childCard),
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
            cardServerMock.setResponseFunctionForPostCard(() => {
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
