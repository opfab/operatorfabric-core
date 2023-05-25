/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Card, Recurrence, HourAndMinutes, TimeSpan} from '@ofModel/card.model';
import moment from 'moment-timezone';

const MAX_MILLISECONDS_FOR_REMINDING_AFTER_EVENT_STARTS = 60000 * 15; // 15 minutes

export function getNextTimeForRepeating(card: Card, startingDate?: number): number {
    if (card.timeSpans) {
        let nextTime = -1;
        card.timeSpans.forEach((timeSpan) => {
            const timeForRepeating = getNextTimeForRepeatingFromTimeSpan(timeSpan, startingDate);
            if (timeForRepeating !== -1) {
                if (nextTime === -1 || timeForRepeating < nextTime) nextTime = timeForRepeating;
            }
        });
        return nextTime;
    }
    return -1;
}

function getNextTimeForRepeatingFromTimeSpan(timeSpan: TimeSpan, startingDate?: number): number {
    if (timeSpan) {
        if (!startingDate) {
            startingDate = new Date().valueOf();
        }
        if (!timeSpan.recurrence) {
            if (timeSpan.start + MAX_MILLISECONDS_FOR_REMINDING_AFTER_EVENT_STARTS < startingDate) {
                return -1;
            } else {
                return timeSpan.start;
            }
        } else {
            if (startingDate > timeSpan.start) {
                return getNextDateTimeFromRecurrence(startingDate, timeSpan.recurrence);
            } else {
                return getNextDateTimeFromRecurrence(timeSpan.start, timeSpan.recurrence);
            }
        }
    }
    return -1;
}

function getNextDateTimeFromRecurrence(StartingDate: number, recurrence: Recurrence): number {
    if (! isRecurrenceObjectInValidFormat(recurrence)) {
        return -1;
    }

    const nextDateTime = moment(StartingDate).tz(recurrence.timeZone);

    const startingHoursMinutes = new HourAndMinutes(nextDateTime.hours(), nextDateTime.minutes());
    if (isFirstHoursMinutesInferiorOrEqualToSecondOne(recurrence.hoursAndMinutes, startingHoursMinutes)) {
        nextDateTime.add(1, 'day');
        nextDateTime.set('hours',0);
        nextDateTime.set('minutes',0)
    }

    moveToValidMonth(nextDateTime, recurrence);

    if (isDaysOfWeekFieldSet(recurrence)) {
        if (!recurrence.daysOfWeek.includes(nextDateTime.isoWeekday())) {

            // we keep the month found previously
            const monthForNextDateTime = nextDateTime.month();

            nextDateTime.set('hours', 0);
            nextDateTime.set('minutes', 0);
            let nb_add = 0;
            do {
                nb_add++;
                nextDateTime.add(1, 'day');

                if (nextDateTime.month() !== monthForNextDateTime) { // in case incrementing took us into the next month
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
    if (recurrence.months) {
        for (const month of recurrence.months) {
            if (month < 0 || month > 11) {
                return false;
            }
        }
    }

    if (recurrence.daysOfWeek) {
        for (const dayOfWeek of recurrence.daysOfWeek) {
            if (dayOfWeek < 1 || dayOfWeek > 7) {
                return false;
            }
        }
    }
    return true;
}

function moveToValidMonth(nextDateTime: moment.Moment, recurrence: Recurrence) {
    if (!recurrence.months || recurrence.months.length === 0)
        return;
    if (recurrence.months.includes(nextDateTime.month()))
        return;
    let nb_add = 0;
    do {
        nb_add++;
        if (nb_add > 12)
            return ; // in case we have an invalid recurrence months array
        nextDateTime.add(1, 'month');
        nextDateTime.set('date',1);
    } while (!recurrence.months.includes(nextDateTime.month()));
}

function isFirstHoursMinutesInferiorOrEqualToSecondOne(hm1: HourAndMinutes, hm2: HourAndMinutes): boolean {
    if (hm1.hours < hm2.hours) return true;
    if (hm1.hours > hm2.hours) return false;
    return hm1.minutes <= hm2.minutes;
}

function isDaysOfWeekFieldSet(recurrence: Recurrence): boolean {
    return recurrence.daysOfWeek?.length > 0;
}
