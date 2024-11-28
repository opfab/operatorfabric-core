/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {MessageUserCardTemplateView} from './messageUserCardTemplateView';
import {QuillEditorMock} from '@tests/mocks/quillEditor.mock';
import {CurrentUserCardAPI} from 'app/api/currentusercard.api';
import {initOpfabAPI} from '@tests/helpers';
import {Card} from '@ofModel/card.model';
import {CardTemplateGateway} from 'app/business/templateGateway/cardTemplateGateway';

describe('Message UserCard template', () => {
    let view: MessageUserCardTemplateView;

    beforeEach(() => {
        initOpfabAPI();
        view = new MessageUserCardTemplateView();
    });

    function mockGetCard(message: string, title: string) {
        CardTemplateGateway.setCard({data: {richMessage: message, messageTitle: title}} as Card);
    }

    it('GIVEN an existing card WHEN user edit card THEN message is actual message', () => {
        CurrentUserCardAPI.currentUserCard.editionMode = 'EDITION';
        mockGetCard('My message', 'My title');
        expect(view.getRichMessage()).toEqual('My message');
        expect(view.getMessageTitle()).toEqual('My title');
    });

    it('GIVEN an existing card WHEN user copy card THEN message is actual message', () => {
        CurrentUserCardAPI.currentUserCard.editionMode = 'COPY';
        mockGetCard('My message', 'My title');
        expect(view.getRichMessage()).toEqual('My message');
        expect(view.getMessageTitle()).toEqual('My title');
    });

    it('GIVEN a user WHEN create card THEN message is empty', () => {
        CurrentUserCardAPI.currentUserCard.editionMode = 'CREATE';
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
            'Translation (en) of builtInTemplate.messageUserCard.noMessageError'
        );
    });
});
