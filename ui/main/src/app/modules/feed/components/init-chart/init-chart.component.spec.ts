import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InitChartComponent } from './init-chart.component';
import {APP_BASE_HREF, CommonModule} from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { CustomTimelineChartComponent } from '../custom-timeline-chart/custom-timeline-chart.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Store, StoreModule } from '@ngrx/store';
import { appReducer, AppState, storeConfig } from '@ofStore/index';
import { RouterStateSerializer, StoreRouterConnectingModule } from '@ngrx/router-store';
import { CustomRouterStateSerializer } from '@ofStates/router.state';
import { RouterTestingModule } from '@angular/router/testing';
import { DraggableDirective } from '../time-line/app-draggable';
import { MouseWheelDirective } from '../time-line/mouse-wheel.directive';
import { XAxisTickFormatPipe } from '../time-line/x-axis-tick-format.pipe';

describe('InitChartComponent', () => {
  let component: InitChartComponent;
  let store: Store<AppState>;
  let fixture: ComponentFixture<InitChartComponent>;

  beforeEach(() => {
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
      providers: [{provide: APP_BASE_HREF, useValue: '/'}, {provide: Store, useClass: Store},
        {provide: RouterStateSerializer, useClass: CustomRouterStateSerializer}],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
    store = TestBed.get(Store);
    spyOn(store, 'dispatch').and.callThrough();
    fixture = TestBed.createComponent(InitChartComponent);
    component = fixture.componentInstance;
  });

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

  it('should not create button home cause is undefined', () => {
    fixture.detectChanges();
    component.buttonHome = null;
    expect(component.checkButtonHomeDisplay()).toBeFalsy();
  });

  it('should apply differents zoom levels on timeline' +
      'should verify domain value is changed after calling moveDomain & homeClick functions', () => {
    fixture.detectChanges();
    const tmp = component.forwardButtonType;
    component.applyNewZoom('drag');
    expect(tmp).toEqual(component.forwardButtonType);
    expect(component.buttonHomeActive).toBeTruthy();

    component.homeClick(1, 2);
    expect(component.buttonHomeActive).toBeFalsy();
    expect(component.myDomain).toEqual([1, 2]);

    // check domain change after call moveDomain function with any forwardButtonType
    let domain = component.myDomain;
    component.moveDomain(true);
    expect(domain).not.toEqual(component.myDomain);
    domain = component.myDomain;
    component.moveDomain(false);
    expect(domain).not.toEqual(component.myDomain);

    // move two times domain in same direction for
    // increment continuousForward allowing a full condition coverage of moveDomainByDay
    domain = component.myDomain;
    component.forwardButtonType = '7D';
    component.moveDomain(true);
    component.moveDomain(true);
    expect(domain).not.toEqual(component.myDomain);
    domain = component.myDomain;
    component.moveDomain(false);
    expect(domain).not.toEqual(component.myDomain);

    // for D-7 two cases to test, we inverse boolean value passed at moveDomain function
    domain = component.myDomain;
    component.forwardButtonType = '7D';
    component.moveDomain(false);
    component.moveDomain(false);
    expect(domain).not.toEqual(component.myDomain);
    domain = component.myDomain;
    component.moveDomain(true);
    expect(domain).not.toEqual(component.myDomain);

    domain = component.myDomain;
    component.forwardButtonType = 'M';
    component.moveDomain(true);
    expect(domain).not.toEqual(component.myDomain);
    domain = component.myDomain;
    component.moveDomain(false);
    expect(domain).not.toEqual(component.myDomain);

    domain = component.myDomain;
    component.forwardButtonType = 'Y';
    component.moveDomain(true);
    expect(domain).not.toEqual(component.myDomain);
    domain = component.myDomain;
    component.moveDomain(false);
    expect(domain).not.toEqual(component.myDomain);
    expect(component).toBeTruthy();
  });

  it('check applyNewZoom function with only one button' +
      'forward level activated is different', () => {
    fixture.detectChanges();
    component.forwardButtonType = 'W';
    component.buttonList = [{forwardLevel: 'M'}];
    const tmp = component.forwardButtonType;
    component.applyNewZoom('in');
    // no change expected, cause button forwardLevel is not equal to forwardButtonType
    expect(tmp).toEqual(component.forwardButtonType);
    component.applyNewZoom('out');
    expect(tmp).toEqual(component.forwardButtonType);
    expect(component).toBeTruthy();
  });

  it('check applyNewZoom function with only one button' +
      'forward level activated is same than one button', () => {
    fixture.detectChanges();
    component.forwardButtonType = 'W';
    component.buttonList = [{forwardLevel: 'W'}];
    const tmp = component.forwardButtonType;
    component.applyNewZoom('in');
    // no change expected, cause buttonList got only one button
    expect(tmp).toEqual(component.forwardButtonType);
    component.applyNewZoom('out');
    expect(tmp).toEqual(component.forwardButtonType);
    expect(component).toBeTruthy();
  });

  it('check applyNewZoom function with two buttons' +
      'forward level activated is same than last button', () => {
    fixture.detectChanges();
    component.forwardButtonType = 'W';
    component.buttonList = [{forwardLevel: 'M'}, {forwardLevel: 'W'}];
    component.applyNewZoom('in');
    // change expected, cause buttonList got two buttons :
    //  - one is the same than actual forwardButtonType
    //  - next one has forwardLevel differe
    expect(component.forwardButtonType).toEqual('M');
    component.applyNewZoom('out');
    expect(component.forwardButtonType).toEqual('W');
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
