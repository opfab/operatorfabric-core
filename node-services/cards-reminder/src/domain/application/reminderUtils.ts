/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Card, Recurrence, HourAndMinutes, TimeSpan} from '../model/card.model';
import moment from 'moment-timezone';

export function getNextTimeForRepeating(card: Card, startingDate?: number): number {
    if (card.timeSpans != null) {
        let nextTime = -1;

        card.timeSpans.forEach((timeSpan) => {
            const timeForRepeating = getNextTimeForRepeatingFromTimeSpan(timeSpan, startingDate);
            if (timeForRepeating !== -1) {
                if (nextTime === -1 || timeForRepeating < nextTime) nextTime = timeForRepeating;
            }
        });
        if (card.endDate != null && nextTime > card.endDate) return -1;
        return nextTime;
    }
    return -1;
}

function getNextTimeForRepeatingFromTimeSpan(timeSpan: TimeSpan, startingDate?: number): number {
    if (startingDate == null) {
        startingDate = new Date().valueOf();
    }
    if (timeSpan.recurrence == null) {
        if (timeSpan.start < startingDate) {
            return -1;
        } else {
            return timeSpan.start;
        }
    } else if (startingDate > timeSpan.start) {
        return getNextDateTimeFromRecurrence(startingDate, timeSpan.recurrence);
    } else {
        return getNextDateTimeFromRecurrence(timeSpan.start, timeSpan.recurrence);
    }
}

function getNextDateTimeFromRecurrence(StartingDate: number, recurrence: Recurrence): number {
    if (!isRecurrenceObjectInValidFormat(recurrence)) {
        return -1;
    }

    if (recurrence.timeZone == null) recurrence.timeZone = 'Europe/Paris';
    const nextDateTime = moment(StartingDate).tz(recurrence.timeZone);

    const startingHoursMinutes = new HourAndMinutes(nextDateTime.hours(), nextDateTime.minutes());
    if (isFirstHoursMinutesInferiorOrEqualToSecondOne(recurrence.hoursAndMinutes, startingHoursMinutes)) {
        nextDateTime.add(1, 'day');
        nextDateTime.set('hours', 0);
        nextDateTime.set('minutes', 0);
    }

    moveToValidMonth(nextDateTime, recurrence);

    if (isDaysOfWeekFieldSet(recurrence)) {
        if (recurrence?.daysOfWeek?.includes(nextDateTime.isoWeekday()) === false) {
            // we keep the month found previously
            const monthForNextDateTime = nextDateTime.month();

            nextDateTime.set('hours', 0);
            nextDateTime.set('minutes', 0);
            do {
                nextDateTime.add(1, 'day');

                if (nextDateTime.month() !== monthForNextDateTime) {
                    // in case incrementing took us into the next month
                    moveToValidMonth(nextDateTime, recurrence);
                }
            } while (!recurrence.daysOfWeek.includes(nextDateTime.isoWeekday()));

            nextDateTime.set('hours', recurrence.hoursAndMinutes.hours);
            nextDateTime.set('minutes', recurrence.hoursAndMinutes.minutes);
            nextDateTime.set('seconds', 0);
            nextDateTime.set('milliseconds', 0);

            return nextDateTime.valueOf();
        }
    }

    nextDateTime.set('hours', recurrence.hoursAndMinutes.hours);
    nextDateTime.set('minutes', recurrence.hoursAndMinutes.minutes);
    nextDateTime.set('seconds', 0);
    nextDateTime.set('milliseconds', 0);
    return nextDateTime.valueOf();
}

function isRecurrenceObjectInValidFormat(recurrence: Recurrence): boolean {
    if (recurrence.months != null) {
        for (const month of recurrence.months) {
            if (month < 0 || month > 11) {
                return false;
            }
        }
    }

    if (recurrence.daysOfWeek != null) {
        for (const dayOfWeek of recurrence.daysOfWeek) {
            if (dayOfWeek < 1 || dayOfWeek > 7) {
                return false;
            }
        }
    }
    return true;
}

function moveToValidMonth(nextDateTime: moment.Moment, recurrence: Recurrence): void {
    if (recurrence.months == null || recurrence.months.length === 0) return;
    if (recurrence.months.includes(nextDateTime.month())) return;
    // month validity has been checked before
    // so it avoids infinite loop for month outside of authorized range
    do {
        nextDateTime.add(1, 'month');
        nextDateTime.set('date', 1);
    } while (!recurrence.months.includes(nextDateTime.month()));
}

function isFirstHoursMinutesInferiorOrEqualToSecondOne(hm1: HourAndMinutes, hm2: HourAndMinutes): boolean {
    if (hm1.hours < hm2.hours) return true;
    if (hm1.hours > hm2.hours) return false;
    return hm1.minutes <= hm2.minutes;
}

function isDaysOfWeekFieldSet(recurrence: Recurrence): boolean {
    return recurrence.daysOfWeek != null && recurrence.daysOfWeek.length > 0;
}
