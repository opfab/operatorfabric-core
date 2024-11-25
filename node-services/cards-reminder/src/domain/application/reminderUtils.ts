/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Card, Recurrence, HourAndMinutes, TimeSpan} from '../model/card.model';
import {add, getISODay} from 'date-fns';
import {fromZonedTime, toZonedTime} from 'date-fns-tz';

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

    if (recurrence.timeZone == null || !isValidTimeZone(recurrence.timeZone)) {
        recurrence.timeZone = 'Europe/Paris';
    }

    let nextDateTime = new Date(StartingDate);
    nextDateTime = toZonedTime(nextDateTime, recurrence.timeZone);

    const startingHoursMinutes = new HourAndMinutes(nextDateTime.getHours(), nextDateTime.getMinutes());
    if (isFirstHoursMinutesInferiorOrEqualToSecondOne(recurrence.hoursAndMinutes, startingHoursMinutes)) {
        nextDateTime = add(nextDateTime, {days: 1, hours: 0, minutes: 0});
    }

    nextDateTime = moveToValidMonth(nextDateTime, recurrence);

    if (isDaysOfWeekFieldSet(recurrence)) {
        if (recurrence?.daysOfWeek?.includes(getISODay(nextDateTime)) === false) {
            // we keep the month found previously
            const monthForNextDateTime = nextDateTime.getMonth();

            nextDateTime.setHours(0);
            nextDateTime.setMinutes(0);
            do {
                nextDateTime = add(nextDateTime, {days: 1});

                if (nextDateTime.getMonth() !== monthForNextDateTime) {
                    // in case incrementing took us into the next month
                    nextDateTime = moveToValidMonth(nextDateTime, recurrence);
                }
            } while (!recurrence.daysOfWeek.includes(getISODay(nextDateTime)));

            nextDateTime.setHours(recurrence.hoursAndMinutes.hours);
            nextDateTime.setMinutes(recurrence.hoursAndMinutes.minutes);
            nextDateTime.setSeconds(0);
            nextDateTime.setMilliseconds(0);
            nextDateTime = fromZonedTime(nextDateTime, recurrence.timeZone);

            return nextDateTime.valueOf();
        }
    }

    nextDateTime.setHours(recurrence.hoursAndMinutes.hours);
    nextDateTime.setMinutes(recurrence.hoursAndMinutes.minutes);
    nextDateTime.setSeconds(0);
    nextDateTime.setMilliseconds(0);
    nextDateTime = fromZonedTime(nextDateTime, recurrence.timeZone);
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

function moveToValidMonth(nextDateTime: Date, recurrence: Recurrence): Date {
    if (
        recurrence.months != null &&
        recurrence.months.length > 0 &&
        !recurrence.months.includes(nextDateTime.getMonth())
    ) {
        do {
            nextDateTime = add(nextDateTime, {months: 1});
            nextDateTime.setDate(1);
        } while (!recurrence.months.includes(nextDateTime.getMonth()));
    }
    return nextDateTime;
}

function isFirstHoursMinutesInferiorOrEqualToSecondOne(hm1: HourAndMinutes, hm2: HourAndMinutes): boolean {
    if (hm1.hours < hm2.hours) return true;
    if (hm1.hours > hm2.hours) return false;
    return hm1.minutes <= hm2.minutes;
}

function isDaysOfWeekFieldSet(recurrence: Recurrence): boolean {
    return recurrence.daysOfWeek != null && recurrence.daysOfWeek.length > 0;
}

function isValidTimeZone(tz): boolean {
    try {
        Intl.DateTimeFormat(undefined, {timeZone: tz});
        return true;
        //eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (ex) {
        return false;
    }
}
