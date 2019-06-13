/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { LightCard } from '@ofModel/light-card.model';
import { select, Store } from '@ngrx/store';
import { catchError } from 'rxjs/operators';
import { AppState } from '@ofStore/index';
import { InitTimeline } from '@ofActions/timeline.actions';
import { AddCardDataTimeline } from '@ofActions/timeline.actions';
import * as _ from 'lodash';
import * as moment from 'moment';
import * as feedSelectors from '@ofSelectors/feed.selectors';

@Component({
  selector: 'of-time-line',
  templateUrl: './time-line.component.html',
})
export class TimeLineComponent implements OnInit {
    lightCards$: Observable<LightCard[]>;

    public conf: any;
    public confZoom: any;

    constructor(private store: Store<AppState>) {}

    ngOnInit() {
        // set start of Week to saturday on moment locale used
        moment.updateLocale('en', { week: {
                dow: 6, // First day of week is Saturday
                doy: 12 // First week of year must contain 1 January (7 + 6 - 1)
            }});

        // conf 1 === end of the actual week + next week
        const startDomain = moment();
        startDomain.hours(0).minutes(0).seconds(0).millisecond(0);
        const endDomain = _.cloneDeep(startDomain);
        endDomain.add(1, 'week');
        endDomain.startOf('week');
        endDomain.hours(0).minutes(0).seconds(0).millisecond(0);
        endDomain.add(7, 'days');
        // endDomain.add(5, 'days'); // example

        // conf 2 === actual month + next month
        const startDomain2 = moment();
        startDomain2.hours(0).minutes(0).seconds(0).millisecond(0);
        const endDomain2 = _.cloneDeep(startDomain2);
        endDomain2.startOf('month');
        endDomain2.add(2, 'months');
        // endDomain2.add(1, 'months'); // example
        // endDomain2.date(15); // example

        // conf 3 === from start of actual month to end of the year + 1 year
        const startDomain3 = moment();
        startDomain3.startOf('month');
        startDomain3.hours(0);
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
        this.lightCards$.subscribe(value => {
            this.store.dispatch(new InitTimeline({
                data: [],
            }));
            for (const val of value) {
                // val.endDate val.startDate val.severity
                const myCardTimeline = {
                    startDate: val.startDate,
                    endDate: val.endDate,
                    severity: val.severity
                };
                this.store.dispatch(new AddCardDataTimeline({
                    cardTimeline: myCardTimeline,
                }));
            }
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
}
