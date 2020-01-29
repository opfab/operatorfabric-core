/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


import { Component, OnInit, OnDestroy } from '@angular/core';
import {Observable, of, Subscription} from 'rxjs';
import { LightCard } from '@ofModel/light-card.model';
import { select, Store } from '@ngrx/store';
import {catchError, debounceTime, distinctUntilChanged} from 'rxjs/operators';
import { AppState } from '@ofStore/index';
import {InitTimeline, SetCardDataTimeline} from '@ofActions/timeline.actions';
import * as _ from 'lodash';
import * as moment from 'moment';
import * as feedSelectors from '@ofSelectors/feed.selectors';
import { buildConfigSelector } from '@ofStore/selectors/config.selectors';

@Component({
  selector: 'of-time-line',
  templateUrl: './time-line.component.html',
})
export class TimeLineComponent implements OnInit, OnDestroy {
    lightCards$: Observable<LightCard[]>;
    subscription: Subscription;

    public conf: any;
    public confZoom = [];
    public domains: any;

    constructor(private store: Store<AppState>) {}
    ngOnInit() {
        // DOMAIN CONF from moment() to our conf
        const domain7DayConf = this.constructMomentObj([0, 0, 0, 8, 0, 0, 0], ['day'], null);
        const domainWeekConf = this.constructMomentObj([0, 0, 1, 0, 0, 0, 0], ['week'], null);

        const domainMonthConf = this.constructMomentObj([0, 1, 0, 0, 0, 0, 0], ['month'], null);
        const domainYearConf = this.constructMomentObj([1, 0, 0, 0, 0, 0, 0], ['year'], null);
        const currentMoment = moment();

        const startDomain7Day = moment(currentMoment);
        startDomain7Day.minutes(0).second(0).millisecond(0);
        const endDomain7Day = this.periodStartToEnd(domain7DayConf, true);

        const startDomainWeek = moment(currentMoment.startOf('week'));
        startDomainWeek.minutes(0).second(0).millisecond(0);
        const endDomainWeek = this.periodStartToEnd(domainWeekConf, true);

        const startDomainMonth = moment(currentMoment.startOf('month'));
        startDomainMonth.minutes(0).second(0).millisecond(0);
        const endDomainMonth = this.periodStartToEnd(domainMonthConf, true);

        const startDomainYear = moment(currentMoment.startOf('year'));
        startDomainYear.hour(0).minutes(0).second(0).millisecond(0);
        const endDomainYear = this.periodStartToEnd(domainYearConf, true);

        // Adding two domains required by SEA Team
        const startDomainTR = moment().minutes(0).second(0).millisecond(0).subtract(2, 'hours');
        const endDomainTR = moment().hours(0).minutes(0).second(0).millisecond(0).add(1, 'days');

        const startDomainJ = moment().hours(0).minutes(0).second(0).millisecond(0);
        const endDomainJ = moment().hours(0).minutes(0).second(0).millisecond(0).add(1, 'days');
        // FORWARD CONF (movement on domain)
        const forwardYearConf = {
            start: this.constructMomentObj([1, 0, 0, 0, 0, 0, 0]),
            end: this.constructMomentObj([1, 0, 0, 0, 0, 0, 0]),
        };
        const forwardMonthConf = {
            start: this.constructMomentObj([0, 1, 0, 0, 0, 0, 0]),
            end: this.constructMomentObj([0, 1, 0, 0, 0, 0, 0])
        };
        const forwardWeekConf = {
            start: this.constructMomentObj([0, 0, 1, 0, 0, 0, 0]),
            end: this.constructMomentObj([0, 0, 1, 0, 0, 0, 0]),
        };
        const forwardDayConf = {
            start: this.constructMomentObj([0, 0, 0, 1, 0, 0, 0]),
            end: this.constructMomentObj([0, 0, 0, 1, 0, 0, 0]),
        };
        const forwardTRConf = {
            start: this.constructMomentObj([0, 0, 0, 0, 2, 0, 0]),
            end: this.constructMomentObj([0, 0, 0, 0, 2, 0, 0]),
        };

        const ticks4HoursConf = this.constructMomentObj([0, 0, 0, 0, 4, 0, 0]);

        const ticksDayConf = this.constructMomentObj([0, 0, 0, 1, 0, 0, 0]);
        const ticksHalfMonthConf = this.constructMomentObj([0, 0, 0, 0, 0, 0, 0], null, [1, 16]);

        const ticks30minConf = this.constructMomentObj([0, 0, 0, 0, 0, 30, 0]);
        const ticks1hConf = this.constructMomentObj([0, 0, 0, 0, 1, 0, 0]);
        this.conf = {
            enableDrag: false,
            enableZoom: true,
            zoomOnButton: true,
            autoScale: false,
            showGridLines: true,
            realTimeBar: true,
        };

        this.domains = {
            J: {
                startDomain: startDomainJ.valueOf(),
                endDomain: endDomainJ.valueOf(),
                centeredOnTicks: true,
                clusterTicksToTicks: true,
                buttonTitle: 'J',
                forwardConf: forwardDayConf,
                backwardConf: forwardDayConf,
                ticksConf: ticks1hConf,
                formatTicks: 'dd - h:mm a'
            }, TR: {
                startDomain: startDomainTR.valueOf(),
                endDomain: endDomainTR.valueOf(),
                centeredOnTicks: true,
                clusterTicksToTicks: true,
                buttonTitle: 'TR',
                forwardConf: forwardTRConf,
                backwardConf: forwardTRConf,
                ticksConf: ticks30minConf,
                formatTicks: 'dd - h:mm a'
            }, '7D': {
                startDomain: startDomain7Day.valueOf(),
                endDomain: endDomain7Day.valueOf(),
                centeredOnTicks: true,
                clusterTicksToTicks: true,
                buttonTitle: '7D',
                forwardConf: forwardDayConf,
                ticksConf: ticks4HoursConf,
                followClockTick: true,
                firstMoveStartOfUnit: true,
                homeDomainExtraTicks: true
            }, 'W': {
                startDomain: startDomainWeek.valueOf(),
                endDomain: endDomainWeek.valueOf(),
                centeredOnTicks: true,
                clusterTicksToTicks: true,
                buttonTitle: 'W',
                forwardConf: forwardWeekConf,
                backwardConf: forwardWeekConf,
                ticksConf: ticks4HoursConf,
                followClockTick: false,
                firstMoveStartOfUnit: false,
                homeDomainExtraTicks: false
            }, M: {
                startDomain: startDomainMonth.valueOf(),
                endDomain: endDomainMonth.valueOf(),
                centeredOnTicks: true,
                clusterTicksToTicks: true,
                buttonTitle: 'M',
                forwardConf: forwardMonthConf,
                ticksConf: ticksDayConf,
                // formatTicks: 'DD',
                // formatTooltipsDate: 'DD/MM',
                followClockTick: false,
                firstMoveStartOfUnit: false,
                homeDomainExtraTicks: false
            }, Y: {
                startDomain: startDomainYear.valueOf(),
                endDomain: endDomainYear.valueOf(),
                centeredOnTicks: true,
                clusterTicksToTicks: true,
                buttonTitle: 'Y',
                forwardConf: forwardYearConf,
                ticksConf: ticksHalfMonthConf,
                followClockTick: false,
                firstMoveStartOfUnit: false,
                homeDomainExtraTicks: false
            }
        };
        this.store.pipe(select(buildConfigSelector('feed.timeline.domains')), catchError(() => of([]))).subscribe(d => {
            if (d) {
                d.map(domain => {
                    if (Object.keys(this.domains).includes(domain)) {
                        this.confZoom.push(this.domains[domain]);
                    }
                });
            }
        });
        // timeline state is same than feed state (not filtered Feed)
        // select all the feed
        this.lightCards$ = this.store.pipe(select(feedSelectors.selectFeed),
            catchError(err => of([]))
        );

        // init timeline state
        this.store.dispatch(new InitTimeline({
            data: [],
        }));

        // add a card data to the timeline state for each new card received
        this.subscription = this.lightCards$.pipe(debounceTime(300), distinctUntilChanged()).subscribe(value => {
            const tmp = _.cloneDeep(value);
            this.store.dispatch(new InitTimeline({data: []}));
            const myCardsTimeline = [];
            for (const val of tmp) {
                if (val.timeSpans && val.timeSpans.length > 0) {
                    val.timeSpans.forEach(d => {
                        const myCardTimelineTimespans = {
                            displayDate: d.start, publishDate: d.start, // useless
                            startDate: d.start, // useless
                            endDate: d.end, // useless
                            severity: val.severity, publisher: val.publisher,
                            publisherVersion: val.publisherVersion, summary: val.title
                        };
                        myCardsTimeline.push(myCardTimelineTimespans);
                    });
                } else {
                    // val.endDate val.startDate val.severity
                    const myCardTimeline = {
                        displayDate: val.startDate,
                        publishDate: val.publishDate, // useless
                        startDate: val.startDate, // useless
                        endDate: val.endDate, // useless
                        severity: val.severity, publisher: val.publisher,
                        publisherVersion: val.publisherVersion, summary: val.title
                    };
                    myCardsTimeline.push(myCardTimeline);
                }
            }
            this.store.dispatch(new SetCardDataTimeline({cardsTimeline: myCardsTimeline}));
        });
    }

