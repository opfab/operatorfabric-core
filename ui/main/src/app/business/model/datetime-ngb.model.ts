/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {NgbDateStruct, NgbTimeStruct} from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';

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

export class DateTimeNgb {
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
            } else if (
                dateParts.length === 3 &&
                isNumber(dateParts[0]) &&
                isNumber(dateParts[1]) &&
                isNumber(dateParts[2])
            ) {
                return {day: toInteger(dateParts[0]), month: toInteger(dateParts[1]), year: toInteger(dateParts[2])};
            }
        }
        return null;
    }

    format(): string {
        const {date} = this;
        let str = '';

        if (date) {
            str = date.year.toString();
            str += '-' + (isNumber(date.month) ? padNumber(date.month) : '');
            str += '-' + (isNumber(date.day) ? padNumber(date.day) : '');
        }
        return str;
    }


    // a function that transform timestruct to string
    formatTime(): string {
        const {time} = this;
        let str = '';

        if (time) {
            str = isNumber(time.hour) ? padNumber(time.hour) : '';
            str += ':' + (isNumber(time.minute) ? padNumber(time.minute) : '');
        }
        return str;
    }

    formatDateTime() {
        let result = '';
        const {date} = this;
        // if date is present
        if (date) {
            result = `${this.format()}T${this.formatTime()}`;
        }
        return result;
    }

    convertToMomentOrNull(): moment.Moment {
        const dateString = this.formatDateTime();
        if (dateString && dateString !== '' && !dateString.includes('--')) {
            return moment(dateString);
        }
        return null;
    }

    convertToNumber(): number {
        const asMoment = this.convertToMomentOrNull();
        if (asMoment) {
            return asMoment.valueOf();
        }
        return NaN;
    }

    convertToDateOrNull(): Date {
        const asMoment = this.convertToMomentOrNull();
        if (asMoment) {
            return asMoment.toDate();
        }
        return null;
    }
}
