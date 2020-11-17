/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import { Card, Recurrence } from '@ofModel/card.model';
import { getNextTimeForRepeating } from './reminderUtils';

export class ReminderList {


    static reminderItem = class {
        constructor(
            public cardUid: string,
            public timeForReminding: number,
            public hasBeenRemind: boolean,
            public recurrence?: Recurrence
        ) { }
    };

    private reminderList = new Map();
    private userLogin;

    constructor(userLogin: string) {
        this.userLogin = userLogin;
        this.loadRemindersFromLocalStorage();
    }

    public addAReminder(card: Card, secondsToRemindBeforeEvent: number) {
        if (!!card) {
            const reminderItem = this.reminderList.get(card.id);
            if (!!reminderItem && (reminderItem.cardUid === card.uid)) return;
            const dateForReminder: number = getNextTimeForRepeating(new Date().valueOf(), card);
            if (dateForReminder >= 0) {
                this.reminderList.set(card.id,
                    new ReminderList.reminderItem(card.uid, dateForReminder - secondsToRemindBeforeEvent * 1000, false));
                console.log(new Date().toISOString(), `Will remind card ${card.id} at
                         ${new Date(dateForReminder - secondsToRemindBeforeEvent * 1000)}`);
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
            if ((!reminderItem.hasBeenRemind) && reminderItem.timeForReminding < new Date().valueOf()) cardsIdToRemind.push(cardId);
        }
        );
        return cardsIdToRemind;
    }

    public setCardHasBeenRemind(cardId) {
        const reminderItem = this.reminderList.get(cardId);
        if (!!reminderItem) {
            reminderItem.hasBeenRemind = true;
            this.persistReminder();
        }
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

