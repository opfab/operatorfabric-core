/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import 'jest';
import {Card, Recurrence, TimeSpan} from '../domain/model/card.model';
import {getNextTimeForRepeating} from '../domain/application/reminderUtils';
import moment from 'moment-timezone';

describe('ReminderUtils:getNextTimeForRepeating with recurrence hour and minutes  ', () => {
    const timeZone = 'Europe/Paris';
    let testCard: Card;
    let recurrence: Recurrence;
    let recurrence2: Recurrence;
    let recurrence3: Recurrence;
    let recurrence4: Recurrence;

    beforeAll(() => {
        testCard = new Card('uid', 'id', 0);
    });

    beforeEach(() => {
        recurrence = new Recurrence({hours: 0, minutes: 0});
        recurrence.timeZone = timeZone;
        recurrence2 = new Recurrence({hours: 0, minutes: 0});
        recurrence2.timeZone = timeZone;
        recurrence3 = new Recurrence({hours: 0, minutes: 0});
        recurrence3.timeZone = timeZone;
        recurrence4 = new Recurrence({hours: 0, minutes: 0});
        recurrence4.timeZone = timeZone;
        testCard.endDate = moment.tz('2050-01-01 08:00', 'Europe/Paris').valueOf();
    });

    it('2000/01/01 10:00 , Recurrence :10:00  => 2000/01/02 10:00 ', () => {
        const date = moment.tz('2000-01-01 10:00', 'Europe/Paris').valueOf();
        recurrence.hoursAndMinutes = {hours: 10, minutes: 0};
        testCard.timeSpans = [new TimeSpan(0, null, recurrence)];

        const expectedResponseDate = moment.tz('2000-01-02 10:00', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });

    it('2000/01/01 10:00 , Recurrence :10:10  => 2000/01/01 10:10 ', () => {
        const date = moment.tz('2000-01-01 10:00', 'Europe/Paris').valueOf();
        recurrence.hoursAndMinutes = {hours: 10, minutes: 10};
        testCard.timeSpans = [new TimeSpan(0, null, recurrence)];

        const expectedResponseDate = moment.tz('2000-01-01 10:10', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });

    it('2000/01/01 10:00 , Recurrence :09:00  => 2000/01/02 09:00 ', () => {
        const date = moment.tz('2000-01-01 10:00', 'Europe/Paris').valueOf();
        recurrence.hoursAndMinutes = {hours: 9, minutes: 0};
        testCard.timeSpans = [new TimeSpan(0, null, recurrence)];

        const expectedResponseDate = moment.tz('2000-01-02 09:00', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });

    it('2000/01/01 10:00 with endDate 2000/01/02 8:00  , Recurrence :09:00  => -1 end date reach ', () => {
        const date = moment.tz('2000-01-01 10:00', 'Europe/Paris').valueOf();
        recurrence.hoursAndMinutes = {hours: 9, minutes: 0};
        testCard.timeSpans = [new TimeSpan(0, null, recurrence)];
        testCard.endDate = moment.tz('2000-01-01 08:00', 'Europe/Paris').valueOf();

        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(dateForRepeating).toEqual(-1);
    });

    it('2000/01/01 10:00 , Recurrence :10:10 , 10:15   => 2000/01/01 10:10 ', () => {
        const date = moment.tz('2000-01-01 10:00', 'Europe/Paris').valueOf();
        recurrence.hoursAndMinutes = {hours: 10, minutes: 10};
        recurrence2.hoursAndMinutes = {hours: 10, minutes: 15};
        testCard.timeSpans = [new TimeSpan(0, null, recurrence), new TimeSpan(0, null, recurrence2)];

        const expectedResponseDate = moment.tz('2000-01-01 10:10', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });

    it('2000/01/01 10:00 , Recurrence :10:15 , 10:10   => 2000/01/01 10:10 ', () => {
        const date = moment.tz('2000-01-01 10:00', 'Europe/Paris').valueOf();
        recurrence.hoursAndMinutes = {hours: 10, minutes: 15};
        recurrence2.hoursAndMinutes = {hours: 10, minutes: 10};
        testCard.timeSpans = [new TimeSpan(0, null, recurrence), new TimeSpan(0, null, recurrence2)];

        const expectedResponseDate = moment.tz('2000-01-01 10:10', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });

    it('2000/01/01 10:00 , Recurrence :10:15 , 10:10 ,10:06  => 2000/01/01 10:06 ', () => {
        const date = moment.tz('2000-01-01 10:00', 'Europe/Paris').valueOf();
        recurrence.hoursAndMinutes = {hours: 10, minutes: 15};
        recurrence2.hoursAndMinutes = {hours: 10, minutes: 10};
        recurrence3.hoursAndMinutes = {hours: 10, minutes: 6};
        testCard.timeSpans = [
            new TimeSpan(0, null, recurrence),
            new TimeSpan(0, null, recurrence2),
            new TimeSpan(0, null, recurrence3)
        ];

        const expectedResponseDate = moment.tz('2000-01-01 10:06', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });

    it('2000/01/01 15:00 , Recurrence :10:15 , 10:10 ,10:06  => 2000/01/02 10:06 ', () => {
        const date = moment.tz('2000-01-01 15:00', 'Europe/Paris').valueOf();
        recurrence.hoursAndMinutes = {hours: 10, minutes: 15};
        recurrence2.hoursAndMinutes = {hours: 10, minutes: 10};
        recurrence3.hoursAndMinutes = {hours: 10, minutes: 6};
        testCard.timeSpans = [
            new TimeSpan(0, null, recurrence),
            new TimeSpan(0, null, recurrence2),
            new TimeSpan(0, null, recurrence3)
        ];

        const expectedResponseDate = moment.tz('2000-01-02 10:06', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });

    it('2000/01/01 15:00 , Recurrence :10:15 , 10:10 ,15:00, 10:06  => 2000/01/02 10:06 ', () => {
        const date = moment.tz('2000-01-01 15:00', 'Europe/Paris').valueOf();
        recurrence.hoursAndMinutes = {hours: 10, minutes: 15};
        recurrence2.hoursAndMinutes = {hours: 10, minutes: 10};
        recurrence3.hoursAndMinutes = {hours: 15, minutes: 0};
        recurrence4.hoursAndMinutes = {hours: 10, minutes: 6};

        testCard.timeSpans = [
            new TimeSpan(0, null, recurrence),
            new TimeSpan(0, null, recurrence2),
            new TimeSpan(0, null, recurrence3),
            new TimeSpan(0, null, recurrence4)
        ];

        const expectedResponseDate = moment.tz('2000-01-02 10:06', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });

    it('2000/01/01 15:00 , Recurrence :10:15 , 10:10 ,15:00, 10:06 / Time Zone : London  => 2000/01/02 10:06 ', () => {
        const date = moment.tz('2000-01-01 15:00', 'Europe/London').valueOf();
        recurrence.hoursAndMinutes = {hours: 10, minutes: 15};
        recurrence2.hoursAndMinutes = {hours: 10, minutes: 10};
        recurrence3.hoursAndMinutes = {hours: 15, minutes: 0};
        recurrence4.hoursAndMinutes = {hours: 10, minutes: 6};
        recurrence.timeZone = 'Europe/London';
        recurrence2.timeZone = 'Europe/London';
        recurrence3.timeZone = 'Europe/London';
        recurrence4.timeZone = 'Europe/London';
        testCard.timeSpans = [
            new TimeSpan(0, null, recurrence),
            new TimeSpan(0, null, recurrence2),
            new TimeSpan(0, null, recurrence3),
            new TimeSpan(0, null, recurrence4)
        ];

        const expectedResponseDate = moment.tz('2000-01-02 10:06', 'Europe/London').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });

    it(
        '2000/01/01 14:00 TimeZone London , ' +
            'Recurrence :10:15 , 10:10 ,15:00, 10:06 / Time Zone : Paris ' +
            '=> 2000/01/02 9:06 TimeZone London ',
        () => {
            const date = moment.tz('2000-01-01 14:00', 'Europe/London').valueOf();

            recurrence.hoursAndMinutes = {hours: 10, minutes: 15};
            recurrence2.hoursAndMinutes = {hours: 10, minutes: 10};
            recurrence3.hoursAndMinutes = {hours: 15, minutes: 0};
            recurrence4.hoursAndMinutes = {hours: 10, minutes: 6};
            recurrence.timeZone = 'Europe/Paris';
            recurrence2.timeZone = 'Europe/Paris';
            recurrence3.timeZone = 'Europe/Paris';
            recurrence4.timeZone = 'Europe/Paris';
            testCard.timeSpans = [
                new TimeSpan(0, null, recurrence),
                new TimeSpan(0, null, recurrence2),
                new TimeSpan(0, null, recurrence3),
                new TimeSpan(0, null, recurrence4)
            ];

            const expectedResponseDate = moment.tz('2000-01-02 09:06', 'Europe/London').valueOf();
            const dateForRepeating = getNextTimeForRepeating(testCard, date);
            expect(dateForRepeating).toEqual(expectedResponseDate);
        }
    );
});

describe('ReminderUtils:getNextTimeForRepeating hour/minutes/daysOfWeek   ', () => {
    const timeZone = 'Europe/Paris';
    let testCard: Card;
    let recurrence: Recurrence;
    let recurrence2: Recurrence;
    let recurrence3: Recurrence;

    beforeAll(() => {
        testCard = new Card('uid', 'id', 0);
    });

    beforeEach(() => {
        recurrence = new Recurrence({hours: 0, minutes: 0});
        recurrence.timeZone = timeZone;
        recurrence2 = new Recurrence({hours: 0, minutes: 0});
        recurrence2.timeZone = timeZone;
        recurrence3 = new Recurrence({hours: 0, minutes: 0});
        recurrence3.timeZone = timeZone;
    });

    /**
     *  The value for days of week is in ISOWeekDay
     * 09/11/2020 : Monday --> 1
     * 10/11/2020 : Tuesday --> 2
     * ...
     * 15/11/2020 : Sunday --> 7
     *
     */

    it('2020/11/09 Monday 10:00 , locale = en , Recurrence :10:30 / invalid day(0) => -1 ', () => {
        moment.locale('en');
        const date = moment.tz('2020-11-09 10:00', 'Europe/Paris').valueOf();

        recurrence.hoursAndMinutes = {hours: 10, minutes: 30};
        recurrence.daysOfWeek = [0];
        testCard.timeSpans = [new TimeSpan(0, null, recurrence)];

        const expectedResponse = -1;
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(dateForRepeating).toEqual(expectedResponse);
    });

    it('2020/11/09 Monday 10:00 , locale = en , Recurrence :10:30 / invalid day(8) => -1 ', () => {
        moment.locale('en');
        const date = moment.tz('2020-11-09 10:00', 'Europe/Paris').valueOf();

        recurrence.hoursAndMinutes = {hours: 10, minutes: 30};
        recurrence.daysOfWeek = [8];
        testCard.timeSpans = [new TimeSpan(0, null, recurrence)];

        const expectedResponse = -1;
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(dateForRepeating).toEqual(expectedResponse);
    });

    it('2020/11/09 Monday 10:00 , locale = en , Recurrence :10:30 / Monday(1) => 2020/11/09 Monday 10:30 ', () => {
        moment.locale('en');
        const date = moment.tz('2020-11-09 10:00', 'Europe/Paris').valueOf();

        recurrence.hoursAndMinutes = {hours: 10, minutes: 30};
        recurrence.daysOfWeek = [1];
        testCard.timeSpans = [new TimeSpan(0, null, recurrence)];

        const expectedResponseDate = moment.tz('2020-11-09 10:30', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });

    // Test to be sure the chosen user locale has no influence on the result
    it('2020/11/09 Monday 10:00  , locale = fr , Recurrence :10:30 / Monday(1) => 2020/11/09 Monday 10:30 ', () => {
        moment.locale('fr');
        const date = moment.tz('2020-11-09 10:00', 'Europe/Paris').valueOf();

        recurrence.hoursAndMinutes = {hours: 10, minutes: 30};
        recurrence.daysOfWeek = [1];
        testCard.timeSpans = [new TimeSpan(0, null, recurrence)];

        const expectedResponseDate = moment.tz('2020-11-09 10:30', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });

    it('2020/11/09 Monday 15:00 ,  Recurrence :15:45 / Monday(1) => 2020/11/09 Monday 15:45 ', () => {
        const date = moment.tz('2020-11-09 15:00', 'Europe/Paris').valueOf();

        recurrence.hoursAndMinutes = {hours: 15, minutes: 45};
        recurrence.daysOfWeek = [1];
        testCard.timeSpans = [new TimeSpan(0, null, recurrence)];

        const expectedResponseDate = moment.tz('2020-11-09 15:45', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });

    it('2020/11/10 Saturday 10:00 , Recurrence :10:30 / Monday(1) => 2020/11/16 Monday 10:30 ', () => {
        const date = moment.tz('2020-11-10 10:00', 'Europe/Paris').valueOf();
        recurrence.hoursAndMinutes = {hours: 10, minutes: 30};
        recurrence.daysOfWeek = [1];
        testCard.timeSpans = [new TimeSpan(0, null, recurrence)];

        const expectedResponseDate = moment.tz('2020-11-16 10:30', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });

    it('2020/11/09 Monday 12:00 , Recurrence :10:30 / Monday(1) => 2020/11/16 Monday 10:30 ', () => {
        const date = moment.tz('2020-11-09 12:00', 'Europe/Paris').valueOf();
        recurrence.hoursAndMinutes = {hours: 10, minutes: 30};
        recurrence.daysOfWeek = [1];
        testCard.timeSpans = [new TimeSpan(0, null, recurrence)];

        const expectedResponseDate = moment.tz('2020-11-16 10:30', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });

    it('2020/11/09 Monday 10:30 , Recurrence :10:30 / Monday(1) => 2020/11/16 Monday 10:30 ', () => {
        const date = moment.tz('2020-11-09 10:30', 'Europe/Paris').valueOf();
        recurrence.hoursAndMinutes = {hours: 10, minutes: 30};
        recurrence.daysOfWeek = [1];
        testCard.timeSpans = [new TimeSpan(0, null, recurrence)];

        const expectedResponseDate = moment.tz('2020-11-16 10:30', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });

    it('2020/11/09 Monday 10:00 , Recurrence :10:30 / Tuesday(2) => 2020/11/10 Tuesday 10:30 ', () => {
        const date = moment.tz('2020-11-09 10:00', 'Europe/Paris').valueOf();
        recurrence.hoursAndMinutes = {hours: 10, minutes: 30};
        recurrence.daysOfWeek = [2];
        testCard.timeSpans = [new TimeSpan(0, null, recurrence)];

        const expectedResponseDate = moment.tz('2020-11-10 10:30', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });

    it('2020/11/09 Monday 10:00 , Recurrence :10:30 / Sunday(7) => 2020/11/15 Sunday 10:30 ', () => {
        const date = moment.tz('2020-11-09 10:00', 'Europe/Paris').valueOf();
        recurrence.hoursAndMinutes = {hours: 10, minutes: 30};
        recurrence.daysOfWeek = [7];
        testCard.timeSpans = [new TimeSpan(0, null, recurrence)];

        const expectedResponseDate = moment.tz('2020-11-15 10:30', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });

    it('2020/11/09 Monday 10:00 , Recurrence :10:30 / Saturday(6) Sunday(7) => 2020/11/14 Saturday 10:30 ', () => {
        const date = moment.tz('2020-11-09 10:00', 'Europe/Paris').valueOf();
        recurrence.hoursAndMinutes = {hours: 10, minutes: 30};
        recurrence.daysOfWeek = [6, 7];
        testCard.timeSpans = [new TimeSpan(0, null, recurrence)];

        const expectedResponseDate = moment.tz('2020-11-14 10:30', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });

    it('2020/11/09 Monday 12:00 , Recurrence :10:30 / Saturday(6) Sunday(7) Wednesday(3) => 2020/11/11 Wednesday 10:30 ', () => {
        const date = moment.tz('2020-11-09 12:00', 'Europe/Paris').valueOf();
        recurrence.hoursAndMinutes = {hours: 10, minutes: 30};
        recurrence.daysOfWeek = [6, 7, 3];
        testCard.timeSpans = [new TimeSpan(0, null, recurrence)];

        const expectedResponseDate = moment.tz('2020-11-11 10:30', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });

    it(
        '2020/11/09 Monday 12:00 , ' +
            'Recurrence :10:30 5:20 18:00 / Saturday(6) Sunday(7) Wednesday(3) ' +
            '=> 2020/11/11 Wednesday 5:20 ',
        () => {
            const date = moment.tz('2020-11-09 12:00', 'Europe/Paris').valueOf();
            recurrence.hoursAndMinutes = {hours: 10, minutes: 30};
            recurrence2.hoursAndMinutes = {hours: 5, minutes: 20};
            recurrence3.hoursAndMinutes = {hours: 18, minutes: 0};
            recurrence.daysOfWeek = [6, 7, 3];
            recurrence2.daysOfWeek = [6, 7, 3];
            recurrence3.daysOfWeek = [6, 7, 3];
            testCard.timeSpans = [
                new TimeSpan(0, null, recurrence),
                new TimeSpan(0, null, recurrence2),
                new TimeSpan(0, null, recurrence3)
            ];

            const expectedResponseDate = moment.tz('2020-11-11 05:20', 'Europe/Paris').valueOf();
            const dateForRepeating = getNextTimeForRepeating(testCard, date);
            expect(dateForRepeating).toEqual(expectedResponseDate);
        }
    );

    it(
        '2020/11/09 Monday 12:00 , ' +
            'Recurrence :10:30 5:20  / Saturday(6) Sunday(7)  / 18:00 Wednesday(3) ' +
            '=> 2020/11/11 Wednesday 5:20 ',
        () => {
            const date = moment.tz('2020-11-09 12:00', 'Europe/Paris').valueOf();
            recurrence.hoursAndMinutes = {hours: 10, minutes: 30};
            recurrence2.hoursAndMinutes = {hours: 5, minutes: 20};
            recurrence3.hoursAndMinutes = {hours: 18, minutes: 0};
            recurrence.daysOfWeek = [6, 7];
            recurrence2.daysOfWeek = [6, 7];
            recurrence3.daysOfWeek = [3];
            testCard.timeSpans = [
                new TimeSpan(0, null, recurrence),
                new TimeSpan(0, null, recurrence2),
                new TimeSpan(0, null, recurrence3)
            ];

            const expectedResponseDate = moment.tz('2020-11-11 18:00', 'Europe/Paris').valueOf();
            const dateForRepeating = getNextTimeForRepeating(testCard, date);
            expect(dateForRepeating).toEqual(expectedResponseDate);
        }
    );

    it(
        '2020/11/09 Monday 12:00 , ' +
            'Recurrence :10:30 5:20  / Saturday(6) Sunday(7)  / 18:00 Wednesday(3) ' +
            '=> 2020/11/11 Wednesday 5:20 ',
        () => {
            const date = moment.tz('2020-11-09 12:00', 'Europe/Paris').valueOf();
            recurrence.hoursAndMinutes = {hours: 10, minutes: 30};
            recurrence2.hoursAndMinutes = {hours: 5, minutes: 20};
            recurrence3.hoursAndMinutes = {hours: 18, minutes: 0};
            recurrence.daysOfWeek = [6, 7, 3];
            recurrence2.daysOfWeek = [6, 7];
            recurrence3.daysOfWeek = [3];
            testCard.timeSpans = [
                new TimeSpan(0, null, recurrence),
                new TimeSpan(0, null, recurrence2),
                new TimeSpan(0, null, recurrence3)
            ];

            const expectedResponseDate = moment.tz('2020-11-11 10:30', 'Europe/Paris').valueOf();
            const dateForRepeating = getNextTimeForRepeating(testCard, date);
            expect(dateForRepeating).toEqual(expectedResponseDate);
        }
    );

    it('2020/11/09 Monday 12:00 , Recurrence :10:30 5:20 18:00 / Saturday(6) Sunday(7) Wednesday(3) => 2020/11/11 Wednesday 5:20 ', () => {
        const date = moment.tz('2020-11-09 12:00', 'Europe/Paris').valueOf();
        recurrence.hoursAndMinutes = {hours: 10, minutes: 30};
        recurrence2.hoursAndMinutes = {hours: 5, minutes: 20};
        recurrence3.hoursAndMinutes = {hours: 18, minutes: 0};
        recurrence.daysOfWeek = [6, 7, 3];
        recurrence2.daysOfWeek = [6, 7, 3];
        recurrence3.daysOfWeek = [6, 7, 3];
        testCard.timeSpans = [
            new TimeSpan(0, null, recurrence),
            new TimeSpan(0, null, recurrence2),
            new TimeSpan(0, null, recurrence3)
        ];

        const expectedResponseDate = moment.tz('2020-11-11 05:20', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });

    it(
        '2020/11/09 Monday 12:00  Time Zone : London ' +
            'Recurrence :10:30 5:20 18:00  Time Zone : London / Saturday(6) Sunday(7) Wednesday(3) ' +
            '=> 2020/11/11 Wednesday 5:20  Time Zone : London ',
        () => {
            const date = moment.tz('2020-11-09 12:00', 'Europe/London').valueOf();
            recurrence.hoursAndMinutes = {hours: 10, minutes: 30};
            recurrence2.hoursAndMinutes = {hours: 5, minutes: 20};
            recurrence3.hoursAndMinutes = {hours: 18, minutes: 0};
            recurrence.daysOfWeek = [6, 7, 3];
            recurrence2.daysOfWeek = [6, 7, 3];
            recurrence3.daysOfWeek = [6, 7, 3];
            recurrence.timeZone = 'Europe/London';
            recurrence2.timeZone = 'Europe/London';
            recurrence3.timeZone = 'Europe/London';
            testCard.timeSpans = [
                new TimeSpan(0, null, recurrence),
                new TimeSpan(0, null, recurrence2),
                new TimeSpan(0, null, recurrence3)
            ];

            const expectedResponseDate = moment.tz('2020-11-11 05:20', 'Europe/London').valueOf();
            const dateForRepeating = getNextTimeForRepeating(testCard, date);
            expect(dateForRepeating).toEqual(expectedResponseDate);
        }
    );

    it(
        '2020/11/09 Monday 11:00 Time Zone : London  ' +
            'Recurrence :10:30 5:20 18:00 Time Zone Paris/ Saturday(6) Sunday(7) Wednesday(3) ' +
            '=> 2020/11/11 Wednesday 4:20 Time Zone : London ',
        () => {
            const date = moment.tz('2020-11-09 11:00', 'Europe/London').valueOf();
            recurrence.hoursAndMinutes = {hours: 10, minutes: 30};
            recurrence2.hoursAndMinutes = {hours: 5, minutes: 20};
            recurrence3.hoursAndMinutes = {hours: 18, minutes: 0};
            recurrence.daysOfWeek = [6, 7, 3];
            recurrence2.daysOfWeek = [6, 7, 3];
            recurrence3.daysOfWeek = [6, 7, 3];
            testCard.timeSpans = [
                new TimeSpan(0, null, recurrence),
                new TimeSpan(0, null, recurrence2),
                new TimeSpan(0, null, recurrence3)
            ];

            const expectedResponseDate = moment.tz('2020-11-11 04:20', 'Europe/London').valueOf();
            const dateForRepeating = getNextTimeForRepeating(testCard, date);
            expect(dateForRepeating).toEqual(expectedResponseDate);
        }
    );
});

describe('ReminderUtils:getNextTimeForRepeating with recurrence on months only   ', () => {
    const timeZone = 'Europe/Paris';
    let testCard: Card;
    let recurrence: Recurrence;
    let recurrence2: Recurrence;
    let recurrence3: Recurrence;

    beforeAll(() => {
        testCard = new Card('uid', 'id', 0);
    });

    beforeEach(() => {
        recurrence = new Recurrence({hours: 0, minutes: 0});
        recurrence.timeZone = timeZone;
        recurrence2 = new Recurrence({hours: 0, minutes: 0});
        recurrence2.timeZone = timeZone;
        recurrence3 = new Recurrence({hours: 0, minutes: 0});
        recurrence3.timeZone = timeZone;
    });

    /**
     *  The value for days of week is in ISOWeekDay
     * 09/11/2020 : Monday --> 1
     * 10/11/2020 : Tuesday --> 2
     * ...
     * 15/11/2020 : Sunday --> 7
     *
     */

    it('2020/11/09 10:00 , locale = en , Recurrence : 16:30 / November(10) => 2020/11/09 16:30 ', () => {
        moment.locale('en');
        const date = moment.tz('2020-11-09 10:00', 'Europe/Paris').valueOf();

        recurrence.hoursAndMinutes = {hours: 16, minutes: 30};
        recurrence.months = [10];
        testCard.timeSpans = [new TimeSpan(0, null, recurrence)];

        const expectedResponseDate = moment.tz('2020-11-09 16:30', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(new Date(dateForRepeating)).toEqual(new Date(expectedResponseDate));
    });

    it('2020/11/09 16:30 , locale = en , Recurrence : 10:00 / November(10) => 2020/11/10 10:00 ', () => {
        moment.locale('en');
        const date = moment.tz('2020-11-09 16:30', 'Europe/Paris').valueOf();

        recurrence.hoursAndMinutes = {hours: 10, minutes: 0};
        recurrence.months = [10];
        testCard.timeSpans = [new TimeSpan(0, null, recurrence)];

        const expectedResponseDate = moment.tz('2020-11-10 10:00', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(new Date(dateForRepeating)).toEqual(new Date(expectedResponseDate));
    });

    it('2020/11/09 16:30 , locale = en , Recurrence : 10:00 / March(2) => 2021/03/01 10:00 ', () => {
        moment.locale('en');
        const date = moment.tz('2020-11-09 16:30', 'Europe/Paris').valueOf();

        recurrence.hoursAndMinutes = {hours: 10, minutes: 0};
        recurrence.months = [2];
        testCard.timeSpans = [new TimeSpan(0, null, recurrence)];

        const expectedResponseDate = moment.tz('2021-03-01 10:00', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(new Date(dateForRepeating)).toEqual(new Date(expectedResponseDate));
    });

    it('2020/11/09 10:00 , locale = en , Recurrence : 16:30 / December(12) => 2020/12/01 16:30 ', () => {
        moment.locale('en');
        const date = moment.tz('2020-11-09 10:00', 'Europe/Paris').valueOf();

        recurrence.hoursAndMinutes = {hours: 16, minutes: 30};
        recurrence.months = [11];
        testCard.timeSpans = [new TimeSpan(0, null, recurrence)];

        const expectedResponseDate = moment.tz('2020-12-01 16:30', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(new Date(dateForRepeating)).toEqual(new Date(expectedResponseDate));
    });

    it('2020/08/03 10:00 , locale = en , Recurrence : 16:30 / February(1) , December(11) => 2020/12/01 16:30 ', () => {
        moment.locale('en');
        const date = moment.tz('2020-08-03 10:00', 'Europe/Paris').valueOf();

        recurrence.hoursAndMinutes = {hours: 16, minutes: 30};
        recurrence.months = [1, 11];
        testCard.timeSpans = [new TimeSpan(0, null, recurrence)];

        const expectedResponseDate = moment.tz('2020-12-01 16:30', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(new Date(dateForRepeating)).toEqual(new Date(expectedResponseDate));
    });

    it('2020/08/03 10:00 , locale = en , Recurrence : 16:30 / invalid month(12) => -1 ', () => {
        moment.locale('en');
        const date = moment.tz('2020-08-03 10:00', 'Europe/Paris').valueOf();

        recurrence.hoursAndMinutes = {hours: 16, minutes: 30};
        recurrence.months = [12];
        testCard.timeSpans = [new TimeSpan(0, null, recurrence)];

        const expectedResponse = -1;
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(dateForRepeating).toEqual(expectedResponse);
    });
});

describe('ReminderUtils:getNextTimeForRepeating with recurrence on days and months   ', () => {
    const timeZone = 'Europe/Paris';
    let testCard: Card;
    let recurrence: Recurrence;
    let recurrence2: Recurrence;
    let recurrence3: Recurrence;

    beforeAll(() => {
        testCard = new Card('uid', 'id', 0);
    });

    beforeEach(() => {
        recurrence = new Recurrence({hours: 0, minutes: 0});
        recurrence.timeZone = timeZone;
        recurrence2 = new Recurrence({hours: 0, minutes: 0});
        recurrence2.timeZone = timeZone;
        recurrence3 = new Recurrence({hours: 0, minutes: 0});
        recurrence3.timeZone = timeZone;
    });

    /**
     *  The value for days of week is in ISOWeekDay
     * 09/11/2020 : Monday --> 1
     * 10/11/2020 : Tuesday --> 2
     * ...
     * 15/11/2020 : Sunday --> 7
     *
     */

    it('2020/11/12 Thursday 10:00 , locale = en , Recurrence : 16:30 / Wednesday(3) / November(10) => 2020/11/18 16:30 ', () => {
        moment.locale('en');
        const date = moment.tz('2020-11-12 10:00', 'Europe/Paris').valueOf();

        recurrence.hoursAndMinutes = {hours: 16, minutes: 30};
        recurrence.months = [10];
        recurrence.daysOfWeek = [3];
        testCard.timeSpans = [new TimeSpan(0, null, recurrence)];

        const expectedResponseDate = moment.tz('2020-11-18 16:30', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(new Date(dateForRepeating)).toEqual(new Date(expectedResponseDate));
    });

    it('2020/11/09 Monday 10:00 , locale = en , Recurrence : 16:30 / Wednesday(3) / November(10) => 2020/11/11 16:30 ', () => {
        moment.locale('en');
        const date = moment.tz('2020-11-09 10:00', 'Europe/Paris').valueOf();

        recurrence.hoursAndMinutes = {hours: 16, minutes: 30};
        recurrence.months = [10];
        recurrence.daysOfWeek = [3];
        testCard.timeSpans = [new TimeSpan(0, null, recurrence)];

        const expectedResponseDate = moment.tz('2020-11-11 16:30', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(new Date(dateForRepeating)).toEqual(new Date(expectedResponseDate));
    });

    it('2020/11/09 Monday 10:00 , locale = en , Recurrence : 09:00 / Monday(1), Wednesday(3) / November(10) => 2020/11/11 09:00 ', () => {
        moment.locale('en');
        const date = moment.tz('2020-11-09 10:00', 'Europe/Paris').valueOf();

        recurrence.hoursAndMinutes = {hours: 9, minutes: 0};
        recurrence.months = [10];
        recurrence.daysOfWeek = [1, 3];
        testCard.timeSpans = [new TimeSpan(0, null, recurrence)];

        const expectedResponseDate = moment.tz('2020-11-11 09:00', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(new Date(dateForRepeating)).toEqual(new Date(expectedResponseDate));
    });

    it('2020/11/09 Monday 10:00 , locale = en , Recurrence : 16:30 / Monday(1), Wednesday(3) / November(10) => 2020/11/09 16:30 ', () => {
        moment.locale('en');
        const date = moment.tz('2020-11-09 10:00', 'Europe/Paris').valueOf();

        recurrence.hoursAndMinutes = {hours: 16, minutes: 30};
        recurrence.months = [10];
        recurrence.daysOfWeek = [1, 3];
        testCard.timeSpans = [new TimeSpan(0, null, recurrence)];

        const expectedResponseDate = moment.tz('2020-11-09 16:30', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(new Date(dateForRepeating)).toEqual(new Date(expectedResponseDate));
    });

    it('2020/11/09 Monday 10:00 , locale = en , Recurrence : 09:00 / Monday(1), Wednesday(3) / January (0), November(10) => 2020/11/11 09:00 ', () => {
        moment.locale('en');
        const date = moment.tz('2020-11-09 10:00', 'Europe/Paris').valueOf();

        recurrence.hoursAndMinutes = {hours: 9, minutes: 0};
        recurrence.months = [0, 10];
        recurrence.daysOfWeek = [1, 3];
        testCard.timeSpans = [new TimeSpan(0, null, recurrence)];

        const expectedResponseDate = moment.tz('2020-11-11 09:00', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(new Date(dateForRepeating)).toEqual(new Date(expectedResponseDate));
    });

    it('2020/11/09 Monday 10:00 , locale = en , Recurrence : 09:00 / Monday(1), Wednesday(3) / March (2), January (0) => 2021/01/04 09:00 ', () => {
        moment.locale('en');
        const date = moment.tz('2020-11-09 10:00', 'Europe/Paris').valueOf();

        recurrence.hoursAndMinutes = {hours: 9, minutes: 0};
        recurrence.months = [2, 0];
        recurrence.daysOfWeek = [1, 3];
        testCard.timeSpans = [new TimeSpan(0, null, recurrence)];

        const expectedResponseDate = moment.tz('2021-01-04 09:00', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(new Date(dateForRepeating)).toEqual(new Date(expectedResponseDate));
    });

    it('2020/11/30 Monday 18:00 , locale = en , Recurrence : 16:30 / Wednesday(3) / November(10) => 2021/11/03 16:30 ', () => {
        moment.locale('en');
        const date = moment.tz('2020-11-30 18:00', 'Europe/Paris').valueOf();

        recurrence.hoursAndMinutes = {hours: 16, minutes: 30};
        recurrence.months = [10];
        recurrence.daysOfWeek = [3];
        testCard.timeSpans = [new TimeSpan(0, null, recurrence)];

        const expectedResponseDate = moment.tz('2021-11-03 16:30', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(new Date(dateForRepeating)).toEqual(new Date(expectedResponseDate));
    });

    it('2020/11/29 Sunday 10:00 , locale = en , Recurrence : 16:30 / Wednesday(3) / November(10) => 2021/11/03 16:30 ', () => {
        moment.locale('en');
        const date = moment.tz('2020-11-29 10:00', 'Europe/Paris').valueOf();

        recurrence.hoursAndMinutes = {hours: 16, minutes: 30};
        recurrence.months = [10];
        recurrence.daysOfWeek = [3];
        testCard.timeSpans = [new TimeSpan(0, null, recurrence)];

        const expectedResponseDate = moment.tz('2021-11-03 16:30', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(new Date(dateForRepeating)).toEqual(new Date(expectedResponseDate));
    });

    it('2020/11/29 Sunday 10:00 , locale = en , Recurrence : 16:30 / Wednesday(3) / November(10), February(1) => 2021/11/03 16:30 ', () => {
        moment.locale('en');
        const date = moment.tz('2020-11-29 10:00', 'Europe/Paris').valueOf();

        recurrence.hoursAndMinutes = {hours: 16, minutes: 30};
        recurrence.months = [10, 1];
        recurrence.daysOfWeek = [3];
        testCard.timeSpans = [new TimeSpan(0, null, recurrence)];

        const expectedResponseDate = moment.tz('2021-02-03 16:30', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(new Date(dateForRepeating)).toEqual(new Date(expectedResponseDate));
    });

    it('2020/11/29 Sunday 10:00 , locale = en , Recurrence : 16:30 / Wednesday(3), Monday(1) / November(10), February(1) => 2021/11/03 16:30 ', () => {
        moment.locale('en');
        const date = moment.tz('2020-11-29 10:00', 'Europe/Paris').valueOf();

        recurrence.hoursAndMinutes = {hours: 16, minutes: 30};
        recurrence.months = [10, 1];
        recurrence.daysOfWeek = [3, 1];
        testCard.timeSpans = [new TimeSpan(0, null, recurrence)];

        const expectedResponseDate = moment.tz('2020-11-30 16:30', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(new Date(dateForRepeating)).toEqual(new Date(expectedResponseDate));
    });

    it('2020/08/29 Saturday 10:00 , locale = en , Recurrence : 16:30 / Wednesday(3), Monday(1) / December(11), October(9) => 2020/10/05 16:30 ', () => {
        moment.locale('en');
        const date = moment.tz('2020-08-29 10:00', 'Europe/Paris').valueOf();

        recurrence.hoursAndMinutes = {hours: 16, minutes: 30};
        recurrence.months = [11, 9];
        recurrence.daysOfWeek = [3, 1];
        testCard.timeSpans = [new TimeSpan(0, null, recurrence)];

        const expectedResponseDate = moment.tz('2020-10-05 16:30', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(new Date(dateForRepeating)).toEqual(new Date(expectedResponseDate));
    });

    it('2020/08/29 Saturday 10:00 , locale = en , Recurrence : 16:30 / Wednesday(3), Friday(5) / August(7), October(9) => 2020/10/02 16:30 ', () => {
        moment.locale('en');
        const date = moment.tz('2020-08-29 10:00', 'Europe/Paris').valueOf();

        recurrence.hoursAndMinutes = {hours: 16, minutes: 30};
        recurrence.months = [7, 9];
        recurrence.daysOfWeek = [3, 5];
        testCard.timeSpans = [new TimeSpan(0, null, recurrence)];

        const expectedResponseDate = moment.tz('2020-10-02 16:30', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(new Date(dateForRepeating)).toEqual(new Date(expectedResponseDate));
    });

    it('2020/08/26 Wednesday 10:00 , locale = en , Recurrence : 16:30 / Tuesday(2) / August(7), october(9) => 2020/10/06 16:30 ', () => {
        moment.locale('en');
        const date = moment.tz('2020-08-26 10:00', 'Europe/Paris').valueOf();

        recurrence.hoursAndMinutes = {hours: 16, minutes: 30};
        recurrence.months = [7, 9];
        recurrence.daysOfWeek = [2];
        testCard.timeSpans = [new TimeSpan(0, null, recurrence)];

        const expectedResponseDate = moment.tz('2020-10-06 16:30', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(new Date(dateForRepeating)).toEqual(new Date(expectedResponseDate));
    });
});

describe('ReminderUtils:getNextTimeForRepeating without or invalid recurrence ', () => {
    const timeZone = 'Europe/Paris';
    let recurrence: Recurrence;
    let recurrence2: Recurrence;
    let testCard: Card;

    beforeAll(() => {
        testCard = new Card('uid', 'id', 0);
    });

    beforeEach(() => {
        recurrence = new Recurrence({hours: 0, minutes: 0});
        recurrence.timeZone = timeZone;
        recurrence2 = new Recurrence({hours: 0, minutes: 0});
        recurrence2.timeZone = timeZone;
    });

    it('No recurrence , date for remind is startdate ', () => {
        const date = moment.tz('2000-01-01 10:00', 'Europe/Paris').valueOf();
        const cardStartdate = moment.tz('2000-01-01 10:01', 'Europe/Paris').valueOf();
        testCard.timeSpans = [new TimeSpan(cardStartdate)];

        const expectedResponseDate = moment.tz('2000-01-01 10:01', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });

    it('No recurrence , date for remind is startdate ,  currentDate is 16 minutes after startDate , should return no date (-1) ', () => {
        const date = moment.tz('2000-01-01 10:00', 'Europe/Paris').valueOf();
        const cardStartdate = moment.tz('2000-01-01 09:44', 'Europe/Paris').valueOf();
        testCard.timeSpans = [new TimeSpan(cardStartdate)];

        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(dateForRepeating).toEqual(-1);
    });

    it('Invalid recurrence days of week should return -1 ', () => {
        const date = moment.tz('2000-01-01 10:00', 'Europe/Paris').valueOf();
        recurrence.hoursAndMinutes = {hours: 10, minutes: 30};
        recurrence.daysOfWeek = [0, 22];
        testCard.timeSpans = [new TimeSpan(0, null, recurrence)];

        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(dateForRepeating).toEqual(-1);
    });

    it('Invalid recurrence days of week for one of two timespan  should return -1 ', () => {
        const date = moment.tz('2000-01-01 10:00', 'Europe/Paris').valueOf();
        recurrence.hoursAndMinutes = {hours: 10, minutes: 30};
        recurrence2.hoursAndMinutes = {hours: 10, minutes: 40};
        recurrence.daysOfWeek = [0, 22];
        recurrence2.daysOfWeek = [1, 2, 3, 6, 7];
        testCard.timeSpans = [new TimeSpan(0, null, recurrence), new TimeSpan(0, null, recurrence2)];

        const expectedResponseDate = moment.tz('2000-01-01 10:40', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });

    it('Invalid recurrence month 12 should return -1 ', () => {
        const date = moment.tz('2000-01-01 10:00', 'Europe/Paris').valueOf();
        recurrence.hoursAndMinutes = {hours: 10, minutes: 30};
        recurrence.months = [12, 3];
        testCard.timeSpans = [new TimeSpan(0, null, recurrence)];

        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(dateForRepeating).toEqual(-1);
    });

    it('Invalid recurrence month -1 should return -1 ', () => {
        const date = moment.tz('2000-01-01 10:00', 'Europe/Paris').valueOf();
        recurrence.hoursAndMinutes = {hours: 10, minutes: 30};
        recurrence.months = [-1, 3];
        testCard.timeSpans = [new TimeSpan(0, null, recurrence)];

        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(dateForRepeating).toEqual(-1);
    });
});
