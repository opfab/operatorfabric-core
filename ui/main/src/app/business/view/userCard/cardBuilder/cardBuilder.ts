/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Card, TimeSpan} from '@ofModel/card.model';
import {CardAction, Severity} from '@ofModel/light-card.model';
import {EditionMode, InputFieldName} from '../userCard.model';
import {MessageLevel} from '@ofModel/message.model';
import {AlertMessageService} from 'app/business/services/alert-message.service';
import {LoggerService as logger} from 'app/services/logs/LoggerService';
import {I18n} from '@ofModel/i18n.model';
import {firstValueFrom} from 'rxjs';
import {CardService} from 'app/business/services/card/card.service';
import {Guid} from 'guid-typescript';
import {ProcessesService} from 'app/business/services/businessconfig/processes.service';
import {UserPermissionsService} from 'app/business/services/user-permissions.service';
import {UserService} from 'app/business/services/users/user.service';
import {UserCardTemplateGateway} from 'app/business/templateGateway/userCardTemplateGateway';

export class CardBuilder {
    private card: Card;
    private existingCard: Card;
    private editionMode: EditionMode;
    private endDate: number;
    private expirationDate: number;
    private readonly inputFieldVisibility: Map<InputFieldName, boolean> = new Map();
    private lttd: number;
    private processId: string;
    private processVersion: string;
    private publisher: string;
    private recipientsForInformationSelectedByUser: string[];
    private recipientsSelectedByUser: string[];
    private severity: Severity;
    private keepChildCards: boolean;
    private startDate: number;
    private stateId: string;
    private startDateEqualsToCurrentDate = false;
    private specificCardInformation: any;

    public setEndDate(endDate: number) {
        this.endDate = endDate;
    }
    public setExistingCard(card: Card, editionMode?: EditionMode) {
        this.existingCard = card;
        this.editionMode = editionMode;
    }
    public setExpirationDate(expirationDate: number) {
        this.expirationDate = expirationDate;
    }
    public setFieldVisible(field: InputFieldName, visible: boolean) {
        this.inputFieldVisibility.set(field, visible);
    }
    public setLttd(lttd: number) {
        this.lttd = lttd;
    }
    public setProcessId(processId: string) {
        this.processId = processId;
    }
    public setProcessVersion(processVersion: string) {
        this.processVersion = processVersion;
    }
    public setPublisher(publisher: string) {
        this.publisher = publisher;
    }
    public setRecipientsForInformationSelectedByUser(recipientsForInformationSelectedByUser: string[]) {
        this.recipientsForInformationSelectedByUser = recipientsForInformationSelectedByUser;
    }
    public setRecipientsSelectedByUser(recipientsSelectedByUser: string[]) {
        this.recipientsSelectedByUser = recipientsSelectedByUser;
    }
    public setSeveritySelectedByUser(severity: Severity) {
        this.severity = severity;
    }
    public setKeepChildCards(keepChildCards: boolean) {
        this.keepChildCards = keepChildCards;
    }
    public setStartDate(startDate: number) {
        this.startDate = startDate;
    }
    public setStateId(stateId: string) {
        this.stateId = stateId;
    }

    public async getCard(): Promise<Card> {
        this.specificCardInformation = UserCardTemplateGateway.getSpecificCardInformationFromTemplate();
        if (!this.isSpecificCardInformationValid()) {
            return undefined;
        }
        this.setDateValues();
        if (!this.areDatesValid(this.startDate, this.endDate, this.lttd, this.expirationDate)) {
            return undefined;
        }
        if (!this.inputFieldVisibility.get(InputFieldName.Severity)) {
            this.severity =
                UserCardTemplateGateway.getSpecificCardInformationFromTemplate()?.card?.severity ??
                Severity.INFORMATION;
        }
        let actions = this.specificCardInformation.card.actions ?? undefined;
        let keepChildCardsChoice = actions?.includes(CardAction.KEEP_CHILD_CARDS) ?? this.keepChildCards ?? undefined;

        if (this.inputFieldVisibility.get(InputFieldName.KeepChildCards)) keepChildCardsChoice = this.keepChildCards;

        actions = actions ?? [];

        actions = keepChildCardsChoice
            ? [...new Set([...actions, CardAction.KEEP_CHILD_CARDS])]
            : actions.filter((item) => item !== CardAction.KEEP_CHILD_CARDS);

        const titleTranslated = await this.getTitleTranslated(this.specificCardInformation.card.title);
        const {entityRecipients, entityRecipientsForInformation} = this.getRecipients();
        const card: Card = {
            actions: actions,
            data: this.specificCardInformation.card.data,
            endDate: this.endDate,
            entitiesAllowedToEdit: this.specificCardInformation.card.entitiesAllowedToEdit,
            entitiesAllowedToRespond: this.getEntitiesAllowedToRespond(),
            entitiesRequiredToRespond: this.specificCardInformation.card.entitiesRequiredToRespond,
            entityRecipients,
            entityRecipientsForInformation,
            expirationDate: this.expirationDate,
            externalRecipients: this.specificCardInformation.card.externalRecipients,
            hasBeenAcknowledged: false,
            hasBeenRead: false,
            hasChildCardFromCurrentUserEntity: false,
            id: 'dummyId', // will be set by the backend
            lttd: this.lttd,
            process: this.processId,
            processInstanceId: this.getProcessInstanceId(),
            processVersion: this.processVersion,
            publisher: this.publisher,
            publisherType: 'ENTITY',
            publishDate: null,
            rRule: this.specificCardInformation.card.rRule,
            secondsBeforeTimeSpanForReminder: this.specificCardInformation.card.secondsBeforeTimeSpanForReminder,
            severity: this.severity,
            startDate: this.startDate,
            state: this.stateId,
            summary: this.specificCardInformation.card.summary,
            tags: this.getTags(),
            timeSpans: this.getTimeSpans(),
            title: this.specificCardInformation.card.title,
            titleTranslated: titleTranslated,
            uid: 'dummyUID', // will be set by the backend
            wktGeometry: this.getWktGeometry(),
            wktProjection: this.getWktProjection()
        };
        if (this.specificCardInformation.recurrence)
            logger.warn(
                "Using deprecated field 'specificInformation.recurrence'. Use 'specificInformation.timeSpan' field instead to configure timespans"
            );
        this.card = card;
        return card;
    }

