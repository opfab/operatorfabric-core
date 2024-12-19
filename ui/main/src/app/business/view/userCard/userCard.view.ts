/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {EditionMode, InputFieldName, UserCardUIControl} from './userCard.model';
import {UserService} from 'app/business/services/users/user.service';
import {PermissionEnum} from '@ofServices/groups/model/PermissionEnum';
import {ProcessStatesForm} from './processStatesForm/processStatesForm';
import {HandlebarsService} from '@ofServices/handlebars/HandlebarsService';
import {ProcessesService} from '@ofServices/processes/ProcessesService';
import {firstValueFrom, map} from 'rxjs';
import {DetailContext} from '@ofServices/handlebars/model/DetailContext.model';
import {DatesForm} from './datesForm/datesForm';
import {SeverityForm} from './severityForm/severityForm';
import {KeepChildCardsForm} from './keepChildCardsForm/keepChildCardsForm';
import {PublisherForm} from './publisherForm/publisherForm';
import {RecipientsForm} from './recipientsForm/recipientsForm';
import {Card, CardWithChildCards} from '@ofModel/card.model';
import {CardAction, Severity} from '@ofModel/light-card.model';
import {CardBuilder} from './cardBuilder/cardBuilder';
import {CardSender} from './cardSender/cardSender';
import {CardService} from 'app/business/services/card/card.service';
import {UserCardTemplateGateway} from 'app/business/templateGateway/userCardTemplateGateway';

/**

!! IMPORTANT !!

This class is the main controller for the user card UI component. It handles interactions with the UI and manages the underlying logic.

It controls the UI via an implementation of the UserCardUIControl interface provided by the UI component.

It manages form initialization and updates using `datesForm`, `processStatesForm`, etc. Forms are used to:
- Set initial values and visibility based on template scripts and configuration.
- Update values and visibility based on user interaction.
- Update values based on template script execution.

A tricky part of the code is the order of the initialization of the fields and the rendering of the template :
Some fields need to be initialized before the template is rendered, and some fields need to be initialized
or reinitialized  after the template is rendered. That is one of the reasons why we have the two methods
initFieldsThatNeedToBeSetBeforeExecutingTemplateScripts and initFieldsThatNeedToBeSetAfterExecutingTemplateScripts.

Another important point is the asynchronous nature of the rendering of the template, we need to wait
for the template rendering and the template scripts execution to complete before calling the next method.

The CardBuilder class is used both to prepare the card and child card to be sent and to get the card with child cards
for preview.

The CardSend is used to send the card and child card to the backend after the card has been built via the CardBuilder
and when the users click on the send button.

All the orchestration of these classes is done in this class, the UI shall only interact with this class
and not directly with the other classes.

 **/

export class UserCardView {
    private cardToSend: Card;
    private childCardToSend: Card;
    private currentStateId: string;
    private currentProcessId: string;
    private editionMode: EditionMode;
    private existingCard: Card;
    private existingChildCards: Card[];
    private datesForm: DatesForm;
    private readonly processStatesForm: ProcessStatesForm;
    private readonly publisherForm: PublisherForm;
    private recipientsForm: RecipientsForm;
    private readonly severityForm: SeverityForm;
    private readonly keepChildCardsForm: KeepChildCardsForm;
    private useCurrentDateForCardStartDate: boolean;

    constructor(private readonly userCardUIControl: UserCardUIControl) {
        this.processStatesForm = new ProcessStatesForm(this.userCardUIControl);
        this.publisherForm = new PublisherForm(this.userCardUIControl);
        this.severityForm = new SeverityForm(this.userCardUIControl);
        this.keepChildCardsForm = new KeepChildCardsForm(this.userCardUIControl);
    }

    async init(existingCardId?: string, editionMode: EditionMode = EditionMode.CREATE) {
        this.editionMode = editionMode;
        if (UserService.hasCurrentUserAnyPermission([PermissionEnum.READONLY])) {
            this.userCardUIControl.setUserNotAllowedToSendCard();
            return;
        }
        if (existingCardId) {
            const existingCardWithChildCards = await firstValueFrom(CardService.loadCard(existingCardId));
            this.existingCard = existingCardWithChildCards?.card;
            this.existingChildCards = existingCardWithChildCards?.childCards;
        }

        this.initUserCardProcessStates();

        if (!this.processStatesForm.hasAtLeastOneStateAllowedToSendCard()) {
            this.userCardUIControl.setUserNotAllowedToSendCard();
            return;
        }
        await this.initUserCardFieldsAndRenderTemplate();
    }

