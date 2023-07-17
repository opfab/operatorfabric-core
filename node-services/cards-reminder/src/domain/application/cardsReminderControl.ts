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

    public checkCardsReminder() {
        this.reminderService.getCardsToRemindNow().then(reminders => 

            reminders.forEach(card => {
                this.opfabServicesInterface.sendCardReminder(card.uid).then( resp => {
                    if (resp.isValid()) this.reminderService.setCardHasBeenRemind(card);
                })
            })
        );

        this.rruleReminderService.getCardsToRemindNow().then(rrulReminders =>
            rrulReminders.forEach(card => {
                this.opfabServicesInterface.sendCardReminder(card.uid).then( resp => {
                        if (resp.isValid()) this.rruleReminderService.setCardHasBeenRemind(card);
                    }
                )
            })
        )
    }

    public resetReminderDatabase() {
        this.reminderService.clearReminders();
        this.rruleReminderService.clearReminders();

        this.rruleReminderService.getAllCardsToRemind().then(cardsWithReminders => 

            cardsWithReminders.forEach(card => {
                this.reminderService.addCardReminder(card);
                this.rruleReminderService.addCardReminder(card);
            })
        );

    }

}
