/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
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
import { BaseChartComponent, calculateViewDimensions, ChartComponent, ViewDimensions } from '@swimlane/ngx-charts';
import * as moment from 'moment';
import {select,Store} from "@ngrx/store";
import {selectCurrentUrl} from '@ofStore/selectors/router.selectors';
import {AppState} from "@ofStore/index";
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import * as feedSelectors from '@ofSelectors/feed.selectors';


@Component({
  selector: 'of-custom-timeline-chart',
  templateUrl: './custom-timeline-chart.component.html',
  styleUrls: ['./custom-timeline-chart.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CustomTimelineChartComponent extends BaseChartComponent implements OnInit {

  subscription: Subscription;
  public xTicks: Array<any> = [];
  public xTicksOne: Array<any> = [];
  public xTicksTwo: Array<any> = [];
  public xTicksOneFormat: string;
  public xTicksTwoFormat: string;
  public underDayPeriod: boolean = false;
  public dateFirstTick: string;
  public oldWidth: number = 0;


  @ViewChild(ChartComponent, { read: ElementRef, static: false }) chart: ElementRef;
  public dims: ViewDimensions;
  public xDomain: any;
  public yScale: any;
  private xAxisHeight: number = 0;
  private yAxisWidth: number = 0 ;
  public xScale: any;
  private margin: any[]= [10, 20, 10, 0];
  public translateGraph: string;
  public translateXTicksTwo: string;
  public xRealTimeLine: moment.Moment;
  private currentPath : string;


  // TOOLTIP
  public currentCircleHovered;
  public circles;
  public cardsData;
  
  @Input() prod; // Workaround for testing, the variable is not set  in unit test an true in production mode 
  @Input() domainId;
  @Input() followClockTick;
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

  @Output() zoomChange: EventEmitter<string> = new EventEmitter<string>(); 
  @Output() widthChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(chartElement: ElementRef, zone: NgZone, cd: ChangeDetectorRef,private store: Store<AppState>,private router: Router) {
    super(chartElement, zone, cd);
  }

  ngOnInit(): void {
    this.store.select(selectCurrentUrl).subscribe(url => {
      if (url) {
          const urlParts = url.split('/');
          this.currentPath = urlParts[1];
      }
  });
    this.initGraph();
    this.updateRealTimeDate();
    this.initDataPipe();
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
      if (this.xTicks[4].valueOf() <= moment().millisecond(0).valueOf()) {
        this.valueDomain = [this.xTicks[1].valueOf(), this.xDomain[1] + (this.xTicks[1] - this.xDomain[0])];
        return true;
      }
    }
    return false;
  }

  /**
   * Main function for ngx-charts
   * called for each update on chart
   */
  update(): void {
    super.update();
    this.updateDimensions();
    this.setupXAxis();
    this.createCircles();
  }

  updateDimensions(): void {
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
    this.xScale =  scaleTime().range([0, this.dims.width]).domain(this.xDomain);
    this.yScale =  scaleLinear().range([this.dims.height, 0]).domain([0, 5]);
    this.translateGraph = `translate(${this.dims.xOffset} , ${this.margin[0]})`;
    this.translateXTicksTwo = `translate(0, ${this.dims.height + 15})`;
    if (this.oldWidth !== this.dims.width) {
      this.oldWidth = this.dims.width;
      this.widthChange.emit(true);
    }
  }

  setupXAxis(): void {
    this.setXTicksValue();
    this.xTicksOne = [];
    this.xTicksTwo = [];
    switch (this.domainId) {
      case 'TR':
        this.xTicks.forEach(tick => { 
          this.xTicksOne.push(tick);
          if (tick.minute() === 0) this.xTicksTwo.push(tick)
        });
        break;
      case 'J':
      case 'M':
      case 'Y':
        for (let i = 0; i < this.xTicks.length; i++) {
          if (i % 2 === 0) this.xTicksOne.push(this.xTicks[i]);
          else this.xTicksTwo.push(this.xTicks[i]);
        }
        break;
      case '7D':
      case 'W':
        this.xTicks.forEach(tick => {
          this.xTicksOne.push(tick);
          // [OC-797] 
          //  in case of a period containing the switch form winter/summer time
          //  the tick are offset by one hour in a part of the timeline 
          // in this case , we put the date on the tick representing 01:00
          if ((tick.hour() === 0) || (tick.hour() === 1))  this.xTicksTwo.push(tick);
        });
        break;
      default:
    }

  }

  setXTicksValue(): void {
    const startDomain = moment(this.xDomain[0]);
    this.xTicks = [];
    this.xTicks.push(startDomain);
    let nextTick = moment(startDomain);
    const tickSize = this.getTickSize();

    while (nextTick.valueOf() < this.xDomain[1]) {

      // we need to make half month tick when Y domain 
      if (this.domainId === 'Y') {
        if (nextTick.isSame(moment(nextTick).startOf('month'))) nextTick.add(15, 'day')
        else nextTick.add(1, 'month').startOf('month');
      }
      else nextTick.add(tickSize.amount, tickSize.unit);
      this.xTicks.push(moment(nextTick));
    }
  }
 


  initDataPipe(): void {
    this.subscription = this.store.pipe(select(feedSelectors.selectFilteredFeed))
    .pipe(debounceTime(200), distinctUntilChanged())
    .subscribe(value => this.getAllCardsToDrawOnTheTimeLine(value));
  }


  getAllCardsToDrawOnTheTimeLine(cards) {
    const myCardsTimeline = [];
    for (const card of cards) {
        if (card.timeSpans && card.timeSpans.length > 0) {
            card.timeSpans.forEach(timeSpan => {
                const myCardTimelineTimespans = {
                    date: timeSpan.start, 
                    id: card.id,
                    severity: card.severity, process: card.process,
                    processVersion: card.processVersion, summary: card.title
                };
                myCardsTimeline.push(myCardTimelineTimespans);
            });
        } else {
            const myCardTimeline = {
                date: card.startDate,
                id: card.id,
                severity: card.severity, process: card.process,
                processVersion: card.processVersion, summary: card.title
            };
            myCardsTimeline.push(myCardTimeline);
        }
    }
    this.cardsData = myCardsTimeline;
    this.createCircles();
}



  createCircles(): void {

    this.circles = [];
    if (this.cardsData === undefined || this.cardsData === []) return;

    // filter cards by date 
    this.cardsData.sort((val1, val2) => {
      return val1.date - val2.date;
    });

    // seperate cards by severity 
    let cardsBySeverity = [];
    for (var i=0;i<4;i++) cardsBySeverity.push([]);
    for (const card of this.cardsData) {
      card.circleYPosition = this.getCircleYPosition(card.severity);
      cardsBySeverity[card.circleYPosition-1].push(card);
    }

    // foreach severity array create the circles 
    for (const cards of cardsBySeverity ) {
      let cardIndex = 0;
      // move index to the first card in the time domain 
      if (cards.length > 0) {
        while (cards[cardIndex] && (cards[cardIndex].date < this.xDomain[0]) && (cardIndex < cards.length)) cardIndex++;
      }
      // for each interval , if a least one card in the interval , create a circle object. 
      if (cardIndex < cards.length) {
        for (let tickIndex = 1; tickIndex < this.xTicks.length; tickIndex++) {
          
          let endLimit = this.xTicks[tickIndex].valueOf();
          if (tickIndex + 1 === this.xTicks.length) 
              {
                endLimit += 1; // Include the limit domain value by adding 1ms
              }
    

          if (cards[cardIndex] && cards[cardIndex].date < endLimit ) {
            // initialisation of a new circle
            const circle = {
              start: cards[cardIndex].date,
              end: cards[cardIndex].date,
              date: moment(this.xTicks[tickIndex - 1].valueOf()),
              dateOrPeriod: '',
              count: 0,
              color: this.getCircleColor(cards[cardIndex].severity),
              circleYPosition: cards[cardIndex].circleYPosition,
              summary: []
            };

            // while cards date is inside the interval of the two current ticks ,add card information in the circle 
            while (cards[cardIndex]  && cards[cardIndex].date < endLimit) {
              circle.count ++;
              circle.end = cards[cardIndex].date;
              circle.summary.push({
                cardId : cards[cardIndex].id,
                parameters: cards[cardIndex].summary.parameters,
                key: cards[cardIndex].summary.key,
                summaryDate: moment(cards[cardIndex].date).format('DD/MM - HH:mm :'),
                i18nPrefix: cards[cardIndex].process + '.' + cards[cardIndex].processVersion + '.'
              });
              cardIndex++;
            }

            //  add the circle to the list of circles to display  
            if (circle.start.valueOf() === circle.end.valueOf()) {
              circle.dateOrPeriod = 'Date : ' + this.getCircleDateFormatting(circle.start);
            } else {
              circle.dateOrPeriod = 'Periode : ' + this.getCircleDateFormatting(circle.start) +
                ' - ' + this.getCircleDateFormatting(circle.end);
            }
            this.circles.push(circle);

          }
        }
      }
    }
  }

  getCircleYPosition(severity: string): number {
    if (severity) {
      switch (severity) {
        case 'ALARM': return 4;
        case 'ACTION': return 3;
        case 'COMPLIANT':  return 2;
        case 'INFORMATION': return 1;
        default: return 1;
      }
    } else  return 1;
  }

  getCircleColor(severity: string): string {
    if (severity) {
      switch (severity) {
        case 'ALARM': return 'red';
        case 'ACTION': return 'orange';
        case 'COMPLIANT': return 'green';
        case 'INFORMATION': return 'blue';
        default:  return 'blue';
      }
    } else return 'blue';
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
      case 'TR': return date.format('ddd DD MMM HH') +  'h' + date.format('mm');
      case '7D':
      case 'W':
      case 'M': return date.format("ddd DD MMM HH") + 'h';
      case 'Y': return date.format("ddd DD MMM YYYY");
      case 'J':
      default: return date.format('HH[h]mm');
    }
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

  showCard(cardId): void {
    console.log("cardId=" , cardId);
    this.router.navigate(['/' + this.currentPath, 'cards', cardId]);
    this.scrollToSelectedCard();
  }

  scrollToSelectedCard()
  {
    // wait for 500ms to be sure the card is selected and scroll to the card with his id (opfab-selected-card)
    setTimeout(() => { document.getElementById("opfab-selected-card").scrollIntoView({behavior: "smooth", block: "center"});},500);
  }

  checkInsideDomain(date): boolean {
    const domain = this.xDomain;
    return date >= domain[0] && date <= domain[1];
  }

  getXRealTimeLineFormatting(xRealTimeLine) {
    return moment(xRealTimeLine).format('DD/MM/YY HH:mm');
  }

  feedCircleHovered(myCircle): void {
    this.currentCircleHovered = myCircle;
  }

  getXTickOneFormatting = (value): string => {

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

  getXTickTwoFormatting = (value): string => {
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
   * called when the height of the chart is updated
   */
  updateXAxisHeight({ height }): void {
    this.xAxisHeight = height;
    this.updateDimensions();
  }

  /**
   *  change for next or previous zoom set by buttons conf
   */
  onZoom($event: MouseEvent, direction): void {
    this.zoomChange.emit(direction);
  }

}
