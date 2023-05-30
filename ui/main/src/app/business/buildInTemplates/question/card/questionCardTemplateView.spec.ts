/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {initOpfabApiMock} from '../../../../../tests/mocks/opfabApi.mock';
import {QuestionCardTemplateView} from './questionCardTemplateView';

declare const opfab;

fdescribe('Question UserCard template', () => {
    let view: QuestionCardTemplateView;
    beforeEach(() => {
        initOpfabApiMock();
        view = new QuestionCardTemplateView();
    });

    it('GIVEN a card WHEN get question THEN question is provided', () => {
        opfab.currentCard.getCard = function () {
            return {data: {question: 'My question'}};
        };
        expect(view.getQuestion()).toEqual('My question');
    });

    it('GIVEN a card WHEN get question with new line THEN question is provided with <br> tag', () => {
        opfab.currentCard.getCard = function () {
            return {data: {question: 'My question \n question'}};
        };
        expect(view.getQuestion()).toEqual('My question <br/> question');
    });

    it('Given a card WHEN user is not allowed to response THEN response input is hidden', () => {
        opfab.currentCard.isUserAllowedToRespond = () => false;
        let inputFieldVisibility = true;
        view.listenToInputFieldVisibility((visible) => (inputFieldVisibility = visible));
        expect(inputFieldVisibility).toBeFalse();
    });

    it('Given a card WHEN user card is locked THEN response input is hidden', () => {
        opfab.currentCard.isUserAllowedToRespond = () => true;

        let listenToResponseLockTemplateFunction;
        opfab.currentCard.listenToResponseLock = (listenLockFunction) =>
            (listenToResponseLockTemplateFunction = listenLockFunction);

        let inputFieldVisibility = true;
        view.listenToInputFieldVisibility((visible) => (inputFieldVisibility = visible));

        listenToResponseLockTemplateFunction();

        expect(inputFieldVisibility).toBeFalse();
    });

    it('Given a card WHEN user card is unlocked THEN response input is visible', () => {
        opfab.currentCard.isUserAllowedToRespond = () => true;

        let listenToResponseUnlockTemplateFunction;
        opfab.currentCard.listenToResponseUnlock = (listenUnlockFunction) =>
            (listenToResponseUnlockTemplateFunction = listenUnlockFunction);

        let inputFieldVisibility = true;
        view.listenToInputFieldVisibility((visible) => (inputFieldVisibility = visible));

        listenToResponseUnlockTemplateFunction();

        expect(inputFieldVisibility).toBeTrue();
    });

    it('GIVEN input is "my response" WHEN  get user response THEN responseCardData.response is "my_response" and response is valid', () => {
        // Simulate opfabAPI
        let getUserResponseFromTemplate;
        opfab.currentCard.registerFunctionToGetUserResponse = (getUserResponse) => {
            getUserResponseFromTemplate = getUserResponse;
        };

        // Simulate input "my response"
        view.setFunctionToGetResponseInput(() => 'my response');

        expect(getUserResponseFromTemplate().valid).toBeTrue();
        expect(getUserResponseFromTemplate().responseCardData.response).toEqual('my response');
    });

    it('GIVEN 2 child cards WHEN listen to child card  THEN received 2 response', () => {
        const childcards = [
            {
                publisher: 'entity1',
                data: {response: 'response_entity1'}
            },
            {
                publisher: 'entity2',
                data: {response: 'response_entity2'}
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
        expect(responsesResult[0].response).toEqual('response_entity1');
        expect(responsesResult[1].entityName).toEqual('entity2 name');
        expect(responsesResult[1].response).toEqual('response_entity2');
    });
});
