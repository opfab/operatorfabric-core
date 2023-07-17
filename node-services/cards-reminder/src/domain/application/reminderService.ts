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

    public static REMINDERS_COLLECTION = "reminders";
    private static MAX_MILLISECONDS_FOR_REMINDING_AFTER_EVENT_STARTS = 60000 * 15; // 15 minutes

    private databaseService: RemindDatabaseService;

    logger: any;


    public setLogger(logger: any) {
        this.logger = logger;
        return this;
    }

    async onMessage(message: any) {
        const cardOperation : CardOperation = JSON.parse(message.content);
        // Hack to fix enumeration value parsing from json
        const type = '' + cardOperation.type;

        if (type === 'ADD' || type === 'UPDATE')
            this.addCardReminder(cardOperation.card);
        else if (type == 'DELETE')
            this.databaseService.removeReminder(cardOperation.cardId);     
    }

    public setDatabaseService(databaseService: RemindDatabaseService) {
        this.databaseService = databaseService;
        return this;
    }

    public async addCardReminder(card: Card, startingDate?: number) {
        if (card) {
            const cardId = card.id? card.id : card._id;
            if (card.secondsBeforeTimeSpanForReminder === undefined || card.secondsBeforeTimeSpanForReminder === null)
                return;
            const reminderItem = await this.databaseService.getReminder(cardId);
            if (reminderItem) {
                if (reminderItem.cardUid === card.uid) {
                    return;
                } else {
                    this.databaseService.removeReminder(cardId);
                }
            }
            
            const dateForReminder: number = getNextTimeForRepeating(card, startingDate);
            if (dateForReminder >= 0) {

                const reminder = new Reminder(
                        cardId,
                        card.uid,
                        dateForReminder - card.secondsBeforeTimeSpanForReminder * 1000,
                        false
                    )


                this.logger.info(
                    `Reminder Will remind card ${cardId} at
                         ${new Date(dateForReminder - card.secondsBeforeTimeSpanForReminder * 1000)}`
                );
                this.databaseService.persistReminder(reminder);
            }
        }
    }

    public async getCardsToRemindNow(): Promise<Card[]> {
        const cardsToRemind = [];
        const reminders =  await this.databaseService.getItemsToRemindNow();

        for(const reminder of reminders) {
            const card = await this.databaseService.getCardByUid(reminder.cardUid);
            if (card) {
                cardsToRemind.push(card);
            } else {
                // the card has been deleted in this case
                this.databaseService.removeReminder(reminder.cardId);
            }
        }
        return cardsToRemind;
    }

    public async setCardHasBeenRemind(card: Card) {
        const reminderItem = await this.databaseService.getReminder(card._id);
        if (reminderItem) {
            if (!card.timeSpans[0].recurrence) {
                reminderItem.hasBeenRemind = true;
                this.databaseService.persistReminder(reminderItem);
            }
            else this.setNextRemindWhenRecurrenceAndRemindHasBeenDone(card, reminderItem);
        }
    }

    private setNextRemindWhenRecurrenceAndRemindHasBeenDone(card: Card, reminderItem: any) {

        const reminderDate: number = reminderItem.timeForReminding;
        this.databaseService.removeReminder(card._id);
        this.addCardReminder(
            card,
            reminderDate + card.secondsBeforeTimeSpanForReminder + ReminderService.MAX_MILLISECONDS_FOR_REMINDING_AFTER_EVENT_STARTS
        );
    }


    public async getAllCardsToRemind(): Promise<Card[]> {
        return this.databaseService.getAllCardsToRemind();
    }

    public clearReminders() {
        this.databaseService.clearReminders();
    }

}