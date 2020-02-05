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
import {neutralTimeReference, TimeReference} from "@ofModel/time.model";
import {interval, Observable, of} from "rxjs";
import {EventSourceInit, EventSourcePolyfill} from "ng-event-source";
import {map, tap} from "rxjs/operators";
import {selectTimeReference} from "@ofSelectors/time.selectors";
import {buildConfigSelector} from "@ofSelectors/config.selectors";
import {AuthenticationService} from "@ofServices/authentication/authentication.service";
import {TickPayload} from "@ofActions/time.actions";

@Injectable()
export class TimeService {

    readonly FiveSecondsAsPulseDurationFallback = '5000';

    private timeFormat;
    private dateFormat;
    private dateTimeFormat;
    readonly timeUrl: string;
    private timeReference$: Observable<TimeReference>;
    private currentTimeReference: TimeReference=neutralTimeReference;
    private beatDurationInMilliseconds: number;
    private timeAtLastHeartBeat: Moment;
    private timeLineFormats: any;

    constructor(private store: Store<AppState>,
                private authService: AuthenticationService) {
        this.initializeTimeFormat();

        this.store.select(buildConfigSelector('time.pulse',
            this.FiveSecondsAsPulseDurationFallback))
            .subscribe(duration => this.beatDurationInMilliseconds = duration);

        this.timeUrl = environment.urls.time;

    }

    private initializeTimeFormat() {
        this.store.select(buildSettingsOrConfigSelector('timeFormat', 'LT'))
            .subscribe(next => this.timeFormat = next);
        this.store.select(buildSettingsOrConfigSelector('dateFormat', 'L'))
            .subscribe(next => this.dateFormat = next);
        this.store.select(buildSettingsOrConfigSelector('dateTimeFormat'))
            .subscribe(next => this.dateTimeFormat = next);
        this.store.select(buildSettingsOrConfigSelector('timeLineDefaultClusteringFormats',
            {
                dateInsideTooltipsWeek: "ddd DD MMM HH",
                dateInsideTooltipsMonth: "ddd DD MMM YYYY",
                dateOnDay: "ddd DD MMM",
                dateOnWeek: "DD/MM/YY",
                dateOnMonth: "MMM YY",
                dateOnYear: "YYYY",
                titleDateInsideTooltips: "DD/MM",
                titleHourInsideTooltips: "HH:mm",
                dateOnDayNewYear: "DD MMM YY",
                realTimeBarFormat: "DD/MM/YY HH:mm",
                dateSimplifliedOnDayNewYear: "D MMM YY",
                dateSimplifliedOnDay: "D MMM",
                hoursOnly: "HH",
                minutesOnly: "mm",
                secondedsOnly: "ss",
                weekNumberOnly: "ww"
            }))
            .subscribe(next => this.timeLineFormats = next);
    }


    public currentTime(): moment.Moment {
        return this.computeCurrentTime(moment(), this.currentTimeReference);
    }

    computeCurrentTime(now: moment.Moment, timeRef: TimeReference): moment.Moment {
        return timeRef.computeNow(now);

    }

    public fetchTimeReferences(): Observable<TimeReference> {
        if(typeof this.timeReference$ === 'undefined' || this.timeReference$ === null){
            this.initiateTimeReference();
        }
        return this.timeReference$;
    }

    /**
     * Due te specific implementation of EventSourcePolyfill, this method need to be called just before usage,
     * not within the constructor of the service otherwise try to call indefinitely the time service even
     * it it's unavailable.
     */

    initiateTimeReference() {
      /**  const eventSource = new EventSourcePolyfill(
            environment.urls.time,
            {   headers: this.authService.getSecurityHeader(),
                heartbeatTimeout: 600000
            } as EventSourceInit);
        this.timeReference$ = this.fetchVirtualTime(eventSource);
        this.store.select(selectTimeReference)
            .subscribe(timeRef => this.currentTimeReference = timeRef); */

            
// first REMOVE of time service 
            this.timeReference$ = of(neutralTimeReference);
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
                map(n => this.currentTime()),
                map(heartBeat => {
                    return {
                        currentTime: heartBeat,
                        elapsedSinceLast: this.timeAtLastHeartBeat ? heartBeat.diff(this.timeAtLastHeartBeat) : 0
                    };
                }),
                tap(heartBeat => this.timeAtLastHeartBeat = heartBeat.currentTime) // update timeAtLastHeartBeat with the emitted value
            );
    }

    fetchVirtualTime(eventSource: EventSourcePolyfill): Observable<TimeReference> {
        if(!!eventSource) return of(neutralTimeReference);
        return Observable.create(observer => {
            try {
                eventSource.onmessage = message => {
                    if (!!message) {
                        console.error('no message in Event from Event Source of Time service',message);
                        return observer.error('no message in Event from Event Source of Time service');
                    }
                    const timeRef = JSON.parse(message.data, TimeReference.convertSpeedIntoEnum);
                    return observer.next(timeRef);
                };
                eventSource.onerror = error => {
                    console.error('error occurred from Event Source of Time Service', error)
                }

            } catch (error) {
                console.error('error occurred from Event Source of Time Service', error)
                return observer.error(error);
            }
            return () => {
                if (eventSource && eventSource.readyState !== eventSource.CLOSED) {
                    eventSource.close();
                }
            };
        })
    }

    public parseString(value: string): moment.Moment {
        return moment(value, 'YYYY-MM-DDTHH:mm');
    }

    public asInputString(value: number): string {
        return moment(value).format('YYYY-MM-DDTHH:mm:ss.SSS');
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

    public predefinedFormat(date: Date, formatKey:string);
    public predefinedFormat(timestamp: number, formatKey:string);
    public predefinedFormat(m: Moment, formatKey:string);
    public predefinedFormat(arg:Date | number | Moment, formatKey:string){
        let m = null;
        if (!arg)
            return '';
        if (isMoment(arg))
            m = arg;
        else
            m = moment(arg);
        return m.format(this.timeLineFormats[formatKey]);
    }


}
