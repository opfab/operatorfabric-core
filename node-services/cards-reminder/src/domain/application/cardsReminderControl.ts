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

export default class CardsReminderControl {
    private opfabServicesInterface: CardsReminderOpfabServicesInterface;
    private reminderService: ReminderService;
    private rruleReminderService: RRuleReminderService;

    logger: any;

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

    public async checkCardsReminder():Promise<boolean> {
        const cards = await this.reminderService.getCardsToRemindNow();
        for (const card of cards) {
            try {
                const resp = await this.opfabServicesInterface.sendCardReminder(card.uid);
                if (resp.isValid()) await this.reminderService.setCardHasBeenRemind(card);
            } catch (error) {
                this.logger.error('reminderService checkCardsReminder error ' + error);
            }
        }

        const rruleCards = await this.rruleReminderService.getCardsToRemindNow();
        for (const card of rruleCards) {
            try {
                const resp = await this.opfabServicesInterface.sendCardReminder(card.uid);
                if (resp.isValid()) await this.rruleReminderService.setCardHasBeenRemind(card);
            } catch (error) {
                this.logger.error('rruleReminderService checkCardsReminder error ' + error);
            }
        }
        return Promise.resolve(true);
    }

    public resetReminderDatabase() {
        this.reminderService.clearReminders();
        this.rruleReminderService.clearReminders();

        this.rruleReminderService
            .getAllCardsToRemind()
            .then((cardsWithReminders) =>
                cardsWithReminders.forEach((card) => {
                    this.reminderService.addCardReminder(card);
                    this.rruleReminderService.addCardReminder(card);
                })
            )
            .catch((error) => {
                this.logger.error('resetReminderDatabase error ' + error);
            });
    }
}
