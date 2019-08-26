import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {InitChartComponent} from './init-chart.component';
import {APP_BASE_HREF, CommonModule} from '@angular/common';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule} from '@angular/forms';
import {NgxChartsModule} from '@swimlane/ngx-charts';
import {CustomTimelineChartComponent} from '../custom-timeline-chart/custom-timeline-chart.component';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {Store, StoreModule} from '@ngrx/store';
import {appReducer, AppState, storeConfig} from '@ofStore/index';
import {RouterStateSerializer, StoreRouterConnectingModule} from '@ngrx/router-store';
import {CustomRouterStateSerializer} from '@ofStates/router.state';
import {RouterTestingModule} from '@angular/router/testing';
import {DraggableDirective} from '../time-line/app-draggable';
import {MouseWheelDirective} from '../time-line/mouse-wheel.directive';
import {XAxisTickFormatPipe} from '../time-line/x-axis-tick-format.pipe';
import {TimeService} from "@ofServices/time.service";
import * as moment from 'moment';

describe('InitChartComponent', () => {
  let component: InitChartComponent;
  let store: Store<AppState>;
  let fixture: ComponentFixture<InitChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule,
        BrowserAnimationsModule,
        FormsModule,
        StoreModule.forRoot(appReducer, storeConfig),
        RouterTestingModule,
        StoreRouterConnectingModule,
        NgxChartsModule ],
      declarations: [ InitChartComponent, CustomTimelineChartComponent,
        DraggableDirective, MouseWheelDirective, XAxisTickFormatPipe],
      providers: [{provide: APP_BASE_HREF, useValue: '/'},
        {provide: Store, useClass: Store},
        {provide: RouterStateSerializer, useClass: CustomRouterStateSerializer},
        {provide: TimeService, useClass: TimeService}],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
    store = TestBed.get(Store);
    spyOn(store, 'dispatch').and.callThrough();
    fixture = TestBed.createComponent(InitChartComponent);
    component = fixture.componentInstance;
  }));

  it('should create button home display', () => {
    fixture.detectChanges();
    component.buttonHomeActive = true;
    expect(component.checkButtonHomeDisplay()).toBeTruthy();
  });

  it('should create button home cause domains differs', () => {
    fixture.detectChanges();
    component.buttonHome = [4, 5];
    expect(component.checkButtonHomeDisplay()).toBeTruthy();
  });

  it('should not create button home cause firstMove is true', () => {
    fixture.detectChanges();
    component.firstMove = true;
    expect(component.checkButtonHomeDisplay()).toBeFalsy();
  });

  it('should test homeClick & subtract3Ticks functions with a date conf', () => {
    fixture.detectChanges();
    component.startDomainWith3TicksMode = true;
    component.ticksConf = {date: [1,16]};
    const tmp = moment();
    tmp.date(18);
    component.homeClick(tmp.valueOf(), tmp.valueOf());
    tmp.date(1);
    tmp.subtract(1, 'month');
    expect(component.myDomain[0]).toEqual(tmp.valueOf());
    expect(component).toBeTruthy();    
  });

  it('should test homeClick & subtract3Ticks functions with a hour conf', () => {
    fixture.detectChanges();
    component.startDomainWith3TicksMode = true;
    component.ticksConf = {hour: 2};
    const tmp = moment();
    tmp.date(4).hour(0);
    const tmp3TicksBefore = moment(tmp);
    tmp3TicksBefore.subtract(3 * 2, 'hour');
    expect(component.subtract3Ticks(tmp.valueOf())).toEqual(tmp3TicksBefore.valueOf());
    expect(component).toBeTruthy();    
  });

  it('should apply differents zoom levels on timeline' +
      'should verify domain value is changed after calling moveDomain & homeClick functions', () => {
    fixture.detectChanges();
    const tmp = component.buttonTitle;
    component.applyNewZoom('drag');
    expect(tmp).toEqual(component.buttonTitle);
    expect(component.buttonHomeActive).toBeTruthy();

    component.followClockTickMode = true;
    component.homeClick(1, 2);
    expect(component.buttonHomeActive).toBeFalsy();
    expect(component.myDomain).toEqual([1, 2]);

    // check domain change after call moveDomain function with any buttonTitle
    let domain = component.myDomain;
    component.moveDomain(true);
    expect(domain).not.toEqual(component.myDomain);
    domain = component.myDomain;
    component.moveDomain(false);
    expect(domain).not.toEqual(component.myDomain);

    component.followClockTick = true;
    domain = component.myDomain;
    component.buttonTitle = 'M';
    component.moveDomain(true);
    expect(domain).not.toEqual(component.myDomain);
    domain = component.myDomain;
    component.moveDomain(false);
    expect(domain).not.toEqual(component.myDomain);

    domain = component.myDomain;
    component.buttonTitle = 'Y';
    component.moveDomain(true);
    expect(domain).not.toEqual(component.myDomain);
    domain = component.myDomain;
    component.moveDomain(false);
    expect(domain).not.toEqual(component.myDomain);
    expect(component).toBeTruthy();
  });



  it('check moveDomain function :' +
    'forward with different movements for start and end of domain' +
    'backward with same movement for start and end of domain' +
    'set to true firstMoveStartOfUnit and move forward and backward' +
    'forward on weekDay Configuration', () => {
    fixture.detectChanges();
    let tmpStart = moment(component.myDomain[0]);
    let tmpEnd = moment(component.myDomain[1]);
    component.forwardConf = {
      start: {
        month: 0,
        week: 2,
      },
      end: {
        year: 0,
        week: 1,
      },
    };
    tmpStart.add(2, 'week');
    tmpEnd.add(1, 'week');
    component.moveDomain(true);
    expect(tmpStart.valueOf()).toEqual(component.myDomain[0]);
    expect(tmpEnd.valueOf()).toEqual(component.myDomain[1]);

    tmpStart = moment(component.myDomain[0]);
    tmpEnd = moment(component.myDomain[1]);
    component.backwardConf = {
      start: {
        month: 0,
        week: 2,
        day: 1,
      },
    };
    tmpStart.subtract(2, 'week').subtract(1, 'day');
    tmpEnd.subtract(2, 'week').subtract(1, 'day');
    component.moveDomain(false);
    expect(tmpStart.valueOf()).toEqual(component.myDomain[0]);
    expect(tmpEnd.valueOf()).toEqual(component.myDomain[1]);

    tmpStart = moment(component.myDomain[0]);
    tmpEnd = moment(component.myDomain[1]);
    // every time start of domain don't be impacted by firstMoveStartOfUnit
    tmpStart.startOf('week').startOf('day')
        .subtract(2, 'week').subtract(1, 'day');
    tmpEnd.startOf('week').startOf('day')
        .subtract(2 + 1, 'week').subtract(1 + 1, 'day');
    component.firstMoveStartOfUnit = true;
    component.moveDomain(false);
    expect(tmpStart.valueOf()).toEqual(component.myDomain[0]);
    expect(tmpEnd.valueOf()).toEqual(component.myDomain[1]);

    // using forwardConf set at begin ===> end: 1 week
    tmpEnd = moment(component.myDomain[1]);
    tmpEnd.startOf('week').add(1 - 1, 'week');
    component.firstMoveStartOfUnit = true;
    component.moveDomain(true);
    expect(tmpEnd.valueOf()).toEqual(component.myDomain[1]);

    component.forwardConf = {
      start: {
        weekDay: 1, // 1 = next Sunday
        month: 0,
        week: 2,
      },
      end: {
        weekDay: 1,
        year: 0,
        week: 0,
      },
    };
    component.moveDomain(true);
    component.backwardConf = {
      start: {
        weekDay: 2,
      },
      end: {
        weekDay: 1,
        week: 1,
      }
    };
    component.moveDomain(false);
    expect(component).toBeTruthy();
  });

  it('check moveDomain function, test when first move is used with 4 ticks preview option', () => {
    fixture.detectChanges();
    component.startDomainWith3TicksMode = true;
    component.firstMove = true;
    const tmpStart = moment(component.myDomain[0]);
    const tmpEnd = moment(component.myDomain[1]);
    component.buttonHome[0] = tmpStart.valueOf();
    component.buttonHome[1] = tmpEnd.valueOf();
    component.forwardConf = {
      start: {
        month: 0,
        day: 2,
      },
    };
    tmpStart.subtract(2, 'day');
    tmpEnd.subtract(2, 'day');
    component.moveDomain(false);
    expect(tmpStart.valueOf()).toEqual(component.myDomain[0]);
    expect(tmpEnd.valueOf()).toEqual(component.myDomain[1]);
    }
  );

  it('check getWeekDayBalanceNumber return', () => {
    fixture.detectChanges();
    expect(component.getWeekDayBalanceNumber(0)).toEqual(0);
    expect(component.getWeekDayBalanceNumber(1)).toEqual(0);
    expect(component.getWeekDayBalanceNumber(2)).toEqual(2);
    expect(component.getWeekDayBalanceNumber(3)).toEqual(4);
    expect(component.getWeekDayBalanceNumber(4)).toEqual(6);
    expect(component.getWeekDayBalanceNumber(5)).toEqual(8);
    expect(component.getWeekDayBalanceNumber(6)).toEqual(10);
    expect(component.getWeekDayBalanceNumber(7)).toEqual(12);
    expect(component.getWeekDayBalanceNumber(8)).toEqual(0);
    expect(component).toBeTruthy();
  });

  it('check applyNewZoom function with only one button' +
      'forward level activated is different', () => {
    fixture.detectChanges();
    component.buttonTitle = 'W';
    component.buttonList = [{buttonTitle: 'M'}];
    const tmp = component.buttonTitle;
    component.applyNewZoom('in');
    // no change expected, cause button buttonList is not equal to buttonTitle
    expect(tmp).toEqual(component.buttonTitle);
    component.applyNewZoom('out');
    expect(tmp).toEqual(component.buttonTitle);
    expect(component).toBeTruthy();
  });

  it('check applyNewZoom function with only one button' +
      'forward level activated is same than one button', () => {
    fixture.detectChanges();
    component.buttonTitle = 'W';
    component.buttonList = [{buttonTitle: 'W'}];
    const tmp = component.buttonTitle;
    component.applyNewZoom('in');
    // no change expected, cause buttonList got only one button
    expect(tmp).toEqual(component.buttonTitle);
    component.applyNewZoom('out');
    expect(tmp).toEqual(component.buttonTitle);
    expect(component).toBeTruthy();
  });

  it('check applyNewZoom function with two buttons' +
      'forward level activated is same than last button', () => {
    fixture.detectChanges();
    component.buttonTitle = 'W';
    component.buttonList = [{buttonTitle: 'M'}, {buttonTitle: 'W'}];
    component.applyNewZoom('in');
    // change expected, cause buttonList got two buttons :
    //  - one is the same than actual buttonTitle
    //  - next one has buttonList differe
    expect(component.buttonTitle).toEqual('M');
    expect(component.buttonList[0].selected).toBeTruthy();
    expect(component.buttonList[1].selected).toBeFalsy();
    component.applyNewZoom('out');
    expect(component.buttonTitle).toEqual('W');
    expect(component.buttonList[0].selected).toBeFalsy();
    expect(component.buttonList[1].selected).toBeTruthy();

    expect(component).toBeTruthy();
  });

  it('check getCircleValue & getColorSeverity functions' +
      'on switch default case (unused normally)' +
      'and with null params', () => {
    fixture.detectChanges();
    expect(component.getCircleValue('0')).toEqual(5);
    expect(component.getColorSeverity('NO')).toEqual('white');
    expect(component.getCircleValue(null)).toEqual(5);
    expect(component.getColorSeverity(null)).toEqual('white');
    component.changeGraphConf(null);
    expect(component).toBeTruthy();
  });

  it('should create timeline with another zoom conf, without zoom configuration', () => {
    fixture.detectChanges();
    const saveTitle = component.buttonTitle;
    const fakeConf = {
      formatTicks: 'DD/MM/YY',
      formatTooltipsDate: 'DD/MM/YY',
      buttonTitle: null, // nothing happened
    };
    component.readZoomConf(fakeConf);
    fixture.detectChanges();
    expect(component.formatTicks).toEqual('DD/MM/YY');
    expect(component.formatTooltipsDate).toEqual('DD/MM/YY');
    expect(component.buttonTitle).toEqual(saveTitle);
  });

  it('should create timeline with another conf', () => {
    const myConf = {
      enableDrag: true,
      enableZoom: false,
      autoScale: true,
      animations: true,
      showGridLines: false,
      realTimeBar: false,
      centeredOnTicks: false,
      circleDiameter: 12,
    };
    component.conf = myConf;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