    private isSpecificCardInformationValid(): boolean {
        if (!this.specificCardInformation) {
            logger.error(
                'ERROR : registered method getSpecificCardInformation in template return no information, card cannot be sent'
            );
            this.displayErrorMessage('userCard.error.templateError', undefined);
            return false;
        }

        if (!this.specificCardInformation.valid) {
            this.displayErrorMessage(undefined, this.specificCardInformation.errorMsg);
            return false;
        }

        if (!this.specificCardInformation.card) {
            logger.error(
                'ERROR : registered method getSpecificCardInformation in template return specificInformation with no card field, card cannot be sent'
            );
            this.displayErrorMessage('userCard.error.templateError', undefined);
            return false;
        }

        return true;
    }

    private displayErrorMessage(i18nKey: string, msg: string) {
        AlertMessageService.sendAlertMessage({message: msg, level: MessageLevel.ERROR, i18n: {key: i18nKey}});
    }

    private setDateValues() {
        if (!this.inputFieldVisibility.get(InputFieldName.StartDate)) {
            this.startDate = this.specificCardInformation.card.startDate;
        }
        if (!this.startDate) {
            this.startDate = new Date().valueOf();
            this.startDateEqualsToCurrentDate = true;
        }
        if (!this.inputFieldVisibility.get(InputFieldName.EndDate)) {
            this.endDate = this.specificCardInformation.card.endDate;
        }
        if (!this.inputFieldVisibility.get(InputFieldName.Lttd)) {
            this.lttd = this.specificCardInformation.card.lttd;
        }
        if (!this.inputFieldVisibility.get(InputFieldName.ExpirationDate)) {
            this.expirationDate = this.specificCardInformation.card.expirationDate;
        }
    }

    private areDatesValid(startDate, endDate, lttd, expirationDate): boolean {
        if (endDate && endDate < startDate) {
            this.displayErrorMessage('shared.endDateBeforeStartDate', undefined);
            return false;
        }

        const currentDate = new Date().valueOf();
        if (lttd && (lttd < startDate || lttd <= currentDate)) {
            this.displayErrorMessage('userCard.error.lttdBeforeStartDate', undefined);
            return false;
        }

        if (lttd && endDate && lttd > endDate) {
            this.displayErrorMessage('userCard.error.lttdAfterEndDate', undefined);
            return false;
        }
        if (expirationDate && expirationDate < startDate) {
            this.displayErrorMessage('userCard.error.expirationDateBeforeStartDate', undefined);
            return false;
        }
        return true;
    }

    private async getTitleTranslated(i18n: I18n): Promise<string> {
        if (!i18n?.key) return '';
        const translated: any = await firstValueFrom(
            CardService.postTranslateCardField(this.processId, this.processVersion, i18n)
        );
        return translated.translatedField;
    }

    private getRecipients(): {entityRecipients: string[]; entityRecipientsForInformation: string[]} {
        let recipients = this.getUnionOfEntityRecipientsFromTemplateAndUserSelection();
        let recipientsForInformation = this.getUnionOfEntityRecipientsForInformationFromTemplateAndUserSelection();
        recipientsForInformation = this.removeEntityRecipientForInformationIfPresentInEntityRecipient(
            recipients,
            recipientsForInformation
        );
        recipients = recipients.concat(recipientsForInformation);

        return {entityRecipients: recipients, entityRecipientsForInformation: recipientsForInformation};
    }

