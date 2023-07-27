/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

declare const opfab;

export class MessageOrQuestionListCardTemplateView {
    showInputField: Function;


    public getTitle() {
        let title = opfab.currentCard.getCard()?.data?.title;
        if (title) title = opfab.utils.convertSpacesAndNewLinesInHTML(opfab.utils.escapeHtml(title));
        else title = '';
        return title;
    }

    public getMessage() {
        let message = opfab.currentCard.getCard()?.data?.message;
        if (message) message = opfab.utils.convertSpacesAndNewLinesInHTML(opfab.utils.escapeHtml(message));
        else message = '';
        return message;
    }

    public setFunctionToGetResponseInput( getResponseInput: Function) {
        opfab.currentCard.registerFunctionToGetUserResponse(() => {
            const response  = getResponseInput();
            return {valid: true, responseCardData: {agreement: response[0], comment: response[1]}};
        });
    }


    public listenToResponses(setResponses: Function) {
        opfab.currentCard.listenToChildCards((childCards) => {
            const responses = [];
            if (childCards?.forEach && childCards.length > 0) {
                childCards?.forEach((element) => {
                    responses.push({
                        entityName: opfab.users.entities.getEntityName(element.publisher),
                        agreement: element.data?.agreement,
                        comment: element.data?.comment
                    });
                });
            }
            setResponses(responses);
        });
    }

    public listenToInputFieldVisibility(showInputField: Function) {
        this.showInputField = showInputField;
        if (opfab.currentCard.isUserAllowedToRespond() && opfab.currentCard.getCard()?.data.question) this.listenToLock();
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
