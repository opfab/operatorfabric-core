/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {MessageOrQuestionListCardTemplateView} from './message-or-question-listCardTemplateView';

declare const opfab;

export class MessageOrQuestionListCardTemplate extends HTMLElement {
    private messageOrQuestionListCardTemplateView: MessageOrQuestionListCardTemplateView;

    constructor() {
        super();
        this.messageOrQuestionListCardTemplateView = new MessageOrQuestionListCardTemplateView();
        this.setHTMLContent();
        this.setFunctionToGetUserResponseInput();
        this.listenToResponses();
        this.listenToInputVisibility();
    }

    private setHTMLContent() {
        this.innerHTML = `
        <center>
        <h2> ${this.messageOrQuestionListCardTemplateView.getTitle()} </h2>

        <br/>

        <div id="message">
            <h3 > ${this.messageOrQuestionListCardTemplateView.getMessage()} </h3>
        </div>

        <br/>
        </center>

        <div id="reponse">
            <div style="display:flex;margin:auto;width:500px">
                <div style="margin:10px"> ${opfab.utils.getTranslation('buildInTemplate.message-or-question-listCard.answers')} : </div>
                <div style="margin:10px" id="yes_button">
                    <label class="opfab-radio-button">
                        <span> ${opfab.utils.getTranslation('buildInTemplate.message-or-question-listCard.yes')} </span>
                        <input type="radio" name="agreement" id="YES" value="YES" checked>
                        <span class="opfab-radio-button-checkmark"></span>
                    </label>
                </div>
                <div style="margin:10px" id="no_button">
                    <label class="opfab-radio-button">
                        <span> ${opfab.utils.getTranslation('buildInTemplate.message-or-question-listCard.no')} </span>
                        <input type="radio" name="agreement" id="NO" value="NO">
                        <span class="opfab-radio-button-checkmark"></span>
                    </label>
                </div>
            </div>

            <div id="comment_area">
                <div class="opfab-textarea" style="position:relative;">    <label> ${opfab.utils.getTranslation('buildInTemplate.message-or-question-listCard.comment')} </label>
                    <textarea id="comment" name="comment"></textarea>
                </div>
            </div>
        </div>

            <br/>
            <br/>

        <div id="childs-div">
        </div>

        `;
    }

    private setFunctionToGetUserResponseInput() {
        this.messageOrQuestionListCardTemplateView.setFunctionToGetResponseInput(() =>  {
            return [ (<HTMLInputElement>document.getElementById('YES')).checked, 
            (<HTMLInputElement>document.getElementById('comment')).value]; 
            })
    }

    private listenToResponses() {
        this.messageOrQuestionListCardTemplateView.listenToResponses((responses) => {
            let html = '';
            if (responses?.forEach && responses.length > 0) {
                html += `<center><h3> ${opfab.utils.getTranslation('buildInTemplate.questionCard.responsesReceivedLabel')} </h3> <br/>`;
                html += '<div class="opfab-table">';
                html += `<table width="100%"> <tr> <th> ${opfab.utils.getTranslation('buildInTemplate.message-or-question-listCard.entityColumnLabel')} </th>`;
                html += `<th>  ${opfab.utils.getTranslation('buildInTemplate.message-or-question-listCard.responseColumnLabel')} </th>`;
                html += `<th>  ${opfab.utils.getTranslation('buildInTemplate.message-or-question-listCard.commentColumnLabel')} </th>`;
                html += ' </tr>';
                responses?.forEach((response) => {
                    html += '<tr>';
                    html += '<td>' + response.entityName + '</td>';
                    if (response.agreement) html += `<td> <span style="color:green"> ${opfab.utils.getTranslation('buildInTemplate.message-or-question-listCard.yes')} </span></td>`
                    else html += `<td> <span style="color:red"> ${opfab.utils.getTranslation('buildInTemplate.message-or-question-listCard.no')} </span></td>`
                    html += '<td>' + response.comment + '</td> </tr>';
                });
                html += '</table> </div></center>';
                document.getElementById('childs-div').innerHTML = html;
            }
        });
    }

    private listenToInputVisibility() {
        this.messageOrQuestionListCardTemplateView.listenToInputFieldVisibility((visible) => {
            if (visible) document.getElementById('reponse').hidden = false;
            else document.getElementById('reponse').hidden = true;
        });
    }

}
