/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, OnDestroy, OnInit} from '@angular/core';
import {Observable, of, Subscription} from 'rxjs';
import {LightCard} from '@ofModel/light-card.model';
import {select, Store} from '@ngrx/store';
import {catchError, debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {AppState} from '@ofStore/index';
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
        moment.updateLocale('en', { week: {
                dow: 6, // First day of week is Saturday
                doy: 12 // First week of year must contain 1 January (7 + 6 - 1)
            }});

        //
        let result = this.periodStartToEnd('W', 1, true);
        const startDomain = result[0];
        const endDomain = result[1];
        result = this.periodStartToEnd('M', 1, true);
        const startDomain2 = result[0];
        const endDomain2 = result[1];
        result = this.periodStartToEnd('Y', 1, true);
        const startDomain3 = result[0];
        const endDomain3 = result[1];
        result = this.periodStartToEnd('7D', 7, true);
        const startDomain4 = result[0];
        const endDomain4 = result[1];
        result = this.periodStartToEnd('D', 7, false);
        const startDomain5 = result[0];
        const endDomain5 = result[1];

        // FORWARD CONF (movement on domain)

        const forwardYearConf = {
            year: 1,
            month: 0,
            week: 0,
            day: 0,
            hour: 0,
            seconde: 0,
        };

        const forwardMonthConf = {
            year: 0,
            month: 1,
            week: 0,
            day: 0,
            hour: 0,
            seconde: 0,
        };

        const forwardWeekConf = {
            year: 0,
            month: 0,
            week: 1,
            day: 0,
            hour: 0,
            seconde: 0,
        };

        const forwardDayConf = {
            year: 0,
            month: 0,
            week: 0,
            day: 1,
            hour: 0,
            seconde: 0,
        };

        // TICKS CONF

        const ticks4HoursConf = {
            year: 0,
            month: 0,
            week: 0,
            day: 0,
            hour: 4,
            seconde: 0,
        };

        const ticksDayConf = {
            year: 0,
            month: 0,
            week: 0,
            day: 1,
            hour: 0,
            seconde: 0,
        };

        const ticksHourConf = {
            year: 0,
            month: 0,
            week: 0,
            day: 0,
            hour: 1,
            seconde: 0,
        };

        const ticksHalfMonthConf = {
            year: 0,
            month: 0,
            week: 0,
            day: 0,
            hour: 0,
            seconde: 0,
            date: [1, 15],
        };

        this.conf = {
            enableDrag: false,
            enableZoom: true,
            autoScale: false,
            animations: false,
            showGridLines: true,
            realTimeBar: true,
            centeredOnTicks: true,
            clusterTicksToTicks: true,
        };
        this.confZoom = [{
            startDomain: startDomain.valueOf(),
            endDomain: endDomain.valueOf(),
            buttonTitle: 'W',
            forwardConf: forwardWeekConf,
            ticksConf: ticks4HoursConf,
            followCloackTick: false,
        },
        {
            startDomain: startDomain5.valueOf(),
            endDomain: endDomain5.valueOf(),
            buttonTitle: 'D',
            forwardConf: forwardDayConf,
            ticksConf: ticksHourConf,
            followCloackTick: false,
        },
        {
            startDomain: startDomain4.valueOf(),
            endDomain: endDomain4.valueOf(),
            buttonTitle: '7D',
            forwardConf: forwardDayConf,
            ticksConf: ticks4HoursConf,
            followCloackTick: false,
        },
        {
            startDomain: startDomain2.valueOf(),
            endDomain: endDomain2.valueOf(),
            buttonTitle: 'M',
            forwardConf: forwardMonthConf,
            ticksConf: ticksDayConf,
            followCloackTick: false,
        },
        {
            startDomain: startDomain3.valueOf(),
            endDomain: endDomain3.valueOf(),
            buttonTitle: 'Y',
            forwardConf: forwardYearConf,
            ticksConf: ticksHalfMonthConf,
            followCloackTick: false,
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
                            summary: val.summary.parameters.value,
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
                        summary: val.summary.parameters.value,
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
     * return a array of two moments
     * first moment equal to start of domain, second moment equal to end of domain
     * set spaceBeforeMoment to true for start the domain 4 ticks before the actual moment
     * @param level
     * @param spaceBeforeMoment
     */
    periodStartToEnd(level: string, number: number, spaceBeforeMoment: boolean): [moment.Moment, moment.Moment] {
        let tmpMoment = moment();
        if (spaceBeforeMoment) {
            tmpMoment = this.dateWithSpaceBeforeMoment(moment(tmpMoment), level);
        }
        const startDomain = tmpMoment;
        const endDomain = _.cloneDeep(startDomain);

        switch (level) {
            case 'D': {
                // conf 5 === end of the actual day + 1 day
                endDomain.hours(0).minutes(0).seconds(0).millisecond(0);
                endDomain.startOf('day');
                endDomain.add(1 + number, 'days');
                break;
            }
            case 'W': {
                // conf 1 === end of the actual week + next week
                endDomain.add(1 + number, 'weeks');
                endDomain.startOf('week');
                endDomain.hours(0).minutes(0).seconds(0).millisecond(0);
                break;
            }
            case '7D': {
                // conf 4 === end of the actual day + 7 days
                endDomain.hours(0).minutes(0).seconds(0).millisecond(0);
                endDomain.add(1 + number, 'days');
                break;
            }
            case 'M': {
                // conf 2 === actual month + next month
                endDomain.add(1 + number, 'months');
                endDomain.startOf('month');
                break;
            }
            case 'Y': {
                // conf 3 === from start of actual month to end of the year + 1 year
                endDomain.add(1 + number, 'years');
                endDomain.startOf('year'); // Voir avec Guillaume
                break;
            }
            default: {
                return [moment(), moment()];
            }
        }
        return [startDomain, endDomain];
    }

    /**
     * make start of domain begin 4 ticks before actual date (moment())
     * each cluster level had a different treatment
     * @param clusterLevel
     */
    dateWithSpaceBeforeMoment(date, clusterLevel) {
        date.minutes(0).seconds(0).millisecond(0);
        switch (clusterLevel) {
            case 'D' : {
                // start 3 hours before date
                date.subtract(3, 'hours');
                return date;
            }
            case 'W' : case '7D': {
                // align date hours by subtract exceeded hours for stay on ticks (every 4 hours)
                for (let i = 0; i < 10; i++) {
                    if (((date.hours() - i) % 4) === 0) {
                        date.subtract(i, 'hours');
                        break;
                    }
                }
                // start 12 hours before date
                date.subtract(3 * 4, 'hours');
                return date;
            }
            case 'M': {
                // start 3 days before moment()
                date.startOf('day');
                date.subtract(3, 'days');
                return date;
            }
            case 'Y': {
                date.startOf('day');
                // start at begin of month
                if (date.date() >= 16) {
                    date.startOf('month');
                    date.subtract(1, 'months');
                } else {
                    // start at middle of month (16th)
                    date.date(16);
                    date.subtract(2, 'months');
                }
                return date;
            }
        }
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
