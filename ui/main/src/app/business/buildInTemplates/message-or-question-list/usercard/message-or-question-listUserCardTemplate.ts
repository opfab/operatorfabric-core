/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {BaseUserCardTemplate} from '../../baseUserCardTemplate';
import {MessageOrQuestionListUserCardTemplateView} from './message-or-question-listUserCardTemplateView';

declare const opfab;

export class MessageOrQuestionListUserCardTemplate extends BaseUserCardTemplate {
    messageSelect;
    view: MessageOrQuestionListUserCardTemplateView;
    titleOptions;
    previousTitleId;

    constructor() {
        super();
        this.view = new MessageOrQuestionListUserCardTemplateView();
        this.innerHTML = `
        <br/>

        <div class="opfab-multiselect">
            <label> ${opfab.utils.getTranslation('buildInTemplate.message-or-question-listUserCard.titleLabel')} </label>
            <div id="message-select"></div>
        </div>

        <br/>

        <div class="opfab-textarea">
            <label> ${opfab.utils.getTranslation('buildInTemplate.message-or-question-listUserCard.messageLabel')} </label>
            <textarea id="message" name="message" style="width:100%" rows="3">${this.view.getMessage()}</textarea>
        </div>

        <br/>
        `;
        this.initMultiSelect();
        this.previousTitleId = this.view.getTitleId();
    }

    getSpecificCardInformation() {
        const message = (<HTMLInputElement>document.getElementById('message')).value;
        return this.view.getSpecificCardInformation(message);
    }

    async initMultiSelect() {
        this.messageSelect = opfab.multiSelect.init({
            id: "message-select",
            multiple: false,
            search: true
        });

        await this.view.initRecipientsAndMessageList(this.getAttribute('businessData')).then( (titlesOptions) => {
            this.titleOptions = titlesOptions;
        });
        
        this.messageSelect.setOptions(this.titleOptions);

        if (['EDITION', 'COPY'].includes(opfab.currentUserCard.getEditionMode())) {
            let titleId = this.view.getTitleId();
            this.messageSelect.setSelectedValues(titleId)
        }

        let that = this; 

        document.querySelector('#message-select').addEventListener('change', ()=> {
            that.fillTextAndRecipientFields();
        });

        if (opfab.currentUserCard.getEditionMode() == 'CREATE') {
            this.messageSelect.setSelectedValues(this.titleOptions[0].value)
        }
    }

    fillTextAndRecipientFields () {
        const messageId = this.messageSelect.getSelectedValues();
        const message = this.view.getMessageOrQuestion(messageId)
        if ( this.previousTitleId != messageId ) {
            document.getElementById("message").innerHTML = message?.message;
            this.view.setRecipients(message?.recipients);
            this.previousTitleId = messageId;
        } 
        
    }

}
