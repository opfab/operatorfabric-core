import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import {Observable, of, Subscription} from 'rxjs';
import {select, Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import * as timelineSelectors from '@ofSelectors/timeline.selectors';
import {catchError, debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {FilterType} from "@ofServices/filter.service";
import {ApplyFilter} from "@ofActions/feed.actions";

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
  public realCaseActivate: boolean;
  private continuousForward: number;

  // buttons
  public forwardConf: any; // could make interface
  public ticksConf: any; // could make interface
  public buttonTitle: string;
  public zoomButtonsActive: boolean;
  public buttonHome: number[];
  public buttonHomeActive: boolean;
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
    this.ticksConf = undefined;
    this.realCaseActivate = true;
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
      // console.log('init-chart subscribe');
      const chartData = _.cloneDeep(value);
      this.setArrayChartData(chartData);
    });
  }

  /**
   * sort by date the array received on param
   * set an list of arrays for each severity of Cards
   */
  setArrayChartData(array: any[]): void {
    array.sort((val1, val2) => { return val1.publishDate - val2.publishDate; });

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

      // Set this.arrayChartData and arraySeverity
      if (this.arrayChartData === []) {
        this.arrayChartData.push([]);
        this.arrayChartData[0].push(obj);
        arraySeverity.push({color: obj.color, id: 0});
      } else {
        let idx = -1;
        for (let i = 0; i < arraySeverity.length; i++) {
          if (arraySeverity[i].color === obj.color) {
            idx = i;
            break;
          }
        }
        if (idx === -1) {
          const last = this.arrayChartData.length;
          this.arrayChartData.push([]);
          this.arrayChartData[last].push(obj);
          arraySeverity.push({color: obj.color, id: last});
        } else {
          this.arrayChartData[idx].push(obj);
        }
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
   * timeline configuration make by calling readConf function
   * set domain context of timeline :
   * if it was given on confZoom, set the list of zoom buttons
   * else default zoom is weekly without selection
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
      this.forwardConf = {
        year: 0,
        month: 0,
        week: 1,
        day: 0,
        hour: 0,
        seconde: 0,
      };
      this.ticksConf = {
        year: 0,
        month: 0,
        week: 0,
        day: 0,
        hour: 4,
        seconde: 0,
      };
      this.zoomButtonsActive = true;
      const startDomain = moment();
      startDomain.startOf('week');
      startDomain.hours(0).minutes(0).seconds(0).millisecond(0);
      const endDomain = _.cloneDeep(startDomain);
      endDomain.add(7, 'days');
      this.setStartAndEndDomain(startDomain.valueOf(), endDomain.valueOf());
      this.buttonHome = [startDomain.valueOf(), endDomain.valueOf()];
    }
    // Set the zoom activate and assign the width of the buttons list on html
    if (this.buttonList.length > 0) {
      this.zoomButtonsActive = true;
      this.changeGraphConf(this.buttonList[0]);
    }
  }

  /**
   * desactive the home button and set his new field
   * set the zoom level type
   * change timeline domain
   * set all buttons selected property to false
   * select the button from the conf received
   * @param conf
   */
  changeGraphConf(conf: any): void {
    if (conf) {
      this.buttonHomeActive = false;
      this.realCaseActivate = true;
      this.continuousForward = 0;
      this.setStartAndEndDomain(conf.startDomain, conf.endDomain);
      if (conf.buttonTitle) {
        this.buttonTitle = conf.buttonTitle;
      }
      if (conf.forwardConf) {
        this.forwardConf = _.cloneDeep(conf.forwardConf);
      }
      if (conf.ticksConf) {
        this.ticksConf = _.cloneDeep(conf.ticksConf);
      }
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
   * change timeline domain
   * desactive the home button display
   * @param startDomain
   * @param endDomain
   */
  homeClick(startDomain: number, endDomain: number): void {
    this.setStartAndEndDomain(startDomain, endDomain);
    this.buttonHomeActive = false;
  }

  /**
   * Apply new timeline domain
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
   * select the movement apply on domain
   * only four set : Day, Week, Month , Year
   * @param moveForward
   */
  moveDomain(moveForward: boolean): void {
    Object.keys(this.forwardConf).forEach(key => {
      if (this.forwardConf[key] > 0) {
        this.moveDomainByUnit(moveForward, key, this.forwardConf[key]);
      }
    });
    // switch (this.forwardButtonType) {
    //   case 'W':
    //     this.moveDomainByUnit(moveForward, 'weeks');
    //     break;
    //   case 'D':
    //     this.moveDomainByUnit(moveForward, 'days');
    //     break;
    //   case '7D': // become D by changing moveDomainByDay function
    //     this.moveDomainBy7Day(moveForward);
    //     break;
    //   case 'M':
    //     this.moveDomainByUnit(moveForward, 'months');
    //     break;
    //   case 'Y':
    //     this.moveDomainByUnit(moveForward, 'years');
    //     break;
    // }
  }


 /**
   * define the actual week
   * add 1 day after the week selected
   * or move 1 day backward the week selected
   * @param forward
   */
  moveDomainBy7Day(forward: boolean): void {
   const startDomain = moment(this.myDomain[0]);
   if (this.realCaseActivate) {
     startDomain.hours(0);
     this.realCaseActivate = false;
   }
   const endDomain = moment(startDomain);
   endDomain.add(7, 'days');
   if (forward) {
     startDomain.add(1, 'days');
     endDomain.add(1, 'days');
   } else {
     startDomain.subtract(1, 'days');
     endDomain.subtract(1, 'days');
   }
   this.setStartAndEndDomain(startDomain.valueOf(), endDomain.valueOf());
  }

  /**
   * define the actual domain received
   * move domain 1 unit before or after the unit selected
   * example of unit : days, weeks, months, years...
   * @param forward
   * @param unit unit of time
   * @param ops number of unit
   */
  moveDomainByUnit(forward: boolean, unit, ope: number): void {
    const startDomain = moment(this.myDomain[0]);
    const endDomain = moment(this.myDomain[1]);
    let realCaseSpe = 0;

    // For the first step, set to start of the unit
    if (this.realCaseActivate) {
      startDomain.startOf(unit).hours(0);
      endDomain.startOf(unit).hours(0);
      realCaseSpe = 1;
      this.realCaseActivate = false;
    }
    if (forward) {
      startDomain.add(ope, unit);
      endDomain.add(ope - realCaseSpe, unit);
    } else {
      startDomain.subtract(ope, unit);
      endDomain.subtract(ope + realCaseSpe, unit);
    }
    this.setStartAndEndDomain(startDomain.valueOf(), endDomain.valueOf());
  }

  /**
   * return true for display home button
   */
  checkButtonHomeDisplay(): boolean {
    // buttonHomeActive = true when drag movement started
    if (this.buttonHomeActive) {
      return true;
    }
    // compare the actual domain with the domain of zoom selected
    if (this.buttonHome) {
      if (this.buttonHome[0] !== this.myDomain[0] || this.buttonHome[1] !== this.myDomain[1]) {
        return true;
      }
    }
    return false;
  }
}

