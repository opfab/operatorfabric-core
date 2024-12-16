/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Card, CardCreationReportData, fromCardToCardForPublishing} from '@ofModel/card.model';
import {I18n} from '@ofModel/i18n.model';
import {MessageLevel} from '@ofModel/message.model';
import {ServerResponse, ServerResponseStatus} from 'app/business/server/serverResponse';
import {AlertMessageService} from 'app/business/services/alert-message.service';
import {CardService} from 'app/business/services/card/card.service';
import {firstValueFrom} from 'rxjs';
import {LoggerService as logger} from 'app/services/logs/LoggerService';
import {NotificationDecision} from 'app/services/notifications/NotificationDecision';

export class CardSender {
    public async sendCardAndChildCard(card: Card, childCard?: Card, setCurrentDateForStartDate = false) {
        let cardForPublish = fromCardToCardForPublishing(card);
        if (setCurrentDateForStartDate) {
            cardForPublish = {
                ...cardForPublish,
                startDate: new Date().valueOf()
            };
        }
        NotificationDecision.addSentCard(card.process + '.' + card.processInstanceId);
        const responseFromCardPost = await firstValueFrom(CardService.postCard(cardForPublish));
        if (responseFromCardPost.status !== ServerResponseStatus.OK) {
            this.displayErrorMessageOnUI();
            logger.error(
                `Error while sending card to the back end, status = ${responseFromCardPost.status} message =  ${responseFromCardPost.statusMessage}`
            );
            return;
        }

        if (childCard) {
            const responseFromChildCardPost = await this.sendChildCard(
                childCard,
                responseFromCardPost,
                setCurrentDateForStartDate
            );
            if (responseFromChildCardPost.status !== ServerResponseStatus.OK) {
                this.displayErrorMessageOnUI();
                logger.error(
                    `Error while sending child card to the back end, status = ${responseFromChildCardPost.status} message =  ${responseFromChildCardPost.statusMessage}`
                );
                return;
            }
        }
        this.displaySuccessMessageOnUI();
    }

    private displayErrorMessageOnUI() {
        AlertMessageService.sendAlertMessage({
            message: '',
            level: MessageLevel.ERROR,
            i18n: new I18n('userCard.error.impossibleToSendCard')
        });
    }
    private async sendChildCard(
        childCard: Card,
        responseFromCardPost: ServerResponse<CardCreationReportData>,
        setCurrentDateForStartDate
    ): Promise<ServerResponse<CardCreationReportData>> {
        let cardForPublish = {
            ...fromCardToCardForPublishing(childCard),
            parentCardId: responseFromCardPost.data.id,
            initialParentCardUid: responseFromCardPost.data.uid
        };
        if (setCurrentDateForStartDate) {
            cardForPublish = {
                ...cardForPublish,
                startDate: new Date().valueOf()
            };
        }
        return await firstValueFrom(CardService.postCard(cardForPublish));
    }

    private displaySuccessMessageOnUI() {
        AlertMessageService.sendAlertMessage({
            message: '',
            level: MessageLevel.INFO,
            i18n: new I18n('userCard.cardSendWithNoError')
        });
    }
}
