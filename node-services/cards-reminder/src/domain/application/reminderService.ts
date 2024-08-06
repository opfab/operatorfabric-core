/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
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

    public setLogger(logger: any): this {
        this.logger = logger;
        return this;
    }

    public setDatabaseService(databaseService: RemindDatabaseService): this {
        this.databaseService = databaseService;
        return this;
    }

    async onMessage(message: any): Promise<void> {
        try {
            const cardOperation: CardOperation = JSON.parse(message.content as string);

            if (cardOperation.type === 'ADD' || cardOperation.type === 'UPDATE') {
                this.logger.debug(
                    `Reminder - ADD or UPDATE received from event bus for card ${cardOperation.card.id} (uid=${cardOperation.card.uid})`
                );
                await this.addCardReminder(cardOperation.card);
            } else if (cardOperation.type === 'DELETE' && cardOperation.cardId != null) {
                this.logger.info(`Reminder - Delete reminder for card id=${cardOperation.cardId} if exists...`);
                await this.databaseService.removeReminder(cardOperation.cardId);
            }
        } catch (error) {
            this.logger.warn('Reminder - Error on card operation received ' + error);
        }
    }

    public async addCardReminder(card: Card): Promise<void> {
        if (card != null) {
            if (
                card.secondsBeforeTimeSpanForReminder === undefined ||
                card.secondsBeforeTimeSpanForReminder === null ||
                isNaN(card.secondsBeforeTimeSpanForReminder) ||
                card.secondsBeforeTimeSpanForReminder < 0
            ) {
                this.logger.debug(`Reminder - Card ${card.id} (uid=${card.uid}) is not a card to remind`);
                return;
            }
            const reminderItem = await this.databaseService.getReminder(card.id);
            if (reminderItem != null) {
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
                    ).toISOString()}`
                );
                await this.databaseService.persistReminder(reminder);
            } else
                this.logger.debug(
                    `Reminder - Card ${card.id} (uid=${card.uid}) has no occurrence , no reminder to add`
                );
        }
    }

    private async setNextRemindWhenRecurrenceAndRemindHasBeenDone(card: Card, reminderItem: any): Promise<void> {
        this.logger.debug(`Reminder - Card ${card.id} (uid=${card.uid}) compute the next reminder date`);

        if (card.secondsBeforeTimeSpanForReminder != null) {
            const startingDate: number =
                reminderItem.timeForReminding + card.secondsBeforeTimeSpanForReminder * 1000 + 1;

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
                    ).toISOString()}`
                );
                await this.databaseService.updateReminder(reminder);
                return;
            }
        }
        this.logger.info(`Reminder - Card ${card.id} (uid=${card.uid}) has no new occurrence , remove the reminder`);
        await this.databaseService.removeReminder(card.id);
    }

    public async getCardsToRemindNow(): Promise<Card[]> {
        const cardsToRemind: any[] = [];
        const reminders = await this.databaseService.getItemsToRemindNow();

        for (const reminder of reminders) {
            const card = await this.databaseService.getCardByUid(reminder.cardUid as string);
            if (card != null) {
                cardsToRemind.push(card);
            } else {
                // the card has been deleted in this case
                this.logger.info(
                    `Reminder - card with uid ${reminder.cardUid} does not exist anymore , remove reminder`
                );
                await this.databaseService.removeReminder(reminder.cardId as string);
            }
        }
        return cardsToRemind;
    }

    public async clearReminders(): Promise<void> {
        await this.databaseService.clearReminders();
    }
}
