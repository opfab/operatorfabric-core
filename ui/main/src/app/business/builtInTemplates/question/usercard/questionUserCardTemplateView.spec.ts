/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {TranslationServiceMock} from '@tests/mocks/translation.service.mock';
import {OpfabAPIService} from 'app/business/services/opfabAPI.service';
import {QuestionUserCardTemplateView} from './questionUserCardTemplateView';

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
        const translationService = new TranslationServiceMock();
        OpfabAPIService.setTranslationService(translationService);
        OpfabAPIService.init();
        OpfabAPIService.initAPI();
        OpfabAPIService.initUserCardTemplateInterface();
    });

    it('GIVEN an existing card WHEN user edit card THEN question is actual question', () => {
        const view = new QuestionUserCardTemplateView();
        OpfabAPIService.currentUserCard.editionMode = 'EDITION';
        OpfabAPIService.currentCard.card = {data: {richQuestion: 'My question'}};
        expect(view.getRichQuestion()).toEqual('My question');
    });

    it('GIVEN an existing card with an HTML tag in question WHEN user edit card THEN question is provide with HTML tag escaped', () => {
        const view = new QuestionUserCardTemplateView();
        OpfabAPIService.currentUserCard.editionMode = 'EDITION';
        OpfabAPIService.currentCard.card = {data: {richQuestion: 'My question <script>'}};
        expect(view.getRichQuestion()).toEqual('My question &lt;script&gt;');
    });

    it('GIVEN an existing card WHEN user copy card THEN question is actual question', () => {
        const view = new QuestionUserCardTemplateView();
        OpfabAPIService.currentUserCard.editionMode = 'COPY';
        OpfabAPIService.currentCard.card = {data: {richQuestion: 'My question'}};
        expect(view.getRichQuestion()).toEqual('My question');
    });

    it('GIVEN a user WHEN create card THEN question is empty', () => {
        const view = new QuestionUserCardTemplateView();
        OpfabAPIService.currentUserCard.editionMode = 'CREATE';
        OpfabAPIService.currentCard.card = {data: {richQuestion: 'My question'}};
        expect(view.getRichQuestion()).toEqual('');
    });

    it('GIVEN a user WHEN create card with question THEN card is provided with question', () => {
        const view = new QuestionUserCardTemplateView();
        const quillEditor = new QuillEditorMock();
        quillEditor.setContents('My question');
        const specificCardInformation = view.getSpecificCardInformation(quillEditor);
        expect(specificCardInformation.card.data.richQuestion).toEqual('My question');
        expect(specificCardInformation.valid).toEqual(true);
    });

    it('GIVEN a user WHEN create card with empty question THEN card is not valid with error message ', () => {
        const view = new QuestionUserCardTemplateView();
        const quillEditor = new QuillEditorMock();
        quillEditor.setContents('');
        const specificCardInformation = view.getSpecificCardInformation(quillEditor);
        expect(specificCardInformation.valid).toEqual(false);
        expect(specificCardInformation.errorMsg).toEqual(
            'Translation (en) of builtInTemplate.questionUserCard.noQuestionError'
        );
    });
});
