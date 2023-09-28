/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

declare const opfab;

export class QuestionUserCardTemplateView {

    public getSpecificCardInformation(question: string) {
        const card = {
            summary: {key: 'question.summary'},
            title: {key: 'question.title'},
            data: {question: question}
        };
        if (question.length < 1)
            return {
                valid: false,
                errorMsg: opfab.utils.getTranslation('buildInTemplate.questionUserCard.noQuestionError')
            };
        return {
            valid: true,
            card: card
        };
    }

    public getQuestion() {
        let question = '';
        if (opfab.currentUserCard.getEditionMode() !== 'CREATE') {
            const questionField = opfab.currentCard.getCard()?.data?.question;
            if (questionField) question = questionField;
        }
        return opfab.utils.escapeHtml(question);
    }

}
