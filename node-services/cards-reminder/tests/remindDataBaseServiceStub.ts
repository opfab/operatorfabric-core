/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import RemindDatabaseService from "../src/domain/server-side/remindDatabaseService";

export class RemindDatabaseServiceStub extends RemindDatabaseService {
    private reminders: Array<any> = new Array();
    private static cards: Map<string,any> = new Map(); // card is static as database is common between reminder and rRuleReminder
    private static simulateError: boolean = false;

    public async getItemsToRemindNow(): Promise<any[]> {
        if (RemindDatabaseServiceStub.simulateError) throw new Error("error test");
        let toRemind = this.reminders.filter(
            (reminder) => reminder.timeForReminding <= new Date().valueOf()
        );
        return Promise.resolve(toRemind);
    }

    public async getAllCardsWithReminder(): Promise<any[]> {
        let toRemind = Array.from(RemindDatabaseServiceStub.cards.values()).filter(
            (card) => card.secondsBeforeTimeSpanForReminder && (!card.endDate || card.endDate >= new Date().valueOf())
        );
        return Promise.resolve(toRemind);
    }

    public getReminder(id: string) {
        const res = this.reminders.find((reminder) => reminder.cardId === id);
        return Promise.resolve(res);
    }

    public async persistReminder(reminder: any) {
        this.reminders.push(reminder);
    }

    public async updateReminder(reminder: any) {
        this.removeReminder(reminder.cardId);
        this.reminders.push(reminder);
    }

    public async removeReminder(id: string) {
        const toRemove = this.reminders.findIndex((reminder) => reminder.cardId === id);
        this.reminders.splice(toRemove, 1);
    }

    public async getCardByUid(uid: string) {
        let card = Array.from(RemindDatabaseServiceStub.cards.values()).find((card) => card.uid === uid);
        return Promise.resolve(card);
    }

    public async clearReminders() {
        if (RemindDatabaseServiceStub.simulateError) throw new Error("error test");
        this.reminders = new Array();
    }

    public getNbReminder() {
        return this.reminders.length;
    }

    public addCard(card) {
        RemindDatabaseServiceStub.cards.set(card.uid,card);
    }

    public setSimulateError(simulateError:boolean) {
        RemindDatabaseServiceStub.simulateError = simulateError;
    }

    public clean() {
        RemindDatabaseServiceStub.simulateError = false;;
        this.reminders = new Array();
        RemindDatabaseServiceStub.cards = new Map();
    }

    public cleanCards() {
        RemindDatabaseServiceStub.cards = new Map();
    }
}
