/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Card, TimeSpan} from '@ofModel/card.model';
import {Frequency, Weekday, RRule} from 'rrule';
import {Frequency as OpfabFrequency} from "@ofModel/light-card.model";

const MAX_MILLISECONDS_FOR_REMINDING_AFTER_EVENT_STARTS = 60000 * 15; // 15 minutes
const NB_MILLISECONDS_IN_ONE_MINUTE = 60000;
const NB_MILLISECONDS_IN_ONE_SECOND = 1000;

export function getNextTimeForRepeating(card: Card, startingDate?: number): number {
    if (!startingDate) {
        startingDate = new Date().valueOf();
    }

    if (!!card.timeSpans) {
        let nextTime = -1;
        card.timeSpans.forEach((timeSpan) => {
            const timeForRepeating = getNextTimeForRepeatingFromTimeSpan(timeSpan, card, startingDate);
            if (timeForRepeating !== -1) {
                if (nextTime === -1 || timeForRepeating < nextTime) nextTime = timeForRepeating;
            }
        });
        return nextTime;
    } else {
        if (startingDate > card.startDate) {
            return getNextDateTimeFromRRule(startingDate, card);
        }
        else {
            return getNextDateTimeFromRRule(card.startDate, card);
        }
    }
}

function getNextTimeForRepeatingFromTimeSpan(timeSpan: TimeSpan, card: Card, startingDate: number): number {
    if (!!timeSpan) {
        if (!timeSpan.recurrence) {
            if (timeSpan.start + MAX_MILLISECONDS_FOR_REMINDING_AFTER_EVENT_STARTS < startingDate) {
                return -1;
            } else {
                return timeSpan.start;
            }
        } else {
            if (startingDate > timeSpan.start) {
                return getNextDateTimeFromRRule(startingDate, card);
            } else {
                return getNextDateTimeFromRRule(timeSpan.start, card);
            }
        }
    }
    return -1;
}

export function getNextDateTimeFromRRule(startingDate: number, card: Card): number {

    if (!!card.rRule && !!card.rRule.freq) {

        const byweekdayForRRule = [];
        if (!! card.rRule.byweekday) {
            card.rRule.byweekday.forEach(weekday => {
                byweekdayForRRule.push(Weekday.fromStr(weekday));
            });
        }

        let tzid = 'Europe/Paris';
        if (!! card.rRule.tzid && card.rRule.tzid !== '') {
            tzid = card.rRule.tzid;
        }

        if ((card.rRule.freq === OpfabFrequency.HOURLY) || (card.rRule.freq === OpfabFrequency.MINUTELY)) {
            return getNextDateTimeFromRRuleInCaseOfHourlyOrMinutelyRecurrence(startingDate, card, byweekdayForRRule, tzid);
        }

        let byhourSorted = null;
        if (!!card.rRule.byhour) {
            byhourSorted = card.rRule.byhour;
            byhourSorted.sort(function (a, b) {return a - b;});
        }

        let byminuteSorted = null;
        if (!!card.rRule.byminute) {
            byminuteSorted = card.rRule.byminute;
            byminuteSorted.sort(function (a, b) {return a - b;});
        }

        let rule: RRule;
        rule = new RRule({
            freq: convertOpfabFrequencyToRRuleFrequency(card.rRule.freq),
            count: 1,
            bymonth: card.rRule.bymonth,
            byweekday: byweekdayForRRule,
            byhour: byhourSorted,
            byminute: byminuteSorted,
            bysetpos: card.rRule.bysetpos,
            bymonthday: card.rRule.bymonthday
        });

        // Workaround I've found to have the right hour for dtstart. Otherwise, it is transformed in UTC time and so the result is not the good one
        // Maybe a bug of rrule.js...
        rule = RRule.fromString(rule.toString() +
                                ';DTSTART;TZID=' + tzid + ':' +
                                dateObjectToYYYYMMDDTHHmmss(new Date(startingDate + NB_MILLISECONDS_IN_ONE_MINUTE)));

        const nextDateTimeFromRRule = rule.all(function (date, i) {return i < 1})[0];

        // It is necessary to do this addition to have the right hour, maybe a bug of rrule.js here too...
        return (nextDateTimeFromRRule.valueOf() +
                nextDateTimeFromRRule.getTimezoneOffset() * NB_MILLISECONDS_IN_ONE_MINUTE);
    }
    return -1;
}

export function getNextDateTimeFromRRuleInCaseOfHourlyOrMinutelyRecurrence(startingDate: number,
                                                                           card: Card,
                                                                           byweekdayForRRule: Weekday[],
                                                                           tzid: string): number {

    let rule: RRule;
    let nextDateTimeNumber = card.startDate;
    const ruleBase = new RRule({
        freq: convertOpfabFrequencyToRRuleFrequency(card.rRule.freq),
        count: 1,
        interval: card.rRule.interval,
        bymonth: card.rRule.bymonth,
        byweekday: byweekdayForRRule,
        byminute: card.rRule.freq === OpfabFrequency.HOURLY ? new Date(card.startDate).getMinutes() : null,
        bysecond: card.rRule.freq === OpfabFrequency.MINUTELY ? new Date(card.startDate).getSeconds() : null
    });

    let timeToAdd = NB_MILLISECONDS_IN_ONE_MINUTE;
    if (card.rRule.freq === OpfabFrequency.MINUTELY) {
        timeToAdd = NB_MILLISECONDS_IN_ONE_SECOND;
    }

    let nextDateTimeFromRRule;

    do {
        rule = RRule.fromString(ruleBase.toString() +
            ';DTSTART;TZID=' + tzid + ':' +
            dateObjectToYYYYMMDDTHHmmss(new Date(nextDateTimeNumber + timeToAdd)));

        nextDateTimeFromRRule = rule.all(function (date, i) {return i < 1})[0];

        nextDateTimeNumber = nextDateTimeFromRRule.valueOf() +
            nextDateTimeFromRRule.getTimezoneOffset() * NB_MILLISECONDS_IN_ONE_MINUTE;
    } while (nextDateTimeNumber <= startingDate);

    return nextDateTimeNumber;
}

function convertOpfabFrequencyToRRuleFrequency(opfabFrequency: OpfabFrequency): Frequency {
    return Frequency[OpfabFrequency[opfabFrequency] as keyof typeof Frequency];
}

function dateObjectToYYYYMMDDTHHmmss(date: Date): string {
    if (!!date) {
        return '' + date.getFullYear() +
            pad(date.getMonth() + 1) +
            pad(date.getDate()) +
            'T' +
            pad(date.getHours()) +
            pad(date.getMinutes()) +
            pad(date.getSeconds());
    }
    return null;
}

function pad(number): string {
    if (number < 10) {
        return '0' + number;
    }
    return number;
}
