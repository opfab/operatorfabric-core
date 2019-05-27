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
  chartData: any[];
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
   // this.setChartData(); // example de test
   // this.setCustomDate(); // example de test
   // this.setArrayChartData(); // example de test
    this.setChartData2();

    /* setTimeout(() => {
       this.chartData[2].r = 30;
       let tmpDate = new Date();
       tmpDate.setMonth(9);
       this.chartData.push({
         date: tmpDate,
         value: 4,
         cy: 250,
         r: 20,
         color: 'pink',
         stroke: 'stroke',
         count: 5
       });
       this.setArrayChartData();
     }, 3000);*/
    /*setTimeout(() => {
      let myTime = new Date();
      myTime.setMonth(1);
      const tmp = myTime.getTime();
      myTime.setMonth(5);
      const tmp2 = myTime.getTime();
      this.myDomain = [tmp, tmp2];
    }, 3000);*/
    /*setTimeout(() => {
      let myTime = new Date();
      myTime.setFullYear(2018);
      const tmp = myTime.getTime();
      myTime.setFullYear(2019);
      myTime.setMonth(10);
      const tmp2 = myTime.getTime();
      this.myDomain = [tmp, tmp2];
    }, 6000);*/
  }

  setChartData() {
    this.chartData = [
      {
        date: moment(),
        value: 4,
        cy: 300,
        r: 20,
        color: 'red',
        stroke: 'stroke',
        count: 23
      },
      {
        date: moment(),
        value: 3,
        cy: 200,
        r: 20,
        color: 'orange',
        stroke: 'stroke',
        count: 15
      },
      {
        date: moment(),
        value: 2,
        cy: 250,
        r: 20,
        color: 'blue',
        stroke: 'stroke',
        count: 3
      },
      {
        date: moment(),
        value: 1,
        cy: 350,
        r: 20,
        color: 'green',
        stroke: 'stroke',
        count: 102
      },
      {
        date: moment(),
        value: 1,
        cy: 350,
        r: 20,
        color: 'green',
        stroke: 'stroke',
        count: 21
      },
      {
        date: moment(),
        value: 1,
        cy: 350,
        r: 20,
        color: 'green',
        stroke: 'stroke',
        count: 1
      },
      {
        date: moment(),
        value: 2,
        cy: 250,
        r: 30,
        color: 'blue',
        stroke: 'stroke',
        count: 5
      },
      {
        date: moment(),
        value: 1,
        cy: 250,
        r: 20,
        color: 'green',
        stroke: 'stroke',
        count: 87
      },
      {
        date: moment(),
        value: 1,
        cy: 250,
        r: 20,
        color: 'green',
        stroke: 'stroke',
        count: 144
      },
      {
        date: moment(),
        value: 1,
        cy: 250,
        r: 20,
        color: 'green',
        stroke: 'stroke',
        count: 8
      },
      {
        date: moment(),
        value: 2,
        cy: 250,
        r: 20,
        color: 'blue',
        stroke: 'stroke',
        count: 3
      },
      {
        date: moment(),
        value: 4,
        cy: 300,
        r: 20,
        color: 'red',
        stroke: 'stroke',
        count: 23
      },
      {
        date: moment(),
        value: 3,
        cy: 200,
        r: 20,
        color: 'orange',
        stroke: 'stroke',
        count: 15
      },
      {
        date: moment(),
        value: 1,
        cy: 250,
        r: 20,
        color: 'green',
        stroke: 'stroke',
        count: 256
      },
      {
        date: moment(),
        value: 1,
        cy: 250,
        r: 20,
        color: 'green',
        stroke: 'stroke',
        count: 4
      },
      {
        date: moment(),
        value: 1,
        cy: 250,
        r: 20,
        color: 'green',
        stroke: 'stroke',
        count: 34
      },
      {
        date: moment(),
        value: 1,
        cy: 250,
        r: 20,
        color: 'green',
        stroke: 'stroke',
        count: 56
      },
    ];
  }

  /**
   * set the First List of Date
   */
  setCustomDate() {
    this.chartData[0].date.year(2017);
    this.chartData[1].date.year(2018);
    this.chartData[2].date.month(11);
    this.chartData[4].date.month(4);
    this.chartData[4].date.date(20); // Disparition 22 04 2019
    this.chartData[5].date.year(2020);
    this.chartData[6].date.month(11);
    this.chartData[6].date.date(10);
    this.chartData[7].date.hours(19);
    console.log(this.chartData[7].date)
    this.chartData[8].date.hours(24);
    this.chartData[9].date.hours(28);
    /*
    // TEST le premier segment sur le clustering
    this.chartData[10].date.hours(1);
    this.chartData[11].date.hours(1);
    this.chartData[12].date.hours(1);
    */
    // -------WEEK AND MONTH TEST------
    /*this.chartData[14].date.hours(60);
    this.chartData[15].date.hours(64);
    this.chartData[16].date.hours(68);
    this.chartData[13].date.hours(72);*/
    // -------YEAR TEST------
    this.chartData[14].date.month(7);
    this.chartData[14].date.date(1);
    this.chartData[15].date.month(7);
    this.chartData[16].date.month(8);
    this.chartData[16].date.date(1);
    this.chartData[13].date.month(8);
    console.log('Les dates pr lexemples :', this.chartData[14].date, this.chartData[15].date, this.chartData[16].date, this.chartData[13].date)
  }

  setChartData2() {
    this.data$.subscribe(value => {
      // this.chartData = value.map(d => d);
      this.setArrayChartData2(value);
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
    console.log('setArrayChartData this.arrayChartData =', this.arrayChartData);
  }

  setColorSeverity(color: string) {
    if (color) {
     switch (color) {
       case 'ACTION': {
         return 'red';
       }
       case 'A Définir....': {
         return 'green/blue/orange';
       }
     }
    } else {
      return 'noColor';
    }
  }

  /**
   * set a array with arrays for each severity of Cards
   * sort by date
   */
  setArrayChartData() {
    this.chartData.sort((val1, val2) => { return val1.date - val2.date; });

    const arraySeverity = [];
    this.arrayChartData = [];

    for (const value of this.chartData) {
      // Set this.arrayChartData and arraySeverity
      const obj = _.cloneDeep(value);
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
    console.log('setArrayChartData this.arrayChartData =', this.arrayChartData);
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
    console.log('moveDomainByWeek funcction');
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
    console.log('moveDomainBy MONTH function');
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
    console.log('moveDomainBy MONTH function');
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

