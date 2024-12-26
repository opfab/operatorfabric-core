/* Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import 'jest';
import {Card, TimeSpan} from '../domain/model/card.model';
import {getNextTimeForRepeating} from '../domain/application/reminderUtils';
import {fromZonedTime} from 'date-fns-tz';

describe('ReminderUtils:getNextTimeForRepeating without or invalid recurrence ', () => {
    let testCard: Card;

    beforeAll(() => {
        testCard = new Card('uid', 'id', 0);
    });

    it('No recurrence , date for remind is startdate ', () => {
        const date = fromZonedTime('2000-01-01 10:00', 'Europe/Paris').valueOf();
        const cardStartdate = fromZonedTime('2000-01-01 10:01', 'Europe/Paris').valueOf();
        testCard.timeSpans = [new TimeSpan(cardStartdate)];

        const expectedResponseDate = fromZonedTime('2000-01-01 10:01', 'Europe/Paris').valueOf();
        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(dateForRepeating).toEqual(expectedResponseDate);
    });

    it('No recurrence , date for remind is startdate ,  currentDate is 16 minutes after startDate , should return no date (-1) ', () => {
        const date = fromZonedTime('2000-01-01 10:00', 'Europe/Paris').valueOf();
        const cardStartdate = fromZonedTime('2000-01-01 09:44', 'Europe/Paris').valueOf();
        testCard.timeSpans = [new TimeSpan(cardStartdate)];

        const dateForRepeating = getNextTimeForRepeating(testCard, date);
        expect(dateForRepeating).toEqual(-1);
    });
});
