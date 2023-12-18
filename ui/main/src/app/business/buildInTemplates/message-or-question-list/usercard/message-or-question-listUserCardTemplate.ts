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
    initialSetting = true;

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
        this.listenToEntityUsedForSendingCardChange();
        this.view.initRecipientsAndMessageList(this.getAttribute('businessData')).then(() => this.handleInitialSettings())
        this.initMultiSelect();
        this.previousTitleId = this.view.getTitleId();
    }

    getSpecificCardInformation() {
        const message = (<HTMLInputElement>document.getElementById('message')).value;
        return this.view.getSpecificCardInformation(message);
    }

    initMultiSelect() {
        this.messageSelect = opfab.multiSelect.init({
            id: "message-select",
            multiple: false,
            search: true
        });

        let that = this; 

        document.querySelector('#message-select').addEventListener('change', ()=> {
            that.fillTextAndRecipientFields();
        });

    }

    fillTextAndRecipientFields () {
        const messageId = this.messageSelect.getSelectedValues();
        const message = this.view.getMessageOrQuestion(messageId)
        if ( this.previousTitleId != messageId || opfab.currentUserCard.getEditionMode() == 'CREATE') {
            const messageArea =  document.getElementById("message") as HTMLTextAreaElement;
            messageArea.value  = message?.message;
            this.view.setRecipients(message?.recipients, message?.recipientsForInformation);
            this.previousTitleId = messageId;
        } 
        
    }

    private listenToEntityUsedForSendingCardChange() {
        opfab.currentUserCard.listenToEntityUsedForSendingCard((entity) => {
            this.updateSelectedEmitter(entity);
        });
    }

    private handleInitialSettings() {
        const initialSelectedEmitter = this.view.getPublisher() ?? this.view.getSelectedEmitter();

        if (initialSelectedEmitter) {
            this.view.setSelectedEmitter(initialSelectedEmitter);
            this.loadInitialSetting();
            this.initialSetting = false;
        }
    }

    private updateSelectedEmitter(entity) {
        this.view.setSelectedEmitter(entity);

        if (!this.initialSetting || !['EDITION', 'COPY'].includes(opfab.currentUserCard.getEditionMode())) {
            const previousSelectedOption = this.messageSelect.getSelectedValues();
            this.setMessageListOptions(previousSelectedOption);
        }

        this.initialSetting = false;
    }

    private loadInitialSetting() {
        this.setMessageListOptions();
        this.messageSelect.setSelectedValues(this.view.getInitialSelectedOption());
    }

    private setMessageListOptions(selected?) {
        this.titleOptions  = this.view.getMessageListOptions();
        if (this.titleOptions?.length > 0) {
            this.messageSelect.setOptions(this.titleOptions);
            if (selected && this.titleOptions.find(t => t.value === selected))
                this.messageSelect.setSelectedValues(selected);
            else this.messageSelect.setSelectedValues(this.titleOptions[0].value)
        }
    }


}