    private initUserCardProcessStates() {
        this.processStatesForm.init(this.existingCard);
    }

    private async initUserCardFieldsAndRenderTemplate() {
        const {processId, stateId} = this.processStatesForm.getSelectedProcessState();
        this.currentProcessId = processId;
        this.currentStateId = stateId;
        UserCardTemplateGateway.initTemplateFunctions();
        UserCardTemplateGateway.init();

        UserCardTemplateGateway.setEditionMode(this.editionMode);
        UserCardTemplateGateway.setState(stateId);
        UserCardTemplateGateway.setProcessId(processId);
        UserCardTemplateGateway.setUserEntityChildCard(
            this.existingChildCards?.find((child) => child.publisher === this.existingCard.publisher)
        );
        this.initFieldsThatNeedToBeSetBeforeExecutingTemplateScripts();
        await this.renderTemplate();
        this.initFieldsThatNeedToBeSetAfterExecutingTemplateScripts();
    }

    private initFieldsThatNeedToBeSetBeforeExecutingTemplateScripts() {
        this.datesForm = new DatesForm(this.userCardUIControl);
        this.datesForm.initDatesBeforeTemplateScriptsExecution(
            this.currentProcessId,
            this.currentStateId,
            this.existingCard,
            this.editionMode
        );
        this.recipientsForm = new RecipientsForm(this.userCardUIControl);
        this.recipientsForm.setProcessAndState(this.currentProcessId, this.currentStateId, this.existingCard);
    }

    private async renderTemplate() {
        const process = ProcessesService.getProcess(this.currentProcessId);
        const templateName = process.states.get(this.currentStateId).userCard?.template;

        if (templateName) {
            this.userCardUIControl.setLoadingTemplateInProgress(true);
            const html = await firstValueFrom(
                HandlebarsService.queryTemplate(this.currentProcessId, process.version, templateName).pipe(
                    map((t) => t(new DetailContext(this.existingCard, null)))
                )
            );
            this.userCardUIControl.setLoadingTemplateInProgress(false);
            await this.userCardUIControl.renderTemplate(html);
        }
    }

    private initFieldsThatNeedToBeSetAfterExecutingTemplateScripts() {
        this.datesForm.initDatesAfterTemplateScriptsExecution();
        this.severityForm.setProcessAndState(this.currentProcessId, this.currentStateId, this.existingCard);
        this.keepChildCardsForm.setValueAndVisibility(
            this.currentProcessId,
            this.currentStateId,
            this.existingCard,
            this.editionMode
        );
        this.publisherForm.setProcessAndState(
            this.currentProcessId,
            this.currentStateId,
            this.existingCard,
            this.editionMode
        );
    }

    public async userClicksOnState(stateId: string) {
        if (stateId === this.currentStateId || stateId == null || stateId === '') return;
        this.processStatesForm.userClicksOnState(stateId);
        await this.initUserCardFieldsAndRenderTemplate();
    }

    public async userClicksOnProcess(processId: string) {
        if (processId === this.currentProcessId || processId == null || processId === '') return;
        this.processStatesForm.userClickOnProcess(processId);
        await this.initUserCardFieldsAndRenderTemplate();
    }

