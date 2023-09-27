/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {initOpfabApiMock} from '../../../../../tests/mocks/opfabApi.mock';
import {MessageOrQuestionListCardTemplateView} from './message-or-question-listCardTemplateView';

declare const opfab;

describe('MessageOrQuestionList Card template', () => {
    let view: MessageOrQuestionListCardTemplateView;
    beforeEach(() => {
        initOpfabApiMock();
        view = new MessageOrQuestionListCardTemplateView();
    });

    it('GIVEN a card WHEN get title and message THEN title and message are provided', () => {
        opfab.currentCard.getCard = function () {
            return {data: {title: 'My title', message: 'My message'}};
        };
        expect(view.getTitle()).toEqual('My title');
        expect(view.getMessage()).toEqual('My message');
    });

    it('GIVEN a card WHEN get message with new line THEN message is provided with <br> tag', () => {
        opfab.currentCard.getCard = function () {
            return {data: {message: 'My message \n message'}};
        };
        expect(view.getMessage()).toEqual('My message <br/> message');
    });

    it('GIVEN a card WHEN get message with a HTML tag THEN message is provided with HTML tag escaped', () => {
        opfab.currentCard.getCard = function () {
            return {data: {message: 'My message <script>'}};
        };
        expect(view.getMessage()).toEqual('My message &lt;script&gt;');
    });

    it('GIVEN a card WHEN get title with a HTML tag THEN title is provided with HTML tag escaped', () => {
        opfab.currentCard.getCard = function () {
            return {data: {title: 'My title <script>'}};
        };
        expect(view.getTitle()).toEqual('My title &lt;script&gt;');
    });

    it('Given a card WHEN user is not allowed to response THEN response input is hidden', () => {
        opfab.currentCard.isUserAllowedToRespond = () => false;
        let inputFieldVisibility = true;
        view.listenToInputFieldVisibility((visible) => (inputFieldVisibility = visible));
        expect(inputFieldVisibility).toBeFalse();
    });

    it('GIVEN input is "my response" and "Yes" WHEN get user response THEN responseCardData.comment is "my_response", responseCardData.agreement is "Yes" and response is valid', () => {
        // Simulate opfabAPI
        let getUserResponseFromTemplate;
        opfab.currentCard.registerFunctionToGetUserResponse = (getUserResponse) => {
            getUserResponseFromTemplate = getUserResponse;
        };

        // Simulate input "my response"
        view.setFunctionToGetResponseInput(() => {
            return [true, 'my response'];
        });

        expect(getUserResponseFromTemplate().valid).toBeTrue();
        expect(getUserResponseFromTemplate().responseCardData.comment).toEqual('my response');
        expect(getUserResponseFromTemplate().responseCardData.agreement).toEqual(true);
    });

    it('Given a question card WHEN user card is locked THEN response input is hidden', () => {
        opfab.currentCard.isUserAllowedToRespond = () => true;
        opfab.currentCard.getCard = function () {
            return {data: {question: true}};
        };

        let listenToResponseLockTemplateFunction;
        opfab.currentCard.listenToResponseLock = (listenLockFunction) =>
            (listenToResponseLockTemplateFunction = listenLockFunction);

        let inputFieldVisibility = true;
        view.listenToInputFieldVisibility((visible) => (inputFieldVisibility = visible));

        listenToResponseLockTemplateFunction();

        expect(inputFieldVisibility).toBeFalse();
    });

    it('Given a question card WHEN user card is unlocked THEN response input is visible', () => {
        opfab.currentCard.isUserAllowedToRespond = () => true;
        opfab.currentCard.getCard = function () {
            return {data: {question: true}};
        };

        let listenToResponseUnlockTemplateFunction;
        opfab.currentCard.listenToResponseUnlock = (listenUnlockFunction) =>
            (listenToResponseUnlockTemplateFunction = listenUnlockFunction);

        let inputFieldVisibility = true;
        view.listenToInputFieldVisibility((visible) => (inputFieldVisibility = visible));

        listenToResponseUnlockTemplateFunction();

        expect(inputFieldVisibility).toBeTrue();
    });

    it('GIVEN 2 child cards WHEN listen to child card THEN received 2 response', () => {
        const childcards = [
            {
                publisher: 'entity1',
                data: {comment: 'my response 1', agreement: true}
            },
            {
                publisher: 'entity2',
                data: {comment: 'my response 2', agreement: false}
            }
        ];

        // Simulate opfab API
        let sendChildCards: Function;
        opfab.currentCard.listenToChildCards = (listenFunction) => {
            sendChildCards = listenFunction;
        };

        // Get responses from view
        let responsesResult;
        view.listenToResponses((responses) => {
            responsesResult = responses;
        });

        sendChildCards(childcards);
        expect(responsesResult[0].entityName).toEqual('entity1 name');
        expect(responsesResult[0].comment).toEqual('my response 1');
        expect(responsesResult[0].agreement).toEqual(true);
        expect(responsesResult[1].entityName).toEqual('entity2 name');
        expect(responsesResult[1].comment).toEqual('my response 2');
        expect(responsesResult[1].agreement).toEqual(false);
    });

    it('GIVEN a child card with HTML tag in data WHEN listen to child card THEN received response with HTML tag escaped', () => {
        const childcards = [
            {
                publisher: 'entity1',
                data: {comment: 'my response <script>', agreement: true}
            }
        ];

        // Simulate opfab API
        let sendChildCards: Function;
        opfab.currentCard.listenToChildCards = (listenFunction) => {
            sendChildCards = listenFunction;
        };

        // Get responses from view
        let responsesResult;
        view.listenToResponses((responses) => {
            responsesResult = responses;
        });

        sendChildCards(childcards);
        expect(responsesResult[0].entityName).toEqual('entity1 name');
        expect(responsesResult[0].comment).toEqual('my response &lt;script&gt;');
        expect(responsesResult[0].agreement).toEqual(true);

    });
});
