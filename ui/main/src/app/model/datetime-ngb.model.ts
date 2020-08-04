/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {NgbDate, NgbDateStruct, NgbTimeStruct} from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment-timezone';
import {Moment} from 'moment-timezone';

export function padNumber(value: any) {
    if (isNumber(value)) {
        return `0${value}`.slice(-2);
    } else {
        return '';
    }
}

export function toInteger(value: any): number {
    return parseInt(`${value}`, 10);
}

export function isNumber(value: any): value is number {
    return !isNaN(toInteger(value));
}

export function getDateTimeNgbFromMoment(date: moment.Moment): DateTimeNgb {
    return new DateTimeNgb(new NgbDate(date.year(), date.month() + 1, date.date())
        , {hour: date.hour(), minute: date.minute(), second: date.second()});
}

export class DateTimeNgb {

    /* istanbul ignore next */
    constructor(readonly date?: NgbDateStruct, readonly time: NgbTimeStruct = {hour: 0, minute: 0, second: 0}) {
        // in case time is explicitly set to null/undefined set to default one
        if (!time) {
            this.time = {hour: 0, minute: 0, second: 0};
        }
    }


    parse(value: string): NgbDateStruct {
        if (value) {
            const dateParts = value.trim().split('-').reverse();
            if (dateParts.length === 1 && isNumber(dateParts[0])) {
                return {day: toInteger(dateParts[0]), month: null, year: null};
            } else if (dateParts.length === 2 && isNumber(dateParts[0]) && isNumber(dateParts[1])) {
                return {day: toInteger(dateParts[0]), month: toInteger(dateParts[1]), year: null};
            } else if (dateParts.length === 3 && isNumber(dateParts[0]) && isNumber(dateParts[1]) && isNumber(dateParts[2])) {
                return {day: toInteger(dateParts[0]), month: toInteger(dateParts[1]), year: toInteger(dateParts[2])};
            }
        }
        return null;
    }

    format(): string {
        const {date} = this;
        return date ?
            `${date.year}-${isNumber(date.month) ? padNumber(date.month) : ''}-${isNumber(date.day) ? padNumber(date.day) : ''}` :
            '';
    }

    // a function that transform timestruct to string
    formatTime(): string {
        const {time} = this;
        return time ?
            `${isNumber(time.hour) ? padNumber(time.hour) : ''}:${isNumber(time.minute) ? padNumber(time.minute) : ''}` : '';
    }

    formatDateTime() {
        let result = '';
        const {date, time} = this;
        // if date is present
        if (date) {
            result = `${this.format()}T${this.formatTime()}`;
        }
        return result;
    }

    convertToMomentOrNull(): Moment {
        const dateString = this.formatDateTime();
        if (!!dateString && dateString !== '' && !dateString.includes('--')) {
            return moment(dateString);
        }
        return null;
    }

    convertToNumber(): number {
        const asMoment = this.convertToMomentOrNull();
        if (!!asMoment) {
            return asMoment.valueOf();
        }
        return NaN;
    }

    convertToDateOrNull(): Date {
        const asMoment = this.convertToMomentOrNull();
        if (!!asMoment) {
            return asMoment.toDate();
        }
        return null;
    }

}