    constructMomentObj(mommentOjb: Array<number>, startOf?: Array<string>, date?: Array<number>) {
        const obj: any = {};
        obj.year = mommentOjb[0];
        obj.month = mommentOjb[1];
        obj.week = mommentOjb[2];
        obj.day = mommentOjb[3];
        obj.hour = mommentOjb[4];
        obj.minute = mommentOjb[5];
        obj.second = mommentOjb[6];
        if (startOf) {
            obj.startOf = startOf;
        }
        if (date) {
            obj.date = date;
        }
        return obj;
    }
    /**
     * return a moment
     * add time to moment depending of configue object when future is true. compute a domain end
     * subtract time when future is false
     * use startOf function on each time's unit pass in list
     * @param conf
     * @param future
     */
    periodStartToEnd(conf, future: boolean): moment.Moment {
        const tmpMoment = moment();
        // Test bug
        // tmpMoment.date(2);
        const newDate = _.cloneDeep(tmpMoment);
        Object.keys(conf).forEach(key => {
            if (key === 'startOf') {
                conf[key].forEach(value => {
                    newDate.startOf(value);
                });
            } else if (conf[key] > 0) {
                if (future) {
                    newDate.add(conf[key], key);
                } else {
                    newDate.subtract(conf[key], key);
                }
            }
        });
        return newDate;
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
