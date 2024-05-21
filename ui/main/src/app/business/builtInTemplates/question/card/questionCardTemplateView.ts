/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import * as moment from 'moment/moment';

declare const opfab;

export class QuestionCardTemplateView {
    showInputField: Function;

    public getQuestion() {
        let question = opfab.currentCard.getCard()?.data?.question;
        if (question) question = opfab.utils.convertSpacesAndNewLinesInHTML(opfab.utils.escapeHtml(question));
        else question = '';
        return question;
    }

    public setFunctionToGetResponseInput(getResponseInput: Function) {
        opfab.currentCard.registerFunctionToGetUserResponse(() => {
            const response = getResponseInput();
            return {valid: true, responseCardData: {response: response}};
        });
    }

    public listenToResponses(setResponses: Function) {
        opfab.currentCard.listenToChildCards((childCards) => {
            const responses = [];
            if (childCards?.forEach && childCards.length > 0) {
                childCards?.forEach((element) => {
                    responses.push({
                        entityName: opfab.utils.escapeHtml(opfab.users.entities.getEntityName(element.publisher)),
                        response: opfab.utils.escapeHtml(element.data?.response),
                        dateTime: moment(element.publishDate).format('HH:mm DD/MM/yyyy')
                    });
                });
            }
            setResponses(responses);
        });
    }

    public listenToInputFieldVisibility(showInputField: Function) {
        this.showInputField = showInputField;
        if (opfab.currentCard.isUserAllowedToRespond()) this.listenToLock();
        else showInputField(false);
    }

    private listenToLock() {
        opfab.currentCard.listenToResponseUnlock(() => {
            if (this.showInputField) this.showInputField(true);
        });
        opfab.currentCard.listenToResponseLock(() => {
            if (this.showInputField) this.showInputField(false);
        });
    }
}
