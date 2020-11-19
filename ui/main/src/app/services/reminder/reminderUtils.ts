/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import { Card, Recurrence, HourAndMinutes } from '@ofModel/card.model';
import moment from 'moment';


const MAX_MILLISECONDS_FOR_REMINDING_AFTER_EVENT_STARTS =  60000 * 15; // 15 minutes

export function getNextTimeForRepeating(card: Card, startingDate?: number) {

    if (!!card.timeSpans) {
        if (!startingDate) startingDate = new Date().valueOf();
        if (!card.timeSpans[0].recurrence) {
            if (card.timeSpans[0].start + MAX_MILLISECONDS_FOR_REMINDING_AFTER_EVENT_STARTS < startingDate) return -1;
            return card.timeSpans[0].start;
        } else {
            if (startingDate > card.timeSpans[0].start) return getNextTimeFromRecurrence(startingDate, card.timeSpans[0].recurrence);
            else return getNextTimeFromRecurrence(card.timeSpans[0].start, card.timeSpans[0].recurrence);
        }
    }
    return -1;
}

function getNextTimeFromRecurrence(StartingDate: number, recurrence: Recurrence): number {
 
    const date = moment(StartingDate).tz(recurrence.timeZone);
    if (isDaysOfWeekFieldSet(recurrence)) {
        if (!recurrence.daysOfWeek.includes(date.isoWeekday())) {
            date.set('hours', 0);
            date.set('minutes', 0);
            let nb_add = 0;
            do {
                nb_add++;
                if (nb_add > 7) return -1; // in case we have an invalid recurrence daysOfWeek array
                date.add(1, 'day');
            }
            while (!recurrence.daysOfWeek.includes(date.isoWeekday()));
            const firstHoursMinutes = getNextFormTimeArray(new HourAndMinutes(0, 0), recurrence.hoursAndMinutes);
            date.set('hours', firstHoursMinutes.hours);
            date.set('minutes', firstHoursMinutes.minutes);
            date.set('seconds', 0);
            date.set('milliseconds', 0);
            return date.valueOf();
        }
    }

    const startingHoursMinutes = new HourAndMinutes(date.hours(), date.minutes());
    const nextHoursMinutes = getNextFormTimeArray(startingHoursMinutes, recurrence.hoursAndMinutes);

    if (!isFirstHoursMinutesSuperiorToSecondOne(nextHoursMinutes, startingHoursMinutes)) {
            date.add(1, 'day');
            if (isDaysOfWeekFieldSet(recurrence)) {
                while (!recurrence.daysOfWeek.includes(date.isoWeekday()))  date.add(1, 'day');
            }

        }
    date.set('hours', nextHoursMinutes.hours);
    date.set('minutes', nextHoursMinutes.minutes);
    date.set('seconds', 0);
    date.set('milliseconds', 0);
    return date.valueOf();
}



 function getNextFormTimeArray(initialValue: HourAndMinutes, possibleValues: HourAndMinutes[]): HourAndMinutes {

    let i = 1;
    let value = possibleValues[0];
    let timeSpan = subtractHM2ToHM1(value, initialValue);
    while (i < possibleValues.length) {
        const nextTimeSpan = subtractHM2ToHM1(possibleValues[i], initialValue);
        if (nextTimeSpan > 0) {
            if ((timeSpan <= 0) || (nextTimeSpan < timeSpan)) {
                timeSpan = nextTimeSpan;
                value = possibleValues[i];
            }
        } else {
            if (nextTimeSpan !== 0 && timeSpan < 0 && timeSpan > nextTimeSpan) {
                timeSpan = nextTimeSpan;
                value = possibleValues[i];
            }
        }
        i++;
    }
    return value;
}


function isFirstHoursMinutesSuperiorToSecondOne(hm1: HourAndMinutes, hm2: HourAndMinutes): boolean {
    if (hm1.hours > hm2.hours) return true;
    if (hm1.hours < hm2.hours) return false;
    return hm1.minutes > hm2.minutes;
}

function subtractHM2ToHM1(hm1: HourAndMinutes, hm2: HourAndMinutes): number {

    return hm1.hours * 60 + hm1.minutes - hm2.hours * 60 + hm2.minutes;
}

function isDaysOfWeekFieldSet(recurrence: Recurrence): boolean {
    return !!recurrence.daysOfWeek && (recurrence.daysOfWeek.length > 0) ;
}

