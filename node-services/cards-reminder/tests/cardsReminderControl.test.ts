/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import 'jest';

import GetResponse from '../src/common/server-side/getResponse';
import logger from '../src/common/server-side/logger';
import CardsReminderOpfabServicesInterface from '../src/domain/server-side/cardsReminderOpfabServicesInterface';
import RemindDatabaseService from '../src/domain/server-side/remindDatabaseService';
import ReminderService from '../src/domain/application/reminderService';
import {RRuleReminderService} from '../src/domain/application/rruleReminderService';
import {HourAndMinutes, RRule, Recurrence, TimeSpan,Day, Frequency} from '../src/domain/model/card.model';
import CardsReminderControl from '../src/domain/application/cardsReminderControl';
import {CardOperation, CardOperationType} from '../src/domain/model/card-operation.model';

let cards: Array<any> = new Array();

class OpfabServicesInterfaceStub extends CardsReminderOpfabServicesInterface {
    sentReminders: Array<any> = new Array();

    public async sendCardReminder(cardId: string) {
        this.sentReminders.push(cardId);
        return new GetResponse(null, true);
    }
}

class RemindDatabaseServiceStub extends RemindDatabaseService {
    private reminders: Array<any> = new Array();

    public async getItemsToRemindNow(): Promise<any[]> {
        let toRemind = this.reminders.filter(
            (reminder) => !reminder.hasBeenRemind && reminder.timeForReminding <= new Date().valueOf()
        );
        return Promise.resolve(toRemind);
    }

