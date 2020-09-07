/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {Injectable} from '@angular/core';
import * as moment from 'moment-timezone';
import {Moment} from 'moment-timezone/moment-timezone';
import {AppState} from '@ofStore/index';
import {Store} from '@ngrx/store';
import {buildSettingsOrConfigSelector} from '@ofSelectors/settings.x.config.selectors';
import {isMoment} from 'moment';


@Injectable()
export class TimeService {


    private timeFormat;
    private dateFormat;
    private dateTimeFormat;

    constructor(private store: Store<AppState>) {
        this.initializeTimeFormat();

    }

    private initializeTimeFormat() {
        this.store.select(buildSettingsOrConfigSelector('timeFormat', 'LT'))
            .subscribe(next => this.timeFormat = next);
        this.store.select(buildSettingsOrConfigSelector('dateFormat', 'L'))
            .subscribe(next => this.dateFormat = next);
        this.store.select(buildSettingsOrConfigSelector('dateTimeFormat'))
            .subscribe(next => this.dateTimeFormat = next);
    }



    public parseString(value: string): moment.Moment {
        return moment(value, 'YYYY-MM-DDTHH:mm');
    }

    public formatDate(timestamp: number): string;
    public formatDate(date: Date): string;
    public formatDate(date: Moment): string;
    public formatDate(arg: Moment | Date | number): string {
        let m: Moment = null;
        if (!arg)
            return '';
        if (isMoment(arg))
            m = arg;
        else m = moment(arg);
        if (m)
            return m.format(this.dateFormat);
        return '';
    }

    public toNgBTimestamp(date): string {
        return this.toNgBNumberTimestamp(date).toString();
    }

    public toNgBNumberTimestamp(date): number {
        return this.parseString(date).valueOf()
    }

    public formatDateTime(timestamp: number): string;
    public formatDateTime(date: Date): string;
    public formatDateTime(m: Moment): string;
    public formatDateTime(arg: Moment | Date | number): string {
        let m: Moment = null;
        if (!arg)
            return '';
        if (isMoment(arg))
            m = arg;
        else
            m = moment(arg);
        if (m)
            return m.format(this.dateTimeFormat ? this.dateTimeFormat : `${this.dateFormat} ${this.timeFormat}`);
        return '';
    }

    public formatTime(date: Date);
    public formatTime(timestamp: number);
    public formatTime(m: Moment);
    public formatTime(arg: Date | number | Moment) {
        let m = null;
        if (!arg)
            return '';
        if (isMoment(arg))
            m = arg;
        else
            m = moment(arg);
        return m.format(this.timeFormat);
    }

    private static isMoment(arg: Date | number | Moment): arg is Moment { //magic happens here
        return (<Moment>arg).format !== undefined && (<Moment>arg).toISOString !== undefined;
    }

}
