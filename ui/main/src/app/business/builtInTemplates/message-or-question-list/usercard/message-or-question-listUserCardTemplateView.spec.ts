/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {OpfabAPIService} from 'app/business/services/opfabAPI.service';
import {MessageOrQuestionListUserCardTemplateView} from './message-or-question-listUserCardTemplateView';
import {TranslationServiceMock} from '@tests/mocks/translation.service.mock';

class QuillEditorMock {
    contents: string;

    setContents(contents: string) {
        this.contents = contents;
    }

    getContents() {
        return this.contents;
    }

    isEmpty() {
        return !this.contents || this.contents.length === 0;
    }
}

describe('MessageOrQuestionList UserCard template', () => {
    beforeEach(() => {
        const translationService = new TranslationServiceMock();
        OpfabAPIService.setTranslationService(translationService);
        OpfabAPIService.init();
        OpfabAPIService.initAPI();
        OpfabAPIService.initUserCardTemplateInterface();
    });

    it('GIVEN a new card THEN initial selected message option is the first option', () => {
        const view = new MessageOrQuestionListUserCardTemplateView();
        const messageOrQuestionList = {
            messagesList: [
                {id: 'id1', summary: 'summary1', message: 'message1'},
                {id: 'id2', message: 'message2'},
                {id: 'id3', summary: 'summary3', message: 'message3'}
            ]
        };

        view.messageOrQuestionList = messageOrQuestionList;

        OpfabAPIService.currentUserCard.editionMode = 'CREATE';
        view.setSelectedEmitter('ENTITY1_FR');
        expect(view.getInitialSelectedOption()).toEqual('id1');
    });

    it('GIVEN an existing card WHEN user edit card THEN message/summary are actual message/summary', () => {
        const view = new MessageOrQuestionListUserCardTemplateView();
        OpfabAPIService.currentUserCard.editionMode = 'EDITION';
        OpfabAPIService.currentCard.card = {data: {richMessage: 'My message', summary: 'My summary'}};
        expect(view.getRichMessage()).toEqual('My message');
        expect(view.getSummary()).toEqual('My summary');
    });

    it('GIVEN an existing card with an HTML tag in  message WHEN user edit card THEN message is provided with HTML tag escaped', () => {
        const view = new MessageOrQuestionListUserCardTemplateView();
        OpfabAPIService.currentUserCard.editionMode = 'EDITION';
        OpfabAPIService.currentCard.card = {data: {richMessage: 'My message <script>'}};
        expect(view.getRichMessage()).toEqual('My message &lt;script&gt;');
    });

    it('GIVEN an existing card WHEN user edit card THEN initial selected message option is actual option id', () => {
        const view = new MessageOrQuestionListUserCardTemplateView();
        const messageOrQuestionList = {
            messagesList: [
                {id: 'id1', message: 'message1'},
                {id: 'id2', message: 'message2'},
                {id: 'id3', message: 'message3'}
            ]
        };

        view.messageOrQuestionList = messageOrQuestionList;

        OpfabAPIService.currentUserCard.editionMode = 'EDITION';
        OpfabAPIService.currentCard.card = {data: {id: 'id2', richMessage: 'message2'}};
        view.setSelectedEmitter('ENTITY1_FR');
        expect(view.getInitialSelectedOption()).toEqual('id2');
    });

    it('GIVEN an existing card WHEN user copy card THEN initial selected message option is actual option id', () => {
        const view = new MessageOrQuestionListUserCardTemplateView();
        const messageOrQuestionList = {
            messagesList: [
                {id: 'id1', message: 'message1'},
                {id: 'id2', message: 'message2'},
                {id: 'id3', message: 'message3'}
            ]
        };

        view.messageOrQuestionList = messageOrQuestionList;

        OpfabAPIService.currentUserCard.editionMode = 'COPY';
        OpfabAPIService.currentCard.card = {data: {id: 'id2', richMessage: 'message2'}};
        view.setSelectedEmitter('ENTITY1_FR');
        expect(view.getInitialSelectedOption()).toEqual('id2');
    });

    it('GIVEN an existing card WHEN user copy card THEN message/summary are actual message/summary', () => {
        const view = new MessageOrQuestionListUserCardTemplateView();
        OpfabAPIService.currentUserCard.editionMode = 'COPY';
        OpfabAPIService.currentCard.card = {data: {richMessage: 'My message', summary: 'My summary'}};
        expect(view.getRichMessage()).toEqual('My message');
        expect(view.getSummary()).toEqual('My summary');
    });

    it('GIVEN a user WHEN create card with empty question THEN card is not valid with error message ', () => {
        const view = new MessageOrQuestionListUserCardTemplateView();
        const quillEditor = new QuillEditorMock();

        const specficCardInformation = view.getSpecificCardInformation(quillEditor, '');
        expect(specficCardInformation.valid).toEqual(false);
        expect(specficCardInformation.errorMsg).toEqual(
            'Translation (en) of builtInTemplate.message-or-question-listUserCard.emptyMessage'
        );
    });

    it('GIVEN a message list with ids WHEN given a message id THEN message associated to id is returned', () => {
        const view = new MessageOrQuestionListUserCardTemplateView();
        const messageOrQuestionList = {
            messagesList: [
                {
                    id: 'id',
                    message: 'my message'
                }
            ]
        };

        view.messageOrQuestionList = messageOrQuestionList;
        const message = view.getMessageOrQuestion('id');
        expect(message.id).toEqual('id');
        expect(message.message).toEqual('my message');
    });

    it('GIVEN a user WHEN create card THEN card is the correct severity', () => {
        const view = new MessageOrQuestionListUserCardTemplateView();

        const selectedMessageWithoutseverity = {title: 'default severity', question: true};
        view.selectedMessage = selectedMessageWithoutseverity;

        const quillEditor = new QuillEditorMock();
        quillEditor.setContents('My question');
        let specficCardInformation = view.getSpecificCardInformation(quillEditor, '');
        expect(specficCardInformation.card.severity).toEqual('ACTION');

        view.selectedMessage.question = false;
        quillEditor.setContents('My message');
        specficCardInformation = view.getSpecificCardInformation(quillEditor, '');
        expect(specficCardInformation.card.severity).toEqual('INFORMATION');

        const selectedMessageWithSeverity = {title: 'my title', question: true, severity: 'ACTION'};
        view.selectedMessage = selectedMessageWithSeverity;
        quillEditor.setContents('My question');
        specficCardInformation = view.getSpecificCardInformation(quillEditor, '');
        expect(specficCardInformation.card.severity).toEqual('ACTION');

        view.selectedMessage.severity = 'ALARM';
        quillEditor.setContents('My message');
        specficCardInformation = view.getSpecificCardInformation(quillEditor, '');
        expect(specficCardInformation.card.severity).toEqual('ALARM');
    });

    it('GIVEN a message list with restricted publishers WHEN given a selected emitter THEN only allowed messages options are returned', () => {
        const view = new MessageOrQuestionListUserCardTemplateView();
        const messageOrQuestionList = {
            messagesList: [
                {
                    id: 'id1',
                    message: 'allowed publishers : ENTITY1_FR ENTITY2_FR',
                    publishers: ['ENTITY1_FR', 'ENTITY2_FR']
                },
                {
                    id: 'id2',
                    message: 'allowed publishers :  ENTITY3_FR',
                    publishers: ['ENTITY3_FR']
                },
                {
                    id: 'id3',
                    message: 'empty allowed publishers',
                    publishers: []
                },
                {
                    id: 'id4',
                    message: 'publishers not defined'
                }
            ]
        };

        view.messageOrQuestionList = messageOrQuestionList;
        view.setSelectedEmitter('ENTITY1_FR');
        let messages = view.getMessageListOptions();
        expect(messages.length).toEqual(3);
        expect(messages[0].value).toEqual('id1');
        expect(messages[1].value).toEqual('id3');
        expect(messages[2].value).toEqual('id4');

        view.messageOrQuestionList = messageOrQuestionList;
        view.setSelectedEmitter('ENTITY3_FR');
        messages = view.getMessageListOptions();
        expect(messages.length).toEqual(3);
        expect(messages[0].value).toEqual('id2');
        expect(messages[1].value).toEqual('id3');
        expect(messages[2].value).toEqual('id4');

        view.messageOrQuestionList = messageOrQuestionList;
        view.setSelectedEmitter('ENTITY4_FR');
        messages = view.getMessageListOptions();
        expect(messages.length).toEqual(2);
        expect(messages[0].value).toEqual('id3');
        expect(messages[1].value).toEqual('id4');
    });

    it('GIVEN a message list WHEN selected message has richMessage field THEN quill editor content is the richMessage', () => {
        const view = new MessageOrQuestionListUserCardTemplateView();
        const messageOrQuestionList = {
            messagesList: [
                {
                    id: 'id1',
                    richMessage: {ops: [{attributes: {color: '#e60000', bold: true}}, {insert: 'Rich message'}]}
                }
            ]
        };

        view.messageOrQuestionList = messageOrQuestionList;

        const selectedMessage = messageOrQuestionList.messagesList[0];

        const quillEditor = new QuillEditorMock();
        view.setRichTextContent(quillEditor, selectedMessage);

        expect(quillEditor.getContents()).toEqual(
            '{"ops":[{"attributes":{"color":"#e60000","bold":true}},{"insert":"Rich message"}]}'
        );
    });

    it('GIVEN a message list WHEN selected message does not have richMessage field THEN quill editor content is the message in delta format', () => {
        const view = new MessageOrQuestionListUserCardTemplateView();
        const messageOrQuestionList = {
            messagesList: [
                {
                    id: 'id2',
                    message: 'message2'
                }
            ]
        };

        view.messageOrQuestionList = messageOrQuestionList;

        const selectedMessage = messageOrQuestionList.messagesList[0];

        const quillEditor = new QuillEditorMock();
        view.setRichTextContent(quillEditor, selectedMessage);

        expect(quillEditor.getContents()).toEqual('{"ops":[{"insert":"message2"}]}');
    });
});
