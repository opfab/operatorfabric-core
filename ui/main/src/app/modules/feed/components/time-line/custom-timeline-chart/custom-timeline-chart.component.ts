/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { scaleLinear, scaleTime } from 'd3-scale';
import * as _ from 'lodash';
import { BaseChartComponent, calculateViewDimensions, ChartComponent, ViewDimensions } from '@swimlane/ngx-charts';
import * as moment from 'moment';
import {Store} from "@ngrx/store";
import {AppState} from "@ofStore/index";
import {ApplyFilter} from "@ofActions/feed.actions";
import {FilterType} from "@ofServices/filter.service";


@Component({
  selector: 'of-custom-timeline-chart',
  templateUrl: './custom-timeline-chart.component.html',
  styleUrls: ['./custom-timeline-chart.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CustomTimelineChartComponent extends BaseChartComponent implements OnInit {


  public xTicks: Array<any>;
  public xTicksOne: Array<any>;
  public xTicksTwo: Array<any>;
  public xTicksOneFormat: String;
  public xTicksTwoFormat: String;
  public underDayPeriod: boolean;
  public dateFirstTick: string;
  public oldWidth: number;

  // MUST
  @ViewChild(ChartComponent, { read: ElementRef, static: false }) chart: ElementRef;
  public dims: ViewDimensions;
  public xDomain: any;
  public yDomain: any;
  public yScale: any;
  private xAxisHeight: number;
  private yAxisWidth: number;
  public timeScale: any;
  private margin: any[];
  public transform: string;
  public transform2: string;
  public xRealTimeLine: moment.Moment;

  private circleDiameter = 10;

  // TOOLTIP
  public circleHovered;
  // DATA
  private _myData;
  public dataClustered;

  @Input() prod; // Workaround for testing, the variable is not set  in unit test an true in production mode 
  @Input() domainId;
  @Output() zoomChange: EventEmitter<string> = new EventEmitter<string>(); // manage home btn when domain change inside this component
  @Input() followClockTick;


  @Output() widthChange: EventEmitter<boolean> = new EventEmitter<boolean>();


  constructor(chartElement: ElementRef, zone: NgZone, cd: ChangeDetectorRef,private store: Store<AppState>) {
    super(chartElement, zone, cd);
    this.xTicks = [];
    this.xTicksOne = [];
    this.xTicksTwo = [];
    this.xAxisHeight = 0;
    this.yAxisWidth = 0;
    this.margin = [10, 20, 10, 0];
    this.circleHovered = {
      period: '',
      count: 0,
      summary: [],
    };
    this.underDayPeriod = false;
    this.oldWidth = 0;
  }

  // Domain
  @Input()
  set valueDomain(value: any) {
    this.xDomain = value;
    // allow to show on top left of component date of first tick 
    this.underDayPeriod = false;
    if (value[1] - value[0] < 86401000) { // 1 Day + 1 second  , take into account the J domain form Oh to 0h the next day 
      this.underDayPeriod = true;
      this.dateFirstTick = moment(value[0]).format('ddd DD MMM YYYY');
    }
  }

  get valueDomain() {
    return this.xDomain;
  }
  // Data
  @Input()
  set myData(value: any) {
    this._myData = _.cloneDeep(value);
  }
  get myData() {
    return this._myData;
  }


  ngOnInit(): void {
    this.initGraph();
    this.updateRealTimeDate();
  }

  // set inside ngx-charts library verticalSpacing variable to 10
  // library need to rotate ticks one time for set verticalSpacing to 10px on ngx-charts-x-axis-ticks
  // searching to loop lessiest time possible but loop enough time for use more than usable space
  initGraph(): void {
    const limit = window.innerWidth / 10;
    for (let i = 0; i < limit; i++) {
      this.xTicksOne.push(moment(i));
      this.xTicksTwo.push(moment(i));
    }
  }

  /**
   * loop function for set xRealTimeLine at the actual time
   * xRealTimeLine is a vertical bar which represent the current time
   * update the domain if check follow clock tick is true
   */
  updateRealTimeDate(): void {
    this.xRealTimeLine = moment();
    if (this.followClockTick) {
      if (this.checkFollowClockTick()) {
        this.update();
      }
    }
    setTimeout(() => {
      this.updateRealTimeDate();
    }, 1000);
  }


  /**
   * change domain start with the second tick value
   * if moment is equal to the 4th tick return true
   */
  checkFollowClockTick(): boolean {
    if (this.xTicks && this.xTicks.length > 5) {
      const tmp = moment();
      tmp.millisecond(0);
      if (this.xTicks[4].valueOf() <= tmp.valueOf()) {
        this.valueDomain = [this.xTicks[1].valueOf(), this.xDomain[1] + (this.xTicks[1] - this.xDomain[0])];
        return true;
      }
    }
    return false;
  }

  /**
   * Main function for ngx-charts
   * called for each update on chart
   * set chart dimension and chart domains
   * set chart scales and translate (add margin arround chart)
   */
  update(): void {
    super.update();
    this.dims = calculateViewDimensions({
      width: this.width,
      height: this.height,
      margins: this.margin,
      showXAxis: true,
      showYAxis: true,
      xAxisHeight: this.xAxisHeight,
      yAxisWidth: this.yAxisWidth,
      showLegend: false,
      legendType: 'time'
    });
    this.yDomain = [0, 5];
    this.timeScale = this.getTimeScale(this.xDomain, this.dims.width);
    this.yScale = this.getYScale(this.yDomain, this.dims.height);
    this.transform = `translate(${this.dims.xOffset} , ${this.margin[0]})`;
    this.transform2 = `translate(0, ${this.dims.height + 15})`;
    if (this.oldWidth !== this.dims.width) {
      this.oldWidth = this.dims.width;
      this.widthChange.emit(true);
    }
  }


  /**
   * return scaleTime (xScale) function after called XTicks and Cluster setter functions
   * @param domain
   * @param width
   */
  getTimeScale(domain, width): any {
    this.xTicks = [];
    this.setTicksAndClusterize(domain);
    return scaleTime()
      .range([0, width])
      .domain(domain);
  }


  /**
  * set cluster level 
  * set format level
  * set the x ticks value
  * set the two x ticks displayed lists
  * call clusterize function
  * @param domain
  */
  setTicksAndClusterize(domain): void {

    this.setXTicksValue(domain);
    this.xTicksOne = [];
    this.xTicksTwo = [];
    switch (this.domainId) {
      case 'TR':
        this.xTicksOne = this.multiHorizontalTicksLine(3);
        this.xTicksTwo = this.multiHorizontalTicksLine(5);
        break;
      case 'J':
      case 'M':
      case 'Y':
        this.xTicksOne = this.multiHorizontalTicksLine(1);
        this.xTicksTwo = this.multiHorizontalTicksLine(2);
        break;
      case '7D':
      case 'W':
        this.xTicksOne = this.multiHorizontalTicksLine(3);
        this.xTicksTwo = this.multiHorizontalTicksLine(4);
        break;
      default:
    }
    this.clusterize(domain);
  }



  setXTicksValue(domain): void {
    const startDomain = moment(domain[0]);
    this.xTicks.push(startDomain);
    let nextTick = moment(startDomain);
    const tickSize = this.getTickSize();

    while (nextTick.valueOf() < domain[1]) {

      // we need to make half month tick when Y domain 
      if (this.domainId === 'Y') {
        if (nextTick.isSame(moment(nextTick).startOf('month'))) nextTick.add(15, 'day')
        else nextTick.add(1, 'month').startOf('month');
      }
      else nextTick.add(tickSize.amount, tickSize.unit);
      this.xTicks.push(moment(nextTick));
    }
  }
  /**
      * return a list of ticks made by the parsing of xTicks
      * 1 : return half of xTicks' ticks
      * 2 : return the other half of xTicks' ticks
      * 3 : return xTicks
      * 4 : return tick value every time tick hour = 0
      * 5 : return tick value every time tick minute = 0
      */
  multiHorizontalTicksLine(pos: number) {
    const newList = [];
    switch (pos) {
      case 1:
        for (let i = 0; i < this.xTicks.length; i++) {
          if (i % 2 === 0) {
            newList.push(this.xTicks[i]);
          }
        }
        break;
      case 2:
        for (let i = 0; i < this.xTicks.length; i++) {
          if (i % 2 === 1) {
            newList.push(this.xTicks[i]);
          }
        }
        break;
      case 3:
        this.xTicks.forEach(tick => {
          newList.push(tick);
        });
        break;
      case 4:
        for (let i = 0; i < this.xTicks.length; i++) {

          // [OC-797] 
          //  in case of a period containing the switch form winter/summer time
          //  the tick are offset by one hour in a part of the timeline 
          // in this cas , we put the date on the tick representing 01:00
          if ((this.xTicks[i].hour() === 0) || (this.xTicks[i].hour() === 1)) {
            newList.push(this.xTicks[i]);
          }
        }
        break;

      case 5:
        for (let i = 0; i < this.xTicks.length; i++) {
          if (this.xTicks[i].minute() === 0) {
            newList.push(this.xTicks[i]);
          }
        }
        break;

      default:
        break;
    }
    return newList;
  }

  /**
    * set dataClustered with the data after they be parsed
    * two differents algos :
    *  - circle position are centered on ticks
    *  - circle position are centered between two ticks
    * @param domain
    */
  clusterize(domain): void {
    this.dataClustered = [];
    if (this._myData === undefined || this._myData === []) {
      return;
    }
    let y = 0;
    // loop on arrays (each severities) of our data
    for (const array of this._myData) {
      let firstPass = true;
      let j = 0;
      this.dataClustered.push([]);
      if (array.length > 0) {
        // move cursor to begin of ticks time
        while (array[j] && (array[j].date < domain[0]) && (j < array.length)) {
          j++;
        }
      }
      if (j < array.length) {
        // for all arrays loop on all ticks
        for (let i = 1; i < this.xTicks.length; i++) {
          if (array[j]) {
            let feedIt = false;
            let circleDate;
            circleDate = this.xTicks[i - 1].valueOf();
            const newDate = moment(circleDate);
            // initialisation a new circle
            // it's push on our new Data List only if it's inside the interval
            const newCircle = {
              start: moment(array[j].date),
              end: moment(array[j].date),
              date: newDate,
              count: 0,
              color: array[j].color,
              cy: array[j].cy,
              value: array[j].value,
              summary: [],
              r: this.circleDiameter,
            };
            let startLimit: number;
            let endLimit: number;


            startLimit = this.xTicks[i - 1].valueOf();
            endLimit = this.xTicks[i].valueOf();
            if (i + 1 === this.xTicks.length) {
              endLimit = this.xTicks[i].valueOf() + 1;
            }

            // add value of array[j] if his date is inside the interval make by start and end limit
            while (array[j] && startLimit <= array[j].date && array[j].date < endLimit) {
              const newValue = newCircle.count + array[j].count;
              feedIt = true;
              newCircle.count = newValue;
              newCircle.end = array[j].date;
              const summaryDate = moment(array[j].date).format('DD/MM') +
                ' - ' + moment(array[j].date).format('HH:mm') + ' : ';


              const objSummary = {
                parameters: array[j].summary.parameters, key: array[j].summary.key,
                summaryDate: summaryDate, i18nPrefix: array[j].publisher + '.' + array[j].publisherVersion + '.'
              };
              newCircle.summary.push(objSummary);
              j++;
            }
            if (feedIt) {
              this.dataClustered[y].push(_.cloneDeep(newCircle));
            }
          }
        }
      }
      y++;
    }
  }


  /**
   * return scaleY function after set Y Ticks
   */
  getYScale(domain, height): any {
    return scaleLinear()
      .range([height, 0])
      .domain(domain);
  }


  //
  // FOLLOWING METHODS ARE  CALLED FROM THE HTML 
  //

  /**
   * return an empty value to display (use to have no label on y axis) 
   */
  hideLabelsTicks = (e): string => {
    return '';
  }

  checkInsideDomain(date): boolean {
    const domain = this.xDomain;
    return date >= domain[0] && date <= domain[1];
  }

  getXRealTimeLineFormatting(xRealTimeLine) {
    return moment(xRealTimeLine).format('DD/MM/YY HH:mm');
  }

  /**
   * set circleHovered properties
   * with first and last date in value group creating circle
   * with summary propriety (card title)
   * @param myCircle
   */
  feedCircleHovered(myCircle): void {
    this.circleHovered = {
      period: '',
      count: myCircle.count,
      summary: [],
    };
    if (myCircle.start.valueOf() === myCircle.end.valueOf()) {
      this.circleHovered.period = 'Date : ' + this.getCircleDateFormatting(myCircle.start);
    } else {
      this.circleHovered.period = 'Periode : ' + this.getCircleDateFormatting(myCircle.start) +
        ' - ' + this.getCircleDateFormatting(myCircle.end);
    }
    this.circleHovered.summary = myCircle.summary;
  }

  /**
   * format the date of the hovered circle
   */
  getCircleDateFormatting(value): string {
    if (typeof value === 'string') {
      return value;
    }
    const date = moment(value);
    switch (this.domainId) {
      case 'TR':
        return date.format('ddd DD MMM HH') +
          'h' + date.format('mm');
      case '7D':
      case 'W':
        return date.format("ddd DD MMM HH") + 'h';
      case 'M':
      case 'Y':
        return date.format("ddd DD MMM YYYY");
      case 'J':
      default:
        return date.format('HH[h]mm');

    }
  }


  getXTickOneFormatting = (value): String => {

    const isFirstOfJanuary = (value.valueOf() === moment(value).startOf('year').valueOf());
    switch (this.domainId) {
      case 'TR':
        return value.format('mm');
      case 'J':
        return value.format('HH') + 'h' + value.format('mm');
      case '7D':
      case 'W':
        return value.format('HH') + 'h';
      case 'M':
        if (isFirstOfJanuary) return value.format('DD MMM YY');
        return value.format('ddd DD MMM');
      case 'Y':
        if (isFirstOfJanuary) return value.format('D MMM YY');
        else return value.format('D MMM');
      default: return "";
    }
  }

  getXTickTwoFormatting = (value): String => {
    const isFirstOfJanuary = (value.valueOf() === moment(value).startOf('year').valueOf());
    switch (this.domainId) {
      case 'TR':
        if (moment(value).hours() === 0) return value.format('ddd DD MMM');
        return value.format('HH') + 'h';
      case 'J':
        return value.format('HH') + 'h' + value.format('mm');
      case '7D':
      case 'W':
      case 'M':
        if (isFirstOfJanuary) return value.format('DD MMM YY');
        return value.format('ddd DD MMM');
      case 'Y':
        return value.format('D MMM');
      default: return "";
    }

  }


  getTickSize() {
    switch (this.domainId) {

      // need to explicit format for moment : https://stackoverflow.com/questions/41768864/moment-add-only-works-with-literal-values
      case 'TR':
        const amountTR: moment.DurationInputArg1 = 15;
        const unitTR: moment.DurationInputArg2 = 'minute';
        return { amount: amountTR, unit: unitTR };

      case 'J':
        const amountJ: moment.DurationInputArg1 = 30;
        const unitJ: moment.DurationInputArg2 = 'minute';
        return { amount: amountJ, unit: unitJ };

      case '7D':
        const amount7D: moment.DurationInputArg1 = 4;
        const unit7D: moment.DurationInputArg2 = 'hour';
        return { amount: amount7D, unit: unit7D };

      case 'W':
        const amountW: moment.DurationInputArg1 = 4;
        const unitW: moment.DurationInputArg2 = 'hour';
        return { amount: amountW, unit: unitW };

      case 'M':
        const amountM: moment.DurationInputArg1 = 1;
        const unitM: moment.DurationInputArg2 = 'day';
        return { amount: amountM, unit: unitM };

      default: return;
    }
  }

  /**
   * called when the width of the chart is updated
   * set new y axis width and call update function
   * @param width
   */
  updateYAxisWidth({ width }): void {
    this.yAxisWidth = width;
    this.update();
  }

  /**
   * called when the height of the chart is updated
   * set new x axis height and call update function
   * @param height
   */
  updateXAxisHeight({ height }): void {
    this.xAxisHeight = height;
    this.update();
  }

  /**
   *  change for next or previous zoom set by buttons conf
   */
  onZoom($event: MouseEvent, direction): void {

    // active next or previous zoom button
    if (direction === 'in') {
      this.zoomChange.emit('in');
    }
    if (direction === 'out') {
      this.zoomChange.emit('out');
    }
  }


}
