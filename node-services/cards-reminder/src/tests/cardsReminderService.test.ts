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
import {RRule, Day, Frequency} from '../domain/model/card.model';
import {CardOperationType} from '../domain/model/card-operation.model';
import {RemindDatabaseServiceStub} from './remindDataBaseServiceStub';
import {OpfabServicesInterfaceStub} from './opfabServicesInterfaceStub';
import CardsReminderService from '../domain/client-side/cardsReminderService';
import GetResponse from '../common/server-side/getResponse';

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

let cardsReminderService: CardsReminderService;

function setCurrentTime(dateTime: string): void {
    jest.setSystemTime(new Date(dateTime));
}
function checkNoReminderIsSent(): void {
    expect(opfabServicesInterfaceStub.sentReminders.length).toEqual(0);
    expect(opfabServicesInterfaceStub.sentReminders).toEqual([]);
}

function checkOneReminderIsSent(cardUid = 'uid1'): void {
    expect(opfabServicesInterfaceStub.sentReminders.length).toEqual(1);
    expect(opfabServicesInterfaceStub.sentReminders).toEqual([cardUid]);
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
        cardsReminderService = new CardsReminderService(
            opfabServicesInterfaceStub,
            rruleReminderService,
            reminderService,
            remindDatabaseServiceStub,
            5,
            logger
        );
        cardsReminderService.start();
    });

    afterAll(() => {
        jest.useRealTimers();
        cardsReminderService.stop();
    });

    it('GIVEN a card was sent WHEN current date (02:06) > remind date - secondsBeforeTimeSpanForReminder (02:05) THEN remind is sent', async function () {
        expect(cardsReminderService.isActive()).toBeTruthy();
        await jest.advanceTimersByTimeAsync(6000);
        await jest.advanceTimersByTimeAsync(6000);
        await sendCard(getTestCard());
        setCurrentTime('2017-01-01 02:06');
        await jest.advanceTimersByTimeAsync(6000);
        checkOneReminderIsSent();
        await jest.advanceTimersByTimeAsync(6000);
        await jest.advanceTimersByTimeAsync(6000);
        checkNoReminderIsSent();
    });

    it('GIVEN a card was sent WHEN an error occur THEN try to send remind until possible', async function () {
        await jest.advanceTimersByTimeAsync(6000);
        await jest.advanceTimersByTimeAsync(6000);
        await sendCard(getTestCard());

        // simulate error when sending card
        opfabServicesInterfaceStub.setResponse(new GetResponse(null, false));
        setCurrentTime('2017-01-01 02:06');
        await jest.advanceTimersByTimeAsync(6000);
        checkNoReminderIsSent();
        await jest.advanceTimersByTimeAsync(6000);
        checkNoReminderIsSent();

        // do not simulate error anymore
        opfabServicesInterfaceStub.setResponse(new GetResponse(null, true));
        await jest.advanceTimersByTimeAsync(6000);
        checkOneReminderIsSent();
        await jest.advanceTimersByTimeAsync(6000);
        checkNoReminderIsSent();
    });

    it('GIVEN a card is to be remind WHEN a database error occur THEN program continue and send remind until possible', async function () {
        await jest.advanceTimersByTimeAsync(6000);
        await jest.advanceTimersByTimeAsync(6000);
        await sendCard(getTestCard());
        remindDatabaseServiceStub.setSimulateError(true);
        setCurrentTime('2017-01-01 02:06');
        await jest.advanceTimersByTimeAsync(6000);
        checkNoReminderIsSent();
        await jest.advanceTimersByTimeAsync(6000);
        checkNoReminderIsSent();
        remindDatabaseServiceStub.setSimulateError(false);
        await jest.advanceTimersByTimeAsync(6000);
        checkOneReminderIsSent();
    });

    it('GIVEN reminder service was reset WHEN current date is after reminds date of a cards THEN a remind sent', async function () {
        const card = getTestCard();
        rruleRemindDatabaseServiceStub.addCard(card);
        await cardsReminderService.reset();
        await jest.advanceTimersByTimeAsync(6000);

        setCurrentTime('2017-01-01 02:06');
        await jest.advanceTimersByTimeAsync(6000);
        checkOneReminderIsSent();
    });

    it('GIVEN reset id called WHEN  a database error occur THEN program continue', async function () {
        const card = getTestCard();

        // database error
        rruleRemindDatabaseServiceStub.addCard(card);
        remindDatabaseServiceStub.setSimulateError(true);
        await cardsReminderService.reset();
        remindDatabaseServiceStub.setSimulateError(false);
        rruleRemindDatabaseServiceStub.clean();

        // no more error , a new card is to be remind
        await sendCard(getTestCard());
        setCurrentTime('2017-01-01 02:06');
        await jest.advanceTimersByTimeAsync(6000);
        checkOneReminderIsSent();
    });

    it('GIVEN an invalid message is received via  Event Bus THEN program ignore it and continue', async function () {
        await reminderService.onMessage('invalid message');
        await rruleReminderService.onMessage('invalid message');

        // no more error , a new card is to be remind
        await sendCard(getTestCard());
        setCurrentTime('2017-01-01 02:06');
        await jest.advanceTimersByTimeAsync(6000);
        checkOneReminderIsSent();
    });
});
