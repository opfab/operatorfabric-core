/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Observable, of, Subscription } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { AppState } from '@ofStore/index';
import * as timelineSelectors from '@ofSelectors/timeline.selectors';
import { catchError, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FilterType } from '@ofServices/filter.service';
import { ApplyFilter } from '@ofActions/feed.actions';

const forwardWeekConf = {
  start: { year: 0, month: 0, week: 1, day: 0, hour: 0, minute: 0, second: 0 },
  end: { year: 0, month: 0, week: 1, day: 0, hour: 0, minute: 0, second: 0 }
};

@Component({
  selector: 'of-init-chart',
  templateUrl: './init-chart.component.html',
  styleUrls: ['./init-chart.component.scss']
})
export class InitChartComponent implements OnInit, OnDestroy {

  @Input() confDomain;

  // required by Timeline
  public arrayChartData: any[];
  public myDomain: number[];
  public domainId: string;
  data$: Observable<any[]>;
  subscription: Subscription;

  // required for domain movements specifications
  public followClockTick: boolean;
  public followClockTickMode: boolean;

  // buttons
  public buttonTitle: string;
  public buttonHome: number[];
  public buttonHomeActive: boolean;
  public buttonList;


  constructor(private store: Store<AppState>) {
  }


  /**
   * set selector on timeline's State
   * and call timeline initialization functions
   */
  ngOnInit() {
    this.initDomains();
    this.initDataPipe();
  }

  /**
     * if it was given on confDomain, set the list of zoom buttons and use first zoom of list
     * else default zoom is weekly 
     */
  initDomains(): void {
    this.buttonList = [];
    if (this.confDomain && this.confDomain.length > 0) {
      for (const elem of this.confDomain) {
        const tmp = _.cloneDeep(elem);
        this.buttonList.push(tmp);
      }
    } else {
      const defaultConfig = { buttonTitle: 'W', domainId: 'W' };
      this.buttonList.push(defaultConfig);
    }
    // Set the zoom activated
    if (this.buttonList.length > 0) {
      this.changeGraphConf(this.buttonList[0]);
    }
  }

  /**
   * Call when click on a zoom button 
   * @param conf button clicked 
   */
  changeGraphConf(conf: any): void {

    this.followClockTick = false;
    this.followClockTickMode = false;
    this.buttonHomeActive = false;

    if (conf.followClockTick) {
      this.followClockTick = true;
      this.followClockTickMode = true;
    }
    if (conf.buttonTitle) {
      this.buttonTitle = conf.buttonTitle;
    }

    this.selectZoomButton(conf.buttonTitle);
    this.domainId = conf.domainId;
    this.setDefaultStartAndEndDomain();
  }


  selectZoomButton(buttonTitle) {
    this.buttonList.forEach(button => {
      if (button.buttonTitle === buttonTitle) {
        button.selected = true;
      } else {
        button.selected = false;
      }
    });
  }


  setDefaultStartAndEndDomain() {
    let startDomain;
    let endDomain;
    switch (this.domainId) {

      case 'TR': {
        startDomain = moment().minutes(0).second(0).millisecond(0).subtract(2, 'hours');
        endDomain = moment().minutes(0).second(0).millisecond(0).add(10, 'hours');
        break;
      }
      case 'J': {
        startDomain = moment().hours(0).minutes(0).second(0).millisecond(0);
        endDomain = moment().hours(0).minutes(0).second(0).millisecond(0).add(1, 'days');
        break;
      }
      case '7D': {
        startDomain = moment().minutes(0).second(0).millisecond(0).subtract(12, 'hours');
        // set position to a mutliple of 4 
        for (let i = 0; i < 4; i++) {
          if (((startDomain.hours() - i) % 4) === 0) {
            startDomain.subtract(i, 'hours');
            break;
          }
        }
        endDomain = moment(startDomain).add(8, 'day');
        break;
      }
      case 'W': {
        startDomain = moment().startOf('week').minutes(0).second(0).millisecond(0);
        endDomain = moment().startOf('week').minutes(0).second(0).millisecond(0).add(1, 'week');
        break;
      }
      case 'M': {
        startDomain = moment().startOf('month').minutes(0).second(0).millisecond(0);
        endDomain = moment().startOf('month').hour(0).minutes(0).second(0).millisecond(0).add(1, 'month');
        break;
      }
      case 'Y': {
        startDomain = moment().startOf('year').hour(0).minutes(0).second(0).millisecond(0);
        endDomain = moment().startOf('year').hour(0).minutes(0).second(0).millisecond(0).add(1, 'year');
        break;
      }
    }
    this.setStartAndEndDomain(startDomain.valueOf(), endDomain.valueOf());
    this.buttonHome = [startDomain, endDomain];
  }