    public async getAllCardsWithReminder(): Promise<any[]> {
        let toRemind = cards.filter(
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

    public async removeReminder(id: string) {
        const toRemove = this.reminders.findIndex((reminder) => reminder.cardId === id);
        this.reminders.splice(toRemove, 1);
    }

    public getCardByUid(uid: string) {
        let card = cards.find((card) => card.uid === uid);
        card._id = card.id;
        return Promise.resolve(card);
    }

    public async clearReminders() {
        this.reminders = new Array();
    }

    public getNbReminder() {
        return this.reminders.length;
    }
}

describe('Cards reminder with rrule structure', function () {
    let opfabServicesInterfaceStub = new OpfabServicesInterfaceStub();
    let rruleRemindDatabaseServiceStub = new RemindDatabaseServiceStub();
    let remindDatabaseServiceStub = new RemindDatabaseServiceStub();

    let reminderService = new ReminderService().setLogger(logger).setDatabaseService(remindDatabaseServiceStub);

    let rruleReminderService = new RRuleReminderService()
        .setLogger(logger)
        .setDatabaseService(rruleRemindDatabaseServiceStub);

    let cardsReminderControl = new CardsReminderControl()
        .setOpfabServicesInterface(opfabServicesInterfaceStub)
        .setRruleReminderService(rruleReminderService)
        .setReminderService(reminderService)
        .setRemindDatabaseService(remindDatabaseServiceStub)
        .setLogger(logger);

    let rRule = new RRule(
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
        'Europe/Paris',
        15
    );

    beforeEach(() => {
        opfabServicesInterfaceStub.sentReminders = new Array();
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2017-01-01 01:00'));
        const startDate = new Date('2017-01-01 01:00').valueOf();
        rRule.byhour = [2];
        rRule.byminute = [10];
        const card = {
            uid: 'uid1',
            id: 'defaultProcess.process1',
            secondsBeforeTimeSpanForReminder: 300,
            rRule: rRule,
            startDate: startDate
        };
        cards = [card];
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    it('it should not remind if current date is before remind date - secondsBeforeTimeSpanForReminder (02:05)', async function () {
        await cardsReminderControl.resetReminderDatabase();

        jest.setSystemTime(new Date('2017-01-01 02:04'));
        await cardsReminderControl.checkCardsReminder();
        expect(opfabServicesInterfaceStub.sentReminders.length).toEqual(0);
        expect(opfabServicesInterfaceStub.sentReminders).toEqual([]);
    });

    it('it should remind if current date is after  remind date - secondsBeforeTimeSpanForReminder (02:05) ', async function () {
        await cardsReminderControl.resetReminderDatabase();

        jest.setSystemTime(new Date('2017-01-01 02:06'));
        await cardsReminderControl.checkCardsReminder();
        expect(opfabServicesInterfaceStub.sentReminders.length).toEqual(1);
        expect(opfabServicesInterfaceStub.sentReminders).toEqual(['uid1']);
    });

    it('it should not remind if remind date is after end date ', async function () {
        cards[0].endDate = new Date('2017-01-01 01:20').valueOf();
        await cardsReminderControl.resetReminderDatabase();

        jest.setSystemTime(new Date('2017-01-01 02:06'));
        await cardsReminderControl.checkCardsReminder();
        expect(opfabServicesInterfaceStub.sentReminders.length).toEqual(0);
        expect(opfabServicesInterfaceStub.sentReminders).toEqual([]);
    });

    it('it should remind if remind date is before end date ', async function () {
        cards[0].endDate = new Date('2017-01-01 02:20').valueOf();
        await cardsReminderControl.resetReminderDatabase();

        jest.setSystemTime(new Date('2017-01-01 02:06'));
        await cardsReminderControl.checkCardsReminder();
        expect(opfabServicesInterfaceStub.sentReminders.length).toEqual(1);
        expect(opfabServicesInterfaceStub.sentReminders).toEqual(['uid1']);
    });

    it('it should send the card the first day and the second day', async function () {
        await cardsReminderControl.resetReminderDatabase();

        // First remind
        jest.setSystemTime(new Date('2017-01-01 02:06'));
        await cardsReminderControl.checkCardsReminder();
        expect(opfabServicesInterfaceStub.sentReminders.length).toEqual(1);
        expect(opfabServicesInterfaceStub.sentReminders).toEqual(['uid1']);

        // No new remind one hour later
        jest.setSystemTime(new Date('2017-01-01 03:06'));
        await cardsReminderControl.checkCardsReminder();
        expect(opfabServicesInterfaceStub.sentReminders.length).toEqual(1);
        expect(opfabServicesInterfaceStub.sentReminders).toEqual(['uid1']);

        // Second remind the day after
        jest.setSystemTime(new Date('2017-01-02 02:06'));
        await cardsReminderControl.checkCardsReminder();
        expect(opfabServicesInterfaceStub.sentReminders.length).toEqual(2);
        expect(opfabServicesInterfaceStub.sentReminders).toEqual(['uid1', 'uid1']);
    });



    it('it should take into account card update received via Event Bus ', async function () {
        const cardOperation = {
            number: 1,
            publicationDate: 1,
            card: cards[0],
            type: 'ADD'
        };
        const message = {
            content: JSON.stringify(cardOperation)
        };

        await rruleReminderService.onMessage(message);

        jest.setSystemTime(new Date('2017-01-01 02:00'));
        await cardsReminderControl.checkCardsReminder();
        expect(opfabServicesInterfaceStub.sentReminders.length).toEqual(0);
        expect(opfabServicesInterfaceStub.sentReminders).toEqual([]);

        cards[0].startDate = new Date('2017-01-02 01:00').valueOf();
        cards[0].uid = '0002';
        const cardOperation2 = {
            number: 1,
            publicationDate: 1,
            card: cards[0],
            type: CardOperationType.ADD
        }

        const message2 = {
            content: JSON.stringify(cardOperation2)
        };
        await rruleReminderService.onMessage(message2);

        jest.setSystemTime(new Date('2017-01-01 02:06'));
        await cardsReminderControl.checkCardsReminder();
        expect(opfabServicesInterfaceStub.sentReminders.length).toEqual(0);
        expect(opfabServicesInterfaceStub.sentReminders).toEqual([]);

        jest.setSystemTime(new Date('2017-01-02 02:06'));
        await cardsReminderControl.checkCardsReminder();
        expect(opfabServicesInterfaceStub.sentReminders.length).toEqual(1);
        expect(opfabServicesInterfaceStub.sentReminders).toEqual(['0002']);
    });

   it('it should not remind if secondsBeforeTimeSpanForReminder is null ', async function () {
        cards[0].secondsBeforeTimeSpanForReminder = null;
        const cardOperation = {
            card: cards[0],
            type: CardOperationType.ADD
        };
        const message = {
            content: JSON.stringify(cardOperation)
        };
        await rruleReminderService.onMessage(message);


        jest.setSystemTime(new Date('2017-01-01 02:06'));
        await cardsReminderControl.checkCardsReminder();
        expect(opfabServicesInterfaceStub.sentReminders.length).toEqual(0);
        expect(opfabServicesInterfaceStub.sentReminders).toEqual([]);
    });

    
    it('it should remove reminder when card is deleted ', async function () {

        await cardsReminderControl.resetReminderDatabase();
        expect(rruleRemindDatabaseServiceStub.getNbReminder()).toBe(1);

        const cardOperation = {
            card: cards[0],
            type: CardOperationType.DELETE
        };
        const message = {
            content: JSON.stringify(cardOperation)
        };
        await rruleReminderService.onMessage(message);
        expect(rruleRemindDatabaseServiceStub.getNbReminder()).toBe(0);
        
    });

});

describe('Cards reminder with recurrence structure', function () {
    let opfabServicesInterfaceStub = new OpfabServicesInterfaceStub();
    let rruleRemindDatabaseServiceStub = new RemindDatabaseServiceStub();
    let remindDatabaseServiceStub = new RemindDatabaseServiceStub();

    let reminderService = new ReminderService().setLogger(logger).setDatabaseService(remindDatabaseServiceStub);

    let rruleReminderService = new RRuleReminderService()
        .setLogger(logger)
        .setDatabaseService(rruleRemindDatabaseServiceStub);

    let cardsReminderControl = new CardsReminderControl()
        .setOpfabServicesInterface(opfabServicesInterfaceStub)
        .setRruleReminderService(rruleReminderService)
        .setReminderService(reminderService)
        .setRemindDatabaseService(remindDatabaseServiceStub)
        .setLogger(logger);

    let recurrence = new Recurrence(
        new HourAndMinutes(2, 10),
        [1, 2, 3, 4, 5, 6, 7],
        'Europe/Paris',
        15,
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    );

    beforeEach(() => {
        opfabServicesInterfaceStub.sentReminders = new Array();
        cards = new Array();

        jest.useFakeTimers();
        jest.setSystemTime(new Date('2017-01-01 01:00'));

        const startDate = new Date('2017-01-01 01:00').valueOf();

        let timespans = [new TimeSpan(startDate, null, recurrence)];

        const card = {
            uid: 'uid1',
            id: 'defaultProcess.process2',
            secondsBeforeTimeSpanForReminder: 300,
            timeSpans: timespans,
            startDate: startDate
        };

        cards = [card];
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    it('it should not remind if current date is before remind date - secondsBeforeTimeSpanForReminder (02:05)', async function () {
        await cardsReminderControl.resetReminderDatabase();

        jest.setSystemTime(new Date('2017-01-01 02:04'));
        await cardsReminderControl.checkCardsReminder();
        expect(opfabServicesInterfaceStub.sentReminders.length).toEqual(0);
        expect(opfabServicesInterfaceStub.sentReminders).toEqual([]);
    });

    it('it should remind if current date is after  remind date - secondsBeforeTimeSpanForReminder (02:05)', async function () {
        await cardsReminderControl.resetReminderDatabase();

        jest.setSystemTime(new Date('2017-01-01 02:06'));
        await cardsReminderControl.checkCardsReminder();
        expect(opfabServicesInterfaceStub.sentReminders.length).toEqual(1);
        expect(opfabServicesInterfaceStub.sentReminders).toEqual(['uid1']);
    });


    it('it should not remind if remind date is after end date ', async function () {
        cards[0].endDate = new Date('2017-01-01 01:20').valueOf();
        await cardsReminderControl.resetReminderDatabase();

        jest.setSystemTime(new Date('2017-01-01 02:06'));
        await cardsReminderControl.checkCardsReminder();
        expect(opfabServicesInterfaceStub.sentReminders.length).toEqual(0);
        expect(opfabServicesInterfaceStub.sentReminders).toEqual([]);
    });

    it('it should remind if remind date is before end date ', async function () {
        cards[0].endDate = new Date('2017-01-01 02:20').valueOf();
        await cardsReminderControl.resetReminderDatabase();

        jest.setSystemTime(new Date('2017-01-01 02:06'));
        await cardsReminderControl.checkCardsReminder();
        expect(opfabServicesInterfaceStub.sentReminders.length).toEqual(1);
        expect(opfabServicesInterfaceStub.sentReminders).toEqual(['uid1']);
    });

    it('it should send the card the first day and the second day', async function () {
        await cardsReminderControl.resetReminderDatabase();

        // First remind
        jest.setSystemTime(new Date('2017-01-01 02:06'));
        await cardsReminderControl.checkCardsReminder();
        expect(opfabServicesInterfaceStub.sentReminders.length).toEqual(1);
        expect(opfabServicesInterfaceStub.sentReminders).toEqual(['uid1']);

        // No new remind one hour later
        jest.setSystemTime(new Date('2017-01-01 03:06'));
        await cardsReminderControl.checkCardsReminder();
        expect(opfabServicesInterfaceStub.sentReminders.length).toEqual(1);
        expect(opfabServicesInterfaceStub.sentReminders).toEqual(['uid1']);

        // Second remind the day after
        jest.setSystemTime(new Date('2017-01-02 02:06'));
        await cardsReminderControl.checkCardsReminder();
        expect(opfabServicesInterfaceStub.sentReminders.length).toEqual(2);
        expect(opfabServicesInterfaceStub.sentReminders).toEqual(['uid1', 'uid1']);
    });

    it('it should take into account card update received via Event Bus ', async function () {
        const cardOperation = {
            number: 1,
            publicationDate: 1,
            card: cards[0],
            type: CardOperationType.ADD
        };
        const message = {
            content: JSON.stringify(cardOperation)
        };

        await reminderService.onMessage(message);

        jest.setSystemTime(new Date('2017-01-01 02:00'));
        await cardsReminderControl.checkCardsReminder();
        expect(opfabServicesInterfaceStub.sentReminders.length).toEqual(0);
        expect(opfabServicesInterfaceStub.sentReminders).toEqual([]);

        cards[0].timeSpans =  [new TimeSpan(new Date('2017-01-02 01:00').valueOf(), null, recurrence)];
        cards[0].uid = '0002';
        const cardOperation2 = {
            number: 1,
            publicationDate: 1,
            card: cards[0],
            type: CardOperationType.ADD
        }

        const message2 = {
            content: JSON.stringify(cardOperation2)
        };
        await reminderService.onMessage(message2);

        jest.setSystemTime(new Date('2017-01-01 02:06'));
        await cardsReminderControl.checkCardsReminder();
        expect(opfabServicesInterfaceStub.sentReminders.length).toEqual(0);
        expect(opfabServicesInterfaceStub.sentReminders).toEqual([]);

        jest.setSystemTime(new Date('2017-01-02 02:06'));
        await cardsReminderControl.checkCardsReminder();
        expect(opfabServicesInterfaceStub.sentReminders.length).toEqual(1);
        expect(opfabServicesInterfaceStub.sentReminders).toEqual(['0002']);
    });

    it('it should remove reminder when card is deleted ', async function () {

        await cardsReminderControl.resetReminderDatabase();
        expect(remindDatabaseServiceStub.getNbReminder()).toBe(1);

        const cardOperation: CardOperation = {
            card: cards[0],
            type: CardOperationType.DELETE
        };
        const message = {
            content: JSON.stringify(cardOperation)
        };
        await reminderService.onMessage(message);
        expect(remindDatabaseServiceStub.getNbReminder()).toBe(0);
        
    });

});

describe('Cards reminder with timespans and no recurrence', function () {
    let opfabServicesInterfaceStub = new OpfabServicesInterfaceStub();
    let rruleRemindDatabaseServiceStub = new RemindDatabaseServiceStub();
    let remindDatabaseServiceStub = new RemindDatabaseServiceStub();

    let reminderService = new ReminderService().setLogger(logger).setDatabaseService(remindDatabaseServiceStub);

    let rruleReminderService = new RRuleReminderService()
        .setLogger(logger)
        .setDatabaseService(rruleRemindDatabaseServiceStub);

    let cardsReminderControl = new CardsReminderControl()
        .setOpfabServicesInterface(opfabServicesInterfaceStub)
        .setRruleReminderService(rruleReminderService)
        .setReminderService(reminderService)
        .setRemindDatabaseService(remindDatabaseServiceStub)
        .setLogger(logger);

    beforeEach(() => {
        opfabServicesInterfaceStub.sentReminders = new Array();
        cards = new Array();

        jest.useFakeTimers();
        jest.setSystemTime(new Date('2017-01-01 01:00'));

        const startDate = new Date('2017-01-01 02:00').valueOf();

        const timespans = [new TimeSpan(startDate, null)];

        const card = {
            uid: 'uid1',
            id: 'defaultProcess.process2',
            secondsBeforeTimeSpanForReminder: 300,
            timeSpans: timespans,
            startDate: startDate,
        };

        cards = [card];
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    it('it should not remind if current date is before timespan startDate - secondsBeforeTimeSpanForReminder', async function () {
        await cardsReminderControl.resetReminderDatabase();

        // No remind
        jest.setSystemTime(new Date('2017-01-01 01:30'));
        await cardsReminderControl.checkCardsReminder();
        expect(opfabServicesInterfaceStub.sentReminders.length).toEqual(0);
        expect(opfabServicesInterfaceStub.sentReminders).toEqual([]);
    });

    it('it should remind if current date is after   timespan startDate  - secondsBeforeTimeSpanForReminder ', async function () {
        await cardsReminderControl.resetReminderDatabase();

        jest.setSystemTime(new Date('2017-01-01 01:56'));
        await cardsReminderControl.checkCardsReminder();
        expect(opfabServicesInterfaceStub.sentReminders.length).toEqual(1);
        expect(opfabServicesInterfaceStub.sentReminders).toEqual(['uid1']);
    });

    it('it should not remind if time span is after end date ', async function () {
        cards[0].endDate = new Date('2017-01-01 01:20').valueOf();
        await cardsReminderControl.resetReminderDatabase();

        jest.setSystemTime(new Date('2017-01-01 01:56'));
        await cardsReminderControl.checkCardsReminder();
        expect(opfabServicesInterfaceStub.sentReminders.length).toEqual(0);
        expect(opfabServicesInterfaceStub.sentReminders).toEqual([]);
    });

    it('it should remind if time span  is before end date ', async function () {
        cards[0].endDate = new Date('2017-01-01 02:20').valueOf();
        await cardsReminderControl.resetReminderDatabase();

        jest.setSystemTime(new Date('2017-01-01 01:56'));
        await cardsReminderControl.checkCardsReminder();
        expect(opfabServicesInterfaceStub.sentReminders.length).toEqual(1);
        expect(opfabServicesInterfaceStub.sentReminders).toEqual(['uid1']);
    });

    it('it should send the card the first day and the second day', async function () {
        const span1 = new Date('2017-01-01 02:00').valueOf();
        const span2 = new Date('2017-01-02 05:00').valueOf();

        const timespans = [new TimeSpan(span1, null), new TimeSpan(span2, null)];
        cards[0].timeSpans = timespans;

        await cardsReminderControl.resetReminderDatabase();

        // First remind
        jest.setSystemTime(new Date('2017-01-01 02:00'));
        await cardsReminderControl.checkCardsReminder();
        expect(opfabServicesInterfaceStub.sentReminders.length).toEqual(1);
        expect(opfabServicesInterfaceStub.sentReminders).toEqual(['uid1']);

        // No new remind one hour later
        jest.setSystemTime(new Date('2017-01-01 03:06'));
        await cardsReminderControl.checkCardsReminder();
        expect(opfabServicesInterfaceStub.sentReminders.length).toEqual(1);
        expect(opfabServicesInterfaceStub.sentReminders).toEqual(['uid1']);

        // Second remind the day after
        jest.setSystemTime(new Date('2017-01-02 04:58'));
        await cardsReminderControl.checkCardsReminder();
        expect(opfabServicesInterfaceStub.sentReminders.length).toEqual(2);
        expect(opfabServicesInterfaceStub.sentReminders).toEqual(['uid1', 'uid1']);
    });

    it('it should remind when card came via Event Bus', async function () {
 
        const cardOperation = {
            number: 1,
            publicationDate: 1,
            card: cards[0],
            type: 'ADD'
        };
        const message = {
            content: JSON.stringify(cardOperation)
        };
        await reminderService.onMessage(message);

        jest.setSystemTime(new Date('2017-01-01 01:12'));
        await cardsReminderControl.checkCardsReminder();
        expect(opfabServicesInterfaceStub.sentReminders.length).toEqual(0);
        expect(opfabServicesInterfaceStub.sentReminders).toEqual([]);

        jest.setSystemTime(new Date('2017-01-01 01:56'));
        await cardsReminderControl.checkCardsReminder();
        expect(opfabServicesInterfaceStub.sentReminders.length).toEqual(1);
        expect(opfabServicesInterfaceStub.sentReminders).toEqual(['uid1']);
    });


    it('it should not remind if secondsBeforeTimeSpanForReminder is null ', async function () {
        cards[0].secondsBeforeTimeSpanForReminder = null;
        const cardOperation = {
            number: 1,
            publicationDate: 1,
            card: cards[0],
            type: 'ADD'
        };
        const message = {
            content: JSON.stringify(cardOperation)
        };
        await reminderService.onMessage(message);


        jest.setSystemTime(new Date('2017-01-01 01:56'));
        await cardsReminderControl.checkCardsReminder();
        expect(opfabServicesInterfaceStub.sentReminders.length).toEqual(0);
        expect(opfabServicesInterfaceStub.sentReminders).toEqual([]);
    });
});
