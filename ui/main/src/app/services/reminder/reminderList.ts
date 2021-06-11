/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import { Card } from '@ofModel/card.model';
import { getNextTimeForRepeating } from './reminderUtils';


const MAX_MILLISECONDS_FOR_REMINDING_AFTER_EVENT_STARTS =  60000 * 15; // 15 minutes

export class ReminderList {

    static reminderItem = class {
        constructor(
            public cardUid: string,
            public timeForReminding: number,
            public hasBeenRemind: boolean,
        ) { }
    };

    private reminderList = new Map();
    private userLogin;

    constructor(userLogin: string) {
        this.userLogin = userLogin;
        this.loadRemindersFromLocalStorage();
    }

    public addAReminder(card: Card, startingDate?: number) {
        if (!!card) {
            if ((card.secondsBeforeTimeSpanForReminder===undefined)||(card.secondsBeforeTimeSpanForReminder===null)) return;
            const reminderItem = this.reminderList.get(card.id);
            if (!!reminderItem && (reminderItem.cardUid === card.uid)) return;
            const dateForReminder: number = getNextTimeForRepeating(card, startingDate);
            if (dateForReminder >= 0) {
                this.reminderList.set(card.id,
                    new ReminderList.reminderItem(card.uid, dateForReminder - card.secondsBeforeTimeSpanForReminder * 1000, false));
                console.log(new Date().toISOString(), `Reminder Will remind card ${card.id} at
                         ${new Date(dateForReminder - card.secondsBeforeTimeSpanForReminder * 1000)}`);
                this.persistReminder();
            }
        }
    }

    public hasAReminder(cardId) {
        return this.reminderList.has(cardId);
    }

    public removeAReminder(cardId) {
        this.reminderList.delete(cardId);
        this.persistReminder();
    }

    public getCardIdsToRemindNow(): string[] {
        const cardsIdToRemind = new Array();
        this.reminderList.forEach((reminderItem, cardId) => {
            if ((!reminderItem.hasBeenRemind) && reminderItem.timeForReminding <= new Date().valueOf()) cardsIdToRemind.push(cardId);
        }
        );
        return cardsIdToRemind;
    }

    public setCardHasBeenRemind(card) {
        const reminderItem = this.reminderList.get(card.id);
        if (!!reminderItem) {
            if (!card.timeSpans[0].recurrence) reminderItem.hasBeenRemind = true;
            else this.setNextRemindWhenRecurrenceAndRemindHasBeenDone(card, reminderItem);
            this.persistReminder();

        }
    }

    private setNextRemindWhenRecurrenceAndRemindHasBeenDone(card, reminderItem) {
        const reminderDate: number  = reminderItem.timeForReminding;
        this.removeAReminder(card.id);
        this.addAReminder(card, reminderDate + card.secondsBeforeTimeSpanForReminder
             + MAX_MILLISECONDS_FOR_REMINDING_AFTER_EVENT_STARTS);
    }

    private loadRemindersFromLocalStorage() {
        const list = localStorage.getItem(this.userLogin + '.reminderList');
        const reminderArray = JSON.parse(list);
        if (!!reminderArray) this.reminderList = new Map(reminderArray);
    }

    private persistReminder() {
        localStorage.setItem(this.userLogin + '.reminderList', JSON.stringify(Array.from(this.reminderList)));

    }


}