    private getUnionOfEntityRecipientsFromTemplateAndUserSelection(): string[] {
        const entityRecipients =
            this.inputFieldVisibility.get(InputFieldName.Recipients) && this.recipientsSelectedByUser
                ? [...this.recipientsSelectedByUser]
                : [];

        if (this.specificCardInformation.card.entityRecipients) {
            this.specificCardInformation.card.entityRecipients.forEach((recipient) => {
                if (!entityRecipients.includes(recipient)) {
                    entityRecipients.push(recipient);
                }
            });
        }
        return entityRecipients;
    }

    private getUnionOfEntityRecipientsForInformationFromTemplateAndUserSelection(): string[] {
        const recipientsForInformation = this.inputFieldVisibility.get(InputFieldName.RecipientsForInformation)
            ? [...this.recipientsForInformationSelectedByUser]
            : [];

        if (this.specificCardInformation.card.entityRecipientsForInformation) {
            this.specificCardInformation.card.entityRecipientsForInformation.forEach((recipient) => {
                if (!recipientsForInformation.includes(recipient)) {
                    recipientsForInformation.push(recipient);
                }
            });
        }
        return recipientsForInformation;
    }

    private removeEntityRecipientForInformationIfPresentInEntityRecipient(
        entityRecipients: string[],
        entityRecipientsForInformation: string[]
    ): string[] {
        return entityRecipientsForInformation.filter((recipient) => !entityRecipients.includes(recipient));
    }

    private getEntitiesAllowedToRespond(): string[] {
        if (ProcessesService.getProcess(this.processId)?.states?.get(this.stateId)?.response) {
            return this.specificCardInformation.card.entitiesAllowedToRespond ?? this.recipientsSelectedByUser;
        }
        return [];
    }

    private getProcessInstanceId(): string {
        if (this.existingCard && this.editionMode === EditionMode.EDITION) return this.existingCard.processInstanceId;
        return Guid.create().toString();
    }
    private getTags(): string[] {
        return this.specificCardInformation.card.tags ?? this.existingCard?.tags;
    }

    private getTimeSpans(): TimeSpan[] {
        if (this.specificCardInformation.recurrence)
            logger.warn(
                "Using deprecated field 'specificInformation.recurrence'. Use 'specificInformation.timeSpan' field instead to configure timespans"
            );
        if (this.specificCardInformation.timeSpans) {
            return this.specificCardInformation.timeSpans?.map((timeSpan) => {
                return new TimeSpan(timeSpan.startDate, timeSpan.endDate, timeSpan.recurrence);
            });
        }
        if (this.specificCardInformation.viewCardInCalendar) {
            return [new TimeSpan(this.startDate, this.endDate, this.specificCardInformation.recurrence)];
        }
        return undefined;
    }

    private getWktGeometry(): string {
        return this.specificCardInformation.card.wktGeometry ?? this.existingCard?.wktGeometry;
    }
    private getWktProjection(): string {
        return this.specificCardInformation.card.wktProjection ?? this.existingCard?.wktProjection;
    }

    public getCurrentUserChildCard(): Card {
        const userCanRespond = UserPermissionsService.isUserEnabledToRespond(
            UserService.getCurrentUserWithPerimeters(),
            this.card,
            ProcessesService.getProcess(this.processId)
        );
        if (this.specificCardInformation.childCard && userCanRespond) {
            return this.buildCurrentUserChildCard(this.specificCardInformation.childCard);
        }
        return undefined;
    }
    private buildCurrentUserChildCard(childCardFromTemplate: Card): Card {
        const publisher = childCardFromTemplate.publisher ?? this.card.publisher;
        const childCard: Card = {
            data: childCardFromTemplate.data,
            title: childCardFromTemplate.title,
            summary: childCardFromTemplate.summary,
            endDate: this.card.endDate,
            entityRecipients: this.card.entityRecipients,
            expirationDate: this.card.expirationDate,
            hasBeenAcknowledged: false,
            hasBeenRead: false,
            hasChildCardFromCurrentUserEntity: false,
            id: '', // will be set by the backend
            publisher,
            publisherType: 'ENTITY',
            process: this.card.process,
            processInstanceId: this.card.processInstanceId + '_' + publisher,
            processVersion: this.card.processVersion,
            publishDate: 0,
            startDate: this.card.startDate,
            state: this.getStateForResponse(childCardFromTemplate),
            severity: Severity.INFORMATION,
            uid: '' // will be set by the backend
        };
        return childCard;
    }

    private getStateForResponse(childCardFromTemplate: Card): string {
        return (
            childCardFromTemplate.state ??
            ProcessesService.getProcess(this.card.process)?.states?.get(this.card.state)?.response?.state
        );
    }

    public isStartDateCurrentDate(): boolean {
        return this.startDateEqualsToCurrentDate;
    }
}
