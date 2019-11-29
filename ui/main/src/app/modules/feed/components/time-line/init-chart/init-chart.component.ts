import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import {Observable, of, Subscription} from 'rxjs';
import {select, Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import * as timelineSelectors from '@ofSelectors/timeline.selectors';
import {catchError, debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {FilterType} from '@ofServices/filter.service';
import {ApplyFilter} from '@ofActions/feed.actions';

const forwardWeekConf = {
  start: {year: 0, month: 0, week: 1, day: 0, hour: 0, minute: 0, second: 0},
  end: {year: 0, month: 0, week: 1, day: 0, hour: 0, minute: 0, second: 0}
};

@Component({
  selector: 'of-init-chart',
  templateUrl: './init-chart.component.html',
  styleUrls: ['./init-chart.component.scss']
})
export class InitChartComponent implements OnInit, OnDestroy {
  @Input() conf;
  @Input() confZoom;

  // required by Timeline
  public arrayChartData: any[];
  public myDomain: number[];
  data$: Observable<any[]>;
  subscription: Subscription;

  // options of Timeline
  public enableDrag: boolean;
  public enableZoom: boolean;
  public zoomOnButton: boolean;
  public autoScale: boolean;
  public showGridLines: boolean;
  public realTimeBar: boolean;
  public centeredOnTicks: boolean;
  public clusterTicksToTicks: boolean;
  public circleDiameter: number;

  // required for domain movements specifications
  public forwardConf: any; // could make interface
  public backwardConf: any; // could make interface
  public followClockTick: boolean;
  public followClockTickMode: boolean;
  public firstMoveStartOfUnit: boolean;

  // 3 ticks added before domain start on the visualization define by the conf
  public firstMove: boolean;
  public homeDomainExtraTicks: boolean;
  public homeDomainExtraTicksMode: boolean;

  // ticks
  public formatTicks: any;
  public ticksConf: any; // could make interface
  public formatTooltipsDate: string; // could make interface
  public autonomousTicks: boolean;

  // buttons
  public buttonTitle: string;
  public buttonHome: number[];
  public buttonHomeActive: boolean;
  public zoomButtonsActive: boolean;
  public buttonList;


  constructor(private store: Store<AppState>) {
    this.buttonHome = undefined;
    this.buttonHomeActive = false;
    this.buttonList = undefined;
    this.zoomButtonsActive = false;
    this.buttonTitle = undefined;
    this.forwardConf = undefined;
    this.backwardConf = undefined;
    this.ticksConf = undefined;
    // options
    this.myDomain = undefined;
    this.enableDrag = false;
    this.enableZoom = false;
    this.zoomOnButton = false;
    this.autoScale = false;
    this.showGridLines = false;
    this.centeredOnTicks = false;
    this.clusterTicksToTicks = false;
    this.realTimeBar = false;
    this.circleDiameter = 10;
  }


  /**
   * set selector on timeline's State
   * and call timeline initialization functions
   */
  ngOnInit() {
    // init data selector
    this.data$ = this.store.pipe(
        select(timelineSelectors.selectTimelineSelection),
        catchError(err => of([]))
    );
    this.confContextGraph();
    this.setChartData();
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
   * subscribe on timeline's State data
   * feed arrayChartData with values from data Observable
   */
  setChartData(): void {
    this.subscription = this.data$.pipe(debounceTime(300), distinctUntilChanged()).subscribe(value => {
      const chartData = _.cloneDeep(value);
      this.setArrayChartData(chartData);
    });
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
        arraySeverity.push({color: obj.color, id: last});
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
       case 'QUESTION': {
         return 'green';
       }
       case 'NOTIFICATION': {
         return 'blue';
       }
       default : {
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
       case 'QUESTION': {
         return 2;
       }
       case 'NOTIFICATION': {
         return 1;
       }
       default : {
         return 5;
       }
     }
    } else { // default
      return 5;
    }
  }

  /**
   * set timeline options from conf
   */
  readConf(): void {
    // Options on graph
    if (this.conf) {
      if (this.conf.enableDrag) {
        this.enableDrag = true;
      }
      if (this.conf.enableZoom) {
        this.enableZoom = true;
      }
      if (this.conf.zoomOnButton) {
        this.zoomOnButton = true;
      }
      if (this.conf.autoScale) {
        this.autoScale = true;
      }
      if (this.conf.showGridLines) {
        this.showGridLines = true;
      }
      if (this.conf.realTimeBar) {
        this.realTimeBar = true;
      }
      if (this.conf.circleDiameter) {
        this.circleDiameter = this.conf.circleDiameter;
      }
    }
  }

  /**
   * timeline configuration made by calling readConf function
   * set domain context of timeline :
   * if it was given on confZoom, set the list of zoom buttons and use first zoom of list
   * else default zoom is weekly without selection available
   */
  confContextGraph(): void {
    this.readConf();

    // Feed zoom buttons Array by the conf received
    this.buttonList = [];
    if (this.confZoom && this.confZoom.length > 0) {
      for (const elem of this.confZoom) {
        const tmp = _.cloneDeep(elem);
        this.buttonList.push(tmp);
      }
    } else {
      // Default domain set (week)
      this.buttonTitle = 'W';
      this.firstMove = true;
      this.zoomButtonsActive = true;
      // forward configuration object
      this.forwardConf = forwardWeekConf;
      // use autonomous ticks conf
      this.autonomousTicks = true;
      // create two moment for define start and end of domain
      const startDomain = moment();
      startDomain.startOf('week');
      startDomain.hours(0).minutes(0).seconds(0).millisecond(0);
      const endDomain = _.cloneDeep(startDomain);
      endDomain.add(7, 'days');
      this.setStartAndEndDomain(startDomain.valueOf(), endDomain.valueOf());
      this.buttonHome = [startDomain.valueOf(), endDomain.valueOf()];
    }
    // Set the zoom activated
    if (this.buttonList.length > 0) {
      this.zoomButtonsActive = true;
      this.changeGraphConf(this.buttonList[0]);
    }
  }

  /**
   * set timeline ticks, zoom and movement options from conf zoom selected
   * @param conf
   */
    readZoomConf(conf: any): void {
    if (conf.centeredOnTicks) {
      this.centeredOnTicks = true;
    }
    if (conf.clusterTicksToTicks) {
      this.clusterTicksToTicks = true;
    }
    if (conf.followClockTick) {
      this.followClockTick = true;
      this.followClockTickMode = true;
    }
    if (conf.homeDomainExtraTicks) {
      this.homeDomainExtraTicks = true;
      this.homeDomainExtraTicksMode = true;
    }
    if (conf.firstMoveStartOfUnit) {
      this.firstMoveStartOfUnit = true;
    }
    if (conf.ticksConf) {
      this.ticksConf = _.cloneDeep(conf.ticksConf);
    } else if (conf.autonomousTicks) {
      this.autonomousTicks = true;
    }
    if (conf.formatTicks) {
      this.formatTicks = _.cloneDeep(conf.formatTicks);
    }
    if (conf.formatTooltipsDate) {
      this.formatTooltipsDate = conf.formatTooltipsDate;
    }
    if (conf.buttonTitle) {
      this.buttonTitle = conf.buttonTitle;
    }
    if (conf.forwardConf) {
      this.forwardConf = _.cloneDeep(conf.forwardConf);
    }
    if (conf.backwardConf) {
      this.backwardConf = _.cloneDeep(conf.backwardConf);
    }
  }

  /**
   * deactivate home button and set his new field
   * set the zoom level type
   * change timeline domain
   * set all buttons selected property to false
   * select the button from the conf received
   * @param conf
   */
  changeGraphConf(conf: any): void {
    this.firstMove = true;
    this.followClockTick = false;
    this.followClockTickMode = false;
    this.firstMoveStartOfUnit = false;
    this.homeDomainExtraTicks = false;
    this.homeDomainExtraTicksMode = false;
    this.backwardConf = undefined;
    this.autonomousTicks = false;
    this.formatTicks = undefined;
    this.formatTooltipsDate = undefined;
    if (conf) {
      this.buttonHomeActive = false;
      this.readZoomConf(conf);
      this.setStartAndEndDomain(conf.startDomain, conf.endDomain);
      this.buttonHome = [conf.startDomain, conf.endDomain];
      this.buttonList.forEach(button => {
        if (button.buttonTitle === conf.buttonTitle) {
          button.selected = true;
        } else {
          button.selected = false;
        }
      });
    }
  }

  /**
   * calculate the domain in second
   * optain unit and value suits for actual domain and screen size
   * set the ticksConf with the unit and value
   */
  autonomousTicksConf(): void {
    if (this.autonomousTicks) {
      const domainInSecond = (this.myDomain[1] - this.myDomain[0]) / 1000;
      const screenMultiplier = this.getScreenMultiplier();
      const domainInUnit = this.getDomainInUnit(domainInSecond, screenMultiplier);
      const unit = domainInUnit[0];
      let unitValue = 1;
      if (unit === 'second' || unit === 'day' || unit === 'week') {
        unitValue = this.calculationUnitValue(domainInUnit, false);
      } else {
        unitValue = this.calculationUnitValue(domainInUnit, true);
      }
      this.ticksConf = {};
      // Final ticks conf
      this.ticksConf[unit] = unitValue;
    }
  }

  /**
   * calculate a screen multiplier
   * return the number of loop need for obtain a screen size inferior to 550 by subtracting 100
   */
  getScreenMultiplier(): number {
    let screenMultiplier = 0;
    // get current window size
    let screenSize = window.innerWidth;
    while (550 < screenSize) {
      screenMultiplier++;
      screenSize = screenSize - 100;
    }
    return screenMultiplier;
  }

  /**
   * define list for each time unit corresponding to their:
   * names, unit on seconds, maximal number unit accepted, number of unit multipled by screenMultiplier
   * return unit and domain value on this unit
   * @param domainInSecond domain value in second
   * @param screenMultiplier screen multiplier value
   */
  getDomainInUnit(domainInSecond: number, screenMultiplier: number): object {
    const unitList = ['second', 'minute', 'hour', 'day', 'week', 'month', 'year'];
    const unitsOnSecond = [1, 60, 3600, 86400, 604800, 2629746, 31536000];
    // limit define by unit
    const unitOnMax = [180, 180, 72, 105, 70, 72, 100];
    // booster for add unit
    const unitToAdd = [60, 60, 24, 1, 4, 10, 1];
    let domainInUnit = ['year', 1000];
    let first = true;
    for (let i = 0; i < unitsOnSecond.length; i++) {
      // find the right unit
      if (first && domainInSecond / unitsOnSecond[i] < unitOnMax[i] + (screenMultiplier * unitToAdd[i])) {
        const unit = unitList[i];
        domainInUnit = [
          unit,
          domainInSecond / unitsOnSecond[i]
        ];
        first = false;
      }
    }
    return domainInUnit;
  }

  /**
   * return value corresponding to the closest step of this unit time
   * @param domainInUnit unit and domain value in this unit
   * @param half divise by half the final value
   */
  calculationUnitValue(domainInUnit: Object, half: boolean): number {
    let divisor = 16;
    if (half) {
      divisor = 32;
    }
    let value = 2 * (domainInUnit[1] / (window.innerWidth / 1000)) / divisor;
    value = this.roundByUnitStep(value, domainInUnit[0]);
    return value;
  }

  /**
   * each time unit has a list of numbers corresponding to values addable on this unit
   * return the closest step value
   * @param value result optained
   * @param unit time unit
   */
  roundByUnitStep(value: number, unit: string): number {
    let unitStep = [];
    switch (unit)  {
      case 'second': {
        unitStep = [1, 2, 5, 10, 15, 20, 30];
        break;
      }
      case 'minute': {
        unitStep = [1, 2, 5, 10, 15, 20, 30];
        break;
      }
      case 'hour': {
        unitStep = [1, 2, 3, 6, 12];
        break;
      }
      case 'day': {
        unitStep = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];
        break;
      }
      case 'week': {
        unitStep = [1, 2, 4, 6, 8];
        break;
      }
      case 'month': {
        unitStep = [1, 2, 3, 4, 6, 12];
        break;
      }
      case 'year': {
        unitStep = [1, 2, 3, 4, 5, 10, 15, 20, 30, 40, 50, 100];
        break;
      }
    }
    let stepValue = 1;
    let absMin = Math.abs(value - unitStep[0]);
    for (let i = 1; i < unitStep.length; i++) {
      const tmp = Math.abs(value - unitStep[i]);
      if (absMin > tmp) {
        absMin = tmp;
        stepValue = unitStep[i];
      }
    }
    return stepValue;
  }

  /**
   * 2 cases :
   *  - apply arrow button clicked : switch the graph context with the zoom level configurated
   * at the left or right of our actual button selected
   *  - display home button
   * @param direction receive by child component custom-timeline-chart
   */
  applyNewZoom(direction: string): void {
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
    } else { // Drag
      this.buttonHomeActive = true;
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
    // homeDomainExtraTicksMode is define on the zoom level
    if (this.homeDomainExtraTicksMode) {
      this.homeDomainExtraTicks = true;
    }
    this.setStartAndEndDomain(startDomain, endDomain);
    this.buttonHomeActive = false;
    this.firstMove = true;
    // followClockTickMode is define on the zoom level
    if (this.followClockTickMode) {
      this.followClockTick = true;
    }
  }

  /**
   * return the domain start value after subtract 4 ticks
   * on the ticks conf the property date have the list of number defining the ticks position (day's number)
   * @param newStart domain start
   */
  get3TicksBeforeOnArrayDate(newStart: number): number {
    const tmp = moment(newStart);
    let dateStartDomain = _.cloneDeep(tmp.valueOf());
    let count = 0;
    const arrayDate = _.cloneDeep(this.ticksConf['date']);
    arrayDate.reverse();
    let nbDate = _.cloneDeep(tmp.date());
    while (count < 5) {
      if (arrayDate && arrayDate.length > 0) {
        arrayDate.forEach(nb => {
          if (nb < nbDate) {
            count++;
            tmp.date(nb);
            nbDate = nb;
            if (count === 4) {
              dateStartDomain = _.cloneDeep(tmp.valueOf());
            }
          }
        });
        tmp.subtract(1, 'months');
        nbDate = arrayDate[0] + 1;
      }
    }
    return dateStartDomain;
  }

  /**
   * parse ticks conf and subtract each unit's value defined
   * special case for the unit date
   * return a new domain start value with 3 ticks added at begin of home domain
   * @param newStart domain start
   */
  subtract3Ticks(newStart: number): number {
    let tmp = moment(newStart);
    if (this.ticksConf) {
      // Step 1
      Object.keys(this.ticksConf).forEach(key => {
        if (key === 'date') {
          // return final tmp value used for domain start
          tmp = moment(this.get3TicksBeforeOnArrayDate(newStart));
        } else if (this.ticksConf[key] > 0) {
          if (key === 'hour') {
            // subtract hour excess define by value on ticks conf
            for (let i = 0; i < 24; i++) {
              if (((tmp.hours() - i) % this.ticksConf[key]) === 0) {
                  tmp.subtract(i, 'hours');
                  break;
              }
            }
          }
        }
      });
      // Step 2
      // loop 3 times each unit define on ticks conf
      for (let i = 0; i < 3; i++) {
        Object.keys(this.ticksConf).forEach(key => {
          if (key !== 'date') {
            if (this.ticksConf[key] > 0) {
              tmp = moment(this.getDomainByUnit(false, key, this.ticksConf[key], tmp, false));
            }
          }
        });
      }
    }
    this.homeDomainExtraTicks = false;
    const startDomain = tmp.valueOf();
    return startDomain;
  }

  /**
   * apply new timeline domain
   * feed state dispatch a change on filter, provide the new filter start and end
   * @param startDomain new start of domain
   * @param endDomain new end of domain
   */
  setStartAndEndDomain(startDomain: number, endDomain: number): void {
    let valueStart = startDomain;
    // set domain start value 3 ticks before
    if (this.homeDomainExtraTicks && !this.autonomousTicks) {
      valueStart = this.subtract3Ticks(startDomain);
    }

    const valueEnd = endDomain;
    this.myDomain = [valueStart, valueEnd];
    this.autonomousTicksConf();
    // apply zoom on feed
    this.store.dispatch(new ApplyFilter({
      name: FilterType.TIME_FILTER, active: true,
      status: {start: valueStart, end: valueEnd}
    }));
  }

  /**
   * select the movement applied on domain : forward or backward
   * parse the conf object dedicated for movement, parse it two time when end property is present
   * each object's keys add time precision on start or end of domain
   * apply a special treatment when the moment is end of domain and firstMoveStartOfUnit is active
   * @param moveForward direction: add or subtract conf object
   */
  moveDomain(moveForward: boolean): void {
    let startDomain = moment(this.myDomain[0]);
    let endDomain = moment(this.myDomain[1]);

    // Move from main visualisation, now domain stop to move
    if (this.followClockTick) {
      this.followClockTick = false;
    }
    if (this.firstMove) {
      if (this.homeDomainExtraTicksMode) {
        startDomain = moment(this.buttonHome[0]);
        endDomain = moment(this.buttonHome[1]);
      }
      this.firstMove = false;
    }
    let movementConf = _.cloneDeep(this.forwardConf);
    // backward movement use backward configuration if it's set
    if (moveForward === false) {
      if (this.backwardConf) {
        movementConf = _.cloneDeep(this.backwardConf);
      }
    }
    // when configuration object have only a start property, use it for endDomain too
    if (movementConf.end === undefined || movementConf.end === {}) {
      Object.keys(movementConf.start).forEach(key => {
        if (movementConf.start[key] > 0) {
          startDomain = moment(this.getDomainByUnit(moveForward, key, movementConf.start[key], startDomain, false));
          // let's Co special case, for re-centered domain on one unit not 2 unit
          if (this.firstMoveStartOfUnit) {
            endDomain = moment(this.getDomainByUnit(moveForward, key, movementConf.start[key], endDomain, true));
          } else {
            endDomain = moment(this.getDomainByUnit(moveForward, key, movementConf.start[key], endDomain, false));
          }
        }
      });
    } else { // new start and end of domain are set by 2 conf object: start and end
      Object.keys(movementConf.start).forEach(key => {
        if (movementConf.start[key] > 0) {
          startDomain = moment(this.getDomainByUnit(moveForward, key, movementConf.start[key], startDomain, false));
        }
      });
      Object.keys(movementConf.end).forEach(key => {
        if (movementConf.end[key] > 0) {
          // let's Co speacial case, for recentered domain on one unit not 2 unit
          if (this.firstMoveStartOfUnit) {
            endDomain = moment(this.getDomainByUnit(moveForward, key, movementConf.end[key], endDomain, true));
          } else {
            endDomain = moment(this.getDomainByUnit(moveForward, key, movementConf.end[key], endDomain, false));
          }
        }
      });
    }
    if (this.firstMoveStartOfUnit) {
      this.firstMoveStartOfUnit = false;
    }
    this.setStartAndEndDomain(startDomain.valueOf(), endDomain.valueOf());
  }

  /**
   * return a number corresponding to the number of day needed
   * to subtract for move to previous week day number pass by parameter
   * @param dayNumber
   */
  getWeekDayBalanceNumber(dayNumber: number): number {
    let weekDayBalance = 0;
    switch (dayNumber) {
      case 2: { // Monday
        weekDayBalance = 2;
        break;
      }
      case 3: { // Tuesday
        weekDayBalance = 4;
        break;
      }
      case 4: { // Wednesday
        weekDayBalance = 6;
        break;
      }
      case 5: { // Thursday
        weekDayBalance = 8;
        break;
      }
      case 6: { // Friday
        weekDayBalance = 10;
        break;
      }
      case 7: { // Saturday
        weekDayBalance = 12;
        break;
      }
    }
    return weekDayBalance;
  }

  /**
   * return the moment received after treatment, each params define this treatment
   * @param forward direction: false = subtract, true = add
   * @param unit unit of time
   * @param ops number of unit
   * @param currentMoment moment
   * @param speCase when firstMoveStartOfUnit is true and the moment received is the end of domain, subtract 1 unit more
   */
    getDomainByUnit(forward: boolean, unit, ope,
                    currentMoment: moment.Moment, speCase: boolean): number {
    // For the first step, set unit of currentMoment to its start (Let's Co)
    if (this.firstMoveStartOfUnit) {
      if (unit !== 'weekDay') {
        // Let's Co mandatory
        currentMoment.startOf(unit);
      }
    }
    if (forward) {
      if (unit === 'weekDay') {
        // add 6 for target one week after
        currentMoment.day(ope + 6);
      } else if (speCase) {
        // For let's Co at first move subtract 1 unit
        currentMoment.add(ope - 1, unit);
      } else {
        currentMoment.add(ope, unit);
      }
    } else { // backward
      if (unit === 'weekDay') {
        const weekDayBalance = this.getWeekDayBalanceNumber(ope);
        // remove 6 for target one week before
        currentMoment.day(-ope - 6 + weekDayBalance);
      } else if (speCase) {
        // For let's Co at first move subtract 1 unit more
        currentMoment.subtract(ope + 1, unit);
      } else {
        currentMoment.subtract(ope, unit);
      }
    }
    return currentMoment.valueOf();
  }

  /**
   * return true for display home button
   * compare domain and buttonHome landmark, return true when they differe
   */
  checkButtonHomeDisplay(): boolean {
    // buttonHomeActive is true when drag movement started
    if (this.buttonHomeActive) {
      return true;
    }
    // compare the current domain with the initial domain of zoom selected
    if (!this.firstMove) {
        return true;
    }
    return false;
  }
}

