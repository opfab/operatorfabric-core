/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {ConfigService} from 'app/business/services/config.service';
import {EntitiesService} from 'app/business/services/entities.service';
import {Recipient} from '@ofModel/processes.model';
import {Entity} from '@ofModel/entity.model';
import {OpfabLoggerService} from 'app/business/services/logs/opfab-logger.service';
import {FormControl, FormGroup} from '@angular/forms';
import {MultiSelectConfig, MultiSelectOption} from '@ofModel/multiselect.model';

declare const usercardTemplateGateway: any;
@Component({
    selector: 'of-usercard-recipients-form',
    templateUrl: './usercard-recipients-form.component.html'
})
export class UserCardRecipientsFormComponent implements OnInit, OnChanges {
    @Input() public userCardConfiguration;
    @Input() public initialSelectedRecipients;
    @Input() public initialSelectedRecipientsForInformation;
    @Input() public recipientForInformationVisible;
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

    constructor(
        private configService: ConfigService,
        private entitiesService: EntitiesService,
        private opfabLogger: OpfabLoggerService
    ) {
        this.useDescriptionFieldForEntityList = this.configService.getConfigValue(
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
        this.entitiesService
            .getEntities()
            .forEach((entity) =>
                this.recipientsOptions.push(new MultiSelectOption(entity.id, this.getEntityLabel(entity)))
            );
    }

    private loadRecipientsForInformationOptions() {
        this.recipientsForInformationOptions = [];
        this.entitiesService
            .getEntities()
            .forEach((entity) =>
                this.recipientsForInformationOptions.push(new MultiSelectOption(entity.id, this.getEntityLabel(entity))));
    }

    private loadRestrictedRecipientList(recipients: Recipient[]): void {
        this.recipientsOptions = [];
        recipients.forEach((r) => {
            if (!!r.levels) {
                r.levels.forEach((l) => {
                    this.entitiesService.resolveChildEntitiesByLevel(r.id, l).forEach((entity) => {
                        if (!this.recipientsOptions.find((o) => o.value === entity.id)) {
                            this.recipientsOptions.push(new MultiSelectOption(entity.id, this.getEntityLabel(entity)));
                        }
                    });
                });
            } else {
                if (!this.recipientsOptions.find((o) => o.value === r.id)) {
                    const entity = this.entitiesService.getEntities().find((e) => e.id === r.id);
                    if (!!entity)
                        this.recipientsOptions.push(new MultiSelectOption(entity.id, this.getEntityLabel(entity)));
                    else this.opfabLogger.info('Recipient entity not found : ' + r.id);
                }
            }
        });
    }

    private loadRestrictedRecipientForInformationList(recipientsForInformation: Recipient[]): void {
        this.recipientsForInformationOptions = [];
        recipientsForInformation.forEach((r) => {
            if (!!r.levels) {
                r.levels.forEach((l) => {
                    this.entitiesService.resolveChildEntitiesByLevel(r.id, l).forEach((entity) => {
                        if (!this.recipientsForInformationOptions.find((o) => o.value === entity.id)) {
                            this.recipientsForInformationOptions.push(new MultiSelectOption(entity.id, this.getEntityLabel(entity)));
                        }
                    });
                });
            } else {
                if (!this.recipientsForInformationOptions.find((o) => o.value === r.id)) {
                    const entity = this.entitiesService.getEntities().find((e) => e.id === r.id);
                    if (!!entity)
                        this.recipientsForInformationOptions.push(new MultiSelectOption(entity.id, this.getEntityLabel(entity)));
                    else this.opfabLogger.info('\"Recipient for information\" entity not found : ' + r.id);
                }
            }
        });
    }

    private getEntityLabel(entity: Entity) {
        return this.useDescriptionFieldForEntityList ? entity.description : entity.name;
    }

    private listenForDropdownRecipientList() {
        usercardTemplateGateway.setDropdownEntityRecipientList = (recipients) =>
            this.loadRestrictedRecipientList(recipients);
    }

    private listenForInitialSelectedRecipientList() {
        // Set initial recipient list from template only if not in edition mode
        usercardTemplateGateway.setInitialSelectedRecipients = (recipients) => {
            if (!this.initialSelectedRecipients || this.initialSelectedRecipients.length === 0)
                this.initialSelectedRecipients = recipients;
        };
    }

    private listenForDropdownRecipientForInformationList() {
        usercardTemplateGateway.setDropdownEntityRecipientForInformationList = (recipients) =>
            this.loadRestrictedRecipientForInformationList(recipients);
    }

    private listenForInitialSelectedRecipientForInformationList() {
        // Set initial recipient for information list from template only if not in edition mode
        usercardTemplateGateway.setInitialSelectedRecipientsForInformation = (recipients) => {
            if (!this.initialSelectedRecipientsForInformation || this.initialSelectedRecipientsForInformation.length === 0)
                this.initialSelectedRecipientsForInformation = recipients;
        };
    }

    public recipientChoiceChanged(selected: any) {
        usercardTemplateGateway.selectedEntityRecipients = selected;
    }

    public recipientForInformationChoiceChanged(selected: any) {
        usercardTemplateGateway.selectedEntityRecipientsForInformation = selected;
    }
}
