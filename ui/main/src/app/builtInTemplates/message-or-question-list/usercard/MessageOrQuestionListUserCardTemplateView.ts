/* Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
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
    selectedEmitter;

    public getRichMessage() {
        let message = opfab.currentCard.getCard()?.data?.richMessage;

        if (message) {
            message = opfab.utils.escapeHtml(message);
        } else {
            message = '';
        }
        return message;
    }

    public getSummary() {
        let summary = opfab.currentCard.getCard()?.data?.summary;

        if (summary) {
            summary = opfab.utils.escapeHtml(summary);
        } else {
            summary = '';
        }
        return summary;
    }

    public getTitleId() {
        const titleId = opfab.currentCard.getCard()?.data?.id;
        return titleId;
    }

    public getPublisher() {
        return opfab.currentCard.getCard()?.publisher;
    }

    public getSpecificCardInformation(quillEditor: any, summary: string) {
        summary = summary.trim();

        if (quillEditor.isEmpty()) {
            return {
                valid: false,
                errorMsg: opfab.utils.getTranslation('builtInTemplate.message-or-question-listUserCard.emptyMessage')
            };
        }
        const title = this.selectedMessage.title.trim();
        const id = this.selectedMessage.id;
        const question = this.selectedMessage.question;
        let severity = question ? 'ACTION' : 'INFORMATION';
        if (this.selectedMessage.severity) {
            severity = this.selectedMessage.severity;
        }

        let entitiesAllowedToRespond;

        if (!this.selectedMessage.question) {
            entitiesAllowedToRespond = [];
        }

        const card = {
            title: {key: 'message_or_question_list.title', parameters: {messageTitle: title}},
            summary: {
                key: 'message_or_question_list.summary',
                parameters: {summary: summary.length ? ' : ' + summary : ''}
            },
            startDate: new Date().valueOf(),
            data: {
                id: id,
                title: title,
                summary: summary,
                richMessage: quillEditor.getContents(),
                question: question
            },
            severity: severity,
            entitiesAllowedToRespond: entitiesAllowedToRespond
        };

        return {
            valid: true,
            card: card
        };
    }

    public async initRecipientsAndMessageList(businessDataName: string) {
        this.messageOrQuestionList = await opfab.businessconfig.businessData.get(businessDataName);
        if (this.messageOrQuestionList?.possibleRecipients?.length > 0) {
            opfab.currentUserCard.setDropdownEntityRecipientList(this.messageOrQuestionList.possibleRecipients);
            opfab.currentUserCard.setDropdownEntityRecipientForInformationList(
                this.messageOrQuestionList.possibleRecipients
            );
        }
    }

    public getMessageOrQuestion(messageId: string) {
        this.messageOrQuestionList.messagesList.forEach((message) => {
            if (message.id === messageId) {
                this.selectedMessage = message;
            }
        });
        return this.selectedMessage;
    }

    public setRecipients(selectedRecipients, selectedRecipientsForInformation) {
        opfab.currentUserCard.setSelectedRecipients(selectedRecipients);
        opfab.currentUserCard.setSelectedRecipientsForInformation(selectedRecipientsForInformation);
    }

    getSelectedEmitter() {
        return this.selectedEmitter;
    }

    setSelectedEmitter(entity: string) {
        this.selectedEmitter = entity;
    }

    getMessageListOptions() {
        const titlesOptions = [];
        if (this.messageOrQuestionList)
            this.messageOrQuestionList.messagesList.forEach((message) => {
                if (
                    !message.publishers ||
                    message.publishers.length === 0 ||
                    message.publishers.includes(this.selectedEmitter)
                ) {
                    const option = {
                        label: message.title,
                        value: message.id
                    };
                    titlesOptions.push(option);
                }
            });
        return titlesOptions;
    }

    getInitialSelectedOption() {
        let selectedOption = this.getMessageListOptions()[0].value;
        if (['EDITION', 'COPY'].includes(opfab.currentUserCard.getEditionMode())) {
            const titleId = this.getTitleId();
            if (titleId) selectedOption = titleId;
        }
        return selectedOption;
    }

    setRichTextContent(quillEditor: any, message: any) {
        const delta = message.richMessage
            ? JSON.stringify(message.richMessage)
            : opfab.richTextEditor.getDeltaFromText(opfab.utils.escapeHtml(message.message));
        quillEditor.setContents(delta);
    }
}
