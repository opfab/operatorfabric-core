/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {initOpfabApiMock} from '../../../../tests/mocks/opfabApi.mock';
import {MessageUserCardTemplateView} from './messageUserCardTemplateView';

declare const opfab;

describe('Message UserCard template', () => {
    beforeEach(() => {
        initOpfabApiMock();
    });


    it('GIVEN an existing card WHEN user edit card THEN message is actual message', () => {
        const view = new MessageUserCardTemplateView();
        opfab.currentUserCard.getEditionMode = function () {
            return 'EDITION';
        };
        opfab.currentCard.getCard = function () {
            return {data: {message: 'My message'}};
        };
        expect(view.getMessage()).toEqual('My message');
    });


    it('GIVEN an existing card with HTML tag in message WHEN user edit card THEN message is provided with HTML tag escaped', () => {
        const view = new MessageUserCardTemplateView();
        opfab.currentUserCard.getEditionMode = function () {
            return 'EDITION';
        };
        opfab.currentCard.getCard = function () {
            return {data: {message: 'My message <script>'}};
        };
        expect(view.getMessage()).toEqual('My message &lt;script&gt;');
    });

    it('GIVEN an existing card WHEN user copy card THEN message is actual message', () => {
        const view = new MessageUserCardTemplateView();
        opfab.currentUserCard.getEditionMode = function () {
            return 'COPY';
        };
        opfab.currentCard.getCard = function () {
            return {data: {message: 'My message'}};
        };
        expect(view.getMessage()).toEqual('My message');
    });

    it('GIVEN a user WHEN create card THEN message is empty', () => {
        const view = new MessageUserCardTemplateView();
        opfab.currentUserCard.getEditionMode = function () {
            return 'CREATE';
        };
        opfab.currentCard.getCard = function () {
            return {data: {message: 'My message'}};
        };
        expect(view.getMessage()).toEqual('');
    });

    it('GIVEN a user WHEN create card with message THEN card is provided with message', () => {
        const view = new MessageUserCardTemplateView();
        const specficCardInformation = view.getSpecificCardInformation('My message');
        expect(specficCardInformation.valid).toEqual(true);
        expect(specficCardInformation.card.data.message).toEqual('My message');
    });

    it('GIVEN a user WHEN create card with empty message THEN card is not valid with error message ', () => {
        const view = new MessageUserCardTemplateView();
        const specficCardInformation = view.getSpecificCardInformation('');
        expect(specficCardInformation.valid).toEqual(false);
        expect(specficCardInformation.errorMsg).toEqual(
            'Translation of buildInTemplate.messageUserCard.noMessageError'
        );
    });
});
