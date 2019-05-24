/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, OnInit } from '@angular/core';
import { single } from './data';
import {Observable, of} from "rxjs";
import {LightCard} from "@ofModel/light-card.model";
import {select, Store} from "@ngrx/store";
import * as timelineSelectors from '@ofSelectors/timeline.selectors';
import {catchError} from "rxjs/operators";
import {AppState} from "@ofStore/index";
import {InitTimeline} from "@ofActions/timeline.actions";
import {AddCardDataTimeline} from "@ofActions/timeline.actions";

@Component({
  selector: 'of-time-line',
  templateUrl: './time-line.component.html',
})
export class TimeLineComponent implements OnInit {

  data$: Observable<any[]>;
  selection$: Observable<string>;
  lastCards$: Observable<LightCard[]>;





  // Ngx-charts

  single: any[];
  multi: any[];

  view: any[] = [700, 400];

  // options
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'Country';
  showYAxisLabel = true;
  yAxisLabel = 'Population';

  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };

  constructor(private store: Store<AppState>) {
    Object.assign(this, { single });
  }

  ngOnInit() {
    /*this.data$ = this.store.pipe(
        select(timelineSelectors.selectTimelineSelection),
        catchError(err => of([]))
    );
    */
    // this.selection$ = this.store.select(timelineSelectors.selectLightCardSelection);
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


  onSelect(event) {
    console.log(event);
  }
}
