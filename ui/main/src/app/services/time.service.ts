/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


import {Injectable} from '@angular/core';
import * as moment from 'moment-timezone';
import {Moment} from "moment-timezone/moment-timezone";
import {AppState} from "@ofStore/index";
import {Store} from "@ngrx/store";
import {buildSettingsOrConfigSelector} from "@ofSelectors/settings.x.config.selectors";
import {isMoment} from "moment";
import {environment} from '@env/environment';
import {interval, Observable, of} from "rxjs";
import {map, tap} from "rxjs/operators";
import {buildConfigSelector} from "@ofSelectors/config.selectors";
import {AuthenticationService} from "@ofServices/authentication/authentication.service";
import {TickPayload} from "@ofActions/time.actions";

@Injectable()
export class TimeService {

    readonly FiveSecondsAsPulseDurationFallback = '5000';

    private timeFormat;
    private dateFormat;
    private dateTimeFormat;
    private beatDurationInMilliseconds: number;
    private timeAtLastHeartBeat: Moment;

    constructor(private store: Store<AppState>) {
        this.initializeTimeFormat();

        this.store.select(buildConfigSelector('time.pulse',
            this.FiveSecondsAsPulseDurationFallback))
            .subscribe(duration => this.beatDurationInMilliseconds = duration);
    }

    private initializeTimeFormat() {
        this.store.select(buildSettingsOrConfigSelector('timeFormat', 'LT'))
            .subscribe(next => this.timeFormat = next);
        this.store.select(buildSettingsOrConfigSelector('dateFormat', 'L'))
            .subscribe(next => this.dateFormat = next);
        this.store.select(buildSettingsOrConfigSelector('dateTimeFormat'))
            .subscribe(next => this.dateTimeFormat = next);
    }


    /**
     * Emits a pulse every beatDurationInMilliseconds, containing the current virtual time as well as the
     * elapsed time (milliseconds) since the previous pulse
     * */
    public pulsate(): Observable<TickPayload> {
        return this.heartBeat(this.beatDurationInMilliseconds);
    }

    private heartBeat(interValDurationInMilliseconds: number): Observable<TickPayload> {
        return interval(interValDurationInMilliseconds)
            .pipe(
                map(n => moment()),
                map(heartBeat => {
                    return {
                        currentTime: heartBeat,
                        elapsedSinceLast: this.timeAtLastHeartBeat ? heartBeat.diff(this.timeAtLastHeartBeat) : 0
                    };
                }),
                tap(heartBeat => this.timeAtLastHeartBeat = heartBeat.currentTime) // update timeAtLastHeartBeat with the emitted value
            );
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
        return (this.parseString(date).valueOf()).toString();
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
