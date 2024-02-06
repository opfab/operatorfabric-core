/* Copyright (c) 2022-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {ConfigService} from 'app/business/services/config.service';
import {EntitiesService} from 'app/business/services/users/entities.service';
import {EntitiesTree} from '@ofModel/processes.model';
import {Entity} from '@ofModel/entity.model';
import {FormControl, FormGroup} from '@angular/forms';
import {MultiSelectConfig, MultiSelectOption} from '@ofModel/multiselect.model';
import {OpfabAPIService} from 'app/business/services/opfabAPI.service';
import {RolesEnum} from '@ofModel/roles.model';

@Component({
    selector: 'of-usercard-recipients-form',
    templateUrl: './usercard-recipients-form.component.html'
})
export class UserCardRecipientsFormComponent implements OnInit, OnChanges {
    @Input() public userCardConfiguration;
    @Input() public selectedRecipients;
    @Input() public selectedRecipientsForInformation;
    @Input() public recipientForInformationVisible;
    @Input() public editCardMode;

    public recipientForm: FormGroup<{
        userCardRecipients: FormControl<[] | null>;
        userCardRecipientsForInformation: FormControl<[] | null>;
    }>;
    private useDescriptionFieldForEntityList = false;
    public recipientsOptions: Array<MultiSelectOption> = [];
    public recipientsForInformationOptions: Array<MultiSelectOption> = [];
    public multiSelectConfig: MultiSelectConfig = {
        labelKey: 'userCard.filters.recipients',
        sortOptions: true
    };

    public multiSelectConfigForInformation: MultiSelectConfig = {
        labelKey: 'userCard.filters.recipientsForInformation',
        sortOptions: true
    };

    constructor() {
        this.useDescriptionFieldForEntityList = ConfigService.getConfigValue(
            'usercard.useDescriptionFieldForEntityList',
            false
        );
    }

    ngOnInit() {
        this.recipientForm = new FormGroup({
            userCardRecipients: new FormControl([]),
            userCardRecipientsForInformation: new FormControl([])
        });
        this.listenForDropdownRecipientList();
        this.listenForInitialSelectedRecipientList();

        this.listenForDropdownRecipientForInformationList();
        this.listenForInitialSelectedRecipientForInformationList();

        this.listenForSelectedRecipientList();
        this.listenForSelectedRecipientForInformationList();
    }

    ngOnChanges() {
        if (this.userCardConfiguration) {
            this.loadRecipientsOptions();
            this.loadRecipientsForInformationOptions();
        }
    }

    public getSelectedRecipients() {
        return this.recipientForm.value['userCardRecipients'];
    }

    public getSelectedRecipientsForInformation() {
        return this.recipientForm.value['userCardRecipientsForInformation'];
    }

    private loadRecipientsOptions() {
        this.recipientsOptions = [];
        EntitiesService.getEntities().forEach((entity) => {
            if (entity.roles.includes(RolesEnum.CARD_RECEIVER)) {
                this.recipientsOptions.push(new MultiSelectOption(entity.id, this.getEntityLabel(entity)));
            }
        });
    }

    private loadRecipientsForInformationOptions() {
        this.recipientsForInformationOptions = [];
        EntitiesService.getEntities().forEach((entity) => {
            if (entity.roles.includes(RolesEnum.CARD_RECEIVER)) {
                this.recipientsForInformationOptions.push(
                    new MultiSelectOption(entity.id, this.getEntityLabel(entity))
                );
            }
        });
    }

    private loadRestrictedRecipientList(recipients: EntitiesTree[]): void {
        this.recipientsOptions = [];
        EntitiesService.resolveEntities(recipients).forEach((entity) => {
            if (entity.roles.includes(RolesEnum.CARD_RECEIVER)) {
                this.recipientsOptions.push(new MultiSelectOption(entity.id, this.getEntityLabel(entity)));
            }
        });
    }

    private loadRestrictedRecipientForInformationList(recipientsForInformation: EntitiesTree[]): void {
        this.recipientsForInformationOptions = [];
        EntitiesService.resolveEntities(recipientsForInformation).forEach((entity) => {
            if (entity.roles.includes(RolesEnum.CARD_RECEIVER)) {
                this.recipientsForInformationOptions.push(
                    new MultiSelectOption(entity.id, this.getEntityLabel(entity))
                );
            }
        });
    }

    private getEntityLabel(entity: Entity) {
        return this.useDescriptionFieldForEntityList ? entity.description : entity.name;
    }

    private listenForDropdownRecipientList() {
        OpfabAPIService.currentUserCard.setDropdownEntityRecipientList = (recipients) =>
            this.loadRestrictedRecipientList(recipients);
    }

    private listenForInitialSelectedRecipientList() {
        // Set initial recipient list from template only if not in edition mode
        OpfabAPIService.currentUserCard.setInitialSelectedRecipients = (recipients) => {
            if (!this.editCardMode && (!this.selectedRecipients || this.selectedRecipients.length === 0))
                this.selectedRecipients = recipients;
        };
    }

    private listenForDropdownRecipientForInformationList() {
        OpfabAPIService.currentUserCard.setDropdownEntityRecipientForInformationList = (recipients) =>
            this.loadRestrictedRecipientForInformationList(recipients);
    }

    private listenForInitialSelectedRecipientForInformationList() {
        // Set initial recipient for information list from template only if not in edition mode
        OpfabAPIService.currentUserCard.setInitialSelectedRecipientsForInformation = (recipients) => {
            if (
                !this.editCardMode &&
                (!this.selectedRecipientsForInformation || this.selectedRecipientsForInformation.length === 0)
            )
                this.selectedRecipientsForInformation = recipients;
        };
    }

    private listenForSelectedRecipientList() {
        // Set initial recipient list from template only if not in edition mode
        OpfabAPIService.currentUserCard.setSelectedRecipients = (recipients) => {
            this.selectedRecipients = recipients;
        };
    }

    private listenForSelectedRecipientForInformationList() {
        // Set initial recipient list from template only if not in edition mode
        OpfabAPIService.currentUserCard.setSelectedRecipientsForInformation = (recipients) => {
            this.selectedRecipientsForInformation = recipients;
        };
    }

    public recipientChoiceChanged(selected: any) {
        OpfabAPIService.currentUserCard.selectedEntityRecipients = selected;
    }

    public recipientForInformationChoiceChanged(selected: any) {
        OpfabAPIService.currentUserCard.selectedEntityForInformationRecipients = selected;
    }
}
