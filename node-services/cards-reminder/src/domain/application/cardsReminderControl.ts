/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import CardsReminderOpfabServicesInterface from '../server-side/cardsReminderOpfabServicesInterface';

import ReminderService from '../application/reminderService';
import {RRuleReminderService} from './rruleReminderService';
import {Card} from '../model/card.model';
import RemindDatabaseService from '../server-side/remindDatabaseService';

export default class CardsReminderControl {
    private opfabServicesInterface: CardsReminderOpfabServicesInterface;
    private reminderService: ReminderService;
    private rruleReminderService: RRuleReminderService;
    private remindDatabaseService: RemindDatabaseService;
    private logger: any;

    public setLogger(logger: any) {
        this.logger = logger;
        return this;
    }

    public setReminderService(reminderService: ReminderService): this {
        this.reminderService = reminderService;
        return this;
    }

    public setRruleReminderService(rruleReminderService: RRuleReminderService): this {
        this.rruleReminderService = rruleReminderService;
        return this;
    }

    public setOpfabServicesInterface(opfabServicesInterface: CardsReminderOpfabServicesInterface): this {
        this.opfabServicesInterface = opfabServicesInterface;
        return this;
    }

    public setRemindDatabaseService(remindDatabaseService: RemindDatabaseService): this {
        this.remindDatabaseService = remindDatabaseService;
        return this;
    }

    public async checkCardsReminder(): Promise<boolean> {
        const cards = await this.reminderService.getCardsToRemindNow();
        for (const card of cards) {
            this.logger.info(`ReminderControl - Send remind for card ${card.id} (uid=${card.uid})`);
            await this.opfabServicesInterface.sendCardReminder(card.uid);
        }

        const rruleCards = await this.rruleReminderService.getCardsToRemindNow();
        for (const card of rruleCards) {
            this.logger.info(`ReminderControl - Send remind for card ${card.id} (uid=${card.uid})`);
            await this.opfabServicesInterface.sendCardReminder(card.uid);
        }
        return Promise.resolve(true);
    }

    public async resetReminderDatabase(): Promise<boolean> {
        try {
            this.logger.debug('ReminderControl - Clear reminders');
            await this.reminderService.clearReminders();
            await this.rruleReminderService.clearReminders();
            this.logger.debug('ReminderControl - Reminders cleared');
            const cardsWithReminders: Card[] = await this.remindDatabaseService.getAllCardsWithReminder();
            this.logger.debug('ReminderControl - Compute all reminders');
            for (const card of cardsWithReminders) {
                await this.reminderService.addCardReminder(card);
                await this.rruleReminderService.addCardReminder(card);
            }
        } catch (error) {
            this.logger.warn('resetReminder error ' + error);
        }
        return Promise.resolve(true);
    }
}
