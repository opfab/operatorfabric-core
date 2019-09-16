/* Copyright (c) 2018, RTE (http://www.rte-france.com)
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

@Component({
  selector: 'of-time-line',
  templateUrl: './time-line.component.html',
})
export class TimeLineComponent implements OnInit, OnDestroy {
    lightCards$: Observable<LightCard[]>;
    subscription: Subscription;

    public conf: any;
    public confZoom: any;

    constructor(private store: Store<AppState>) {}

    ngOnInit() {
        // set start of Week to saturday on moment locale used
        /*moment.updateLocale('en', { week: {
                dow: 6, // First day of week is Saturday
                doy: 12 // First week of year must contain 1 January (7 + 6 - 1)
            }});
            */

        // DOMAIN CONF from moment() to our conf

        const domainYearConf = {
            year: 2,
            month: 0,
            week: 0,
            day: 0,
            hour: 0,
            minute: 0,
            second: 0,
            startOf: ['year'],
        };

        const domainMonthConf = {
            year: 0,
            month: 2,
            week: 0,
            day: 0,
            hour: 0,
            minute: 0,
            second: 0,
            startOf: ['month'],
        };

        const domainWeekConf = {
            year: 0,
            month: 0,
            week: 2,
            day: 0,
            hour: 0,
            minute: 0,
            second: 0,
            startOf: ['week'],
        };

        const domain7DayConf = {
            year: 0,
            month: 0,
            week: 0,
            day: 8,
            hour: 0,
            minute: 0,
            second: 0,
            startOf: ['day'],
        };

        const currentMoment = moment();
        const startDomain = moment(currentMoment);
        startDomain.minutes(0).second(0).millisecond(0);
        const endDomain = this.periodStartToEnd(domainWeekConf, true);

        const startDomainUSE = moment(currentMoment);
        startDomainUSE.date(4);
        startDomainUSE.hour(0).minutes(0).second(0).millisecond(0);
        const endDomainUSE = moment(startDomainUSE);
        endDomainUSE.add(16, 'week');

        const startDomain2 = moment(currentMoment);
        startDomain2.minutes(0).second(0).millisecond(0);
        const endDomain2 = this.periodStartToEnd(domainMonthConf, true);

        const startDomain3 = moment(currentMoment);
        startDomain3.hour(0).minutes(0).second(0).millisecond(0);
        const endDomain3 = this.periodStartToEnd(domainYearConf, true);

        const startDomain4 = moment(currentMoment);
        startDomain4.minutes(0).second(0).millisecond(0);
        const endDomain4 = this.periodStartToEnd(domain7DayConf, true);

        // FORWARD CONF (movement on domain)

        const forwardYearConf = {
            start: {
                year: 1,
                month: 0,
                week: 0,
                day: 0,
                hour: 0,
                minute: 0,
                second: 0,
            },
            end: {
                year: 1,
                month: 0,
                week: 0,
                day: 0,
                hour: 0,
                minute: 0,
                second: 0,
            },
        };

        const forwardMonthConf = {
            start: {
                year: 0,
                month: 1,
                week: 0,
                day: 0,
                hour: 0,
                minute: 0,
                second: 0,
            },
            end: {
                year: 0,
                month: 1,
                week: 0,
                day: 0,
                hour: 0,
                minute: 0,
                second: 0,
            },
        };

        const forwardWeekConf = {
            start: {
                year: 0,
                month: 0,
                week: 1,
                day: 0,
                hour: 0,
                minute: 0,
                second: 0,
            },
            end: {
                year: 0,
                month: 0,
                week: 1,
                day: 0,
                hour: 0,
                minute: 0,
                second: 0,
            },
        };

        const forwardDayConf = {
            start: {
                year: 0,
                month: 0,
                week: 0,
                day: 1,
                hour: 0,
                minute: 0,
                second: 0,
            },
            end: {
                year: 0,
                month: 0,
                week: 0,
                day: 1,
                hour: 0,
                minute: 0,
                second: 0,
            },
        };

        // TICKS CONF


        const myticksResponsiveConf = [{ width: 1400,
            conf: {
                year: 0,
                month: 0,
                week: 0,
                day: 0,
                hour: 4,
                minute: 0,
                second: 0,
            }
        },{ width: 1100,
            conf: {
                year: 0,
                month: 0,
                week: 0,
                day: 0,
                hour: 1,
                minute: 0,
                second: 0,
            }
        }, {
            width: 800,
            conf: {
                year: 0,
                month: 0,
                week: 0,
                day: 0,
                hour: 0,
                minute: 20,
                second: 0,
            }
        }];

        const ticks4HoursConf = {
            year: 0,
            month: 0,
            week: 0,
            day: 0,
            hour: 4,
            minute: 0,
            second: 0,
        };

        const ticksDayConf = {
            year: 0,
            month: 0,
            week: 0,
            day: 1,
            hour: 0,
            minute: 0,
            second: 0,
        };

        const ticksHalfMonthConf = {
            year: 0,
            month: 0,
            week: 0,
            day: 0,
            hour: 0,
            minute: 0,
            second: 0,
            date: [1, 16],
        };

        const ticksInUseConf = {
            year: 0,
            month: 0,
            week: 0,
            day: 0,
            hour: 6,
            minute: 0,
            second: 0,
        };

        this.conf = {
            enableDrag: false,
            enableZoom: true,
            zoomOnButton: true,
            autoScale: false,
            animations: false,
            showGridLines: true,
            realTimeBar: true,
        };
        this.confZoom = [{
            startDomain: startDomainUSE.valueOf(),
            endDomain: endDomainUSE.valueOf(),
            centeredOnTicks: true,
            clusterTicksToTicks: true,
            buttonTitle: 'USE',
            forwardConf: forwardDayConf,
            backwardConf: forwardDayConf,
            //ticksConf: ticksInUseConf,
            autonomousTicks: true,
            followClockTick: false,
            firstMoveStartOfUnit: false,
            homeDomainExtraTicks: false,
            },
            {
            startDomain: startDomain4.valueOf(),
            endDomain: endDomain4.valueOf(),
            centeredOnTicks: true,
            clusterTicksToTicks: true,
            buttonTitle: '7D',
            forwardConf: forwardDayConf,
            ticksConf: ticks4HoursConf,
            followClockTick: true,
            firstMoveStartOfUnit: true,
            homeDomainExtraTicks: true,
            },
        {
            startDomain: startDomain.valueOf(),
            endDomain: endDomain.valueOf(),
            centeredOnTicks: true,
            clusterTicksToTicks: true,
            buttonTitle: 'W',
            forwardConf: forwardWeekConf,
            backwardConf: forwardWeekConf,
            ticksConf: ticks4HoursConf,
            followClockTick: true,
            firstMoveStartOfUnit: true,
            startDomainWith3Ticks: true,
        },
        {
            startDomain: startDomain2.valueOf(),
            endDomain: endDomain2.valueOf(),
            centeredOnTicks: true,
            clusterTicksToTicks: true,
            buttonTitle: 'M',
            forwardConf: forwardMonthConf,
            ticksConf: ticksDayConf,
            // formatTicks: 'DD',
            // formatTooltipsDate: 'DD/MM',
            followClockTick: true,
            firstMoveStartOfUnit: true,
            homeDomainExtraTicks: true,
        },
        {
            startDomain: startDomain3.valueOf(),
            endDomain: endDomain3.valueOf(),
            centeredOnTicks: true,
            clusterTicksToTicks: true,
            buttonTitle: 'Y',
            forwardConf: forwardYearConf,
            ticksConf: ticksHalfMonthConf,
            followClockTick: true,
            firstMoveStartOfUnit: true,
            homeDomainExtraTicks: true,
        }];

        // timeline state is same than feed state (not filtered Feed)
        // select all the feed
        this.lightCards$ = this.store.pipe(
            select(feedSelectors.selectFeed),
            catchError(err => of([]))
        );

        // init timeline state
        this.store.dispatch(new InitTimeline({
            data: [],
        }));

        // add a card data to the timeline state for each new card received
        this.subscription = this.lightCards$.pipe(debounceTime(300), distinctUntilChanged())
            .subscribe(value => {
            const tmp = _.cloneDeep(value);
            this.store.dispatch(new InitTimeline({
                data: [],
            }));
            const myCardsTimeline = [];
            for (const val of tmp) {
                if (val.timeSpans && val.timeSpans.length > 0) {
                    val.timeSpans.forEach(d => {
                        const myCardTimelineTimespans = {
                            publishDate: d.start,
                            startDate: d.start, // useless
                            endDate: d.end, // useless
                            severity: val.severity,
                            summary: val.title.parameters.value,
                        };
                        myCardsTimeline.push(myCardTimelineTimespans);
                    });
                } else {
                    // val.endDate val.startDate val.severity
                    const myCardTimeline = {
                        publishDate: val.publishDate,
                        startDate: val.startDate, // useless
                        endDate: val.endDate, // useless
                        severity: val.severity,
                        summary: val.title.parameters.value,
                    };
                    myCardsTimeline.push(myCardTimeline);
                }
            }
            this.store.dispatch(new SetCardDataTimeline({
                cardsTimeline: myCardsTimeline,
            }));
        });
    }

    /**
     * return a moment
     * add time to moment depending of configue object when future is true
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
