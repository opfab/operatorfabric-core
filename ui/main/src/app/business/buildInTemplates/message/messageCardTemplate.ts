/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

declare const opfab;

export class MessageCardTemplate extends HTMLElement {
    constructor() {
        super();

        let messageHeader = this.getAttribute('message-header');
        if (!messageHeader) messageHeader = opfab.utils.getTranslation("buildInTemplate.messageCard.message");
        let richMessage = opfab.currentCard.getCard()?.data?.richMessage;
        if (richMessage) richMessage = opfab.richTextEditor.getHtml(richMessage);

        this.innerHTML= `
        <div style="font-size:28px"> ${messageHeader}  </div>
        <br/>
        <br/>
        <div style="text-align: justify;font-size: 24px">
        ${richMessage} 
        </div>        
        `;
    }
}
