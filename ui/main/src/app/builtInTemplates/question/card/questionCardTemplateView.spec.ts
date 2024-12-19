/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {QuestionCardTemplateView} from './questionCardTemplateView';
import {initOpfabAPI, setEntities} from '@tests/helpers';
import {RoleEnum} from '@ofServices/entities/model/RoleEnum';
import {Entity} from '@ofServices/entities/model/Entity';
import {Card} from '@ofModel/card.model';
import {CardTemplateGateway} from '@ofServices/templateGateway/CardTemplateGateway';

describe('Question Card template', () => {
    let view: QuestionCardTemplateView;
    beforeEach(async () => {
        jasmine.clock().uninstall();
        jasmine.clock().install();
        jasmine.clock().mockDate(new Date(0));
        initOpfabAPI();
        await setEntities([
            new Entity('entity1', 'entity1 name', '', [RoleEnum.CARD_RECEIVER], [], null),
            new Entity('entity2', 'entity2 name', '', [RoleEnum.CARD_RECEIVER], [], null)
        ]);
        view = new QuestionCardTemplateView();
    });

    afterEach(() => {
        jasmine.clock().uninstall();
    });

    it('GIVEN a card WHEN get question THEN question is provided', () => {
        CardTemplateGateway.setCard({data: {richQuestion: 'My question'}} as Card);
        expect(view.getRichQuestion()).toEqual('My question');
    });

    it('GIVEN a card WHEN get question with new line THEN question is provided with <br> tag', () => {
        CardTemplateGateway.setCard({data: {richQuestion: 'My question \n question'}} as Card);
        expect(view.getRichQuestion()).toEqual('My question <br/> question');
    });

    it('GIVEN a card WHEN get question with an HTML tag THEN question is provided with the HTML tag escape', () => {
        CardTemplateGateway.setCard({data: {richQuestion: 'My question <script> question'}} as Card);
        expect(view.getRichQuestion()).toEqual('My question &lt;script&gt; question');
    });

    it('Given a card WHEN user is not allowed to answer THEN response input is hidden', () => {
        CardTemplateGateway.setUserAllowedToRespond(false);
        let inputFieldVisibility = true;
        view.listenToInputFieldVisibility((visible) => (inputFieldVisibility = visible));
        expect(inputFieldVisibility).toBeFalse();
    });

    it('Given a card WHEN user card is locked THEN response input is hidden', () => {
        CardTemplateGateway.setUserAllowedToRespond(false);
        let inputFieldVisibility = true;
        view.listenToInputFieldVisibility((visible) => (inputFieldVisibility = visible));
        CardTemplateGateway.sendResponseLockToTemplate();

        expect(inputFieldVisibility).toBeFalse();
    });

    it('Given a card WHEN user card is unlocked THEN response input is visible', () => {
        CardTemplateGateway.setUserAllowedToRespond(true);
        let inputFieldVisibility = true;
        view.listenToInputFieldVisibility((visible) => (inputFieldVisibility = visible));
        CardTemplateGateway.sendResponseUnlockToTemplate();

        expect(inputFieldVisibility).toBeTrue();
    });

    it('GIVEN input is "my response" WHEN get user response THEN responseCardData.responses[0].response is] "my_response" and response is valid', () => {
        // Simulate input "my response"
        view.setFunctionToGetResponseInput(() => 'my response', false);

        const userResponse = CardTemplateGateway.getUserResponseFromTemplate(undefined);
        expect(userResponse.valid).toBeTrue();
        expect(userResponse.responseCardData.responses[0].response).toEqual('my response');
    });

    it('GIVEN 2 child cards WHEN listen to child card THEN received 2 response', () => {
        const childcards = [
            {
                publisher: 'entity1',
                data: {responses: [{response: 'response_entity1'}]}
            },
            {
                publisher: 'entity2',
                data: {responses: [{response: 'response_entity2'}]}
            }
        ];

        // Get responses from view
        let responsesResult;
        view.listenToResponses((responses) => {
            responsesResult = responses;
        });

        CardTemplateGateway.setChildCards(childcards as Card[]);
        CardTemplateGateway.sendChildCardsToTemplate();
        expect(responsesResult[0].entityName).toEqual('entity1 name');
        expect(responsesResult[0].responses).toEqual([
            {responseDate: '01:00 01/01/1970', response: 'response_entity1'}
        ]);
        expect(responsesResult[1].entityName).toEqual('entity2 name');
        expect(responsesResult[1].responses).toEqual([
            {responseDate: '01:00 01/01/1970', response: 'response_entity2'}
        ]);
    });

    it('GIVEN 1 child card and keepResponseHistoryInCard="true" WHEN calling getUserResponse THEN response contains response history with 2 responses', () => {
        const childcards = [
            {
                publisher: 'entity1',
                data: {
                    responses: [{responseDate: new Date('2024-06-01T09:15:00').getTime(), response: 'response_entity1'}]
                }
            }
        ];

        view.listenToResponses((responses) => {});

        CardTemplateGateway.setChildCards(childcards as Card[]);
        CardTemplateGateway.sendChildCardsToTemplate();

        view.setFunctionToGetResponseInput(() => 'my 2nd response', true);
        jasmine.clock().mockDate(new Date('2024-06-01T09:24:00'));
        const userResponse = CardTemplateGateway.getUserResponseFromTemplate('entity1');

        expect(userResponse.valid).toBeTrue();
        expect(userResponse.responseCardData.responses[0].response).toEqual('response_entity1');
        expect(userResponse.responseCardData.responses[0].responseDate).toEqual(
            new Date('2024-06-01T09:15:00').getTime()
        );
        expect(userResponse.responseCardData.responses[1].response).toEqual('my 2nd response');
        expect(userResponse.responseCardData.responses[1].responseDate).toEqual(
            new Date('2024-06-01T09:24:00').getTime()
        );
    });

    it('GIVEN 1 child card and keepResponseHistoryInCard="false" WHEN calling getUserResponse THEN response contains response history with only last response', () => {
        const childcards = [
            {
                publisher: 'entity1',
                data: {
                    responses: [{responseDate: new Date('2024-06-01T09:15:00').getTime(), response: 'response_entity1'}]
                }
            }
        ];

        view.listenToResponses((responses) => {});
        CardTemplateGateway.setChildCards(childcards as Card[]);
        CardTemplateGateway.sendChildCardsToTemplate();

        view.setFunctionToGetResponseInput(() => 'my 2nd response', false);
        jasmine.clock().mockDate(new Date('2024-06-01T09:24:00'));
        const userResponse = CardTemplateGateway.getUserResponseFromTemplate('entity1');

        expect(userResponse.valid).toBeTrue();
        expect(userResponse.responseCardData.responses.length).toEqual(1);
        expect(userResponse.responseCardData.responses[0].response).toEqual('my 2nd response');
        expect(userResponse.responseCardData.responses[0].responseDate).toEqual(
            new Date('2024-06-01T09:24:00').getTime()
        );
    });
});
