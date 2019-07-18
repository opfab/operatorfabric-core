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
  start: {
    year: 0,
    month: 0,
    week: 1,
    day: 0,
    hour: 0,
    minute: 0,
    second: 0,
  },
  end: {
    year: 0,
    month: 0,
    week: 1,
    day: 0,
    hour: 0,
    minute: 0,
    second: 0,
  },
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
  public autoScale: boolean;
  public animations: boolean;
  public showGridLines: boolean;
  public realTimeBar: boolean;
  public centeredOnTicks: boolean;
  public clusterTicksToTicks: boolean;
  public circleDiameter: number;

  // required for domain movements specifications
  public forwardConf: any; // could make interface
  public backwardConf: any; // could make interface
  public followClockTick: boolean;
  public firstMoveStartOfUnit: boolean;
  private continuousForward: number;

  // ticks
  public formatTicks: any;
  public ticksConf: any; // could make interface
  public formatTooltipsDate: string; // could make interface

  // buttons
  public buttonTitle: string;
  public buttonHome: number[];
  public buttonHomeActive: boolean;
  public zoomButtonsActive: boolean;
  public buttonList;
  private buttonListWidth: number;


  constructor(private store: Store<AppState>) {
    this.buttonHome = undefined;
    this.buttonHomeActive = false;
    this.buttonList = undefined;
    this.buttonListWidth = 0;
    this.zoomButtonsActive = false;
    this.buttonTitle = undefined;
    this.forwardConf = undefined;
    this.backwardConf = undefined;
    this.ticksConf = undefined;
    this.continuousForward = 0;

    // options
    this.myDomain = undefined;
    this.enableDrag = false;
    this.enableZoom = false;
    this.autoScale = false;
    this.animations = false;
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
    this.subscription = this.data$.pipe(debounceTime(300), distinctUntilChanged())
        .subscribe(value => {
      const chartData = _.cloneDeep(value);
      this.setArrayChartData(chartData);
    });
  }

  /**
   * sort by publish date the array received on param
   * set an list of arrays for each severity of Cards
   */
  setArrayChartData(array: any[]): void {
    array.sort((val1, val2) => {
      return val1.publishDate - val2.publishDate;
    });

    const arraySeverity = [];
    this.arrayChartData = [];
    for (const value of array) {
      const obj = _.cloneDeep(value);
      obj.date = obj.publishDate;
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
      if (this.conf.autoScale) {
        this.autoScale = true;
      }
      if (this.conf.animations) {
        this.animations = true;
      }
      if (this.conf.showGridLines) {
        this.showGridLines = true;
      }
      if (this.conf.realTimeBar) {
        this.realTimeBar = true;
      }
      if (this.conf.centeredOnTicks) {
        this.centeredOnTicks = true;
      }
      if (this.conf.clusterTicksToTicks) {
        this.clusterTicksToTicks = true;
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
    if (this.confZoom) {
      for (const elem of this.confZoom) {
        const tmp = _.cloneDeep(elem);
        this.buttonList.push(tmp);
      }
    } else {
      // Default domain set (week)
      this.buttonTitle = 'W';
      // forward configuration object
      this.forwardConf = forwardWeekConf;
      // ticks configuration object
      this.ticksConf = {
        hour: 4,
      };
      // manual conf : create two moment for define start and end of domain
      this.zoomButtonsActive = true;
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
    if (conf.followClockTick) {
      this.followClockTick = true;
    }
    if (conf.formatTicks) {
      this.formatTicks = _.cloneDeep(conf.formatTicks);
    }
    if (conf.formatTooltipsDate) {
      this.formatTooltipsDate = conf.formatTooltipsDate;
    }
    if (conf.firstMoveStartOfUnit) {
      this.firstMoveStartOfUnit = true;
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
    if (conf.ticksConf) {
      this.ticksConf = _.cloneDeep(conf.ticksConf);
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
    this.followClockTick = false;
    this.firstMoveStartOfUnit = false;
    this.backwardConf = undefined;
    this.formatTicks = undefined;
    this.formatTooltipsDate = undefined;
    if (conf) {
      this.buttonHomeActive = false;
      this.continuousForward = 0;
      this.setStartAndEndDomain(conf.startDomain, conf.endDomain);
      this.readZoomConf(conf);
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
   * 2 cases :
   *  - apply arrow button clicked : switch the graph configuration with the zoom button configuration
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
   * change timeline domain (start and end)
   * deactivate the home button display
   * @param startDomain
   * @param endDomain
   */
  homeClick(startDomain: number, endDomain: number): void {
    this.setStartAndEndDomain(startDomain, endDomain);
    this.buttonHomeActive = false;
  }

  /**
   * Apply new timeline domain
   * feed state dispatch a change on filter, with the new filter start and end
   * @param startDomain
   * @param endDomain
   */
  setStartAndEndDomain(startDomain: number, endDomain: number): void {
    const valueStart = startDomain;
    const valueEnd = endDomain;
    this.myDomain = [valueStart, valueEnd];
    // apply zoom on feed
    this.store.dispatch(new ApplyFilter({
      name: FilterType.TIME_FILTER, active: true,
      status: {start: startDomain, end: endDomain}
    }));
  }

  /**
   * select the movement applied on domain : forward or backward
   * parse the conf object dedicated for movement
   * each object's keys add time precision on start or end of domain
   * @param moveForward
   */
  moveDomain(moveForward: boolean): void {
    let startDomain = moment(this.myDomain[0]);
    let endDomain = moment(this.myDomain[1]);
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
    } else { // new start and end of domain are define by 2 conf object: start and end
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
   * return a number corresponding to the number of day
   * needed to subtract for move to previous week day number pass by parameter
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
   * define the actual domain received
   * move domain 1 unit before or after the unit selected
   * example of unit : days, weeks, months, years...
   * @param forward direction: false = backward, true = forward
   * @param unit unit of time
   * @param ops number of unit
   */
    getDomainByUnit(forward: boolean, unit, ope,
                    currentMoment: moment.Moment, speCase: boolean): number {
    // Move from main visualisation, so domain stop to move
    if (this.followClockTick) {
      this.followClockTick = false;
    }
    // For the first step, set currentMoment to start of the unit (Let's Co)
    if (this.firstMoveStartOfUnit) {
      if (unit !== 'weekDay') {
        currentMoment.startOf(unit).hours(0);
      }
    }
    if (forward) {
      if (unit === 'weekDay') {
        // add 6 for target one week after
        currentMoment.day(ope + 6);
      } else if (speCase) {
        // For let's Co subtract 1 unit when it is first move
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
        // For let's Co subtract 1 unit more when it is first move
        currentMoment.subtract(ope + 1, unit);
      } else {
        currentMoment.subtract(ope, unit);
      }
    }
    return currentMoment.valueOf();
  }

  /**
   * return true for display home button
   * compare domain and buttonHome landmark
   */
  checkButtonHomeDisplay(): boolean {
    // buttonHomeActive = true when drag movement started
    if (this.buttonHomeActive) {
      return true;
    }
    // compare the current domain with the initial domain of zoom selected
    if (this.buttonHome) {
      if (this.buttonHome[0] !== this.myDomain[0] || this.buttonHome[1] !== this.myDomain[1]) {
        return true;
      }
    }
    return false;
  }
}

