/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, OnInit } from '@angular/core';
import {Observable, of} from "rxjs";
import {LightCard} from "@ofModel/light-card.model";
import {select, Store} from "@ngrx/store";
import * as timelineSelectors from '@ofSelectors/timeline.selectors';
import {catchError} from "rxjs/operators";
import {AppState} from "@ofStore/index";
import {InitTimeline} from "@ofActions/timeline.actions";
import {AddCardDataTimeline} from "@ofActions/timeline.actions";
import * as _ from 'lodash';
import * as moment from 'moment';

@Component({
  selector: 'of-time-line',
  templateUrl: './time-line.component.html',
})
export class TimeLineComponent implements OnInit {
  selection$: Observable<string>;
  lastCards$: Observable<LightCard[]>;

    public conf: any;
    public confZoom: any;

    constructor(private store: Store<AppState>) {}

    ngOnInit() {
        // check le ticket correspondant, pour savoir si
        // on set la start et end domain par un dictionnaire
        // W/M/Y ou autre

        // conf 1
        const startDomain = moment();
        startDomain.hours(0).minutes(0).seconds(0).millisecond(0);
        const endDomain = _.cloneDeep(startDomain);
        endDomain.add(1, 'week');
        endDomain.startOf('week');
        endDomain.hours(0).minutes(0).seconds(0).millisecond(0);
        endDomain.add(7, 'days');
        // endDomain.add(5, 'days'); // example

        // conf 2
        const startDomain2 = moment();
        startDomain2.hours(0).minutes(0).seconds(0).millisecond(0);
        //startDomain2.startOf('month');
        /*
        // pas obligatoire
        startDomain2.subtract(2, 'days'); // deux jours avant
        startDomain2.hours(0);*/
        const endDomain2 = _.cloneDeep(startDomain2);
        endDomain2.startOf('month');
        endDomain2.add(2, 'months');
        // endDomain2.add(1, 'months'); // example
        // endDomain2.date(15); // example

        // conf 3
        const startDomain3 = moment();
        startDomain3.startOf('month');
        startDomain3.hours(0);
        const endDomain3 = _.cloneDeep(startDomain3);
        endDomain3.add(2, 'years');
        // endDomain3.add(1, 'years'); // example
        endDomain3.startOf('year'); // Voir avec Guillaume
        // endDomain3.month(10); // example
        const forwardLevel = 'W';
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
            forwardLevel,
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
        this.lastCards$ = this.store.select(timelineSelectors.selectLastCardsSelection);

        this.store.dispatch(new InitTimeline({
            data: [],
        }));

        this.lastCards$.subscribe(value => {
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
    }
}
