/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {EventListener} from '../../common/server-side/eventListener';
import {getNextTimeForRepeating} from '../application/reminderUtils';
import {Card} from '../model/card.model';
import {Reminder} from '../model/reminder.model';
import {CardOperation} from '../model/card-operation.model';
import RemindDatabaseService from '../server-side/remindDatabaseService';

export default class ReminderService implements EventListener {
    public static REMINDERS_COLLECTION = 'reminders';
    private static MAX_MILLISECONDS_FOR_REMINDING_AFTER_EVENT_STARTS = 60000 * 15; // 15 minutes

    private databaseService: RemindDatabaseService;

    logger: any;

    public setLogger(logger: any) {
        this.logger = logger;
        return this;
    }

    async onMessage(message: any) {
        try {
            const cardOperation: CardOperation = JSON.parse(message.content);

            if (cardOperation.type === 'ADD' || cardOperation.type === 'UPDATE')
                await this.addCardReminder(cardOperation.card);
            else if (cardOperation.type === 'DELETE') await this.databaseService.removeReminder(cardOperation.cardId);
        } catch (error) {
            this.logger.error('Error on card operation received ' + error);
        }
    }

    public setDatabaseService(databaseService: RemindDatabaseService) {
        this.databaseService = databaseService;
        return this;
    }

    public async addCardReminder(card: Card, startingDate?: number): Promise<void> {
        if (card) {
            const cardId = card.id ? card.id : card._id;
            if (card.secondsBeforeTimeSpanForReminder === undefined || card.secondsBeforeTimeSpanForReminder === null)
                return;
            const reminderItem = await this.databaseService.getReminder(cardId);
            if (reminderItem) {
                if (reminderItem.cardUid === card.uid) {
                    return;
                } else {
                    await this.databaseService.removeReminder(cardId);
                }
            }

            const dateForReminder: number = getNextTimeForRepeating(card, startingDate);
            if (dateForReminder >= 0) {
                const reminder = new Reminder(
                    cardId,
                    card.uid,
                    dateForReminder - card.secondsBeforeTimeSpanForReminder * 1000,
                    false
                );

                this.logger.info(
                    `Reminder Will remind card ${cardId} at
                         ${new Date(dateForReminder - card.secondsBeforeTimeSpanForReminder * 1000)}`
                );
                await this.databaseService.persistReminder(reminder);
            }
        }
        return Promise.resolve();
    }

    public async getCardsToRemindNow(): Promise<Card[]> {
        const cardsToRemind = [];
        const reminders = await this.databaseService.getItemsToRemindNow();

        for (const reminder of reminders) {
            const card = await this.databaseService.getCardByUid(reminder.cardUid);
            if (card) {
                cardsToRemind.push(card);
            } else {
                // the card has been deleted in this case
                await this.databaseService.removeReminder(reminder.cardId);
            }
        }
        return cardsToRemind;
    }

    public async setCardHasBeenRemind(card: Card) {
        const reminderItem = await this.databaseService.getReminder(card._id);
        if (reminderItem) await this.setNextRemindWhenRecurrenceAndRemindHasBeenDone(card, reminderItem);
    }

    private async setNextRemindWhenRecurrenceAndRemindHasBeenDone(card: Card, reminderItem: any) {
        const reminderDate: number = reminderItem.timeForReminding;
        await this.databaseService.removeReminder(card._id);
        this.addCardReminder(
            card,
            reminderDate +
                card.secondsBeforeTimeSpanForReminder * 1000 +
                ReminderService.MAX_MILLISECONDS_FOR_REMINDING_AFTER_EVENT_STARTS +
                1
        );
    }

    public async clearReminders() {
        await this.databaseService.clearReminders();
    }
}
