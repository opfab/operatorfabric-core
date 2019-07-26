import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {CustomTimelineChartComponent} from './custom-timeline-chart.component';
import {APP_BASE_HREF, CommonModule} from '@angular/common';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule} from '@angular/forms';
import {NgxChartsModule} from '@swimlane/ngx-charts';
import {DebugElement, NO_ERRORS_SCHEMA} from '@angular/core';
import * as moment from 'moment';
import {By} from '@angular/platform-browser';
import {DraggableDirective} from '../time-line/app-draggable';
import {MouseWheelDirective} from '../time-line/mouse-wheel.directive';
import {XAxisTickFormatPipe} from '../time-line/x-axis-tick-format.pipe';
import * as _ from 'lodash';
import {Store, StoreModule} from "@ngrx/store";
import {RouterStateSerializer, StoreRouterConnectingModule} from "@ngrx/router-store";
import {CustomRouterStateSerializer} from "@ofStates/router.state";
import {TimeService} from "@ofServices/time.service";
import {appReducer, storeConfig} from "@ofStore/index";
import {RouterTestingModule} from "@angular/router/testing";

describe('CustomTimelineChartComponent', () => {
  let component: CustomTimelineChartComponent;
  let fixture: ComponentFixture<CustomTimelineChartComponent>;
  let inputEl: DebugElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule,
        BrowserAnimationsModule,
        FormsModule,
        StoreModule.forRoot(appReducer, storeConfig),
        RouterTestingModule,
        StoreRouterConnectingModule,
        NgxChartsModule ],
      declarations: [ CustomTimelineChartComponent,
        DraggableDirective, MouseWheelDirective,
        XAxisTickFormatPipe],
      providers: [{provide: APP_BASE_HREF, useValue: '/'},
        {provide: Store, useClass: Store},
        {provide: RouterStateSerializer, useClass: CustomRouterStateSerializer},
        {provide: TimeService, useClass: TimeService}],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(CustomTimelineChartComponent);
    component = fixture.componentInstance;
  }));

  it('init myData & get zoomLevel', () => {
    fixture.detectChanges();
    component.myData = [];
    const tmp = component.zoomLevel;
    expect(component).toBeTruthy();
  });

  it('should call update() and create chart by calling updateYAxisWidth function', () => {
    fixture.detectChanges();
    component.formatLevel = 'Hou'; // check diff par rapport au next test
    component.clusterConf = {
      hour: 4,
    };
    component.realTimeBar = true;
    component.updateYAxisWidth({width: 1920});
    expect(component).toBeTruthy();
  });

  it('should format dateFirsTick when the domain set is smaller than 1 day', () => {
    fixture.detectChanges();
    component.valueDomain = [0, 5000000];
    expect(component.underDayPeriod).toBeTruthy();
  });

  it('should create', () => {
    fixture.detectChanges();
    component.realTimeBar = false;
    component.ngOnInit();
    expect(component).toBeTruthy();
  });

  it('should call update() and create chart by calling updateXAxisWidth function', () => {
    fixture.detectChanges();
    component.clusterConf = {
      hour: 4,
    };
    component.realTimeBar = true;
    component.updateXAxisHeight({height: 1024});
    expect(component).toBeTruthy();
  });

  it('should create an default domain when it wasnt set yet ' +
    'check if the moment is inside the domain', () => {
    fixture.detectChanges();
    component.xDomain = null;
    expect(component.getXDomain()).toEqual([0, 1]);
    expect(component.checkInsideDomain(moment())).toBeFalsy();
    component.xDomain = null;
    const tmp = moment();
    component.myData = [[{date: tmp}, {date: tmp}]];
    tmp.hour(0).minutes(0).seconds(0).milliseconds(0);
    expect(component.getXDomain()).toEqual([tmp.valueOf(), tmp.valueOf()]);
    expect(component).toBeTruthy();
  });

  it('should create an domain with minimal and maximal values from properties: ' +
    'value, min and max from objects inside each list stock inside myData', () => {
    fixture.detectChanges();
    component.autoScale = true;
    const tmp = {
      value: 0,
      min: 1,
      max: 2
    };
    component.myData = [[tmp, tmp]];
    expect(component.getYDomain()).toEqual([0, 2]);
    const tmp2 = {
      value: 0,
    };
    component.myData = [[tmp2, tmp2]];
    expect(component.getYDomain()).toEqual([0, 0]);
    expect(component).toBeTruthy();
  });

  it('should create an default domain when it wasnt set yet ' +
    'if myData return an array of two numbers 0 and 5 ' +
    'if autoScale is true return an array of two numbers minimal (-infini, 0) & maximal (5, infini)', () => {
    fixture.detectChanges();
    component.autoScale = true;
    expect(component.getYDomain()).toEqual([0, 5]);
    component.myData = [];
    component.autoScale = false;
    expect(component.getYDomain()).toEqual([0, 5]);
    expect(component).toBeTruthy();
  });

  it('should test checkFollowClockTick && updateRealTimeDate functions with : ' +
    'an empty ticks list, ' +
    'a ticks list of moment with a length biggest than 5, ' +
    'followClockTick set to true', () => {
    fixture.detectChanges();
    expect(component.checkFollowClockTick()).toBeFalsy();
    component.followClockTick = true;
    component.updateRealTimeDate();
    component.xTicks = [];
    component.xDomain = [0, 1];
    const tmp = moment();
    tmp.millisecond(0);
    for (let i = 0; i < 6; i++) {
      component.xTicks.push(tmp);
    }
    expect(component.checkFollowClockTick()).toBeTruthy();
    expect(component).toBeTruthy();
  });

  it('should test checkFollowClockTick function with a ticks list ' +
    'of moment (next day) with a length biggest than 5', () => {
    fixture.detectChanges();
    component.xTicks = [];
    component.xDomain = [0, 1];
    const tmp = moment();
    tmp.add(1, 'day');
    for (let i = 0; i < 6; i++) {
      component.xTicks.push(tmp);
    }
    expect(component.checkFollowClockTick()).toBeFalsy();
    expect(component).toBeTruthy();
  });

  it('should return the same string which was received when autoScale is true' +
    'should return an empty string when autoScale is false', () => {
    fixture.detectChanges();
    component.autoScale = true;
    expect(component.hideLabelsTicks('test')).toEqual('test');
    component.autoScale = false;
    expect(component.hideLabelsTicks('test')).toEqual('');
  });

  it('should return without effect', () => {
    fixture.detectChanges();
    component.enableDrag = false;
    component.onDragMove(null);
    expect(component).toBeTruthy();
    component.enableDrag = true;
    component.onDragMove(null);
    expect(component).toBeTruthy();
  });

  it('should set zoomLevel', () => {
    fixture.detectChanges();
    component.zoomLevel = 2;
    expect(component).toBeTruthy();
  });

  it('should return the param formatted by normal transform', () => {
    fixture.detectChanges();
    component.formatLevel = 'Day';
    const test = moment();
    test.date(3).hours(0);
    expect(component.fctTickFormatting(test)).toEqual(test.format('ddd DD MMM'));
    expect(component.fctTickFormattingAdvanced(test)).toEqual(test.format('ddd DD MMM'));
    component.formatLevel = 'Hou';
    expect(component.fctTickFormattingAdvanced(test)).toEqual(test.format('HH') + 'h');
  });

  it('check setXTicksValue function', () => {
    fixture.detectChanges();
    let tmp = _.cloneDeep(component.xTicks);
    component.clusterLevel = {
      month: 2,
    };
    component.setXTicksValue([0, 2888000000]);
    expect(component.xTicks).not.toEqual(tmp);

    tmp = _.cloneDeep(component.xTicks);
    component.formatLevel = 'Dat';
    component.clusterLevel = {
      year: 2,
    };
    component.setXTicksValue([10000000000, 44888000000]);
    expect(component.xTicks).not.toEqual(tmp);
  });

  it('check setYTicksValue function', () => {
    fixture.detectChanges();
    component.autoScale = true;
    component.setYTicks();
    expect(component.yTicks).toEqual(null);
    component.autoScale = false;
    component.yTicks = [];
    component.myData = [];
    component.setYTicks();
    expect(component.yTicks).toEqual([0, 1, 2, 3, 4, 5]);
    expect(component).toBeTruthy();
  });

  it('check setTicksAndClusterize function when clusterConf is an object ' +
    'with a date configuration ' +
    'and formatTicks is an object', () => {
    fixture.detectChanges();
    component.clusterConf = {
      month: 1,
      date: [1, 16],
    };
    component.formatTicks = 'DD';
    component.setTicksAndClusterize([0, 10000000000]);
    expect(component.clusterLevel).toEqual({month: 1, date: [1, 16]});
    expect(component.formatLevel).toEqual('DD');
    expect(component).toBeTruthy();
  });

  xit('check setTicksAndClusterize function when clusterConf is an array ' +
    'and formatTicks is an array', () => {
    fixture.detectChanges();
    component.clusterConf = [ { width: 2200, conf: {
        month: 1,
      }
    },
      { width: 0, conf: {
        year: 1,
      }
    }];
    component.formatTicks = [{width: 1600, formatTicks: 'DD'},
      {width: 0, formatTicks: 'hh:mm'}];
    component.setTicksAndClusterize([0, 100000000000]);
    expect(component.clusterLevel).toEqual({year: 1});
    expect(component.formatLevel).toEqual('hh:mm');
    expect(component).toBeTruthy();
  });

  it('check setTicksAndClusterize function when clusterConf is an object on date and month conf', () => {
    fixture.detectChanges();
    component.xTicks = [];
    component.clusterConf = {
      month: 1,
      date: [1, 12, 23],
    };
    component.setTicksAndClusterize([0, 100000000000]);
    expect(component.clusterLevel).toEqual({
      month: 1,
      date: [1, 12, 23]});
    expect(component.formatLevel).toEqual('Dat');
    expect(component).toBeTruthy();
  });

  it('check setTicksAndClusterize function when clusterConf is an object on year conf', () => {
    fixture.detectChanges();
    component.xTicks = [];
    component.clusterConf = {
      year: 1,
    };
    component.setTicksAndClusterize([0, 100000000000]);
    expect(component.clusterLevel).toEqual({year: 1});
    expect(component.formatLevel).toEqual('Yea');
    expect(component).toBeTruthy();
  });

  it('check setTicksAndClusterize function when clusterConf is an object on month conf', () => {
    fixture.detectChanges();
    component.xTicks = [];
    component.clusterConf = {
        month: 1,
    };
    component.setTicksAndClusterize([0, 10000000000]);
    expect(component.clusterLevel).toEqual({month: 1});
    expect(component.formatLevel).toEqual('Mon');
    expect(component).toBeTruthy();
  });

  it('check setTicksAndClusterize function when clusterConf is an object on day conf', () => {
    fixture.detectChanges();
    component.xTicks = [];
    component.clusterConf = {
        day: 2,
    };
    component.setTicksAndClusterize([0, 1000000000]);
    expect(component.clusterLevel).toEqual({day: 2});
    expect(component.formatLevel).toEqual('Day');
    expect(component).toBeTruthy();
  });

  it('check setTicksAndClusterize function when clusterConf is an object on hour conf', () => {
    fixture.detectChanges();
    component.xTicks = [];
    component.clusterConf = {
        hour: 1,
    };
    component.setTicksAndClusterize([0, 100000000]);
    expect(component.clusterLevel).toEqual({hour: 1});
    expect(component.formatLevel).toEqual('Hou');
    expect(component).toBeTruthy();
  });

  it('check setTicksAndClusterize function when clusterConf is an object on minute conf', () => {
    fixture.detectChanges();
    component.xTicks = [];
    component.clusterConf = {
        minute: 5,
    };
    component.setTicksAndClusterize([0, 10000000]);
    expect(component.clusterLevel).toEqual({minute: 5});
    expect(component.formatLevel).toEqual('Min');
    expect(component).toBeTruthy();
  });

  it('check setTicksAndClusterize function when clusterConf is an object on second conf', () => {
    fixture.detectChanges();
    component.xTicks = [];
    component.clusterConf = {
        second: 5,
    };
    component.setTicksAndClusterize([0, 100000]);
    expect(component.clusterLevel).toEqual({second: 5});
    expect(component.formatLevel).toEqual('Sec');
    expect(component).toBeTruthy();
  });

  it('check setTicksAndClusterize function when clusterConf is an object on weekNb conf', () => {
    fixture.detectChanges();
    component.xTicks = [];
    component.clusterConf = {
        week: 1,
        weekNb: 1,
    };
    component.setTicksAndClusterize([0, 10000000000]);
    expect(component.clusterLevel).toEqual({week: 1, weekNb: 1});
    expect(component.formatLevel).toEqual('nbW');
    expect(component).toBeTruthy();
  });

  it('check clusterize functions : ' +
    'two algos create circle when detect one data in the scope of xTicks ' +
    'this test doesnt look the date assigned', () => {
    fixture.detectChanges();
    const tmpMoment = moment();
    component.xTicks.push(tmpMoment);
    component.circleDiameter = 10; // set on init-chart

    // Test 1
    const tmpData = {
      date: tmpMoment,
      color: 'red',
      count: 1,
      cy: 0,
      value: 4,
      summary: 'test',
    };
    component.myData = [[tmpData]];
    component.clusterConf = {
      month: 2,
    };
    component.setTicksAndClusterize([0, 1]);
    expect(component.dataClustered).toEqual([[]]);

    // Test 2
    const tmpData2 = {
      date: moment(),
      color: 'orange',
      count: 1,
      cy: 0,
      value: 3,
      summary: 'test2',
    };
    component.centeredOnTicks = true;
    component.clusterTicksToTicks = false;
    component.setTicksAndClusterize([tmpData.date.valueOf(), tmpData2.date.valueOf()]);
    // Check if dataClustered was feed with the circle in myData
    // can't compare date cause of _i property inside moment
    expect(component.dataClustered[0][0].start).toEqual(tmpMoment);
    expect(component.dataClustered[0][0].end).toEqual(tmpMoment);
    expect(component.dataClustered[0][0].count).toEqual(1);
    expect(component.dataClustered[0][0].color).toEqual('red');
    expect(component.dataClustered[0][0].cy).toEqual(0);
    expect(component.dataClustered[0][0].value).toEqual(4);
    expect(component.dataClustered[0][0].summary).toEqual([tmpMoment.format('DD/MM') + ' - ' + tmpMoment.format('HH:mm') +
    ' : ' + 'test']);
    expect(component.dataClustered[0][0].r).toEqual(10);
    expect(component.dataClustered[0][2]).toEqual(undefined);

    // Test 3
    component.clusterTicksToTicks = true;
    const tmpData3 = {
      date: moment(),
      color: 'blue',
      count: 1,
      cy: 0,
      value: 2,
      summary: 'test3',
    };
    tmpData2.date.add(3, 'days');
    tmpData3.date.subtract(3, 'days');
    component.myData = [[tmpData3, tmpData, tmpData2]];
    component.setTicksAndClusterize([tmpData.date.valueOf(), tmpData2.date.valueOf()]);
    // First Circle
    expect(component.dataClustered[0][0].start).toEqual(tmpMoment);
    expect(component.dataClustered[0][0].end).toEqual(tmpMoment);
    expect(component.dataClustered[0][0].count).toEqual(1);
    expect(component.dataClustered[0][0].color).toEqual('red');
    expect(component.dataClustered[0][0].cy).toEqual(0);
    expect(component.dataClustered[0][0].value).toEqual(4);
    expect(component.dataClustered[0][0].summary).toEqual([tmpMoment.format('DD/MM') + ' - ' + tmpMoment.format('HH:mm') +
    ' : ' + 'test']);
    expect(component.dataClustered[0][0].r).toEqual(10);
    // Second Circle
    expect(component.dataClustered[0][1].start).toEqual(tmpData2.date);
    expect(component.dataClustered[0][1].end).toEqual(tmpData2.date);
    expect(component.dataClustered[0][1].count).toEqual(1);
    expect(component.dataClustered[0][1].color).toEqual('orange');
    expect(component.dataClustered[0][1].cy).toEqual(0);
    expect(component.dataClustered[0][1].value).toEqual(3);
    expect(component.dataClustered[0][1].summary).toEqual([tmpData2.date.format('DD/MM') + ' - ' + tmpMoment.format('HH:mm') +
    ' : ' + 'test2']);
    expect(component.dataClustered[0][1].r).toEqual(10);
    // Third circle isn't in the scope of ticks
    expect(component.dataClustered[0][3]).toEqual(undefined);
    expect(component).toBeTruthy();
  });

  it('simulate circle hovered', () => {
    fixture.detectChanges();
    const circleTest = {
      start: moment(),
      end: moment(),
      count: 5,
    };
    const end = moment();
    end.add(1, 'days');
    const circleTestPeriod = {
      start: moment(),
      end,
      count: 5,
    };
    expect(component.circleHovered.period).toEqual('');
    component.feedCircleHovered(circleTest);
    expect(component.circleHovered.period).not.toEqual('');
    const tmp = component.circleHovered.period;
    component.feedCircleHovered(circleTestPeriod);
    expect(component.circleHovered.period).not.toEqual(tmp);

    component.formatTooltipsDate = 'DD/MM';
    const actualMoment = moment();
    expect(component.fctHoveredCircleDateFormatting(actualMoment)).toEqual(actualMoment.format('DD/MM'));
    expect(component).toBeTruthy();
  });

  it('check zoom function when zoom disabled', () => {
    fixture.detectChanges();
    component.enableZoom = false;
    component.onZoom(null, 'in');
    expect(component).toBeTruthy();
  });

  it('check zoom function when zoom enable but button disabled', () => {
    fixture.detectChanges();
    component.enableZoom = true;
    component.zoomOnButton = false;
    component.onZoom(null, 'in');
    expect(component).toBeTruthy();
  });

  it('check zoom function when zoom on button actived', () => {
    fixture.detectChanges();
    component.enableZoom = true;
    component.zoomOnButton = true;
    component.onZoom(null, 'in');
    component.onZoom(null, 'out');
    expect(component).toBeTruthy();
  });

  it('check drag on left' +
    'check special case when dragDirection is false ' +
    'and the mouse x position is biggest than previous mouse x position ', () => {
    fixture.detectChanges();
    component.valueDomain = [0, 5];
    component.enableDrag = true;
    // verifier si il n'y a pas de diff de couvrture sans le timeScale
    // component.timeScale = component.getTimeScale([0, 100000000], 1820);
    inputEl = fixture.debugElement.query(By.css('ngx-charts-chart'));
    const event = new PointerEvent('click', {
      clientX: 100,
    });
    const event2 = new PointerEvent('click', {
      clientX: -200,
    });
    const event3 = new PointerEvent('click', {
      clientX: 300,
    });
    inputEl.triggerEventHandler('pointerdown', event);
    expect(component.dragDirection).toBeUndefined();
    inputEl.triggerEventHandler('pointermove', event2);
    expect(component.dragDirection).toBeFalsy();
    inputEl.triggerEventHandler('pointermove', event3);
    expect(component.dragDirection).toBeFalsy();
    // Cant check cause of timeScale and all variables are not set
    // expect(component.valueDomain).not.toEqual([0, 5]);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('check drag on right ' +
    'check special case when dragDirection is true ' +
    'and the mouse x position is smallest than previous mouse x position ', () => {
    fixture.detectChanges();
    component.valueDomain = [0, 5];
    component.enableDrag = true;
    // component.timeScale = component.getTimeScale([0, 100000000], 1820);
    inputEl = fixture.debugElement.query(By.css('ngx-charts-chart'));
    const event = new PointerEvent('click', {
      clientX: 100,
    });
    const event2 = new PointerEvent('click', {
      clientX: 200,
    });
    const event3 = new PointerEvent('click', {
      clientX: -300,
    });
    inputEl.triggerEventHandler('pointerdown', event);
    expect(component.dragDirection).toBeUndefined();
    inputEl.triggerEventHandler('pointermove', event2);
    expect(component.dragDirection).toBeTruthy();
    inputEl.triggerEventHandler('pointermove', event3);
    expect(component.dragDirection).toBeTruthy();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
