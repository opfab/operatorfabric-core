/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import GetResponse from "../src/common/server-side/getResponse";
import ReminderService from "../src/domain/application/reminderService";
import {RRuleReminderService} from "../src/domain/application/rruleReminderService";
import {CardOperationType} from "../src/domain/model/card-operation.model";
import CardsReminderOpfabServicesInterface from "../src/domain/server-side/cardsReminderOpfabServicesInterface";
import RemindDatabaseService from "../src/domain/server-side/remindDatabaseService";


export class OpfabServicesInterfaceStub extends CardsReminderOpfabServicesInterface {
    sentReminders: Array<any> = new Array();
    private response = new GetResponse(null,true);

    constructor(private reminderService: ReminderService, private rruleReminderService: RRuleReminderService,private remindDatabaseServiceStub: RemindDatabaseService) {
        super();
    }
    public async sendCardReminder(cardId: string) {
        if (!this.response.isValid()) return this.response;
        this.sentReminders.push(cardId);
      
        // simulate return of the card via event bus
        const cardOperation = {
            number: 1,
            publicationDate: 1,
            card: await this.remindDatabaseServiceStub.getCardByUid('uid1'),
            type: CardOperationType.UPDATE
        };
        const message = {
            content: JSON.stringify(cardOperation)
        };
        await this.reminderService.onMessage(message);
        await this.rruleReminderService.onMessage(message);
        return this.response;
    }

    public clean() {
        this.sentReminders = new Array();
        this.response = new GetResponse(null,true);
    }

    public setResponse(response:GetResponse) {
        this.response = response;
    }

}