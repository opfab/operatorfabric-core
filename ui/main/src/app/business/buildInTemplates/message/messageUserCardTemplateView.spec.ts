/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {OpfabAPIService} from 'app/business/services/opfabAPI.service';
import {MessageUserCardTemplateView} from './messageUserCardTemplateView';
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

describe('Message UserCard template', () => {
    let view: MessageUserCardTemplateView;

    beforeEach(() => {
        const translationService = new TranslationServiceMock();
        OpfabAPIService.setTranslationService(translationService);
        OpfabAPIService.init();
        OpfabAPIService.initAPI();
        OpfabAPIService.initUserCardTemplateInterface();
        view = new MessageUserCardTemplateView();
    });

    function mockGetCard(message: string, title: string) {
        OpfabAPIService.currentCard.card = {data: {richMessage: message, messageTitle: title}};
    }

    it('GIVEN an existing card WHEN user edit card THEN message is actual message', () => {
        OpfabAPIService.currentUserCard.editionMode = 'EDITION';
        mockGetCard('My message', 'My title');
        expect(view.getRichMessage()).toEqual('My message');
        expect(view.getMessageTitle()).toEqual('My title');
    });

    it('GIVEN an existing card WHEN user copy card THEN message is actual message', () => {
        OpfabAPIService.currentUserCard.editionMode = 'COPY';
        mockGetCard('My message', 'My title');
        expect(view.getRichMessage()).toEqual('My message');
        expect(view.getMessageTitle()).toEqual('My title');
    });

    it('GIVEN a user WHEN create card THEN message is empty', () => {
        OpfabAPIService.currentUserCard.editionMode = 'CREATE';
        mockGetCard('My message', 'My title');
        expect(view.getRichMessage()).toEqual('');
        expect(view.getMessageTitle()).toEqual('');
    });

    it('GIVEN a user WHEN create card with message THEN card is provided with message', () => {
        const quillEditor = new QuillEditorMock();
        quillEditor.setContents('My message');
        const messageTitle = 'message Title';
        const specficCardInformation = view.getSpecificCardInformation(quillEditor, messageTitle);
        expect(specficCardInformation.valid).toEqual(true);
        expect(specficCardInformation.card.data.richMessage).toEqual('My message');
        expect(specficCardInformation.card.data.messageTitle).toEqual('message Title');
    });

    it('GIVEN a user WHEN create card with empty message THEN card is not valid with error message ', () => {
        const quillEditor = new QuillEditorMock();
        const messageTitle = 'message Title';
        const specficCardInformation = view.getSpecificCardInformation(quillEditor, messageTitle);
        expect(specficCardInformation.valid).toEqual(false);
        expect(specficCardInformation.errorMsg).toEqual(
            'Translation (en) of buildInTemplate.messageUserCard.noMessageError'
        );
    });
});
