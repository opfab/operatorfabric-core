/* Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {BaseUserCardTemplate} from '../BaseUserCardTemplate';
import {MessageUserCardTemplateView} from './MessageUserCardTemplateView';

declare const opfab;
export class MessageUserCardTemplate extends BaseUserCardTemplate {
    view: MessageUserCardTemplateView;

    constructor() {
        super();
        this.view = new MessageUserCardTemplateView();
        const richMessage = this.view.getRichMessage();
        const textareaLabel = opfab.utils.getTranslation('builtInTemplate.messageUserCard.textareaLabel');
        const messageTitleLabel = opfab.utils.getTranslation('builtInTemplate.messageUserCard.messageTitleLabel');
        this.innerHTML = `
        <br/>
        <div class="opfab-input">
            <label>${messageTitleLabel}</label>
            <input id="usercard_message_title" value='${this.view.getMessageTitle()}'>
        </div>
        <br/>
        <div class="opfab-textarea">
            <label>${textareaLabel}</label>
            <opfab-richtext-editor id="usercard_message_input">${richMessage}</opfab-richtext-editor>
        </div>
        `;
    }

    getSpecificCardInformation() {
        const quillEditor = <HTMLInputElement>document.getElementById('usercard_message_input');
        const messageTitle = (<HTMLInputElement>document.getElementById('usercard_message_title')).value;

        return this.view.getSpecificCardInformation(quillEditor, messageTitle);
    }
}
