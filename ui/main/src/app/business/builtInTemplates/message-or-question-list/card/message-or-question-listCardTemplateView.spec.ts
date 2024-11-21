/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {MessageOrQuestionListCardTemplateView} from './message-or-question-listCardTemplateView';
import {Entity} from '@ofModel/entity.model';
import {RolesEnum} from '@ofModel/roles.model';
import {initOpfabAPI, setEntities} from '@tests/helpers';
import {CurrentCardAPI} from 'app/api/currentcard.api';

describe('MessageOrQuestionList Card template', () => {
    let view: MessageOrQuestionListCardTemplateView;
    beforeEach(async () => {
        initOpfabAPI();
        await setEntities([
            new Entity('entity1', 'entity1 name', '', [RolesEnum.CARD_RECEIVER], [], null),
            new Entity('entity2', 'entity2 name', '', [RolesEnum.CARD_RECEIVER], [], null)
        ]);
        view = new MessageOrQuestionListCardTemplateView();
    });

    it('GIVEN a card WHEN get title and message THEN title and message are provided', () => {
        CurrentCardAPI.currentCard.card = {data: {title: 'My title', richMessage: 'My message'}};
        expect(view.getTitle()).toEqual('My title');
        expect(view.getRichMessage()).toEqual('My message');
    });

    it('GIVEN a card WHEN get title with a HTML tag THEN title is provided with HTML tag escaped', () => {
        CurrentCardAPI.currentCard.card = {data: {title: 'My title <script>'}};
        expect(view.getTitle()).toEqual('My title &lt;script&gt;');
    });

    it('Given a card WHEN user is not allowed to response THEN response input is hidden', () => {
        CurrentCardAPI.currentCard.isUserAllowedToRespond = false;
        CurrentCardAPI.currentCard.card = {data: {question: true}};
        let inputFieldVisibility = true;
        view.listenToInputFieldVisibility((visible) => (inputFieldVisibility = visible));
        expect(inputFieldVisibility).toBeFalse();
    });
    it('GIVEN input is "my response" and "Yes" WHEN get user response THEN responseCardData.comment is "my_response", responseCardData.agreement is "Yes" and response is valid', () => {
        // Simulate input "my response"
        view.setFunctionToGetResponseInput(() => {
            return [true, 'my response'];
        });

        const userResponse = CurrentCardAPI.templateInterface.getUserResponse();
        expect(userResponse.valid).toBeTrue();
        expect(userResponse.responseCardData.comment).toEqual('my response');
        expect(userResponse.responseCardData.agreement).toEqual(true);
    });

    it('Given a question card WHEN user card is locked THEN response input is hidden', () => {
        CurrentCardAPI.currentCard.isUserAllowedToRespond = true;
        CurrentCardAPI.currentCard.card = {data: {question: true}};

        let inputFieldVisibility = true;
        view.listenToInputFieldVisibility((visible) => (inputFieldVisibility = visible));

        CurrentCardAPI.templateInterface.lockAnswer();

        expect(inputFieldVisibility).toBeFalse();
    });

    it('Given a question card WHEN user card is unlocked THEN response input is visible', () => {
        CurrentCardAPI.currentCard.isUserAllowedToRespond = true;
        CurrentCardAPI.currentCard.card = {data: {question: true}};

        let inputFieldVisibility = true;
        view.listenToInputFieldVisibility((visible) => (inputFieldVisibility = visible));

        CurrentCardAPI.templateInterface.unlockAnswer();

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

        // Get responses from view
        let responsesResult;
        view.listenToResponses((responses) => {
            responsesResult = responses;
        });

        CurrentCardAPI.templateInterface.setChildCards(childcards);
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

        // Get responses from view
        let responsesResult;
        view.listenToResponses((responses) => {
            responsesResult = responses;
        });

        CurrentCardAPI.templateInterface.setChildCards(childcards);
        expect(responsesResult[0].entityName).toEqual('entity1 name');
        expect(responsesResult[0].comment).toEqual('my response &lt;script&gt;');
        expect(responsesResult[0].agreement).toEqual(true);
    });
});
