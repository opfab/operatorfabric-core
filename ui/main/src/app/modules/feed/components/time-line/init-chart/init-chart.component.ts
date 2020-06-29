/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import {  Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from '@ofStore/index';
import { FilterType } from '@ofServices/filter.service';
import { ApplyFilter } from '@ofActions/feed.actions';
import { TimeService } from '@ofServices/time.service';


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
  public cardsData: any[];
  public myDomain: number[];
  public domainId: string;
  subscription: Subscription;

  // required for domain movements specifications
  public followClockTick: boolean;
  public followClockTickMode: boolean;

  // buttons
  public buttonTitle: string;
  public buttonHome: number[];
  public buttonHomeActive: boolean;
  public buttonList;

  public hideTimeLine = false;
  public startDate;
  public endDate;


  constructor(private store: Store<AppState>,private time :TimeService ) {
  }


  /**
   * set selector on timeline's State
   * and call timeline initialization functions
   */
  ngOnInit() {
    const hideTimeLineInStorage = localStorage.getItem('opfab.hideTimeLine'); 
    this.hideTimeLine = (hideTimeLineInStorage === 'true');
    this.initDomains();
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
    //this.dateToShowWhenHidingTimeLine = "Business periode from to" + this.time.formatDateTime(new Date(startDomain)) + "to " + new Date(endDomain);
    this.startDate = this.getDateFormatting(startDomain);
    this.endDate = this.getDateFormatting(endDomain);

    this.store.dispatch(new ApplyFilter({
      name: FilterType.TIME_FILTER, active: true,
      status: { start: startDomain, end: endDomain }
    }));
  }


  getDateFormatting(value): string {
    const date = moment(value);
    switch (this.domainId) {
      case 'TR': return date.format("L LT");
      case 'J': return date.format("L");
      case '7D':return date.format("L LT");
      case 'W': return date.format("L");
      case 'M': return date.format("L");
      case 'Y': return date.format("yyyy");
      default: return date.format('L LT');
    }
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
:
   * apply arrow button clicked : switch the graph context with the zoom level configurated
   * at the left or right of our actual button selected
   * @param direction receive by child component custom-timeline-chart
   */
  applyNewZoom(direction: string): void {
    this.buttonHomeActive = false;

    for (let i = 0; i < this.buttonList.length; i++) {
      if (this.buttonList[i].buttonTitle === this.buttonTitle) {
        if (direction === 'in') {
          if (i!==0) this.changeGraphConf(this.buttonList[i-1]);
        }
        else {
          if (i!==this.buttonList.length-1) this.changeGraphConf(this.buttonList[i+1]);
        }
        return;
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

  showOrHideTimeline()
  {
    this.hideTimeLine = !this.hideTimeLine;
    localStorage.setItem('opfab.hideTimeLine',this.hideTimeLine.toString());
   // need to relcalculate frame size 
   // event is catch by calc-height-directive.ts 
    window.dispatchEvent(new Event('resize'));
  }

}

