/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
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
import {HourAndMinutes, RRule, Recurrence, TimeSpan, Day, Frequency} from '../domain/model/card.model';
import CardsReminderControl from '../domain/application/cardsReminderControl';
import {CardOperation, CardOperationType} from '../domain/model/card-operation.model';
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

describe('Cards reminder with rrule structure', function () {
    function getTestCard(): any {
        const startDate = new Date('2017-01-01 01:00').valueOf();
        const rRule = new RRule(
            Frequency.DAILY,
            1,
            1,
            Day.MO,
            [Day.MO, Day.TU, Day.WE, Day.TH, Day.FR, Day.SA, Day.SU],
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
            [12],
            [23],
            [],
            [],
            'Europe/Paris'
        );
        rRule.byhour = [2];
        rRule.byminute = [10];

        return {
            uid: 'uid1',
            id: 'id1',
            secondsBeforeTimeSpanForReminder: 300,
            rRule,
            startDate
        };
    }

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
        await sendCard(getTestCard());
        setCurrentTime('2017-01-01 02:04');
        await checkNoReminderIsSent();
    });

    it('GIVEN a card was sent WHEN current date (02:06) > remind date - secondsBeforeTimeSpanForReminder (02:05) THEN remind is sent', async function () {
        await sendCard(getTestCard());
        setCurrentTime('2017-01-01 02:06');
        await checkOneReminderIsSent();
    });

    it('GIVEN a card was sent WHEN current date (02:11) > remind date - secondsBeforeTimeSpanForReminder with secondsBeforeTimeSpanForReminder = 0  (02:10) THEN remind is sent', async function () {
        const card = getTestCard();
        card.secondsBeforeTimeSpanForReminder = 0;
        await sendCard(card);
        setCurrentTime('2017-01-01 02:11');
        await checkOneReminderIsSent();
    });

    it('GIVEN a card was sent WHEN current date (02:06) > remind date +  (02:05) THEN no remind is sent', async function () {
        await sendCard(getTestCard());
        setCurrentTime('2017-01-01 02:06');
        await checkOneReminderIsSent();
    });

    it('GIVEN two cards were sent WHEN current date is after reminds date THEN two reminds are sent', async function () {
        const card1 = getTestCard();
        const card2 = getTestCard();
        card2.id = 'id2';
        card2.uid = 'uid2';
        await sendCard(card1);
        await sendCard(card2);

        setCurrentTime('2017-01-01 02:06');
        await checkRemindersAreSent(['uid1', 'uid2']);
    });

    it('GIVEN reminder service was reset WHEN current date is after reminds date of two cards THEN two reminds are sent', async function () {
        const card1 = getTestCard();
        const card2 = getTestCard();
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
        const card = getTestCard();
        card.endDate = new Date('2017-01-01 01:20').valueOf();
        await sendCard(card);

        setCurrentTime('2017-01-01 02:06');
        await checkNoReminderIsSent();
    });

    it('GIVEN a card was sent WHEN remind date < card endDate THEN remind is sent', async function () {
        const card = getTestCard();
        card.endDate = new Date('2017-01-01 02:20').valueOf();
        await sendCard(card);

        setCurrentTime('2017-01-01 02:06');
        await checkOneReminderIsSent();
    });

    it('GIVEN a card was sent WHEN remind is every day THEN remind is sent the first day and the second day', async function () {
        await sendCard(getTestCard());

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
        const card = getTestCard();
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
        await sendCard(getTestCard());

        setCurrentTime('2017-01-01 02:00');
        await checkNoReminderIsSent();

        const updatedCard = getTestCard();
        updatedCard.startDate = new Date('2017-01-02 01:00').valueOf();
        updatedCard.uid = '0002';
        await sendCard(updatedCard);

        setCurrentTime('2017-01-01 02:06');
        await checkNoReminderIsSent();

        setCurrentTime('2017-01-02 02:06');
        await checkOneReminderIsSent('0002');
    });

    it('GIVEN a card was sent WHEN secondsBeforeTimeSpanForReminder is not set THEN no reminder is sent', async function () {
        const card = getTestCard();
        card.secondsBeforeTimeSpanForReminder = null;
        await sendCard(card);

        setCurrentTime('2017-01-01 02:06');
        await checkNoReminderIsSent();
    });

    it('GIVEN a card was sent WHEN secondsBeforeTimeSpanForReminder is set to a negative number THEN no reminder is sent', async function () {
        const card = getTestCard();
        card.secondsBeforeTimeSpanForReminder = -1;
        await sendCard(card);

        setCurrentTime('2017-01-01 02:06');
        await checkNoReminderIsSent();
    });

    it('GIVEN a card WHEN card is deleted THEN reminder is removed', async function () {
        await sendCard(getTestCard());
        expect(rruleRemindDatabaseServiceStub.getNbReminder()).toBe(1);

        const cardOperation = {
            cardId: 'uid1',
            card: getTestCard(),
            type: CardOperationType.DELETE
        };
        const message = {
            content: JSON.stringify(cardOperation)
        };
        await rruleReminderService.onMessage(message);
        expect(rruleRemindDatabaseServiceStub.getNbReminder()).toBe(0);
    });

    it('GIVEN a card is to be reminded WHEN card is not existing in database THEN reminder is removed', async function () {
        await sendCard(getTestCard());
        expect(rruleRemindDatabaseServiceStub.getNbReminder()).toBe(1);
        rruleRemindDatabaseServiceStub.cleanCards();

        setCurrentTime('2017-01-01 02:06');
        await cardsReminderControl.checkCardsReminder();
        expect(rruleRemindDatabaseServiceStub.getNbReminder()).toBe(0);
    });

    it('GIVEN a card  WHEN card has invalid freq value  THEN no reminder is save', async function () {
        const card = getTestCard();
        card.rRule.freq = undefined;
        await sendCard(card);
        expect(rruleRemindDatabaseServiceStub.getNbReminder()).toBe(0);
    });
});

