/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


declare const opfab;

export class MessageOrQuestionListUserCardTemplateView {

    
    messageOrQuestionList;
    selectedMessage;

    public getMessage() {
        let message = opfab.currentCard.getCard()?.data?.message;
        if (message) message = opfab.utils.escapeHtml(message);
        else message = '';
        return message;
    }

    public getTitleId() {
        const titleId = opfab.currentCard.getCard()?.data?.id;
        return titleId
    }

    public getSpecificCardInformation(message: string) {
        message = message.trim();
        if (message.length === 0) {
            return {
                valid:false,
                errorMsg : opfab.utils.getTranslation('buildInTemplate.message-or-question-listUserCard.emptyMessage') 
            }
        }

        let title = this.selectedMessage.title.trim();
        let id = this.selectedMessage.id;
        let question = this.selectedMessage.question;
        let severity = 'INFORMATION'
        if (this.selectedMessage.question) {
            severity = 'ACTION'
        }

        let entitiesAllowedToRespond = this.selectedMessage?.possibleRecipients ? this.selectedMessage?.possibleRecipients : "";


        const card = {
		title : {key : "message_or_question_list.title", parameters : {"messageTitle" : title} },
            summary: {key : "message_or_question_list.summary"},
            startDate: new Date().valueOf(),
            data: {
                id: id,
                title: title,
                message: message,
                question: question
            },
            severity: severity,
            entitiesAllowedToRespond: entitiesAllowedToRespond,
        };

        return {
            valid: true,
            card: card
        };
    }

    public async initRecipientsAndMessageList(businessDataName: string) {
        this.messageOrQuestionList = await opfab.businessconfig.businessData.get(businessDataName);

        opfab.currentUserCard.setDropdownEntityRecipientList(this.messageOrQuestionList.possibleRecipients);
        opfab.currentUserCard.setDropdownEntityRecipientForInformationList(this.messageOrQuestionList.possibleRecipients);
        const titlesOptions = [];

        this.messageOrQuestionList.messagesList.forEach( (message) => {
            const option = {
                label: message.title,
                value: message.id
            };
            titlesOptions.push(option);
        })
        return titlesOptions;
    }

    public getMessageOrQuestion(messageId: string) {
        this.messageOrQuestionList.messagesList.forEach( (message) => {
            if (message.id === messageId) {
                this.selectedMessage = message
            }
        })
        return this.selectedMessage;
    }

    public setRecipients(selectedRecipients, selectedRecipientsForInformation) {
        opfab.currentUserCard.setSelectedRecipients(selectedRecipients);
        opfab.currentUserCard.setSelectedRecipientsForInformation(selectedRecipientsForInformation);
    }
    

}
