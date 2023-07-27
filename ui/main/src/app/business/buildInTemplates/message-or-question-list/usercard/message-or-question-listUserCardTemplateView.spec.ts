/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {initOpfabApiMock} from '../../../../../tests/mocks/opfabApi.mock';
import {MessageOrQuestionListUserCardTemplateView} from './message-or-question-listUserCardTemplateView';

declare const opfab;

describe('MessageOrQuestionList UserCard template', () => {
    beforeEach(() => {
        initOpfabApiMock();
    });

    it('GIVEN an existing card WHEN user edit card THEN message is actual message', () => {
        const view = new MessageOrQuestionListUserCardTemplateView();
        opfab.currentUserCard.getEditionMode = function () {
            return 'EDITION';
        };
        opfab.currentCard.getCard = function () {
            return {data: {message: 'My message'}};
        };
        expect(view.getMessage()).toEqual('My message');
    });

    it('GIVEN an existing card WHEN user copy card THEN message is actual message', () => {
        const view = new MessageOrQuestionListUserCardTemplateView();
        opfab.currentUserCard.getEditionMode = function () {
            return 'COPY';
        };
        opfab.currentCard.getCard = function () {
            return {data: {message: 'My message'}};
        };
        expect(view.getMessage()).toEqual('My message');
    });

    it('GIVEN a user WHEN create card with empty question THEN card is not valid with error message ', () => {
        const view = new MessageOrQuestionListUserCardTemplateView();
        const specficCardInformation = view.getSpecificCardInformation('');
        expect(specficCardInformation.valid).toEqual(false);
        expect(specficCardInformation.errorMsg).toEqual(
            'Translation of buildInTemplate.message-or-question-listUserCard.emptyMessage'
        );
    });

    it('GIVEN a message list with ids WHEN given a message id THEN message associated to id is returned', () => {
        const view = new MessageOrQuestionListUserCardTemplateView();
        const messageOrQuestionList = {
            messagesList: [{
                id: 'id',
                message: 'my message'
            }]
        };

        view.messageOrQuestionList = messageOrQuestionList;
        const message = view.getMessageOrQuestion('id');
        expect(message.id).toEqual('id');
        expect(message.message).toEqual('my message');
    });

    it('GIVEN a user WHEN create card THEN card is the correct severity', () => {
        const view = new MessageOrQuestionListUserCardTemplateView();

        const selectedMessage = {title: "my title", question: true};
        view.selectedMessage = selectedMessage;
        let specficCardInformation = view.getSpecificCardInformation('my question');
        expect(specficCardInformation.card.severity).toEqual('ACTION');


        view.selectedMessage.question = false;
        specficCardInformation = view.getSpecificCardInformation('my message');
        expect(specficCardInformation.card.severity).toEqual('INFORMATION');
    });
});
