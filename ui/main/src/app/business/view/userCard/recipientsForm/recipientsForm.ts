/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Card} from '@ofModel/card.model';
import {InputFieldName, MultiselectItem, UserCardUIControl} from '../userCard.model';
import {ProcessesService} from 'app/business/services/businessconfig/processes.service';
import {EntitiesService} from 'app/business/services/users/entities.service';
import {RolesEnum} from '@ofModel/roles.model';
import {Utilities} from 'app/business/common/utilities';
import {ConfigService} from 'app/business/services/config.service';
import {EntitiesTree} from '@ofModel/processes.model';
import {Entity} from '@ofModel/entity.model';
import {CurrentUserCardAPI} from 'app/api/currentusercard.api';

export class RecipientsForm {
    private isInCreationMode = true;
    private recipientForInformationVisible = false;
    private recipientVisible = false;
    private selectedRecipients: string[] = [];
    private selectedRecipientsForInformation: string[] = [];
    private useDescriptionFieldForEntityList = false;

    constructor(private userCardUIControl: UserCardUIControl) {
        this.useDescriptionFieldForEntityList = ConfigService.getConfigValue(
            'usercard.useDescriptionFieldForEntityList',
            false
        );
        this.listenForRecipientListSetByTemplate();
        this.listenForRecipientForInformationListSetByTemplate();
        this.listenForSelectRecipients();
        this.listenForSelectRecipientsForInformation();
    }

    private listenForRecipientListSetByTemplate() {
        CurrentUserCardAPI.currentUserCard.setDropdownEntityRecipientList = (recipients) =>
            this.loadRestrictedRecipientList(recipients);
    }
    private loadRestrictedRecipientList(recipients: EntitiesTree[]) {
        this.loadRecipients(EntitiesService.resolveEntities(recipients));
    }

    private loadRecipients(entities: Entity[]) {
        this.userCardUIControl.setRecipientsList(this.buildMultiSelectItems(entities));
        if (this.isInCreationMode) {
            this.userCardUIControl.setSelectedRecipients([]);
        }
    }

    private buildMultiSelectItems(entities: Entity[]): MultiselectItem[] {
        const recipients: MultiselectItem[] = [];
        entities?.forEach((entity) => {
            if (entity.roles?.includes(RolesEnum.CARD_RECEIVER)) {
                const label = this.useDescriptionFieldForEntityList ? entity.description : entity.name || entity.id;
                recipients.push({
                    id: entity.id,
                    label: label
                });
            }
        });
        recipients.sort((a, b) => Utilities.compareObj(a.label, b.label));
        return recipients;
    }

    private listenForRecipientForInformationListSetByTemplate() {
        CurrentUserCardAPI.currentUserCard.setDropdownEntityRecipientForInformationList = (recipients) =>
            this.loadRestrictedRecipientForInformationList(recipients);
    }
    private loadRestrictedRecipientForInformationList(recipients: EntitiesTree[]) {
        this.loadRecipientsForInformation(EntitiesService.resolveEntities(recipients));
    }

    private loadRecipientsForInformation(entities: Entity[]) {
        this.userCardUIControl.setRecipientsForInformationList(this.buildMultiSelectItems(entities));
        if (this.isInCreationMode) {
            this.userCardUIControl.setSelectedRecipientsForInformation([]);
        }
    }

    private listenForSelectRecipients() {
        CurrentUserCardAPI.currentUserCard.setSelectedRecipients = (recipients) => {
            this.setSelectedRecipients(recipients);
            this.userCardUIControl.setSelectedRecipients(recipients);
        };
        CurrentUserCardAPI.currentUserCard.setInitialSelectedRecipients = (recipients) => {
            if (this.isInCreationMode) {
                this.setSelectedRecipients(recipients);
                this.userCardUIControl.setSelectedRecipients(recipients);
            }
        };
    }

    private listenForSelectRecipientsForInformation() {
        CurrentUserCardAPI.currentUserCard.setSelectedRecipientsForInformation = (recipients) => {
            this.setSelectedRecipientsForInformation(recipients);
            this.userCardUIControl.setSelectedRecipientsForInformation(recipients);
        };
        CurrentUserCardAPI.currentUserCard.setInitialSelectedRecipientsForInformation = (recipients) => {
            if (this.isInCreationMode) {
                this.userCardUIControl.setSelectedRecipientsForInformation(recipients);
                this.setSelectedRecipientsForInformation(recipients);
            }
        };
    }

    public setProcessAndState(processId: string, stateId: string, card: Card = undefined) {
        if (card) this.isInCreationMode = false;
        const state = ProcessesService.getProcess(processId).states.get(stateId);
        if (state) {
            this.recipientVisible = state.userCard?.recipientVisible ?? true;
            this.userCardUIControl.setInputVisibility(InputFieldName.Recipients, this.recipientVisible);
            this.recipientForInformationVisible = state.userCard?.recipientForInformationVisible ?? false;
            this.userCardUIControl.setInputVisibility(
                InputFieldName.RecipientsForInformation,
                this.recipientForInformationVisible
            );
        }
        this.loadRecipients(EntitiesService.getEntities());
        this.loadRecipientsForInformation(EntitiesService.getEntities());
        if (card) {
            this.setSelectedRecipientsFromCard(card);
            this.setSelectedRecipientsForInformationFromCard(card);
        }
    }

    private setSelectedRecipientsFromCard(card: Card) {
        const recipients = card.entityRecipients?.filter(
            (recipient) => !card.entityRecipientsForInformation?.includes(recipient)
        );
        this.userCardUIControl.setSelectedRecipients(recipients ?? []);
        this.setSelectedRecipients(recipients ?? []);
    }

    private setSelectedRecipientsForInformationFromCard(card: Card) {
        this.userCardUIControl.setSelectedRecipientsForInformation(card.entityRecipientsForInformation ?? []);
        this.setSelectedRecipientsForInformation(card.entityRecipientsForInformation ?? []);
    }

    public getSelectedRecipients(): string[] {
        return this.selectedRecipients;
    }

    public setSelectedRecipients(selectedRecipients: string[]) {
        this.selectedRecipients = selectedRecipients;
        CurrentUserCardAPI.currentUserCard.selectedEntityRecipients = selectedRecipients;
    }

    public getSelectedRecipientsForInformation(): string[] {
        return this.selectedRecipientsForInformation;
    }

    public setSelectedRecipientsForInformation(selectedRecipientsForInformation: string[]) {
        this.selectedRecipientsForInformation = selectedRecipientsForInformation;
        CurrentUserCardAPI.currentUserCard.selectedEntityForInformationRecipients = selectedRecipientsForInformation;
    }

    public isRecipientVisible(): boolean {
        return this.recipientVisible;
    }

    public isRecipientForInformationVisible(): boolean {
        return this.recipientForInformationVisible;
    }
}
