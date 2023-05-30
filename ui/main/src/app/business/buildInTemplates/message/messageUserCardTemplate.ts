/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {BaseUserCardTemplate} from '../baseUserCardTemplate';
import {MessageUserCardTemplateView} from './messageUserCardTemplateView';

declare const opfab;
export class MessageUserCardTemplate extends BaseUserCardTemplate {

    view: MessageUserCardTemplateView;

    constructor() {
        super();
        this.view = new MessageUserCardTemplateView();
        const message = this.view.getMessage();
        const textareaLabel = opfab.utils.getTranslation('buildInTemplate.messageUserCard.textareaLabel');
        this.innerHTML = `
        <br/>
        <div class="opfab-textarea">
            <label>${textareaLabel}</label>
            <textarea id="usercard_message_input" rows="5" 
                style="width:100%">${message}</textarea>
        </div>
        `;
    }

    getSpecificCardInformation() {
        const message = (<HTMLInputElement>document.getElementById('usercard_message_input')).value;
        return this.view.getSpecificCardInformation(message);
    }

}
