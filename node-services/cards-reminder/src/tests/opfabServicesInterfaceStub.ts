/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import GetResponse from '../common/server-side/getResponse';
import type ReminderService from '../domain/application/reminderService';
import {type RRuleReminderService} from '../domain/application/rruleReminderService';
import {CardOperationType} from '../domain/model/card-operation.model';
import CardsReminderOpfabServicesInterface from '../domain/server-side/cardsReminderOpfabServicesInterface';
import type RemindDatabaseService from '../domain/server-side/remindDatabaseService';

export class OpfabServicesInterfaceStub extends CardsReminderOpfabServicesInterface {
    sentReminders = new Array<any>();
    private response = new GetResponse(null, true);

    constructor(
        private readonly reminderService: ReminderService,
        private readonly rruleReminderService: RRuleReminderService,
        private readonly remindDatabaseServiceStub: RemindDatabaseService
    ) {
        super();
    }

    public async sendCardReminder(cardId: string): Promise<GetResponse> {
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

    public clean(): void {
        this.sentReminders = [];
        this.response = new GetResponse(null, true);
    }

    public setResponse(response: GetResponse): void {
        this.response = response;
    }
}
