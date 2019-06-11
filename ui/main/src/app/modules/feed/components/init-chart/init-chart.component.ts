import { Component, Input, OnInit} from '@angular/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import {Observable, of} from "rxjs";
import {select, Store} from "@ngrx/store";
import {AppState} from "@ofStore/index";
import * as timelineSelectors from '@ofSelectors/timeline.selectors';
import {catchError} from "rxjs/operators";

@Component({
  selector: 'of-init-chart',
  templateUrl: './init-chart.component.html',
  styleUrls: ['./init-chart.component.scss']
})
export class InitChartComponent implements OnInit {
  @Input() conf;
  @Input() confZoom;

  // Required by Timeline
  public arrayChartData: any[];
  public myDomain: number[];
  data$: Observable<any[]>;

  // Options of Timeline
  public enableDrag: boolean;
  public enableZoom: boolean;
  public autoScale: boolean;
  public animations: boolean;
  public showGridLines: boolean;
  public realTimeBar: boolean;
  public centeredOnTicks: boolean;
  public circleDiameter: number;

  // Required for domain movements specifications
  private realCaseActivate: boolean;

  // Buttons
  public forwardButtonType: string;
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
    this.forwardButtonType = undefined;
    this.realCaseActivate = true;


    // Options
    this.myDomain = undefined;
    this.enableDrag = false;
    this.enableZoom = false;
    this.autoScale = false;
    this.animations = false;
    this.showGridLines = false;
    this.centeredOnTicks = false;
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
   * subscribe on timeline's State data
   * feed arrayChartData with values from data
   */
  setChartData(): void {
    this.data$.subscribe(value => {
      const chartData = value.map(d => d);
      this.setArrayChartData(chartData);
    });
  }

  /**
   * sort by date the array received on param
   * set an array with arrays for each severity of Cards
   */
  setArrayChartData(array: any[]): void {
    array.sort((val1, val2) => { return val1.date - val2.date; });

    const arraySeverity = [];
    this.arrayChartData = [];
    for (const value of array) {
      const obj = _.cloneDeep(value);
      obj.date = obj.startDate;
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
     }
    } else { // default
      return 'black';
    }
  }

  /**
   * return color according to severity
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
      if (this.conf.circleDiameter) {
        this.circleDiameter = this.conf.circleDiameter;
      }
    }
  }

  /**
   * set domain context of timeline :
   * if it was given on confZoom => set the list of zoom buttons & zoom activated
   * else default zoom is weekly
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
      this.forwardButtonType = 'W';
      this.zoomButtonsActive = true;
      const startDomain = moment();
      startDomain.startOf('week');
      startDomain.hours(0).minutes(0).seconds(0).millisecond(0);
      const endDomain = _.cloneDeep(startDomain);
      endDomain.add(7, 'days');
      this.setStartAndEndDomain(startDomain.valueOf(), endDomain.valueOf());
      this.buttonHome = [startDomain.valueOf(), endDomain.valueOf()];
    }
    // Set the zoom activate and assigne the width of the buttons list on html
    if (this.buttonList.length > 0) {
      this.zoomButtonsActive = true;
      this.changeGraphConf(this.buttonList[0]);
    }
  }

  /**
   * desactive the home button and set his new field
   * set the zoom Level Type activate and timeline domain
   * @param conf
   */
  changeGraphConf(conf: any): void {
    if (conf) {
      this.buttonHomeActive = false;
      this.realCaseActivate = true;
      this.setStartAndEndDomain(conf.startDomain, conf.endDomain);
      if (conf.forwardLevel) {
        this.forwardButtonType = conf.forwardLevel;
      }
      this.buttonHome = [conf.startDomain, conf.endDomain];
      this.buttonList.forEach(button => {
        button.selected = false;
      });
      conf.selected = true;
    }
  }

  /**
   * apply zoom buttons clicked
   * or set the buttonHomeActive for display home button
   * receive by child component custom-timeline-chart
   * @param direction
   */
  applyNewZoom(direction: string): void {
    if (direction === 'in') {
      const reverseButtonList = _.cloneDeep(this.buttonList);
      reverseButtonList.reverse();
      for (let i = 0; i < reverseButtonList.length; i++) {
        if (reverseButtonList[i].forwardLevel === this.forwardButtonType) {
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
        if (this.buttonList[i].forwardLevel === this.forwardButtonType) {
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
  }

  /**
   * select the movement apply on domain
   * only three set : Week, Month , Year
   * @param moveForward
   */
  moveDomain(moveForward: boolean): void {
    switch (this.forwardButtonType) {
      case 'W':
        this.moveDomainByWeek(moveForward);
        break;
      case 'M':
        this.moveDomainByMonth(moveForward);
        break;
      case 'Y':
        this.moveDomainByYear(moveForward);
        break;
    }
  }

  /**
   * set the actual week
   * move 7 days before or after the week selected
   * @param forward
   */
  moveDomainByWeek(forward: boolean): void {
    const startDomain = moment(this.myDomain[0]);
    startDomain.day(0);
    const endDomain = moment(startDomain);
    endDomain.add(7, 'days');
    if (forward) {
      startDomain.add(7, 'days');
      endDomain.add(7, 'days');
      this.myDomain = [startDomain.valueOf(), endDomain.valueOf()];
    } else {
      startDomain.subtract(7, 'days');
      endDomain.subtract(7, 'days');
      this.myDomain = [startDomain.valueOf(), endDomain.valueOf()];
    }
  }

  /**
   * set the actual month
   * move 1 month before or after the month selected
   * @param forward
   */
  moveDomainByMonth(forward: boolean): void {
    const prevStartDomain = moment(this.myDomain[0]);
    const startDomain = _.cloneDeep(prevStartDomain);
    // For the first step, set to start of the month
    if (this.realCaseActivate) {
      startDomain.startOf('month').hours(0);
      this.realCaseActivate = false;
    }
    const endDomain = _.cloneDeep(startDomain);
    if (forward) {
      startDomain.add(1, 'months');
      endDomain.add(2, 'months');
      this.myDomain = [startDomain.valueOf(), endDomain.valueOf()];
    } else {
      startDomain.subtract(1, 'months');
      this.myDomain = [startDomain.valueOf(), endDomain.valueOf()];
    }
  }

  /**
   * set the actual week
   * move 1 year before or after the year selected
   * @param forward
   */
  moveDomainByYear(forward: boolean): void {
    const prevStartDomain = moment(this.myDomain[0]);
    const startDomain = _.cloneDeep(prevStartDomain);
    // For the first step, set to start of the year
    if (this.realCaseActivate) {
      startDomain.startOf('year').hours(0);
      this.realCaseActivate = false;
    }
    const endDomain = _.cloneDeep(startDomain);
    if (forward) {
      startDomain.add(1, 'years');
      endDomain.add(2, 'years');
      this.myDomain = [startDomain.valueOf(), endDomain.valueOf()];
    } else {
      startDomain.subtract(1, 'years');
      this.myDomain = [startDomain.valueOf(), endDomain.valueOf()];
    }
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

