/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {format} from 'date-fns';

declare const opfab;

export class QuestionCardTemplateView {
    showInputField: Function;
    responses = [];

    public getRichQuestion() {
        let richQuestion = opfab.currentCard.getCard()?.data?.richQuestion;
        if (richQuestion) {
            richQuestion = opfab.utils.convertSpacesAndNewLinesInHTML(opfab.utils.escapeHtml(richQuestion));
        } else {
            richQuestion = '';
        }
        return richQuestion;
    }

    public setFunctionToGetResponseInput(getResponseInput: Function, keepResponseHistory: boolean) {
        opfab.currentCard.registerFunctionToGetUserResponse((emitter) => {
            const response = getResponseInput();
            const responseHistory = [];
            if (keepResponseHistory && emitter) {
                const entityResponse = this.responses.find((resp) => resp.entityId === emitter);
                if (entityResponse) {
                    entityResponse.responses.forEach((resp) => responseHistory.push(resp));
                }
            }
            responseHistory.push({
                responseDate: new Date().getTime(),
                response: response
            });

            return {valid: true, responseCardData: {responses: responseHistory}};
        });
    }

    public listenToResponses(setResponses: Function) {
        opfab.currentCard.listenToChildCards((childCards) => {
            this.responses = [];
            const viewResponses = [];
            if (childCards?.forEach && childCards.length > 0) {
                childCards?.forEach((element) => {
                    const cardResponses = [];
                    element.data?.responses.forEach((response) => {
                        const responseDate = response.responseDate ?? new Date(null);
                        cardResponses.push({
                            responseDate: format(responseDate, 'HH:mm dd/MM/yyyy'),
                            response: response.response
                        });
                    });
                    this.responses.push({
                        entityId: element.publisher,
                        responses: element.data?.responses
                    });
                    viewResponses.push({
                        entityName: opfab.utils.escapeHtml(opfab.users.entities.getEntityName(element.publisher)),
                        responses: cardResponses
                    });
                });
            }
            setResponses(viewResponses);
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
