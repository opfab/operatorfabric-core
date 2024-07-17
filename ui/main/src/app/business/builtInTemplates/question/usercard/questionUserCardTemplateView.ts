/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

declare const opfab;

export class QuestionUserCardTemplateView {
    public getSpecificCardInformation(quillEditor: any, title: string) {
        const severity = opfab.currentUserCard.severity ?? 'ACTION';

        const card = {
            summary: {key: 'question.summary'},
            title: {key: 'question.title', parameters: {questionTitle: title}},
            data: {richQuestion: quillEditor.getContents(), questionTitle: title},
            severity: severity
        };
        if (quillEditor.isEmpty())
            return {
                valid: false,
                errorMsg: opfab.utils.getTranslation('builtInTemplate.questionUserCard.noQuestionError')
            };
        return {
            valid: true,
            card: card
        };
    }

    public getRichQuestion() {
        let question = '';
        if (opfab.currentUserCard.getEditionMode() !== 'CREATE') {
            const questionField = opfab.currentCard.getCard()?.data?.richQuestion;
            if (questionField) {
                question = opfab.utils.escapeHtml(questionField);
            }
        }
        return question;
    }

    public getTitle() {
        let title = '';
        if (opfab.currentUserCard.getEditionMode() !== 'CREATE') {
            const titleField = opfab.currentCard.getCard()?.data?.questionTitle;
            if (titleField) {
                title = titleField;
            }
        }
        return title;
    }
}