    public async userClicksOnProcessGroup(processGroupId: string) {
        if (
            processGroupId == null ||
            processGroupId === '' ||
            processGroupId === this.processStatesForm.getSelectedProcessGroupId()
        )
            return;
        this.processStatesForm.userClickOnProcessGroup(processGroupId);
        await this.initUserCardFieldsAndRenderTemplate();
    }
    public userSelectsSeverity(severity: Severity) {
        this.severityForm.userSelectsSeverity(severity);
    }
    public userSelectsKeepChildCards(keepChildCards: boolean) {
        this.keepChildCardsForm.userSelectsKeepChildCards(keepChildCards);
    }
    public userSetStartDate(startDate: number) {
        this.datesForm.userSetsDate(InputFieldName.StartDate, startDate);
    }
    public userSetEndDate(endDate: number) {
        this.datesForm.userSetsDate(InputFieldName.EndDate, endDate);
    }
    public userSetLttd(lttd: number) {
        this.datesForm.userSetsDate(InputFieldName.Lttd, lttd);
    }
    public userSetExpirationDate(expirationDate: number) {
        this.datesForm.userSetsDate(InputFieldName.ExpirationDate, expirationDate);
    }
    public userSetPublisher(publisherEntityId: string) {
        this.publisherForm.userSelectsPublisher(publisherEntityId);
    }
    public userSetRecipients(entityRecipientIds: string[]) {
        this.recipientsForm.setSelectedRecipients([...entityRecipientIds]);
    }
    public userSetRecipientsForInformation(entityRecipientsForInformationIds: string[]) {
        this.recipientsForm.setSelectedRecipientsForInformation([...entityRecipientsForInformationIds]);
    }
    public async prepareCardToSend(): Promise<void> {
        const cardBuilder = new CardBuilder();
        cardBuilder.setProcessId(this.currentProcessId);
        cardBuilder.setStateId(this.currentStateId);
        cardBuilder.setProcessVersion(ProcessesService.getProcess(this.currentProcessId).version);
        cardBuilder.setFieldVisible(InputFieldName.Severity, this.severityForm.isSeverityVisible());
        cardBuilder.setFieldVisible(InputFieldName.KeepChildCards, this.keepChildCardsForm.isKeepChildCardsVisible());
        cardBuilder.setFieldVisible(InputFieldName.StartDate, this.datesForm.isDateVisible(InputFieldName.StartDate));
        cardBuilder.setFieldVisible(InputFieldName.EndDate, this.datesForm.isDateVisible(InputFieldName.EndDate));
        cardBuilder.setFieldVisible(InputFieldName.Lttd, this.datesForm.isDateVisible(InputFieldName.Lttd));
        cardBuilder.setFieldVisible(
            InputFieldName.ExpirationDate,
            this.datesForm.isDateVisible(InputFieldName.ExpirationDate)
        );
        cardBuilder.setSeveritySelectedByUser(this.severityForm.getSelectedSeverity());
        cardBuilder.setKeepChildCards(this.keepChildCardsForm.getSelectedKeepChildCards());
        cardBuilder.setStartDate(this.datesForm.getDateValue(InputFieldName.StartDate));
        cardBuilder.setEndDate(this.datesForm.getDateValue(InputFieldName.EndDate));
        cardBuilder.setLttd(this.datesForm.getDateValue(InputFieldName.Lttd));
        cardBuilder.setExpirationDate(this.datesForm.getDateValue(InputFieldName.ExpirationDate));
        cardBuilder.setPublisher(this.publisherForm.getSelectedPublisher());
        cardBuilder.setFieldVisible(InputFieldName.Recipients, this.recipientsForm.isRecipientVisible());
        cardBuilder.setFieldVisible(
            InputFieldName.RecipientsForInformation,
            this.recipientsForm.isRecipientForInformationVisible()
        );
        cardBuilder.setRecipientsSelectedByUser(this.recipientsForm.getSelectedRecipients());
        cardBuilder.setRecipientsForInformationSelectedByUser(
            this.recipientsForm.getSelectedRecipientsForInformation()
        );
        cardBuilder.setExistingCard(this.existingCard, this.editionMode);
        this.cardToSend = await cardBuilder.getCard();
        if (!this.cardToSend) return;
        this.useCurrentDateForCardStartDate = cardBuilder.isStartDateCurrentDate();
        this.childCardToSend = cardBuilder.getCurrentUserChildCard();
    }

    public getCardWithChildCardsForPreview(): CardWithChildCards {
        return {card: this.cardToSend, childCards: this.getChildCardsForPreview()};
    }

    private getChildCardsForPreview(): Card[] {
        const existingChildCards =
            this.editionMode === EditionMode.EDITION && this.cardToSend?.actions?.includes(CardAction.KEEP_CHILD_CARDS)
                ? (this.existingChildCards ?? [])
                : [];
        return this.addCurrentUserChildCardToSend(existingChildCards);
    }

    private addCurrentUserChildCardToSend(childCards: Card[]): Card[] {
        if (this.childCardToSend) {
            const newChildCards = childCards.filter((c) => c.publisher !== this.childCardToSend.publisher);
            newChildCards.push(this.childCardToSend);
            return newChildCards;
        }
        return childCards;
    }

    public async sendCardAncChildCard() {
        await new CardSender().sendCardAndChildCard(
            this.cardToSend,
            this.childCardToSend,
            this.useCurrentDateForCardStartDate
        );
    }
}
