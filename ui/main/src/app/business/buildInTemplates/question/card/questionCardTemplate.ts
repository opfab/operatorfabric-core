/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {QuestionCardTemplateView} from './questionCardTemplateView';

declare const opfab;

export class QuestionCardTemplate extends HTMLElement {
    private questionCardTemplateView: QuestionCardTemplateView;

    constructor() {
        super();
        this.questionCardTemplateView = new QuestionCardTemplateView();
        this.setHTMLContent();
        this.setFunctionToGetUserResponseInput();
        this.listenToResponses();
        this.listenToInputVisibility();
    }

    private setHTMLContent() {
        this.innerHTML = `
        <br/>
        <h2 style="text-align: justify;">${this.questionCardTemplateView.getQuestion()}</h2>
        <div id="template_response_input_component">
            <br/>
            <div class="opfab-input">
                <label> ${opfab.utils.getTranslation('buildInTemplate.questionCard.responseInputLabel')} </label>
                <input id="template_response_input"></input>
            </div>
            <br/>
        </div>
        <br/>   
        <div id="template_responses"></div>
        `;
    }

    private setFunctionToGetUserResponseInput() {
        this.questionCardTemplateView.setFunctionToGetResponseInput(() =>  (<HTMLInputElement>document.getElementById('template_response_input')).value )
    }

    private listenToResponses() {
        this.questionCardTemplateView.listenToResponses((responses) => {
            let html = '';
            if (responses?.forEach && responses.length > 0) {
                html += `<center><h3> ${opfab.utils.getTranslation('buildInTemplate.questionCard.responsesReceivedLabel')} </h3> <br/>`;
                html += '<div class="opfab-table">';
                html += `<table width="100%"> <tr> <th> ${opfab.utils.getTranslation('buildInTemplate.questionCard.entityColumnLabel')} </th>`;
                html += `<th>  ${opfab.utils.getTranslation('buildInTemplate.questionCard.responseColumnLabel')} </th>`;
                html += ' </tr>';
                responses?.forEach((response) => {
                    html += '<tr>';
                    html += '<td>' + response.entityName + '</td>';
                    html += '<td>' + response.response + '</td> </tr>';
                });
                html += '</table> </div></center>';
                document.getElementById('template_responses').innerHTML = html;
            }
        });
    }

    private listenToInputVisibility() {
        this.questionCardTemplateView.listenToInputFieldVisibility((visible) => {
            if (visible) document.getElementById('template_response_input_component').hidden = false;
            else document.getElementById('template_response_input_component').hidden = true;
        });
    }
}
