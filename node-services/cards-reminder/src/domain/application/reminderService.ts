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
    private databaseService: RemindDatabaseService;
    private logger: any;

    public setLogger(logger: any) {
        this.logger = logger;
        return this;
    }

    public setDatabaseService(databaseService: RemindDatabaseService) {
        this.databaseService = databaseService;
        return this;
    }

    async onMessage(message: any) {
        try {
            const cardOperation: CardOperation = JSON.parse(message.content);

            if (cardOperation.type === 'ADD' || cardOperation.type === 'UPDATE') {
                this.logger.debug(
                    `Reminder - ADD or UPDATE received from event bus for card ${cardOperation.card.id} (uid=${cardOperation.card.uid})`
                );
                await this.addCardReminder(cardOperation.card);
            } else if (cardOperation.type === 'DELETE') {
                this.logger.debug(`Reminder - DELETE received for card id=${cardOperation.cardId}`);
                await this.databaseService.removeReminder(cardOperation.cardId);
            }
        } catch (error) {
            this.logger.warn('Reminder - Error on card operation received ' + error);
        }
    }

    public async addCardReminder(card: Card) {
        if (card) {
            if (!card.secondsBeforeTimeSpanForReminder) {
                this.logger.debug(`Reminder - Card ${card.id} (uid=${card.uid}) is not a card to remind`);
                return;
            }
            const reminderItem = await this.databaseService.getReminder(card.id);
            if (reminderItem) {
                if (reminderItem.cardUid === card.uid) {
                    // reminder exists , a remind has just occur , we need to set the reminder for next occurrence
                    this.logger.debug(
                        `Reminder - Card ${card.id} (uid=${card.uid}) reminder exist for this uid , it means a remind just occurs , set next remind date`
                    );
                    await this.setNextRemindWhenRecurrenceAndRemindHasBeenDone(card, reminderItem);
                    return;
                } else {
                    // card is updated , remove existing reminder
                    this.logger.debug(
                        `Reminder - Card ${card.id} (uid=${card.uid}) reminder exist with another uid remove it the card has been updated`
                    );
                    await this.databaseService.removeReminder(card.id);
                }
            }

            const dateForReminder: number = getNextTimeForRepeating(card);
            if (dateForReminder >= 0) {
                const reminder = new Reminder(
                    card.id,
                    card.uid,
                    dateForReminder - card.secondsBeforeTimeSpanForReminder * 1000
                );

                this.logger.info(
                    `Reminder - Will remind card ${card.id} (uid=${card.uid}) at ${new Date(
                        dateForReminder - card.secondsBeforeTimeSpanForReminder * 1000
                    )}`
                );
                await this.databaseService.persistReminder(reminder);
            } else
                this.logger.debug(
                    `Reminder - Card ${card.id} (uid=${card.uid}) has no occurrence , no reminder to add`
                );
        }
    }

    private async setNextRemindWhenRecurrenceAndRemindHasBeenDone(card: Card, reminderItem: any) {
        this.logger.debug(`Reminder - Card ${card.id} (uid=${card.uid}) compute the next reminder date`);
        const startingDate = reminderItem.timeForReminding + card.secondsBeforeTimeSpanForReminder * 1000 + 1;

        const dateForReminder: number = getNextTimeForRepeating(card, startingDate);
        if (dateForReminder >= 0) {
            const reminder = new Reminder(
                card.id,
                card.uid,
                dateForReminder - card.secondsBeforeTimeSpanForReminder * 1000
            );
            this.logger.info(
                `Reminder - Will remind card ${card.id} (uid=${card.uid}) at ${new Date(
                    dateForReminder - card.secondsBeforeTimeSpanForReminder * 1000
                )}`
            );
            await this.databaseService.updateReminder(reminder);
        } else {
            this.logger.info(
                `Reminder - Card ${card.id} (uid=${card.uid}) has no new occurrence , remove the reminder`
            );
            this.databaseService.removeReminder(card.id);
        }
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
                this.logger.info(
                    `Reminder - card with uid ${reminder.cardUid} does not exist anymore , remove reminder`
                );
                await this.databaseService.removeReminder(reminder.cardId);
            }
        }
        return cardsToRemind;
    }

    public async clearReminders() {
        await this.databaseService.clearReminders();
    }
}
