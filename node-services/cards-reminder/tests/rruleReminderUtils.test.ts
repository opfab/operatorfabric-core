/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Card, TimeSpan} from '../src/domain/model/card.model';
import {getOneRandomCard} from './helpers';
import moment from 'moment-timezone';
import {getNextTimeForRepeating} from '../src/domain/application/rrule-reminderUtils';
import {Day, Frequency} from '../src/domain/model/light-card.model';

describe('RRuleReminderUtils:getNextTimeForRepeating with recurrence hour and minutes  ', () => {
    let testCard: Card;

    beforeAll(() => {
        const cardTemplate = {startDate: moment.tz('2000-01-01 08:00', 'Europe/Paris').valueOf()};
        testCard = getOneRandomCard(cardTemplate);
    });

    it('2000/01/01 10:00 , Recurrence :10:00  => 2000/01/02 10:00 ', () => {
        const date = moment.tz('2000-01-01 10:00', 'Europe/Paris').valueOf();

        testCard.rRule = {
            freq: Frequency.DAILY,
            byhour: [10],
            byminute: [0]
        };

        const expectedResponseDate = new Date('2000-01-02 10:00').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date.valueOf());
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });

    it('2000/01/01 10:00 , Recurrence :10:10  => 2000/01/01 10:10 ', () => {
        const date = moment.tz('2000-01-01 10:00', 'Europe/Paris').valueOf();

        testCard.rRule = {
            freq: Frequency.DAILY,
            byhour: [10],
            byminute: [10]
        };

        const expectedResponseDate = moment.tz('2000-01-01 10:10', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });

    it('2000/01/01 10:00 , Recurrence :09:00  => 2000/01/02 09:00 ', () => {
        const date = moment.tz('2000-01-01 10:00', 'Europe/Paris').valueOf();

        testCard.rRule = {
            freq: Frequency.DAILY,
            byhour: [9],
            byminute: [0]
        };

        const expectedResponseDate = moment.tz('2000-01-02 09:00', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });

    it('2000/01/01 10:00 , Recurrence :10:10 , 10:15   => 2000/01/01 10:10 ', () => {
        const date = moment.tz('2000-01-01 10:00', 'Europe/Paris').valueOf();

        testCard.rRule = {
            freq: Frequency.DAILY,
            byhour: [10],
            byminute: [10, 15]
        };

        const expectedResponseDate = moment.tz('2000-01-01 10:10', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });

    it('2000/01/01 10:00 , Recurrence :10:15 , 10:10   => 2000/01/01 10:10 ', () => {
        const date = moment.tz('2000-01-01 10:00', 'Europe/Paris').valueOf();

        testCard.rRule = {
            freq: Frequency.DAILY,
            byhour: [10],
            byminute: [15, 10]
        };

        const expectedResponseDate = moment.tz('2000-01-01 10:10', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });

    it('2000/01/01 10:00 , Recurrence :10:15 , 10:10 ,10:06  => 2000/01/01 10:06 ', () => {
        const date = moment.tz('2000-01-01 10:00', 'Europe/Paris').valueOf();

        testCard.rRule = {
            freq: Frequency.DAILY,
            byhour: [10],
            byminute: [15, 10, 6]
        };

        const expectedResponseDate = moment.tz('2000-01-01 10:06', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });

    it('2000/01/01 15:00 , Recurrence :10:15 , 10:10 ,10:06  => 2000/01/02 10:06 ', () => {
        const date = moment.tz('2000-01-01 15:00', 'Europe/Paris').valueOf();

        testCard.rRule = {
            freq: Frequency.DAILY,
            byhour: [10],
            byminute: [15, 10, 6]
        };

        const expectedResponseDate = moment.tz('2000-01-02 10:06', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });

    it('2000/01/01 11:00 , Recurrence :10:15 , 10:10 , 10:06 / Time Zone : London  => 2000/01/02 10:06 ', () => {
        const date = moment.tz('2000-01-01 11:00', 'Europe/London').valueOf();

        testCard.rRule = {
            freq: Frequency.DAILY,
            byhour: [10],
            byminute: [15, 10, 6],
            tzid: 'Europe/London'
        };

        const expectedResponseDate = moment.tz('2000-01-02 10:06', 'Europe/London').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });

    it('2000/01/01 14:00 TimeZone London , Recurrence :10:15 , 10:10 , 10:06 / TimeZone Paris => 2000/01/02 9:06 TimeZone London ', () => {
        const date = moment.tz('2000-01-01 14:00', 'Europe/London').valueOf();

        testCard.rRule = {
            freq: Frequency.DAILY,
            byhour: [10],
            byminute: [15, 10, 6],
            tzid: 'Europe/Paris'
        };

        const expectedResponseDate = moment.tz('2000-01-02 09:06', 'Europe/London').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });
});

describe('RRuleReminderUtils:getNextTimeForRepeating hour/minutes/daysOfWeek   ', () => {
    let testCard: Card;

    beforeAll(() => {
        const cardTemplate = {startDate: moment.tz('2020-11-09 08:00', 'Europe/Paris').valueOf()};
        testCard = getOneRandomCard(cardTemplate);
    });

    it('2020/11/09 Monday 10:00 , locale = en , Recurrence :10:30 / Monday => 2020/11/09 Monday 10:30 ', () => {
        moment.locale('en');
        const date = moment.tz('2020-11-09 10:00', 'Europe/Paris').valueOf();

        testCard.rRule = {
            freq: Frequency.WEEKLY,
            byweekday: [Day.MO],
            byhour: [10],
            byminute: [30]
        };

        const expectedResponseDate = moment.tz('2020-11-09 10:30', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });

    // Test to be sure the chosen user locale has no influence on the result
    it('2020/11/09 Monday 10:00  , locale = fr , Recurrence :10:30 / Monday => 2020/11/09 Monday 10:30 ', () => {
        moment.locale('fr');
        const date = moment.tz('2020-11-09 10:00', 'Europe/Paris').valueOf();

        testCard.rRule = {
            freq: Frequency.WEEKLY,
            byweekday: [Day.MO],
            byhour: [10],
            byminute: [30]
        };

        const expectedResponseDate = moment.tz('2020-11-09 10:30', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });

    it('2020/11/09 Monday 15:00 ,  Recurrence :15:45 / Monday => 2020/11/09 Monday 15:45 ', () => {
        const date = moment.tz('2020-11-09 15:00', 'Europe/Paris').valueOf();

        testCard.rRule = {
            freq: Frequency.WEEKLY,
            byweekday: [Day.MO],
            byhour: [15],
            byminute: [45]
        };

        const expectedResponseDate = moment.tz('2020-11-09 15:45', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });

    it('2020/11/10 Tuesday 8:00 , Recurrence :10:30 / Monday => 2020/11/16 Monday 10:30 ', () => {
        const date = moment.tz('2020-11-10 08:00', 'Europe/Paris').valueOf();

        testCard.rRule = {
            freq: Frequency.WEEKLY,
            byweekday: [Day.MO],
            byhour: [10],
            byminute: [30]
        };

        const expectedResponseDate = new Date('2020-11-16 10:30').valueOf()
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });

    it('2020/11/09 Monday 12:00 , Recurrence :10:30 / Monday => 2020/11/16 Monday 10:30 ', () => {
        const date = moment.tz('2020-11-09 12:00', 'Europe/Paris').valueOf();

        testCard.rRule = {
            freq: Frequency.WEEKLY,
            byweekday: [Day.MO],
            byhour: [10],
            byminute: [30]
        };

        const expectedResponseDate = moment.tz('2020-11-16 10:30', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });

    it('2020/11/09 Monday 10:30 , Recurrence :10:30 / Monday => 2020/11/16 Monday 10:30 ', () => {
        const date = moment.tz('2020-11-09 10:30', 'Europe/Paris').valueOf();

        testCard.rRule = {
            freq: Frequency.WEEKLY,
            byweekday: [Day.MO],
            byhour: [10],
            byminute: [30]
        };

        const expectedResponseDate = moment.tz('2020-11-16 10:30', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });

    it('2020/11/09 Monday 10:00 , Recurrence :10:30 / Tuesday => 2020/11/10 Tuesday 10:30 ', () => {
        const date = moment.tz('2020-11-09 10:00', 'Europe/Paris').valueOf();

        testCard.rRule = {
            freq: Frequency.WEEKLY,
            byweekday: [Day.TU],
            byhour: [10],
            byminute: [30]
        };

        const expectedResponseDate = moment.tz('2020-11-10 10:30', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });

    it('2020/11/09 Monday 10:00 , Recurrence :10:30 / Sunday => 2020/11/15 Sunday 10:30 ', () => {
        const date = moment.tz('2020-11-09 10:00', 'Europe/Paris').valueOf();

        testCard.rRule = {
            freq: Frequency.WEEKLY,
            byweekday: [Day.SU],
            byhour: [10],
            byminute: [30]
        };

        const expectedResponseDate = moment.tz('2020-11-15 10:30', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });

    it('2020/11/09 Monday 10:00 , Recurrence :10:30 / Saturday Sunday => 2020/11/14 Saturday 10:30 ', () => {
        const date = moment.tz('2020-11-09 10:00', 'Europe/Paris').valueOf();

        testCard.rRule = {
            freq: Frequency.WEEKLY,
            byweekday: [Day.SA, Day.SU],
            byhour: [10],
            byminute: [30]
        };

        const expectedResponseDate = moment.tz('2020-11-14 10:30', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });

    it('2020/11/09 Monday 10:00 , Recurrence :10:30 / Sunday Saturday => 2020/11/14 Saturday 10:30 ', () => {
        const date = moment.tz('2020-11-09 10:00', 'Europe/Paris').valueOf();

        testCard.rRule = {
            freq: Frequency.WEEKLY,
            byweekday: [Day.SU, Day.SA],
            byhour: [10],
            byminute: [30]
        };

        const expectedResponseDate = moment.tz('2020-11-14 10:30', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });

    it('2020/11/09 Monday 12:00 , Recurrence :10:30 / Saturday Sunday Wednesday => 2020/11/11 Wednesday 10:30 ', () => {
        const date = moment.tz('2020-11-09 12:00', 'Europe/Paris').valueOf();

        testCard.rRule = {
            freq: Frequency.WEEKLY,
            byweekday: [Day.SA, Day.SU, Day.WE],
            byhour: [10],
            byminute: [30]
        };

        const expectedResponseDate = moment.tz('2020-11-11 10:30', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });

    it('2020/11/09 Monday 12:00 , ' +
       'Recurrence : 10:30 5:30 18:30 / Saturday Sunday Wednesday ' +
       '=> 2020/11/11 Wednesday 5:30 ', () => {
        const date = moment.tz('2020-11-09 12:00', 'Europe/Paris').valueOf();

        testCard.rRule = {
            freq: Frequency.WEEKLY,
            byweekday: [Day.SA, Day.SU, Day.WE],
            byhour: [10, 5, 18],
            byminute: [30]
        };

        const expectedResponseDate = moment.tz('2020-11-11 05:30', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });

    it('2020/11/09 Monday 12:00  TimeZone : London ' +
       'Recurrence : 10:30 5:30 18:30  TimeZone : London / Saturday(6) Sunday(7) Wednesday(3) ' +
       '=> 2020/11/11 Wednesday 5:30  TimeZone : London ', () => {
        const date = moment.tz('2020-11-09 12:00', 'Europe/London').valueOf();

        testCard.rRule = {
            freq: Frequency.WEEKLY,
            byweekday: [Day.SA, Day.SU, Day.WE],
            byhour: [10, 5, 18],
            byminute: [30],
            tzid: 'Europe/London'
        };

        const expectedResponseDate = moment.tz('2020-11-11 05:30', 'Europe/London').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });

    it('2020/11/09 Monday 11:00 TimeZone : London  ' +
       'Recurrence : 10:30 5:30 18:30 TimeZone Paris / Saturday(6) Sunday(7) Wednesday(3) ' +
       '=> 2020/11/11 Wednesday 4:30 TimeZone : London ', () => {
        const date = moment.tz('2020-11-09 11:00', 'Europe/London').valueOf();

        testCard.rRule = {
            freq: Frequency.WEEKLY,
            byweekday: [Day.SA, Day.SU, Day.WE],
            byhour: [10, 5, 18],
            byminute: [30]
        };

        const expectedResponseDate = moment.tz('2020-11-11 04:30', 'Europe/London').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });
});

describe('RRuleReminderUtils:getNextTimeForRepeating with recurrence on months only   ', () => {
    let testCard: Card;

    it('2020/11/09 10:00 , locale = en , Recurrence : 16:30 / November => 2020/11/09 16:30 ', () => {
        moment.locale('en');
        const date = moment.tz('2020-11-09 10:00', 'Europe/Paris').valueOf();
        const cardTemplate = {startDate: moment.tz('2020-11-09 08:00', 'Europe/Paris').valueOf()};
        testCard = getOneRandomCard(cardTemplate);

        testCard.rRule = {
            freq: Frequency.DAILY,
            bymonth: [11],
            byhour: [16],
            byminute: [30]
        };

        const expectedResponseDate = moment.tz('2020-11-09 16:30', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(new Date(dateForRepeating)).toEqual(new Date(expectedResponseDate));
    });

    it('2020/11/09 16:30 , locale = en , Recurrence : 10:00 / November => 2020/11/10 10:00 ', () => {
        moment.locale('en');
        const date = moment.tz('2020-11-09 16:30', 'Europe/Paris').valueOf();
        const cardTemplate = {startDate: moment.tz('2020-11-09 08:00', 'Europe/Paris').valueOf()};
        testCard = getOneRandomCard(cardTemplate);

        testCard.rRule = {
            freq: Frequency.DAILY,
            bymonth: [11],
            byhour: [10],
            byminute: [0]
        };

        const expectedResponseDate = moment.tz('2020-11-10 10:00', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(new Date(dateForRepeating)).toEqual(new Date(expectedResponseDate));
    });

    it('2020/11/09 16:30 , locale = en , Recurrence : 10:00 / March => 2021/03/01 10:00 ', () => {
        moment.locale('en');
        const date = moment.tz('2020-11-09 16:30', 'Europe/Paris').valueOf();
        const cardTemplate = {startDate: moment.tz('2020-11-09 08:00', 'Europe/Paris').valueOf()};
        testCard = getOneRandomCard(cardTemplate);

        testCard.rRule = {
            freq: Frequency.DAILY,
            bymonth: [3],
            byhour: [10],
            byminute: [0]
        };

        const expectedResponseDate = moment.tz('2021-03-01 10:00', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(new Date(dateForRepeating)).toEqual(new Date(expectedResponseDate));
    });

    it('2020/11/09 10:00 , locale = en , Recurrence : 16:30 / December => 2020/12/01 16:30 ', () => {
        moment.locale('en');
        const date = moment.tz('2020-11-09 10:00', 'Europe/Paris').valueOf();
        const cardTemplate = {startDate: moment.tz('2020-11-09 08:00', 'Europe/Paris').valueOf()};
        testCard = getOneRandomCard(cardTemplate);

        testCard.rRule = {
            freq: Frequency.DAILY,
            bymonth: [12],
            byhour: [16],
            byminute: [30]
        };

        const expectedResponseDate = moment.tz('2020-12-01 16:30', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(new Date(dateForRepeating)).toEqual(new Date(expectedResponseDate));
    });

    it('2020/08/03 10:00 , locale = en , Recurrence : 16:30 / February , December => 2020/12/01 16:30 ', () => {
        moment.locale('en');
        const date = moment.tz('2020-08-03 10:00', 'Europe/Paris').valueOf();
        const cardTemplate = {startDate: moment.tz('2020-08-03 08:00', 'Europe/Paris').valueOf()};
        testCard = getOneRandomCard(cardTemplate);

        testCard.rRule = {
            freq: Frequency.DAILY,
            bymonth: [2, 12],
            byhour: [16],
            byminute: [30]
        };

        const expectedResponseDate = moment.tz('2020-12-01 16:30', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(new Date(dateForRepeating)).toEqual(new Date(expectedResponseDate));
    });

    it('2020/08/03 10:00 , locale = en , Recurrence : 16:30 / December, February => 2020/12/01 16:30 ', () => {
        moment.locale('en');
        const date = moment.tz('2020-08-03 10:00', 'Europe/Paris').valueOf();
        const cardTemplate = {startDate: moment.tz('2020-08-03 08:00', 'Europe/Paris').valueOf()};
        testCard = getOneRandomCard(cardTemplate);

        testCard.rRule = {
            freq: Frequency.DAILY,
            bymonth: [12, 2],
            byhour: [16],
            byminute: [30]
        };

        const expectedResponseDate = moment.tz('2020-12-01 16:30', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(new Date(dateForRepeating)).toEqual(new Date(expectedResponseDate));
    });
});

describe('RRuleReminderUtils:getNextTimeForRepeating with recurrence on days and months   ', () => {
    let testCard: Card;

    it('2020/11/12 Thursday 10:00 , locale = en , Recurrence : 16:30 / Wednesday / November => 2020/11/18 16:30 ', () => {
        moment.locale('en');
        const date = moment.tz('2020-11-12 10:00', 'Europe/Paris').valueOf();
        const cardTemplate = {startDate: moment.tz('2020-11-12 08:00', 'Europe/Paris').valueOf()};
        testCard = getOneRandomCard(cardTemplate);

        testCard.rRule = {
            freq: Frequency.DAILY,
            bymonth: [11],
            byweekday: [Day.WE],
            byhour: [16],
            byminute: [30]
        };

        const expectedResponseDate = moment.tz('2020-11-18 16:30', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(new Date(dateForRepeating)).toEqual(new Date(expectedResponseDate));
    });

    it('2020/11/09 Monday 10:00 , locale = en , Recurrence : 16:30 / Wednesday / November => 2020/11/11 16:30 ', () => {
        moment.locale('en');
        const date = moment.tz('2020-11-09 10:00', 'Europe/Paris').valueOf();
        const cardTemplate = {startDate: moment.tz('2020-11-09 08:00', 'Europe/Paris').valueOf()};
        testCard = getOneRandomCard(cardTemplate);

        testCard.rRule = {
            freq: Frequency.DAILY,
            bymonth: [11],
            byweekday: [Day.WE],
            byhour: [16],
            byminute: [30]
        };

        const expectedResponseDate = moment.tz('2020-11-11 16:30', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(new Date(dateForRepeating)).toEqual(new Date(expectedResponseDate));
    });

    it('2020/11/09 Monday 10:00 , locale = en , Recurrence : 09:00 / Monday, Wednesday / November => 2020/11/11 09:00 ', () => {
        moment.locale('en');
        const date = moment.tz('2020-11-09 10:00', 'Europe/Paris').valueOf();
        const cardTemplate = {startDate: moment.tz('2020-11-09 08:00', 'Europe/Paris').valueOf()};
        testCard = getOneRandomCard(cardTemplate);

        testCard.rRule = {
            freq: Frequency.DAILY,
            bymonth: [11],
            byweekday: [Day.MO, Day.WE],
            byhour: [9],
            byminute: [0]
        };

        const expectedResponseDate = moment.tz('2020-11-11 09:00', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(new Date(dateForRepeating)).toEqual(new Date(expectedResponseDate));
    });

    it('2020/11/09 Monday 10:00 , locale = en , Recurrence : 16:30 / Monday, Wednesday / November => 2020/11/09 16:30 ', () => {
        moment.locale('en');
        const date = moment.tz('2020-11-09 10:00', 'Europe/Paris').valueOf();
        const cardTemplate = {startDate: moment.tz('2020-11-09 08:00', 'Europe/Paris').valueOf()};
        testCard = getOneRandomCard(cardTemplate);

        testCard.rRule = {
            freq: Frequency.DAILY,
            bymonth: [11],
            byweekday: [Day.WE, Day.MO],
            byhour: [16],
            byminute: [30]
        };

        const expectedResponseDate = moment.tz('2020-11-09 16:30', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(new Date(dateForRepeating)).toEqual(new Date(expectedResponseDate));
    });

    it('2020/11/09 Monday 10:00 , locale = en , Recurrence : 09:00 / Monday, Wednesday / January , November => 2020/11/11 09:00 ', () => {
        moment.locale('en');
        const date = moment.tz('2020-11-09 10:00', 'Europe/Paris').valueOf();
        const cardTemplate = {startDate: moment.tz('2020-11-09 08:00', 'Europe/Paris').valueOf()};
        testCard = getOneRandomCard(cardTemplate);

        testCard.rRule = {
            freq: Frequency.DAILY,
            bymonth: [11, 1],
            byweekday: [Day.MO, Day.WE],
            byhour: [9],
            byminute: [0]
        };

        const expectedResponseDate = moment.tz('2020-11-11 09:00', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(new Date(dateForRepeating)).toEqual(new Date(expectedResponseDate));
    });

    it('2020/11/09 Monday 10:00 , locale = en , Recurrence : 09:00 / Monday, Wednesday / March , January => 2021/01/04 09:00 ', () => {
        moment.locale('en');
        const date = moment.tz('2020-11-09 10:00', 'Europe/Paris').valueOf();
        const cardTemplate = {startDate: moment.tz('2020-11-09 08:00', 'Europe/Paris').valueOf()};
        testCard = getOneRandomCard(cardTemplate);

        testCard.rRule = {
            freq: Frequency.DAILY,
            bymonth: [3, 1],
            byweekday: [Day.MO, Day.WE],
            byhour: [9],
            byminute: [0]
        };

        const expectedResponseDate = moment.tz('2021-01-04 09:00', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(new Date(dateForRepeating)).toEqual(new Date(expectedResponseDate));
    });

    it('2020/11/30 Monday 18:00 , locale = en , Recurrence : 16:30 / Wednesday / November => 2021/11/03 16:30 ', () => {
        moment.locale('en');
        const date = moment.tz('2020-11-30 18:00', 'Europe/Paris').valueOf();
        const cardTemplate = {startDate: moment.tz('2020-11-30 08:00', 'Europe/Paris').valueOf()};
        testCard = getOneRandomCard(cardTemplate);

        testCard.rRule = {
            freq: Frequency.DAILY,
            bymonth: [11],
            byweekday: [Day.WE],
            byhour: [16],
            byminute: [30]
        };

        const expectedResponseDate = moment.tz('2021-11-03 16:30', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(new Date(dateForRepeating)).toEqual(new Date(expectedResponseDate));
    });

    it('2020/11/29 Sunday 10:00 , locale = en , Recurrence : 16:30 / Wednesday / November => 2021/11/03 16:30 ', () => {
        moment.locale('en');
        const date = moment.tz('2020-11-29 10:00', 'Europe/Paris').valueOf();
        const cardTemplate = {startDate: moment.tz('2020-11-29 08:00', 'Europe/Paris').valueOf()};
        testCard = getOneRandomCard(cardTemplate);

        testCard.rRule = {
            freq: Frequency.DAILY,
            bymonth: [11],
            byweekday: [Day.WE],
            byhour: [16],
            byminute: [30]
        };

        const expectedResponseDate = moment.tz('2021-11-03 16:30', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(new Date(dateForRepeating)).toEqual(new Date(expectedResponseDate));
    });

    it('2020/11/29 Sunday 10:00 , locale = en , Recurrence : 16:30 / Wednesday / November, February => 2021/11/03 16:30 ', () => {
        moment.locale('en');
        const date = moment.tz('2020-11-29 10:00', 'Europe/Paris').valueOf();
        const cardTemplate = {startDate: moment.tz('2020-11-29 08:00', 'Europe/Paris').valueOf()};
        testCard = getOneRandomCard(cardTemplate);

        testCard.rRule = {
            freq: Frequency.DAILY,
            bymonth: [11, 2],
            byweekday: [Day.WE],
            byhour: [16],
            byminute: [30]
        };

        const expectedResponseDate = moment.tz('2021-02-03 16:30', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(new Date(dateForRepeating)).toEqual(new Date(expectedResponseDate));
    });

    it('2020/11/29 Sunday 10:00 , locale = en , Recurrence : 16:30 / Wednesday, Monday / November, February => 2021/11/03 16:30 ', () => {
        moment.locale('en');
        const date = moment.tz('2020-11-29 10:00', 'Europe/Paris').valueOf();
        const cardTemplate = {startDate: moment.tz('2020-11-29 08:00', 'Europe/Paris').valueOf()};
        testCard = getOneRandomCard(cardTemplate);

        testCard.rRule = {
            freq: Frequency.DAILY,
            bymonth: [11, 2],
            byweekday: [Day.WE, Day.MO],
            byhour: [16],
            byminute: [30]
        };

        const expectedResponseDate = moment.tz('2020-11-30 16:30', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(new Date(dateForRepeating)).toEqual(new Date(expectedResponseDate));
    });

    it('2020/08/29 Saturday 10:00 , locale = en , Recurrence : 16:30 / Wednesday, Monday / December, October => 2020/10/05 16:30 ', () => {
        moment.locale('en');
        const date = moment.tz('2020-08-29 10:00', 'Europe/Paris').valueOf();
        const cardTemplate = {startDate: moment.tz('2020-08-29 08:00', 'Europe/Paris').valueOf()};
        testCard = getOneRandomCard(cardTemplate);

        testCard.rRule = {
            freq: Frequency.DAILY,
            bymonth: [12, 10],
            byweekday: [Day.WE, Day.MO],
            byhour: [16],
            byminute: [30]
        };

        const expectedResponseDate = moment.tz('2020-10-05 16:30', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(new Date(dateForRepeating)).toEqual(new Date(expectedResponseDate));
    });

    it('2020/08/29 Saturday 10:00 , locale = en , Recurrence : 16:30 / Wednesday, Friday / August, October => 2020/10/02 16:30 ', () => {
        moment.locale('en');
        const date = moment.tz('2020-08-29 10:00', 'Europe/Paris').valueOf();
        const cardTemplate = {startDate: moment.tz('2020-08-29 08:00', 'Europe/Paris').valueOf()};
        testCard = getOneRandomCard(cardTemplate);

        testCard.rRule = {
            freq: Frequency.DAILY,
            bymonth: [8, 10],
            byweekday: [Day.WE, Day.FR],
            byhour: [16],
            byminute: [30]
        };

        const expectedResponseDate = moment.tz('2020-10-02 16:30', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(new Date(dateForRepeating)).toEqual(new Date(expectedResponseDate));
    });

    it('2020/08/26 Wednesday 10:00 , locale = en , Recurrence : 16:30 / Tuesday / August, october => 2020/10/06 16:30 ', () => {
        moment.locale('en');
        const date = moment.tz('2020-08-26 10:00', 'Europe/Paris').valueOf();
        const cardTemplate = {startDate: moment.tz('2020-08-26 08:00', 'Europe/Paris').valueOf()};
        testCard = getOneRandomCard(cardTemplate);

        testCard.rRule = {
            freq: Frequency.DAILY,
            bymonth: [8, 10],
            byweekday: [Day.TU],
            byhour: [16],
            byminute: [30]
        };

        const expectedResponseDate = moment.tz('2020-10-06 16:30', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(new Date(dateForRepeating)).toEqual(new Date(expectedResponseDate));
    });
});

describe('RRuleReminderUtils:getNextTimeForRepeating without or invalid recurrence ', () => {
    let testCard: Card;

    beforeAll(() => {
        const cardTemplate = {startDate: moment.tz('2000-01-01 08:00', 'Europe/Paris').valueOf()};
        testCard = getOneRandomCard(cardTemplate);
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

    it('No recurrence , date for remind is startdate ,  currentDate is 14 minutes after startDate , should return startDate ', () => {
        const date = moment.tz('2000-01-01 10:00', 'Europe/Paris').valueOf();
        const cardStartdate = moment.tz('2000-01-01 09:46', 'Europe/Paris').valueOf();
        testCard.timeSpans = [new TimeSpan(cardStartdate)];

        const expectedResponseDate = moment.tz('2000-01-01 09:46', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });
});

describe('RRuleReminderUtils:getNextTimeForRepeating with recurrence on months with bymonthday and bysetpos fields  ', () => {
    let testCard: Card;

    beforeAll(() => {
        const cardTemplate = {startDate: moment.tz('2000-01-01 08:00', 'Europe/Paris').valueOf()};
        testCard = getOneRandomCard(cardTemplate);
    });

    it('2000/01/01 10:00 , Recurrence :10:00, first day of months  => 2000/02/01 10:00 ', () => {
        const date = moment.tz('2000-01-01 10:00', 'Europe/Paris').valueOf();

        testCard.rRule = {
            freq: Frequency.MONTHLY,
            byhour: [10],
            byminute: [0],
            bymonthday: [1]
        };

        const expectedResponseDate = new Date('2000-02-01 10:00').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date.valueOf());
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });

    it('2000/01/01 10:00 , Recurrence :10:00, first day of december and april  => 2000/04/01 10:00 ', () => {
        const date = moment.tz('2000-01-01 10:00', 'Europe/Paris').valueOf();

        testCard.rRule = {
            freq: Frequency.MONTHLY,
            bymonth: [12, 4],
            byhour: [10],
            byminute: [0],
            bymonthday: [1]
        };

        const expectedResponseDate = new Date('2000-04-01 10:00').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date.valueOf());
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });

    it('2000/01/01 10:00 , Recurrence :10:00, last day of months  => 2000/01/31 10:00 ', () => {
        const date = moment.tz('2000-01-01 10:00', 'Europe/Paris').valueOf();

        testCard.rRule = {
            freq: Frequency.MONTHLY,
            byhour: [10],
            byminute: [0],
            bymonthday: [-1]
        };

        const expectedResponseDate = new Date('2000-01-31 10:00').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date.valueOf());
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });

    it('2000/01/01 10:00 , Recurrence :10:00, last day of february  => 2000/02/29 10:00 ', () => {
        const date = moment.tz('2000-01-01 10:00', 'Europe/Paris').valueOf();

        testCard.rRule = {
            freq: Frequency.MONTHLY,
            byhour: [10],
            byminute: [0],
            bymonth: [2],
            bymonthday: [-1]
        };

        const expectedResponseDate = new Date('2000-02-29 10:00').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date.valueOf());
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });

    it('2001/01/01 10:00 , Recurrence :10:00, last day of february  => 2001/02/28 10:00 ', () => {
        const date = moment.tz('2001-01-01 10:00', 'Europe/Paris').valueOf();

        testCard.rRule = {
            freq: Frequency.MONTHLY,
            byhour: [10],
            byminute: [0],
            bymonth: [2],
            bymonthday: [-1]
        };

        const expectedResponseDate = new Date('2001-02-28 10:00').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date.valueOf());
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });

    it('2000/01/01 10:00 , Recurrence :10:00, first and last days of months  => 2000/01/31 10:00 ', () => {
        const date = moment.tz('2000-01-01 10:00', 'Europe/Paris').valueOf();

        testCard.rRule = {
            freq: Frequency.MONTHLY,
            byhour: [10],
            byminute: [0],
            bymonthday: [-1, 1]
        };

        const expectedResponseDate = new Date('2000-01-31 10:00').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date.valueOf());
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });

    it('2000/01/31 10:00 , Recurrence :10:00, first and last days of months  => 2000/02/01 10:00 ', () => {
        const date = moment.tz('2000-01-31 10:00', 'Europe/Paris').valueOf();

        testCard.rRule = {
            freq: Frequency.MONTHLY,
            byhour: [10],
            byminute: [0],
            bymonthday: [-1, 1]
        };

        const expectedResponseDate = new Date('2000-02-01 10:00').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date.valueOf());
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });

    it('2000/01/31 10:00 , Recurrence :10:00, first and last days of september and july => 2000/07/01 10:00 ', () => {
        const date = moment.tz('2000-01-31 10:00', 'Europe/Paris').valueOf();

        testCard.rRule = {
            freq: Frequency.MONTHLY,
            byhour: [10],
            byminute: [0],
            bymonth: [9, 7],
            bymonthday: [-1, 1]
        };

        const expectedResponseDate = new Date('2000-07-01 10:00').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date.valueOf());
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });

    it('2000/01/31 10:00 , Recurrence :10:00, first and last mondays of june and september=> 2000/06/05 10:00 ', () => {
        const date = moment.tz('2000-01-31 10:00', 'Europe/Paris').valueOf();

        testCard.rRule = {
            freq: Frequency.MONTHLY,
            byhour: [10],
            byminute: [0],
            bymonth: [9, 6],
            byweekday: [Day.MO],
            bysetpos: [-1, 1]
        };

        const expectedResponseDate = new Date('2000-06-05 10:00').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date.valueOf());
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });

    it('2000/01/31 10:00 , Recurrence :10:00, second and last mondays of june and september=> 2000/06/12 10:00 ', () => {
        const date = moment.tz('2000-01-31 10:00', 'Europe/Paris').valueOf();

        testCard.rRule = {
            freq: Frequency.MONTHLY,
            byhour: [10],
            byminute: [0],
            bymonth: [6, 9],
            byweekday: [Day.MO],
            bysetpos: [-1, 2]
        };

        const expectedResponseDate = new Date('2000-06-12 10:00').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date.valueOf());
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });

    it('2000/01/31 10:00 , Recurrence :16:00, every 26 of each months=> 2000/02/26 16:00 ', () => {
        const date = moment.tz('2000-01-31 10:00', 'Europe/Paris').valueOf();

        testCard.rRule = {
            freq: Frequency.MONTHLY,
            byhour: [16],
            byminute: [0],
            bymonthday: [26]
        };

        const expectedResponseDate = new Date('2000-02-26 16:00').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date.valueOf());
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });

    it('2000/01/31 10:00 , Recurrence :16:00, every last friday of each months=> 2000/02/25 16:00 ', () => {
        const date = moment.tz('2000-01-31 10:00', 'Europe/Paris').valueOf();

        testCard.rRule = {
            freq: Frequency.MONTHLY,
            byhour: [16],
            byminute: [0],
            byweekday: [Day.FR],
            bysetpos: [-1]
        };

        const expectedResponseDate = new Date('2000-02-25 16:00').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date.valueOf());
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });

    it('2000/07/20 10:00 , Recurrence :16:00, every last friday of each months except august => 2000/07/28 16:00 ', () => {
        const date = moment.tz('2000-07-20 10:00', 'Europe/Paris').valueOf();

        testCard.rRule = {
            freq: Frequency.MONTHLY,
            byhour: [16],
            byminute: [0],
            bymonth: [1,2,3,4,5,6,7,9,10,11,12],
            byweekday: [Day.FR],
            bysetpos: [-1]
        };

        const expectedResponseDate = new Date('2000-07-28 16:00').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date.valueOf());
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });

    it('2000/07/31 10:00 , Recurrence :16:00, every last friday of each months except august => 2000/09/29 16:00 ', () => {
        const date = moment.tz('2000-07-31 10:00', 'Europe/Paris').valueOf();

        testCard.rRule = {
            freq: Frequency.MONTHLY,
            byhour: [16],
            byminute: [0],
            bymonth: [1,2,3,4,5,6,7,9,10,11,12],
            byweekday: [Day.FR],
            bysetpos: [-1]
        };

        const expectedResponseDate = new Date('2000-09-29 16:00').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date.valueOf());
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });
});