/* Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import 'jest';
import * as Logger from '../common/server-side/logger';
import ReminderService from '../domain/application/reminderService';
import {RRuleReminderService} from '../domain/application/rruleReminderService';
import {RRule, TimeSpan, Day, Frequency} from '../domain/model/card.model';
import CardsReminderControl from '../domain/application/cardsReminderControl';
import {CardOperationType} from '../domain/model/card-operation.model';
import {RemindDatabaseServiceStub} from './remindDataBaseServiceStub';
import {OpfabServicesInterfaceStub} from './opfabServicesInterfaceStub';

const logger = Logger.getLogger();
const rruleRemindDatabaseServiceStub = new RemindDatabaseServiceStub();
const remindDatabaseServiceStub = new RemindDatabaseServiceStub();

const reminderService = new ReminderService().setLogger(logger).setDatabaseService(remindDatabaseServiceStub);
const rruleReminderService = new RRuleReminderService()
    .setLogger(logger)
    .setDatabaseService(rruleRemindDatabaseServiceStub);

const opfabServicesInterfaceStub = new OpfabServicesInterfaceStub(
    reminderService,
    rruleReminderService,
    remindDatabaseServiceStub
);

const cardsReminderControl = new CardsReminderControl()
    .setOpfabServicesInterface(opfabServicesInterfaceStub)
    .setRruleReminderService(rruleReminderService)
    .setReminderService(reminderService)
    .setRemindDatabaseService(remindDatabaseServiceStub)
    .setLogger(logger);

function setCurrentTime(dateTime: string): void {
    jest.setSystemTime(new Date(dateTime));
}

async function checkNoReminderIsSent(): Promise<void> {
    await cardsReminderControl.checkCardsReminder();
    expect(opfabServicesInterfaceStub.sentReminders.length).toEqual(0);
    expect(opfabServicesInterfaceStub.sentReminders).toEqual([]);
}

async function checkOneReminderIsSent(cardUid = 'uid1'): Promise<void> {
    await cardsReminderControl.checkCardsReminder();
    expect(opfabServicesInterfaceStub.sentReminders.length).toEqual(1);
    expect(opfabServicesInterfaceStub.sentReminders).toEqual([cardUid]);
    opfabServicesInterfaceStub.clean();
}

async function checkRemindersAreSent(uids: string[]): Promise<void> {
    await cardsReminderControl.checkCardsReminder();
    expect(opfabServicesInterfaceStub.sentReminders).toEqual(uids);
    opfabServicesInterfaceStub.clean();
}

async function sendCard(card): Promise<void> {
    remindDatabaseServiceStub.addCard(card);

    const cardOperation = {
        number: 1,
        publicationDate: 1,
        card,
        type: CardOperationType.ADD
    };

    const message = {
        content: JSON.stringify(cardOperation)
    };
    await reminderService.onMessage(message);
    await rruleReminderService.onMessage(message);
}
function getTestCardWithRecurrence(): any {
    return {
        uid: 'uid1',
        id: 'id1',
        secondsBeforeTimeSpanForReminder: 300,
        rRule: new RRule(
            Frequency.DAILY,
            1,
            1,
            Day.MO,
            [Day.MO, Day.TU, Day.WE, Day.TH, Day.FR, Day.SA, Day.SU],
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
            [2],
            [10],
            [],
            [],
            'Europe/Paris'
        ),
        startDate: new Date('2017-01-01 01:00').valueOf()
    };
}
function getTestCardWithNoRecurrence(): any {
    const startDate = new Date('2017-01-01 02:00').valueOf();
    return {
        uid: 'uid1',
        id: 'id1',
        secondsBeforeTimeSpanForReminder: 300,
        timeSpans: [new TimeSpan(startDate, null)],
        startDate
    };
}

describe('Cards reminder with rrule structure', function () {
    beforeEach(() => {
        opfabServicesInterfaceStub.clean();
        rruleRemindDatabaseServiceStub.clean();

        jest.useFakeTimers();
        setCurrentTime('2017-01-01 01:00');
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    it('GIVEN a card was sent  WHEN current date (02:04) < remind date - secondsBeforeTimeSpanForReminder (02:05) THEN no remind is sent', async function () {
        await sendCard(getTestCardWithRecurrence());
        setCurrentTime('2017-01-01 02:04');
        await checkNoReminderIsSent();
    });

    it('GIVEN a card was sent WHEN current date (02:06) > remind date - secondsBeforeTimeSpanForReminder (02:05) THEN remind is sent', async function () {
        await sendCard(getTestCardWithRecurrence());
        setCurrentTime('2017-01-01 02:06');
        await checkOneReminderIsSent();
    });

    it('GIVEN a card was sent WHEN current date (02:11) > remind date - secondsBeforeTimeSpanForReminder with secondsBeforeTimeSpanForReminder = 0  (02:10) THEN remind is sent', async function () {
        const card = getTestCardWithRecurrence();
        card.secondsBeforeTimeSpanForReminder = 0;
        await sendCard(card);
        setCurrentTime('2017-01-01 02:11');
        await checkOneReminderIsSent();
    });

    it('GIVEN a card was sent WHEN current date (02:06) > remind date +  (02:05) THEN no remind is sent', async function () {
        await sendCard(getTestCardWithRecurrence());
        setCurrentTime('2017-01-01 02:06');
        await checkOneReminderIsSent();
    });

    it('GIVEN two cards were sent WHEN current date is after reminds date THEN two reminds are sent', async function () {
        const card1 = getTestCardWithRecurrence();
        const card2 = getTestCardWithRecurrence();
        card2.id = 'id2';
        card2.uid = 'uid2';
        await sendCard(card1);
        await sendCard(card2);

        setCurrentTime('2017-01-01 02:06');
        await checkRemindersAreSent(['uid1', 'uid2']);
    });

    it('GIVEN reminder service was reset WHEN current date is after reminds date of two cards THEN two reminds are sent', async function () {
        const card1 = getTestCardWithRecurrence();
        const card2 = getTestCardWithRecurrence();
        card2.id = 'id2';
        card2.uid = 'uid2';
        rruleRemindDatabaseServiceStub.addCard(card1);
        rruleRemindDatabaseServiceStub.addCard(card2);
        await cardsReminderControl.resetReminderDatabase();

        setCurrentTime('2017-01-01 02:04');
        await checkNoReminderIsSent();

        setCurrentTime('2017-01-01 02:06');
        await checkRemindersAreSent(['uid1', 'uid2']);
    });

    it('GIVEN a card was sent WHEN remind date > card endDate THEN no remind is sent', async function () {
        const card = getTestCardWithRecurrence();
        card.endDate = new Date('2017-01-01 01:20').valueOf();
        await sendCard(card);

        setCurrentTime('2017-01-01 02:06');
        await checkNoReminderIsSent();
    });

    it('GIVEN a card was sent WHEN remind date < card endDate THEN remind is sent', async function () {
        const card = getTestCardWithRecurrence();
        card.endDate = new Date('2017-01-01 02:20').valueOf();
        await sendCard(card);

        setCurrentTime('2017-01-01 02:06');
        await checkOneReminderIsSent();
    });

    it('GIVEN a card was sent WHEN remind is every day THEN remind is sent the first day and the second day', async function () {
        await sendCard(getTestCardWithRecurrence());

        // First remind
        setCurrentTime('2017-01-01 02:06');
        await checkOneReminderIsSent();

        // No new remind one hour later
        setCurrentTime('2017-01-01 03:06');
        await checkNoReminderIsSent();

        // Second remind the day after
        setCurrentTime('2017-01-02 02:06');
        await checkOneReminderIsSent();
    });

    it('GIVEN a card was sent WHEN second remind date is after end date THEN only one remind is sent', async function () {
        const card = getTestCardWithRecurrence();
        card.endDate = new Date('2017-01-02 01:00').valueOf();
        await sendCard(card);

        // First remind
        setCurrentTime('2017-01-01 02:06');
        await checkOneReminderIsSent();

        // No remind 1 minutes later
        setCurrentTime('2017-01-01 02:07');
        await checkNoReminderIsSent();

        // No remind the day after
        setCurrentTime('2017-01-02 02:06');
        await checkNoReminderIsSent();
    });

    it('GIVEN a card was send WHEN a new card version is sent THEN reminder is updated', async function () {
        await sendCard(getTestCardWithRecurrence());

        setCurrentTime('2017-01-01 02:00');
        await checkNoReminderIsSent();

        const updatedCard = getTestCardWithRecurrence();
        updatedCard.startDate = new Date('2017-01-02 01:00').valueOf();
        updatedCard.uid = '0002';
        await sendCard(updatedCard);

        setCurrentTime('2017-01-01 02:06');
        await checkNoReminderIsSent();

        setCurrentTime('2017-01-02 02:06');
        await checkOneReminderIsSent('0002');
    });

    it('GIVEN a card was sent WHEN secondsBeforeTimeSpanForReminder is not set THEN no reminder is sent', async function () {
        const card = getTestCardWithRecurrence();
        card.secondsBeforeTimeSpanForReminder = null;
        await sendCard(card);

        setCurrentTime('2017-01-01 02:06');
        await checkNoReminderIsSent();
    });

    it('GIVEN a card was sent WHEN secondsBeforeTimeSpanForReminder is set to a negative number THEN no reminder is sent', async function () {
        const card = getTestCardWithRecurrence();
        card.secondsBeforeTimeSpanForReminder = -1;
        await sendCard(card);

        setCurrentTime('2017-01-01 02:06');
        await checkNoReminderIsSent();
    });

    it('GIVEN a card WHEN card is deleted THEN reminder is removed', async function () {
        await sendCard(getTestCardWithRecurrence());
        expect(rruleRemindDatabaseServiceStub.getNbReminder()).toBe(1);

        const cardOperation = {
            cardId: 'uid1',
            card: getTestCardWithRecurrence(),
            type: CardOperationType.DELETE
        };
        const message = {
            content: JSON.stringify(cardOperation)
        };
        await rruleReminderService.onMessage(message);
        expect(rruleRemindDatabaseServiceStub.getNbReminder()).toBe(0);
    });

    it('GIVEN a card is to be reminded WHEN card is not existing in database THEN reminder is removed', async function () {
        await sendCard(getTestCardWithRecurrence());
        expect(rruleRemindDatabaseServiceStub.getNbReminder()).toBe(1);
        rruleRemindDatabaseServiceStub.cleanCards();

        setCurrentTime('2017-01-01 02:06');
        await cardsReminderControl.checkCardsReminder();
        expect(rruleRemindDatabaseServiceStub.getNbReminder()).toBe(0);
    });

    it('GIVEN a card  WHEN card has invalid freq value  THEN no reminder is save', async function () {
        const card = getTestCardWithRecurrence();
        card.rRule.freq = undefined;
        await sendCard(card);
        expect(rruleRemindDatabaseServiceStub.getNbReminder()).toBe(0);
    });
});

describe('Cards reminder with timespans and no recurrence', function () {
    beforeEach(() => {
        opfabServicesInterfaceStub.clean();
        remindDatabaseServiceStub.clean();
        jest.useFakeTimers();
        setCurrentTime('2017-01-01 01:00');
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    it('GIVEN a card was sent WHEN  current date (01:30) < timeSpan startDate - secondsBeforeTimeSpanForReminder (01:55)  THEN no remind is sent', async function () {
        await sendCard(getTestCardWithNoRecurrence());
        setCurrentTime('2017-01-01 01:30');
        await checkNoReminderIsSent();
    });

    it('GIVEN a card was sent WHEN  current date (01:56) > timeSpan startDate - secondsBeforeTimeSpanForReminder (01:55)  THEN remind is sent', async function () {
        await sendCard(getTestCardWithNoRecurrence());
        setCurrentTime('2017-01-01 01:56');
        await checkOneReminderIsSent();
    });

    it('GIVEN two cards were sent WHEN current date is after reminds date THEN two reminds are sent', async function () {
        const card1 = getTestCardWithNoRecurrence();
        const card2 = getTestCardWithNoRecurrence();
        card2.id = 'id2';
        card2.uid = 'uid2';
        await sendCard(card1);
        await sendCard(card2);

        setCurrentTime('2017-01-01 02:06');
        await checkRemindersAreSent(['uid1', 'uid2']);
    });

    it('GIVEN reminder service was reset WHEN current date is after reminds date of two cards THEN two reminds are sent', async function () {
        const card1 = getTestCardWithNoRecurrence();
        const card2 = getTestCardWithNoRecurrence();
        card2.id = 'id2';
        card2.uid = 'uid2';
        remindDatabaseServiceStub.addCard(card1);
        remindDatabaseServiceStub.addCard(card2);
        await cardsReminderControl.resetReminderDatabase();

        setCurrentTime('2017-01-01 01:30');
        await checkNoReminderIsSent();

        setCurrentTime('2017-01-01 01:56');
        await checkRemindersAreSent(['uid1', 'uid2']);
    });

    it('GIVEN a card was sent WHEN remind date > card endDate THEN no remind is sent', async function () {
        const card = getTestCardWithNoRecurrence();
        card.endDate = new Date('2017-01-01 01:20').valueOf();
        await sendCard(card);

        setCurrentTime('2017-01-01 01:56');
        await checkNoReminderIsSent();
    });

    it('GIVEN a card was sent WHEN remind date < card endDate THEN remind is sent', async function () {
        const card = getTestCardWithNoRecurrence();
        card.endDate = new Date('2017-01-01 02:20').valueOf();
        await sendCard(card);

        setCurrentTime('2017-01-01 01:56');
        await checkOneReminderIsSent();
    });

    it('GIVEN a card was sent WHEN remind is every day THEN remind is sent the first day and the second day', async function () {
        const span1 = new Date('2017-01-01 02:00').valueOf();
        const span2 = new Date('2017-01-02 05:00').valueOf();
        const card = getTestCardWithNoRecurrence();
        const timespans = [new TimeSpan(span1, null), new TimeSpan(span2, null)];
        card.timeSpans = timespans;
        await sendCard(card);

        // First remind
        setCurrentTime('2017-01-01 02:00');
        await checkOneReminderIsSent();

        // No new remind one hour later
        setCurrentTime('2017-01-01 03:06');
        await checkNoReminderIsSent();

        // Second remind the day after
        setCurrentTime('2017-01-02 04:58');
        await checkOneReminderIsSent();
    });

    it('GIVEN a card was sent WHEN secondsBeforeTimeSpanForReminder is not set THEN no reminder is sent', async function () {
        const card = getTestCardWithNoRecurrence();
        card.secondsBeforeTimeSpanForReminder = null;
        await sendCard(card);

        setCurrentTime('2017-01-01 02:01');
        await checkNoReminderIsSent();
    });

    it('GIVEN a card was sent WHEN secondsBeforeTimeSpanForReminder is set to a negative number THEN no reminder is sent', async function () {
        const card = getTestCardWithNoRecurrence();
        card.secondsBeforeTimeSpanForReminder = -1;
        await sendCard(card);

        setCurrentTime('2017-01-01 02:01');
        await checkNoReminderIsSent();
    });
});
