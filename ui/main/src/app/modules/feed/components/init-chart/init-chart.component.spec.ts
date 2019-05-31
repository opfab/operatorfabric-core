import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InitChartComponent } from './init-chart.component';
import {CommonModule} from "@angular/common";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {FormsModule} from "@angular/forms";
import {NgxChartsModule} from "@swimlane/ngx-charts";
import {CustomTimelineChartComponent} from "../custom-timeline-chart/custom-timeline-chart.component";
import {Store, StoreModule} from "@ngrx/store";
import {appReducer, AppState, storeConfig} from "@ofStore/index";
import {RouterStateSerializer, StoreRouterConnectingModule} from "@ngrx/router-store";
import {CustomRouterStateSerializer} from "@ofStates/router.state";
import {NO_ERRORS_SCHEMA} from "@angular/core";
import {RouterTestingModule} from "@angular/router/testing";

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
      declarations: [ InitChartComponent, CustomTimelineChartComponent],
      providers: [{provide: Store, useClass: Store},{provide: RouterStateSerializer, useClass: CustomRouterStateSerializer}],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    store = TestBed.get(Store);
    spyOn(store, 'dispatch').and.callThrough();
    fixture = TestBed.createComponent(InitChartComponent);
    component = fixture.debugElement.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should create button home display', () => {
    fixture.detectChanges();
    component.buttonHomeActive = true;
    component.checkButtonHomeDisplay();
    expect(component).toBeTruthy();
  });

  it('should create button home cause domains differs', () => {
    fixture.detectChanges();
    component.buttonHome = [4, 5];
    component.checkButtonHomeDisplay();
    expect(component).toBeTruthy();
  });

  it('should create timeline with month confZoom', () => {
    fixture.detectChanges();
    component.applyNewZoom('in');
    component.applyNewZoom('out');
    component.homeClick(1, 2);
    component.moveDomain(true);
    component.moveDomain(false);
    component.forwardButtonType = 'M';
    component.moveDomain(true);
    component.moveDomain(false);
    component.forwardButtonType = 'Y';
    component.moveDomain(true);
    component.moveDomain(false);
    expect(component).toBeTruthy();
  });

  it('check applyNewZoom function with only one button' +
      'forward level conf is different', () => {
    fixture.detectChanges();
    component.buttonList = [{forwardLevel: 'M'}];
    component.applyNewZoom('in');
    component.applyNewZoom('out');
    expect(component).toBeTruthy();
  });

  it('check applyNewZoom function with only one button' +
      'forward level conf is same than one button', () => {
    fixture.detectChanges();
    component.buttonList = [{forwardLevel: 'W'}];
    component.applyNewZoom('in');
    component.applyNewZoom('out');
    expect(component).toBeTruthy();
  });

  it('check applyNewZoom function with two buttons' +
      'forward level conf is different', () => {
    fixture.detectChanges();
    component.buttonList = [{forwardLevel: 'M'}, {forwardLevel: 'Y'}];
    component.applyNewZoom('in');
    component.applyNewZoom('out');
    expect(component).toBeTruthy();
  });

  it('check applyNewZoom function with two buttons' +
      'forward level conf is same than one button', () => {
    fixture.detectChanges();
    component.buttonList = [{forwardLevel: 'M'}, {forwardLevel: 'W'}];
    component.applyNewZoom('in');
    component.applyNewZoom('out');
    expect(component).toBeTruthy();
  });

  it('should create timeline with other conf', () => {
    const conf = {
      enableDrag: true,
      enableZoom: false,
      autoScale: true,
      animations: true,
      showGridLines: false,
      realTimeBar: false,
      centeredOnTicks: false,
    };
    component.conf = conf;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });


  /*  it('should create timeline with month confZoom', () => {
      component.applyNewZoom('out');
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });*/

  /*  it('should create timeline with month confZoom', () => {
      const startDomain2 = moment();
      startDomain2.hours(0).minutes(0).seconds(0).millisecond(0);
      const endDomain2 = _.cloneDeep(startDomain2);
      endDomain2.startOf('month');
      endDomain2.add(2, 'months');
      const confZoom =  [{
        startDomain: startDomain2.valueOf(),
        endDomain: endDomain2.valueOf(),
        forwardLevel: 'M',
        followCloackTick: false,
      }];
      component.confZoom = confZoom;
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('should create timeline with year confZoom', () => {
      const startDomain3 = moment();
      startDomain3.startOf('month');
      startDomain3.hours(0);
      const endDomain3 = _.cloneDeep(startDomain3);
      endDomain3.add(2, 'years');
      endDomain3.startOf('year');
      const confZoom =  [{
        startDomain: startDomain3.valueOf(),
        endDomain: endDomain3.valueOf(),
        forwardLevel: 'Y',
        followCloackTick: false,
      }];
      component.confZoom = confZoom;
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });*/
});
