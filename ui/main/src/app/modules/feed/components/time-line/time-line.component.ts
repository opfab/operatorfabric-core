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
        moment.updateLocale('en', { week: {
                dow: 6, // First day of week is Saturday
                doy: 12 // First week of year must contain 1 January (7 + 6 - 1)
            }});

        const actualMoment = moment();

        // conf 1 === end of the actual week + next week
        /*const startDomain = moment();
        startDomain.hours(0).minutes(0).seconds(0).millisecond(0);*/
        const startDomain = this.dateWithSpaceBeforeMoment(moment(actualMoment), 'W');
        const endDomain = _.cloneDeep(startDomain);
        endDomain.add(1, 'week');
        endDomain.startOf('week');
        endDomain.hours(0).minutes(0).seconds(0).millisecond(0);
        endDomain.add(7, 'days');
        // endDomain.add(5, 'days'); // example

        // conf 4 === end of the actual day + 7 days
        /*const startDomain4 = moment();
        startDomain4.hours(0).minutes(0).seconds(0).millisecond(0);*/
        const startDomain4 = this.dateWithSpaceBeforeMoment(moment(actualMoment), 'W');
        const endDomain4 = _.cloneDeep(startDomain4);
        endDomain4.hours(0).minutes(0).seconds(0).millisecond(0);
        endDomain4.add(7, 'days');
        // endDomain.add(5, 'days'); // example

        // conf 2 === actual month + next month
        /*const startDomain2 = moment();
        startDomain2.hours(0).minutes(0).seconds(0).millisecond(0);*/
        const startDomain2 = this.dateWithSpaceBeforeMoment(moment(actualMoment), 'M');
        const endDomain2 = _.cloneDeep(startDomain2);
        endDomain2.startOf('month');
        endDomain2.add(2, 'months');
        // endDomain2.add(1, 'months'); // example
        // endDomain2.date(15); // example

        // conf 3 === from start of actual month to end of the year + 1 year
        /*const startDomain3 = moment();
        startDomain3.startOf('month');
        startDomain3.hours(0);*/
        const startDomain3 = this.dateWithSpaceBeforeMoment(moment(actualMoment), 'Y');
        const endDomain3 = _.cloneDeep(startDomain3);
        endDomain3.add(2, 'years');
        endDomain3.startOf('year'); // Voir avec Guillaume
        // endDomain3.add(1, 'years'); // example
        // endDomain3.month(10); // example
        this.conf = {
            enableDrag: false,
            enableZoom: true,
            autoScale: false,
            animations: false,
            showGridLines: true,
            realTimeBar: true,
            centeredOnTicks: true,
        };
        this.confZoom = [{
            startDomain: startDomain.valueOf(),
            endDomain: endDomain.valueOf(),
            forwardLevel: 'W',
            followCloackTick: false,
        },
        {
            startDomain: startDomain4.valueOf(),
            endDomain: endDomain4.valueOf(),
            forwardLevel: 'D-7',
            followCloackTick: true,
        },
        {
            startDomain: startDomain2.valueOf(),
            endDomain: endDomain2.valueOf(),
            forwardLevel: 'M',
            followCloackTick: false,
        },
        {
            startDomain: startDomain3.valueOf(),
            endDomain: endDomain3.valueOf(),
            forwardLevel: 'Y',
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
            console.log('timeline subscribe');
            const tmp = _.cloneDeep(value);
            this.store.dispatch(new InitTimeline({
                data: [],
            }));
            /*for (const val of tmp) {
                // val.endDate val.startDate val.severity
                const myCardTimeline = {
                    startDate: val.startDate,
                    endDate: val.endDate,
                    severity: val.severity
                };
                this.store.dispatch(new AddCardDataTimeline({

                    cardTimeline: myCardTimeline,
                }));
                // console.log('timeline subscribe');
            }*/
            const myCardsTimeline = [];
            for (const val of tmp) {
                // val.endDate val.startDate val.severity
                const myCardTimeline = {
                    startDate: val.startDate,
                    endDate: val.endDate,
                    severity: val.severity
                };
                myCardsTimeline.push(myCardTimeline);
            }
            this.store.dispatch(new SetCardDataTimeline({
                cardsTimeline: myCardsTimeline,
            }));
        });

        // this.lastCards$ = this.store.select(timelineSelectors.selectLastCardsSelection);
        /* // TRY ON TIMELINE
         this.lightCards$ = this.store.pipe(
             select(timelineSelectors.selectFeed),
             catchError(err => of([]))
         );*/
        /* // TRY ON FEED
        this.lightCards$ = this.store.pipe(
            select(feedSelectors.selectFeed),
            catchError(err => of([]))
        );*/

        /*
        // TRY selectUnFilteredFeed
        this.lightCards$ = this.store.pipe(
            select(feedSelectors.selectUnFilteredFeed),
            catchError(err => of([]))
        );*/
    }

    /**
     * make start of domain begin 4 ticks before actual date (moment())
     * each cluster level had a different treatment
     * @param clusterLevel
     */
    dateWithSpaceBeforeMoment(date, clusterLevel) {
        date.minutes(0).seconds(0).millisecond(0);
        switch (clusterLevel) {
            case 'W' : case 'D-7': {
                for (let i = 0; i < 35; i++) {
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