describe('Cards reminder with recurrence structure', function () {
    function getTestCard(): any {
        const startDate = new Date('2017-01-01 01:00').valueOf();

        const recurrence = new Recurrence(
            new HourAndMinutes(2, 10),
            [1, 2, 3, 4, 5, 6, 7],
            'Europe/Paris',
            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
        );

        const timespans = [new TimeSpan(startDate, null, recurrence)];

        return {
            uid: 'uid1',
            id: 'id1',
            secondsBeforeTimeSpanForReminder: 300,
            timeSpans: timespans,
            startDate
        };
    }

    beforeEach(() => {
        opfabServicesInterfaceStub.clean();
        remindDatabaseServiceStub.clean();

        jest.useFakeTimers();
        setCurrentTime('2017-01-01 01:00');
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    it('GIVEN a card was sent WHEN current date (02:04) < remind date - secondsBeforeTimeSpanForReminder (02:05) THEN no remind is sent', async function () {
        await sendCard(getTestCard());
        setCurrentTime('2017-01-01 02:04');
        await checkNoReminderIsSent();
    });

    it('GIVEN a card was sent WHEN current date (02:06) > remind date - secondsBeforeTimeSpanForReminder (02:05) THEN remind is sent', async function () {
        await sendCard(getTestCard());
        setCurrentTime('2017-01-01 02:06');
        await checkOneReminderIsSent();
    });

    it('GIVEN a card was sent WHEN current date (02:11) > remind date - secondsBeforeTimeSpanForReminder , with secondsBeforeTimeSpanForReminder = 0 (02:10) THEN remind is sent', async function () {
        const card = getTestCard();
        card.secondsBeforeTimeSpanForReminder = 0;
        await sendCard(card);
        setCurrentTime('2017-01-01 02:11');
        await checkOneReminderIsSent();
    });

    it('GIVEN two cards were sent WHEN current date is after reminds date THEN two reminds are sent', async function () {
        const card1 = getTestCard();
        const card2 = getTestCard();
        card2.id = 'id2';
        card2.uid = 'uid2';
        await sendCard(card1);
        await sendCard(card2);

        setCurrentTime('2017-01-01 02:06');
        await checkRemindersAreSent(['uid1', 'uid2']);
    });

    it('GIVEN reminder service was reset WHEN current date is after reminds date of two cards THEN two reminds are sent', async function () {
        const card1 = getTestCard();
        const card2 = getTestCard();
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
        const card = getTestCard();
        card.endDate = new Date('2017-01-01 01:20').valueOf();
        await sendCard(card);

        setCurrentTime('2017-01-01 02:06');
        await checkNoReminderIsSent();
    });

    it('GIVEN a card was sent WHEN remind date < card endDate THEN remind is sent', async function () {
        const card = getTestCard();
        card.endDate = new Date('2017-01-01 02:20').valueOf();
        await sendCard(card);

        setCurrentTime('2017-01-01 02:06');
        await checkOneReminderIsSent();
    });

    it('GIVEN a card was sent WHEN remind is every day THEN remind is sent the first day and the second day', async function () {
        await sendCard(getTestCard());

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
        const card = getTestCard();
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
        await sendCard(getTestCard());

        setCurrentTime('2017-01-01 02:00');
        await checkNoReminderIsSent();

        const card = getTestCard();
        card.uid = '0002';
        card.timeSpans[0].start = new Date('2017-01-02 01:00').valueOf();

        await sendCard(card);

        setCurrentTime('2017-01-01 02:06');
        await checkNoReminderIsSent();

        setCurrentTime('2017-01-02 02:06');
        await checkOneReminderIsSent('0002');
    });

    it('GIVEN a card WHEN card is deleted THEN reminder is removed', async function () {
        await sendCard(getTestCard());
        expect(remindDatabaseServiceStub.getNbReminder()).toBe(1);

        const cardOperation: CardOperation = {
            cardId: 'uid1',
            card: getTestCard(),
            type: CardOperationType.DELETE
        };
        const message = {
            content: JSON.stringify(cardOperation)
        };
        await reminderService.onMessage(message);
        expect(remindDatabaseServiceStub.getNbReminder()).toBe(0);
    });

    it('GIVEN a card is to be reminded WHEN card is not existing in database THEN reminder is removed', async function () {
        await sendCard(getTestCard());
        expect(remindDatabaseServiceStub.getNbReminder()).toBe(1);
        remindDatabaseServiceStub.cleanCards();

        setCurrentTime('2017-01-01 02:06');
        await cardsReminderControl.checkCardsReminder();
        expect(remindDatabaseServiceStub.getNbReminder()).toBe(0);
    });

    it('GIVEN a card WHEN card has no timezone value  THEN reminder proceed with default value', async function () {
        const card = getTestCard();
        card.timeSpans[0].recurrence.timeZone = undefined;
        await sendCard(card);
        setCurrentTime('2017-01-01 02:06');
        await checkOneReminderIsSent();
    });
});

describe('Cards reminder with timespans and no recurrence', function () {
    function getTestCard(): any {
        const startDate = new Date('2017-01-01 02:00').valueOf();
        const timespans = [new TimeSpan(startDate, null)];
        return {
            uid: 'uid1',
            id: 'id1',
            secondsBeforeTimeSpanForReminder: 300,
            timeSpans: timespans,
            startDate
        };
    }

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
        await sendCard(getTestCard());
        setCurrentTime('2017-01-01 01:30');
        await checkNoReminderIsSent();
    });

    it('GIVEN a card was sent WHEN  current date (01:56) > timeSpan startDate - secondsBeforeTimeSpanForReminder (01:55)  THEN remind is sent', async function () {
        await sendCard(getTestCard());
        setCurrentTime('2017-01-01 01:56');
        await checkOneReminderIsSent();
    });

    it('GIVEN two cards were sent WHEN current date is after reminds date THEN two reminds are sent', async function () {
        const card1 = getTestCard();
        const card2 = getTestCard();
        card2.id = 'id2';
        card2.uid = 'uid2';
        await sendCard(card1);
        await sendCard(card2);

        setCurrentTime('2017-01-01 02:06');
        await checkRemindersAreSent(['uid1', 'uid2']);
    });

    it('GIVEN reminder service was reset WHEN current date is after reminds date of two cards THEN two reminds are sent', async function () {
        const card1 = getTestCard();
        const card2 = getTestCard();
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
        const card = getTestCard();
        card.endDate = new Date('2017-01-01 01:20').valueOf();
        await sendCard(card);

        setCurrentTime('2017-01-01 01:56');
        await checkNoReminderIsSent();
    });

    it('GIVEN a card was sent WHEN remind date < card endDate THEN remind is sent', async function () {
        const card = getTestCard();
        card.endDate = new Date('2017-01-01 02:20').valueOf();
        await sendCard(card);

        setCurrentTime('2017-01-01 01:56');
        await checkOneReminderIsSent();
    });

    it('GIVEN a card was sent WHEN remind is every day THEN remind is sent the first day and the second day', async function () {
        const span1 = new Date('2017-01-01 02:00').valueOf();
        const span2 = new Date('2017-01-02 05:00').valueOf();
        const card = getTestCard();
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
        const card = getTestCard();
        card.secondsBeforeTimeSpanForReminder = null;
        await sendCard(card);

        setCurrentTime('2017-01-01 02:01');
        await checkNoReminderIsSent();
    });

    it('GIVEN a card was sent WHEN secondsBeforeTimeSpanForReminder is set to a negative number THEN no reminder is sent', async function () {
        const card = getTestCard();
        card.secondsBeforeTimeSpanForReminder = -1;
        await sendCard(card);

        setCurrentTime('2017-01-01 02:01');
        await checkNoReminderIsSent();
    });
});
