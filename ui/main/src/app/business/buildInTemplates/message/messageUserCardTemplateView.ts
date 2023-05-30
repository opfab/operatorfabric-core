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

    public getSpecificCardInformation(message: string) {
        const card = {
            summary: {key: 'message.summary'},
            title: {key: 'message.title'},
            data: {message: message}
        };
        if (message.length < 1)
            return {
                valid: false,
                errorMsg: opfab.utils.getTranslation('buildInTemplate.messageUserCard.noMessageError')
            };
        return {
            valid: true,
            card: card
        };
    }

    public getMessage() {
        let message = '';
        if (opfab.currentUserCard.getEditionMode() !== 'CREATE') {
            const messageField = opfab.currentCard.getCard()?.data?.message;
            if (messageField) message = messageField;
        }
        return message;
    }

}
