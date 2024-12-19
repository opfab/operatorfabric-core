/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {QuestionUserCardTemplateView} from './questionUserCardTemplateView';
import {initOpfabAPI} from '@tests/helpers';
import {Card} from '@ofModel/card.model';
import {CardTemplateGateway} from '@ofServices/templateGateway/CardTemplateGateway';
import {UserCardTemplateGateway} from '@ofServices/templateGateway/UserCardTemplateGateway';
import {TranslationService} from '@ofServices/translation/TranslationService';
import {TranslationLibMock} from '@tests/mocks/TranslationLib.mock';

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

describe('Question UserCard template', () => {
    beforeEach(() => {
        initOpfabAPI();
        TranslationService.setTranslationLib(new TranslationLibMock());
    });

    it('GIVEN an existing card WHEN user edit card THEN question and title are actual question and title', () => {
        const view = new QuestionUserCardTemplateView();
        UserCardTemplateGateway.setEditionMode('EDITION');
        CardTemplateGateway.setCard({data: {richQuestion: 'My question', questionTitle: 'My title'}} as Card);
        expect(view.getRichQuestion()).toEqual('My question');
        expect(view.getTitle()).toEqual('My title');
    });

    it('GIVEN an existing card with an HTML tag in question WHEN user edit card THEN question is provide with HTML tag escaped', () => {
        const view = new QuestionUserCardTemplateView();
        UserCardTemplateGateway.setEditionMode('EDITION');
        CardTemplateGateway.setCard({data: {richQuestion: 'My question <script>'}} as Card);
        expect(view.getRichQuestion()).toEqual('My question &lt;script&gt;');
    });

    it('GIVEN an existing card WHEN user copy card THEN question and title are actual question and title', () => {
        const view = new QuestionUserCardTemplateView();
        UserCardTemplateGateway.setEditionMode('COPY');
        CardTemplateGateway.setCard({data: {richQuestion: 'My question', questionTitle: 'My title'}} as Card);
        expect(view.getRichQuestion()).toEqual('My question');
        expect(view.getTitle()).toEqual('My title');
    });

    it('GIVEN a user WHEN create card THEN title and question are empty', () => {
        const view = new QuestionUserCardTemplateView();
        UserCardTemplateGateway.setEditionMode('CREATE');
        CardTemplateGateway.setCard({data: {richQuestion: 'My question', questionTitle: 'My title'}} as Card);
        expect(view.getRichQuestion()).toEqual('');
        expect(view.getTitle()).toEqual('');
    });

    it('GIVEN a user WHEN create card with title and question THEN card is provided with title and question', () => {
        const view = new QuestionUserCardTemplateView();
        const quillEditor = new QuillEditorMock();
        quillEditor.setContents('My question');
        const title = 'Question title';
        const specificCardInformation = view.getSpecificCardInformation(quillEditor, title);
        expect(specificCardInformation.card.severity).toEqual('ACTION');
        expect(specificCardInformation.card.data.richQuestion).toEqual('My question');
        expect(specificCardInformation.card.data.questionTitle).toEqual('Question title');
        expect(specificCardInformation.valid).toEqual(true);
    });

    it('GIVEN a user WHEN create card with empty question THEN card is not valid with error message ', () => {
        const view = new QuestionUserCardTemplateView();
        const quillEditor = new QuillEditorMock();
        quillEditor.setContents('');
        const title = 'Question title';
        const specificCardInformation = view.getSpecificCardInformation(quillEditor, title);
        expect(specificCardInformation.valid).toEqual(false);
        expect(specificCardInformation.errorMsg).toEqual(
            'Translation (en) of builtInTemplate.questionUserCard.noQuestionError'
        );
    });

    it('GIVEN a user WHEN create card with empty title AND question text has multiple lines THEN title is the first line of question text', () => {
        const view = new QuestionUserCardTemplateView();
        const quillEditor = new QuillEditorMock();
        quillEditor.setContents(
            '{"ops":[{"insert":"Question\\n"},{"attributes":{"bold":true},"insert":"first line in bold"},{"insert":"\\n"},{"attributes":{"color":"#e60000"},"insert":"second line red"},{"insert":"\\n"}]}'
        );
        const title = '';

        const specificCardInformation = view.getSpecificCardInformation(quillEditor, title);
        expect(specificCardInformation.valid).toEqual(true);
        expect(specificCardInformation.card.title.parameters.questionTitle).toEqual('Question');
    });

    it('GIVEN a user WHEN create card with empty title AND question text is longer than 30 characters THEN title is the first 30 characters of question text', () => {
        const view = new QuestionUserCardTemplateView();
        const quillEditor = new QuillEditorMock();
        quillEditor.setContents(
            '{"ops":[{"insert":"France-England\'s interconnection is 100% operational / Result of the maintenance is <OK>"}]}'
        );
        const title = '';

        const specificCardInformation = view.getSpecificCardInformation(quillEditor, title);
        expect(specificCardInformation.valid).toEqual(true);
        expect(specificCardInformation.card.title.parameters.questionTitle).toEqual(
            "France-England's interconnecti..."
        );
    });
});
