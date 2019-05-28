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
  arrayChartData: any[];
  myDomain: number[];
  data$: Observable<any[]>;

  private realCaseActivate: boolean;

  // Options of Timeline
  public enableDrag: boolean;
  public enableZoom: boolean;
  public autoScale: boolean;
  public animations: boolean;
  public showGridLines: boolean;
  public realTimeBar: boolean;

  // Ticks
  centeredOnTicks: boolean;

  // Buttons
  buttonHome: number[];
  buttonHomeActive: boolean;
  buttonList;
  buttonListWidth: number;
  forwardButtonType: string;
  zoomButtonsActive: boolean;

  constructor(private store: Store<AppState>) {
    this.buttonHome = undefined;
    this.buttonHomeActive = false;
    this.buttonList = undefined;
    this.buttonListWidth = 0;
    // this.forwardButtonType = undefined;
    this.zoomButtonsActive = false;

    this.realCaseActivate = true;

    this.centeredOnTicks = false;

    // Options
    this.myDomain = undefined;
    this.enableDrag = false;
    this.enableZoom = false;
    this.autoScale = false;
    this.animations = false;
    this.showGridLines = false;
    this.realTimeBar = false;

    // Default forward interval time add/sub
    this.forwardButtonType = 'W';
  }

  ngOnInit() {
    // init data selector
    this.data$ = this.store.pipe(
        select(timelineSelectors.selectTimelineSelection),
        catchError(err => of([]))
    );

    this.confContextGraph();
    this.setChartData2();
  }

  setChartData2() {
    this.data$.subscribe(value => {
      const chartData = value.map(d => d);
      this.setArrayChartData2(chartData);
    });
  }

  /**
   * set a array with arrays for each severity of Cards
   * sort by date
   */
  setArrayChartData2(array: any[]) {
    array.sort((val1, val2) => { return val1.date - val2.date; });

    const arraySeverity = [];
    this.arrayChartData = [];

    for (const value of array) {
      const obj = _.cloneDeep(value);
      obj.date = obj.startDate;
      obj.r = 20;
      obj.stroke = 'stroke';
      obj.count = 1;
      obj.value = 1;

      obj.color = this.setColorSeverity(obj.severity);

      // Set this.arrayChartData and arraySeverity
      if (this.arrayChartData === []) {
        this.arrayChartData = [];
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

  setColorSeverity(color: string) {
    if (color) {
     switch (color) {
       case 'ALARM': {
         return 'red';
       }
       case 'ACTION': {
         return 'orange';
       }
       case 'QUESTION': {
         return 'blue';
       }
       case 'NOTIFICATION': {
         return 'green';
       }
     }
    } else {
      return 'black';
    }
  }

  readConf() {
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
    }
  }

  /**
   * set options of timeline
   * set the list of zoom buttons : if it was given on confZoom else default zoom is weekly
   */
  confContextGraph() {
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
      this.buttonListWidth = (2 + this.buttonList.length) * 52; // add fct responsive
      const widthPx = this.buttonListWidth + 'px';
      document.getElementById('btn-menu-timeline').style.width = widthPx;
      // this.setStartAndEndDomain(this.buttonList[0].startDomain, this.buttonList[0].endDomain);
      this.changeGraphConf(this.buttonList[0]);
    }
  }

  /**
   * desactive the home button and set his field
   * set the zoom Level activated and timeline domain
   * @param conf
   */
  changeGraphConf(conf: any) {
    if (conf) {
      this.buttonHomeActive = false;
      this.realCaseActivate = true;
      this.setStartAndEndDomain(conf.startDomain, conf.endDomain);
      if (conf.forwardLevel) {
        this.forwardButtonType = conf.forwardLevel;
      }
      this.buttonHome = [conf.startDomain, conf.endDomain];
    }
  }

  applyNewZoom(direction: string) {
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
   * desactive the home button
   * change timeline domain
   * @param startDomain
   * @param endDomain
   */
  homeClick(startDomain: number, endDomain: number) {
    this.setStartAndEndDomain(startDomain, endDomain);
    this.buttonHomeActive = false;
  }

  /**
   * Apply new timeline domain
   * @param startDomain
   * @param endDomain
   */
  setStartAndEndDomain(startDomain: number, endDomain: number) {
    const valueStart = startDomain;
    const valueEnd = endDomain;
    this.myDomain = [valueStart, valueEnd];
  }

  /**
   * select the movement apply on domain
   * only three set : Week, Month , Year
   * @param moveForward
   */
  moveDomain(moveForward: boolean) {
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
   *
   * @param forward
   */
  moveDomainByWeek(forward: boolean) {
    const startDomain = moment(this.myDomain[0]);
    startDomain.day(0);
    /*
    // For the first step, set to next week
    if (this.realCaseActivate) {
      startDomain.add(7, 'days');
      this.realCaseActivate = false;
    }
    */
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

  moveDomainByMonth(forward: boolean) {
    const prevStartDomain = moment(this.myDomain[0]);
    const startDomain = _.cloneDeep(prevStartDomain);
    if (this.realCaseActivate) {
      startDomain.add(1, 'months');
      startDomain.startOf('month').hours(0);
      this.realCaseActivate = false;
    }
    // startDomain.setDate(1);
    const prevEndDomain = moment(this.myDomain[1]);
    const endDomain = _.cloneDeep(prevEndDomain);
    if (forward) {
      startDomain.add(1, 'months');
      endDomain.add(1, 'months');
      this.myDomain = [startDomain.valueOf(), endDomain.valueOf()];
    } else {
      startDomain.subtract(1, 'months');
      endDomain.subtract(1, 'months');
      this.myDomain = [startDomain.valueOf(), endDomain.valueOf()];
    }
  }

  moveDomainByYear(forward: boolean) {
    const prevStartDomain = moment(this.myDomain[0]);
    const startDomain = _.cloneDeep(prevStartDomain);
    if (this.realCaseActivate) {
      startDomain.add(1, 'year');
      startDomain.startOf('year').hours(0);
      this.realCaseActivate = false;
    }
    // startDomain.setDate(1);
    const prevEndDomain = moment(this.myDomain[1]);
    const endDomain = _.cloneDeep(prevEndDomain);
    if (forward) {
      startDomain.add(1, 'years');
      endDomain.add(1, 'years');
      this.myDomain = [startDomain.valueOf(), endDomain.valueOf()];
    } else {
      startDomain.subtract(1, 'years');
      endDomain.subtract(1, 'years');
      this.myDomain = [startDomain.valueOf(), endDomain.valueOf()];
    }
  }

  checkButtonHomeDisplay() {
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

