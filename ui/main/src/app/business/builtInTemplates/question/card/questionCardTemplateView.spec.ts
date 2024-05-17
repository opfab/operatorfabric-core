/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {OpfabAPIService} from 'app/business/services/opfabAPI.service';
import {QuestionCardTemplateView} from './questionCardTemplateView';
import {TranslationServiceMock} from '@tests/mocks/translation.service.mock';
import {setEntities} from '@tests/helpers';
import {RolesEnum} from '@ofModel/roles.model';
import {Entity} from '@ofModel/entity.model';

describe('Question Card template', () => {
    let view: QuestionCardTemplateView;
    beforeEach(async () => {
        const translationService = new TranslationServiceMock();
        OpfabAPIService.setTranslationService(translationService);
        OpfabAPIService.init();
        OpfabAPIService.initAPI();
        OpfabAPIService.initTemplateInterface();
        await setEntities([
            new Entity('entity1', 'entity1 name', '', [RolesEnum.CARD_RECEIVER], [], null),
            new Entity('entity2', 'entity2 name', '', [RolesEnum.CARD_RECEIVER], [], null)
        ]);
        view = new QuestionCardTemplateView();
    });

    it('GIVEN a card WHEN get question THEN question is provided', () => {
        OpfabAPIService.currentCard.card = {data: {richQuestion: 'My question'}};
        expect(view.getRichQuestion()).toEqual('My question');
    });

    it('GIVEN a card WHEN get question with new line THEN question is provided with <br> tag', () => {
        OpfabAPIService.currentCard.card = {data: {richQuestion: 'My question \n question'}};
        expect(view.getRichQuestion()).toEqual('My question <br/> question');
    });

    it('GIVEN a card WHEN get question with an HTML tag THEN question is provided with the HTML tag escape', () => {
        OpfabAPIService.currentCard.card = {data: {richQuestion: 'My question <script> question'}};
        expect(view.getRichQuestion()).toEqual('My question &lt;script&gt; question');
    });

    it('Given a card WHEN user is not allowed to answer THEN response input is hidden', () => {
        OpfabAPIService.currentCard.isUserAllowedToRespond = false;
        let inputFieldVisibility = true;
        view.listenToInputFieldVisibility((visible) => (inputFieldVisibility = visible));
        expect(inputFieldVisibility).toBeFalse();
    });

    it('Given a card WHEN user card is locked THEN response input is hidden', () => {
        OpfabAPIService.currentCard.isUserAllowedToRespond = false;
        let inputFieldVisibility = true;
        view.listenToInputFieldVisibility((visible) => (inputFieldVisibility = visible));

        OpfabAPIService.templateInterface.lockAnswer();

        expect(inputFieldVisibility).toBeFalse();
    });

    it('Given a card WHEN user card is unlocked THEN response input is visible', () => {
        OpfabAPIService.currentCard.isUserAllowedToRespond = true;
        let inputFieldVisibility = true;
        view.listenToInputFieldVisibility((visible) => (inputFieldVisibility = visible));

        OpfabAPIService.templateInterface.unlockAnswer();

        expect(inputFieldVisibility).toBeTrue();
    });

    it('GIVEN input is "my response" WHEN get user response THEN responseCardData.response is "my_response" and response is valid', () => {
        // Simulate input "my response"
        view.setFunctionToGetResponseInput(() => 'my response');

        const userResponse = OpfabAPIService.templateInterface.getUserResponse();
        expect(userResponse.valid).toBeTrue();
        expect(userResponse.responseCardData.response).toEqual('my response');
    });

    it('GIVEN 2 child cards WHEN listen to child card THEN received 2 response', () => {
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

        // Get responses from view
        let responsesResult;
        view.listenToResponses((responses) => {
            responsesResult = responses;
        });

        OpfabAPIService.templateInterface.setChildCards(childcards);
        expect(responsesResult[0].entityName).toEqual('entity1 name');
        expect(responsesResult[0].response).toEqual('response_entity1');
        expect(responsesResult[1].entityName).toEqual('entity2 name');
        expect(responsesResult[1].response).toEqual('response_entity2');
    });
});
