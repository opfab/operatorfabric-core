/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {initOpfabApiMock} from '../../../../../tests/mocks/opfabApi.mock';
import {QuestionUserCardTemplateView} from './questionUserCardTemplateView';

declare const opfab;

describe('Question UserCard template', () => {
    beforeEach(() => {
        initOpfabApiMock();
    });

    it('GIVEN an existing card WHEN user edit card THEN question is actual question', () => {
        const view = new QuestionUserCardTemplateView();
        opfab.currentUserCard.getEditionMode = function () {
            return 'EDITION';
        };
        opfab.currentCard.getCard = function () {
            return {data: {question: 'My question'}};
        };
        expect(view.getQuestion()).toEqual('My question');
    });

    it('GIVEN an existing card WHEN user copy card THEN question is actual question', () => {
        const view = new QuestionUserCardTemplateView();
        opfab.currentUserCard.getEditionMode = function () {
            return 'COPY';
        };
        opfab.currentCard.getCard = function () {
            return {data: {question: 'My question'}};
        };
        expect(view.getQuestion()).toEqual('My question');
    });

    it('GIVEN a user WHEN create card THEN question is empty', () => {
        const view = new QuestionUserCardTemplateView();
        opfab.currentUserCard.getEditionMode = function () {
            return 'CREATE';
        };
        opfab.currentCard.getCard = function () {
            return {data: {question: 'My question'}};
        };
        expect(view.getQuestion()).toEqual('');
    });

    it('GIVEN a user WHEN create card with question THEN card is provided with question', () => {
        const view = new QuestionUserCardTemplateView();
        const specficCardInformation = view.getSpecificCardInformation('My question');
        expect(specficCardInformation.valid).toEqual(true);
        expect(specficCardInformation.card.data.question).toEqual('My question');
    });

    it('GIVEN a user WHEN create card with empty question THEN card is not valid with error message ', () => {
        const view = new QuestionUserCardTemplateView();
        const specficCardInformation = view.getSpecificCardInformation('');
        expect(specficCardInformation.valid).toEqual(false);
        expect(specficCardInformation.errorMsg).toEqual(
            'Translation of buildInTemplate.questionUserCard.noQuestionError'
        );
    });
});