  /**
   * apply new timeline domain
   * feed state dispatch a change on filter, provide the new filter start and end
   * @param startDomain new start of domain
   * @param endDomain new end of domain
   */
  setStartAndEndDomain(startDomain: number, endDomain: number): void {

    console.log(new Date().toISOString(), "BUG OC-604 init-chart.components.ts setStartAndEndDomain() , startDomain= ", startDomain, ",endDomain=", endDomain);
    this.myDomain = [startDomain, endDomain];

    this.store.dispatch(new ApplyFilter({
      name: FilterType.TIME_FILTER, active: true,
      status: { start: startDomain, end: endDomain }
    }));
  }


  /**
   * subscribe on timeline's State data
   * feed arrayChartData with values from data Observable
   */
  initDataPipe(): void {
    // init data selector
    this.data$ = this.store.pipe(
      select(timelineSelectors.selectTimelineSelection),
      catchError(err => of([]))
    );
    this.subscription = this.data$.pipe(debounceTime(300), distinctUntilChanged()).subscribe(value => {
      const chartData = _.cloneDeep(value);
      this.setArrayChartData(chartData);
    });
  }

  /**
 * unsubscribe every subscription made on this file
 */
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }


  /**
   * sort by display date the array received on param
   * set an list of arrays for each severity of Cards
   */
  setArrayChartData(array: any[]): void {
    array.sort((val1, val2) => {
      return val1.displayDate - val2.displayDate;
    });

    const arraySeverity = [];
    this.arrayChartData = [];
    for (const value of array) {
      const obj = _.cloneDeep(value);
      obj.date = obj.displayDate;
      obj.r = 20;
      obj.stroke = 'stroke';
      obj.count = 1;
      obj.color = this.getColorSeverity(obj.severity);
      obj.value = this.getCircleValue(obj.severity);

      let idx = -1;
      // compare object color with all colors stock on arraySeverity
      for (let i = 0; i < arraySeverity.length; i++) {
        if (arraySeverity[i].color === obj.color) {
          idx = i;
          break;
        }
      }
      // push a new array when an new color is parsed
      if (idx === -1) {
        const last = this.arrayChartData.length;
        this.arrayChartData.push([]);
        this.arrayChartData[last].push(obj);
        arraySeverity.push({ color: obj.color, id: last });
      } else {
        // push object inside the severity's list corresponding on arrayChartData
        this.arrayChartData[idx].push(obj);
      }
    }
  }

  /**
   * return color according to severity
   * @param color
   */
  getColorSeverity(color: string): string {
    if (color) {
      switch (color) {
        case 'ALARM': {
          return 'red';
        }
        case 'ACTION': {
          return 'orange';
        }
        case 'COMPLIANT': {
          return 'green';
        }
        case 'INFORMATION': {
          return 'blue';
        }
        default: {
          return 'white';
        }
      }
    } else { // default
      return 'white';
    }
  }

  /**
   * return value (y position) according to severity
   * @param color
   */
  getCircleValue(color: string): number {
    if (color) {
      switch (color) {
        case 'ALARM': {
          return 4;
        }
        case 'ACTION': {
          return 3;
        }
        case 'COMPLIANT': {
          return 2;
        }
        case 'INFORMATION': {
          return 1;
        }
        default: {
          return 5;
        }
      }
    } else { // default
      return 5;
    }
  }



  /**
:
   * apply arrow button clicked : switch the graph context with the zoom level configurated
   * at the left or right of our actual button selected
   * @param direction receive by child component custom-timeline-chart
   */
  applyNewZoom(direction: string): void {
    this.buttonHomeActive = false;
    if (direction === 'in') {
      const reverseButtonList = _.cloneDeep(this.buttonList);
      reverseButtonList.reverse();
      for (let i = 0; i < reverseButtonList.length; i++) {
        if (reverseButtonList[i].buttonTitle === this.buttonTitle) {
          if (i + 1 === reverseButtonList.length) {
            return;
          } else {
            this.changeGraphConf(reverseButtonList[i + 1]);
            return;
          }
        }
      }
    } else if (direction === 'out') {
      for (let i = 0; i < this.buttonList.length; i++) {
        if (this.buttonList[i].buttonTitle === this.buttonTitle) {
          if (i + 1 === this.buttonList.length) {
            return;
          } else {
            this.changeGraphConf(this.buttonList[i + 1]);
            return;
          }
        }
      }
    }
  }

  /**
   * change timeline domain
   * deactivate the home button display
   * activate first move boolean, on first move make by clicking a button the home domain will be used
   * activate followClockTick if the zoom level has this mode activated
   * @param startDomain new start of domain
   * @param endDomain new end of domain
   */
  homeClick(startDomain: number, endDomain: number): void {

    this.setStartAndEndDomain(startDomain, endDomain);
    this.buttonHomeActive = false;
    // followClockTickMode is define on the zoom level
    if (this.followClockTickMode) {
      this.followClockTick = true;
    }
  }

  /**
   * select the movement applied on domain : forward or backward
   * parse the conf object dedicated for movement, parse it two time when end property is present
   * each object's keys add time precision on start or end of domain
   * @param moveForward direction: add or subtract conf object
   */
  moveDomain(moveForward: boolean): void {
    let startDomain = moment(this.myDomain[0]);
    let endDomain = moment(this.myDomain[1]);

    // Move from main visualisation, now domain stop to move
    if (this.followClockTick) {
      this.followClockTick = false;
    }

    if (moveForward) {
      startDomain = this.goForward(startDomain);
      endDomain = this.goForward(endDomain);
    }
    else {
      startDomain = this.goBackword(startDomain);
      endDomain = this.goBackword(endDomain);
    }

    this.buttonHomeActive = true;
    this.setStartAndEndDomain(startDomain.valueOf(), endDomain.valueOf());
  }

  goForward(dateToMove: moment.Moment) {
    switch (this.domainId) {
      case 'TR': return dateToMove.add(2, 'hour');
      case 'J': return dateToMove.add(1, 'day');
      case '7D': return dateToMove.add(8, 'hour').startOf('day').add(1, 'day'); // the feed is not always at the beginning of the day
      case 'W': return dateToMove.add(7, 'day');
      case 'M': return dateToMove.add(1, 'month');
      case 'Y': return dateToMove.add(1, 'year');
    }
  }

  goBackword(dateToMove: moment.Moment) {
    switch (this.domainId) {
      case 'TR': return dateToMove.subtract(2, 'hour');
      case 'J': return dateToMove.subtract(1, 'day');
      case '7D': return dateToMove.add(8, 'hour').startOf('day').subtract(1, 'day'); // the feed is not always at the beginning of the day 
      case 'W': return dateToMove.subtract(7, 'day');
      case 'M': return dateToMove.subtract(1, 'month');
      case 'Y': return dateToMove.subtract(1, 'year');
    }
  }


}

