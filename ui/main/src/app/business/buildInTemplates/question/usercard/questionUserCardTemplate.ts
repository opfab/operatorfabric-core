/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {BaseUserCardTemplate} from '../../baseUserCardTemplate';
import {QuestionUserCardTemplateView} from './questionUserCardTemplateView';

declare const opfab;

export class QuestionUserCardTemplate extends BaseUserCardTemplate {

    view: QuestionUserCardTemplateView;

    constructor() {
        super();
        this.view = new QuestionUserCardTemplateView();
        this.innerHTML = `
        <br/>
        <div class="opfab-textarea">
            <label id="opfab-question-label">${opfab.utils.getTranslation('buildInTemplate.questionUserCard.textareaLabel')}</label>
            <textarea id="usercard_question_input" rows="5" 
                style="width:100%">${this.view.getQuestion()}</textarea>
        </div>
        `;
    }
    getSpecificCardInformation() {
        const message = (<HTMLInputElement>document.getElementById('usercard_question_input')).value;
        return this.view.getSpecificCardInformation(message);
    }

}
