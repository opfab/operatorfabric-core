/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {ConfigService} from '@ofServices/config.service';
import {EntitiesService} from '@ofServices/entities.service';
import {Recipient} from '@ofModel/processes.model';
import {Entity} from '@ofModel/entity.model';
import {OpfabLoggerService} from '@ofServices/logs/opfab-logger.service';

declare const usercardTemplateGateway: any;
@Component({
    selector: 'of-usercard-recipients-form',
    templateUrl: './usercard-recipients-form.component.html',

})
export class UserCardRecipientsFormComponent implements OnInit , OnChanges {

    @Input() public userCardConfiguration;
    @Input() public initialSelectedRecipients;

    public  recipientForm: FormGroup;
    private useDescriptionFieldForEntityList = false;
    public recipientsOptions = [];
    public dropdownSettings = {
        text: '',
        badgeShowLimit: 30,
        enableSearchFilter: true
    };

    constructor(
        private configService: ConfigService,
        private entitiesService: EntitiesService,
        private opfabLogger: OpfabLoggerService
    ) {
        this.useDescriptionFieldForEntityList = this.configService.getConfigValue('usercard.useDescriptionFieldForEntityList', false);
    }

    ngOnInit() {
        this.recipientForm = new FormGroup({
            recipients: new FormControl([])
        });
        this.listenForDropdownRecipientList();
        this.listenForInitialSelectedRecipientList();
    }

    ngOnChanges() {
        if (this.userCardConfiguration) this.loadRecipientsOptions();
    }

    public getSelectedRecipients() {
        return this.recipientForm.value['recipients'];
    }

    private loadRecipientsOptions() {
        if (!!this.userCardConfiguration.recipientList) {
            this.opfabLogger.info("Use of restricted recipient list option in config.json is deprecated, use method usercardTemplateGateway.setDropdownEntityRecipientList in template ");
            this.loadRestrictedRecipientList(this.userCardConfiguration.recipientList);
        } else {
            this.recipientsOptions = [];
            this.entitiesService.getEntities().forEach(entity =>
                this.recipientsOptions.push({id: entity.id, itemName: this.getEntityLabel(entity)}));
            this.recipientsOptions.sort((a, b) => a.itemName.localeCompare(b.itemName));
        }
    }

    private loadRestrictedRecipientList(recipients: Recipient[]): void {
        this.recipientsOptions = [];
        Array.prototype.forEach.call(recipients, r => {
            if (!!r.levels) {
                r.levels.forEach(l => {
                    this.entitiesService.resolveChildEntitiesByLevel(r.id, l).forEach(entity => {
                        if (!this.recipientsOptions.find(o => o.id === entity.id)) {
                            this.recipientsOptions.push({id: entity.id, itemName: this.getEntityLabel(entity)});
                        }
                    });
                });
            } else {
                if (!this.recipientsOptions.find(o => o.id === r.id)) {
                    const entity = this.entitiesService.getEntities().find(e => e.id === r.id);
                    if (!!entity)
                        this.recipientsOptions.push({id: entity.id, itemName: this.getEntityLabel(entity)});
                    else
                        this.opfabLogger.info('Recipient entity not found : ' + r.id);
                }
            }
        });

        this.recipientsOptions.sort((a, b) => a.itemName.localeCompare(b.itemName));
    }

    private getEntityLabel(entity: Entity) {
        return this.useDescriptionFieldForEntityList ? entity.description : entity.name;
    }

    private listenForDropdownRecipientList() {
        usercardTemplateGateway.setDropdownEntityRecipientList =  (recipients) =>  this.loadRestrictedRecipientList(recipients);
    }


    private listenForInitialSelectedRecipientList() {
        // Set initial recipient list from template only if not in edition mode
        usercardTemplateGateway.setInitialSelectedRecipients =  (recipients) =>  { if (!this.initialSelectedRecipients || this.initialSelectedRecipients.length === 0 ) this.initialSelectedRecipients = recipients};
    }

}
