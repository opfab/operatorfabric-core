/* Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {BaseUserCardTemplate} from '../../BaseUserCardTemplate';
import {QuestionUserCardTemplateView} from './QuestionUserCardTemplateView';

declare const opfab;

export class QuestionUserCardTemplate extends BaseUserCardTemplate {
    view: QuestionUserCardTemplateView;

    constructor() {
        super();
        this.view = new QuestionUserCardTemplateView();

        this.innerHTML = `
        <br/>
        <div class="opfab-input">
            <label>${opfab.utils.getTranslation('builtInTemplate.questionUserCard.titleLabel')}</label>
            <input id="usercard_question_title" value='${this.view.getTitle()}'>
        </div>
        <br/>
        <div class="opfab-textarea">
            <label id="opfab-question-label">${opfab.utils.getTranslation('builtInTemplate.questionUserCard.textareaLabel')}</label>
            <opfab-richtext-editor id="usercard_question_input" rows="5" 
                style="width:100%">${this.view.getRichQuestion()}</opfab-richtext-editor>
        </div>
        `;

        this.initSeverity();
    }

    initSeverity() {
        opfab.currentUserCard.setInitialSeverity('ACTION');
    }

    getSpecificCardInformation() {
        const quillEditor = <HTMLInputElement>document.getElementById('usercard_question_input');
        const title = (<HTMLInputElement>document.getElementById('usercard_question_title')).value;
        return this.view.getSpecificCardInformation(quillEditor, title);
    }
}
