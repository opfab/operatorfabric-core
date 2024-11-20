/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Reminder} from '../domain/model/reminder.model';
import RemindDatabaseService from '../domain/server-side/remindDatabaseService';

export class RemindDatabaseServiceStub extends RemindDatabaseService {
    private reminders = new Array<any>();
    private static cards = new Map<string, any>(); // card is static as database is common between reminder and rRuleReminder
    private static simulateError = false;

    public async getItemsToRemindNow(): Promise<any[]> {
        if (RemindDatabaseServiceStub.simulateError) throw new Error('error test');
        const toRemind = this.reminders.filter((reminder) => reminder.timeForReminding <= new Date().valueOf());
        return await Promise.resolve(toRemind);
    }

    public async getAllCardsWithReminder(): Promise<any[]> {
        const toRemind = Array.from(RemindDatabaseServiceStub.cards.values()).filter(
            (card) =>
                card.secondsBeforeTimeSpanForReminder != null &&
                (card.endDate == null || card.endDate >= new Date().valueOf())
        );
        return await Promise.resolve(toRemind);
    }

    public async getReminder(id: string): Promise<any> {
        const res = this.reminders.find((reminder) => reminder.cardId === id);
        return await Promise.resolve(res);
    }

    public async persistReminder(reminder: any): Promise<void> {
        this.reminders.push(reminder);
    }

    public async updateReminder(reminder: Reminder): Promise<void> {
        await this.removeReminder(reminder.cardId);
        this.reminders.push(reminder);
    }

    public async removeReminder(id: string): Promise<void> {
        const toRemove = this.reminders.findIndex((reminder) => reminder.cardId === id);
        this.reminders.splice(toRemove, 1);
    }

    public async getCardByUid(uid: string): Promise<any> {
        const card = Array.from(RemindDatabaseServiceStub.cards.values()).find((card) => card.uid === uid);
        return await Promise.resolve(card);
    }

    public async clearReminders(): Promise<void> {
        if (RemindDatabaseServiceStub.simulateError) throw new Error('error test');
        this.reminders = [];
    }

    public getNbReminder(): number {
        return this.reminders.length;
    }

    public addCard(card): void {
        RemindDatabaseServiceStub.cards.set(card.uid as string, card);
    }

    public setSimulateError(simulateError: boolean): void {
        RemindDatabaseServiceStub.simulateError = simulateError;
    }

    public clean(): void {
        RemindDatabaseServiceStub.simulateError = false;
        this.reminders = [];
        RemindDatabaseServiceStub.cards = new Map();
    }

    public cleanCards(): void {
        RemindDatabaseServiceStub.cards = new Map();
    }
}
