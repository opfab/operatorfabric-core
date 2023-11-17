/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

declare const opfab;

export class MessageUserCardTemplateView {

    public getSpecificCardInformation(quillEditor: any) {

        const card = {
            summary: {key: 'message.summary'},
            title: {key: 'message.title'},
            data: {richMessage: quillEditor.getContents()}
        };
        if (quillEditor.isEmpty())
            return {
                valid: false,
                errorMsg: opfab.utils.getTranslation('buildInTemplate.messageUserCard.noMessageError')
            };
        return {
            valid: true,
            card: card
        };
    }

    public getRichMessage() {
        let message = '';
        if (opfab.currentUserCard.getEditionMode() !== 'CREATE') {
            const messageField = opfab.currentCard.getCard()?.data?.richMessage;
            if (messageField) message = messageField;
        }
        return message;
    }

}
