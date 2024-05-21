/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
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
        if (!messageHeader) messageHeader = opfab.utils.getTranslation('builtInTemplate.messageCard.message');
        const richMessage = opfab.utils.escapeHtml(opfab.currentCard.getCard()?.data?.richMessage);

        this.innerHTML = `
        <div style="font-size:28px"> ${messageHeader}  </div>
        <br/>
        <br/>
        <div id="richMessage" style="text-align: justify;font-size: 24px">
        ${richMessage} 
        </div>
        `;
        opfab.richTextEditor.showRichMessage(document.getElementById('richMessage'));
    }
}
