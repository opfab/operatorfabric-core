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

    it('GIVEN an new card THEN initial selected message option is the first option', () => {
        const view = new MessageOrQuestionListUserCardTemplateView();
        const messageOrQuestionList = {
            messagesList: [{id: 'id1',message: 'message1'},
            { id: 'id2', message: 'message2'},
            { id: 'id3', message: 'message3'}]
        };

        view.messageOrQuestionList = messageOrQuestionList;

        opfab.currentUserCard.getEditionMode = function () {
            return 'CREATE';
        };
        opfab.currentCard.getCard = function () {
            return {data: {id: 'id1', message: 'message1'}};
        };
        view.setSelectedEmitter('ENTITY1_FR');
        expect(view.getInitialSelectedOption()).toEqual('id1');
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
    
    it('GIVEN an existing card with an HTML tag in  message WHEN user edit card THEN message is provided with HTML tag escaped', () => {
        const view = new MessageOrQuestionListUserCardTemplateView();
        opfab.currentUserCard.getEditionMode = function () {
            return 'EDITION';
        };
        opfab.currentCard.getCard = function () {
            return {data: {message: 'My message <script>'}};
        };
        expect(view.getMessage()).toEqual('My message &lt;script&gt;');
    });

    it('GIVEN an existing card WHEN user edit card THEN initial selected message option is actual option id', () => {
        const view = new MessageOrQuestionListUserCardTemplateView();
        const messageOrQuestionList = {
            messagesList: [{id: 'id1',message: 'message1'},
            { id: 'id2', message: 'message2'},
            { id: 'id3', message: 'message3'}]
        };

        view.messageOrQuestionList = messageOrQuestionList;

        opfab.currentUserCard.getEditionMode = function () {
            return 'EDITION';
        };
        opfab.currentCard.getCard = function () {
            return {data: {id: 'id2', message: 'message2'}};
        };
        view.setSelectedEmitter('ENTITY1_FR');
        expect(view.getInitialSelectedOption()).toEqual('id2');
    });

    it('GIVEN an existing card WHEN user copy card THEN initial selected message option is actual option id', () => {
        const view = new MessageOrQuestionListUserCardTemplateView();
        const messageOrQuestionList = {
            messagesList: [{id: 'id1',message: 'message1'},
            { id: 'id2', message: 'message2'},
            { id: 'id3', message: 'message3'}]
        };

        view.messageOrQuestionList = messageOrQuestionList;

        opfab.currentUserCard.getEditionMode = function () {
            return 'COPY';
        };
        opfab.currentCard.getCard = function () {
            return {data: {id: 'id2', message: 'message2'}};
        };
        view.setSelectedEmitter('ENTITY1_FR');
        expect(view.getInitialSelectedOption()).toEqual('id2');
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

        const selectedMessageWithoutseverity = {title: "default severity", question: true};
        view.selectedMessage = selectedMessageWithoutseverity;

        let specficCardInformation = view.getSpecificCardInformation('my question');
        expect(specficCardInformation.card.severity).toEqual('ACTION')

        view.selectedMessage.question = false;
        specficCardInformation = view.getSpecificCardInformation('my message');
        expect(specficCardInformation.card.severity).toEqual('INFORMATION');

        let selectedMessageWithSeverity = {title: "my title", question: true, severity: 'ACTION'};
        view.selectedMessage = selectedMessageWithSeverity;
        specficCardInformation = view.getSpecificCardInformation('my question');
        expect(specficCardInformation.card.severity).toEqual('ACTION');

        view.selectedMessage.severity = 'ALARM';
        specficCardInformation = view.getSpecificCardInformation('my message');
        expect(specficCardInformation.card.severity).toEqual('ALARM');

    });

    it('GIVEN a message list with restricted publishers WHEN given a selected emitter THEN only allowed messages options are returned', () => {
        const view = new MessageOrQuestionListUserCardTemplateView();
        const messageOrQuestionList = {
            messagesList: [{
                id: 'id1',
                message: 'allowed publishers : ENTITY1_FR ENTITY2_FR',
                publishers:  [
                    'ENTITY1_FR',
                    'ENTITY2_FR'
               ]
            },
            {
                
                id: 'id2',
                message: 'allowed publishers :  ENTITY3_FR',
                publishers:  [
                    'ENTITY3_FR'
               ]
            },
            {
                id: 'id3',
                message: 'empty allowed publishers',
                publishers:  []
            },
            {
                id: 'id4',
                message: 'publishers not defined'
            }
        ]
        };

        view.messageOrQuestionList = messageOrQuestionList;
        view.setSelectedEmitter('ENTITY1_FR');
        let messages = view.getMessageListOptions()
        expect(messages.length).toEqual(3);
        expect(messages[0].value).toEqual('id1');
        expect(messages[1].value).toEqual('id3');
        expect(messages[2].value).toEqual('id4');

        view.messageOrQuestionList = messageOrQuestionList;
        view.setSelectedEmitter('ENTITY3_FR');
        messages = view.getMessageListOptions()
        expect(messages.length).toEqual(3);
        expect(messages[0].value).toEqual('id2');
        expect(messages[1].value).toEqual('id3');
        expect(messages[2].value).toEqual('id4');

        view.messageOrQuestionList = messageOrQuestionList;
        view.setSelectedEmitter('ENTITY4_FR');
        messages = view.getMessageListOptions()
        expect(messages.length).toEqual(2);
        expect(messages[0].value).toEqual('id3');
        expect(messages[1].value).toEqual('id4');
    });
});
