/* Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

declare const opfab;

export class MessageUserCardTemplateView {
    public getSpecificCardInformation(quillEditor: any, messageTitle: string) {
        const card = {
            summary: {key: 'message.summary'},
            title: {key: 'message.title', parameters: {messageTitle: messageTitle}},
            data: {richMessage: quillEditor.getContents(), messageTitle: messageTitle}
        };
        if (quillEditor.isEmpty())
            return {
                valid: false,
                errorMsg: opfab.utils.getTranslation('builtInTemplate.messageUserCard.noMessageError')
            };
        return {
            valid: true,
            card: card
        };
    }

    public getMessageTitle() {
        let messageTitle = '';
        if (opfab.currentUserCard.getEditionMode() !== 'CREATE') {
            const messageTitleField = opfab.currentCard.getCard()?.data?.messageTitle;
            if (messageTitleField) {
                messageTitle = messageTitleField;
            }
        }
        return messageTitle;
    }

    public getRichMessage() {
        let message = '';
        if (opfab.currentUserCard.getEditionMode() !== 'CREATE') {
            const messageField = opfab.currentCard.getCard()?.data?.richMessage;
            if (messageField) {
                message = opfab.utils.escapeHtml(messageField);
            }
        }
        return message;
    }
}
