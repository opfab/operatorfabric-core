import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InitChartComponent } from './init-chart.component';
import {CommonModule} from "@angular/common";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {FormsModule} from "@angular/forms";
import {NgxChartsModule} from "@swimlane/ngx-charts";
import {CustomTimelineChartComponent} from "../custom-timeline-chart/custom-timeline-chart.component";
import {TimeLineComponent} from "../time-line/time-line.component";
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

 /* it('should create Month', () => {
    const startDomain2 = moment();
    startDomain2.hours(0).minutes(0).seconds(0).millisecond(0);
    const endDomain2 = _.cloneDeep(startDomain2);
    endDomain2.startOf('month');
    endDomain2.add(2, 'months');
    const confZoom =  {
      startDomain: startDomain2.valueOf(),
      endDomain: endDomain2.valueOf(),
      forwardLevel: 'M',
      followCloackTick: false,
    };
    component.confZoom = confZoom;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });*/
/*
  it('should create Year', () => {
    const startDomain3 = moment();
    startDomain3.startOf('month');
    startDomain3.hours(0);
    const endDomain3 = _.cloneDeep(startDomain3);
    endDomain3.add(2, 'years');
    endDomain3.startOf('year');
    const confZoom =  {
      startDomain: startDomain3.valueOf(),
      endDomain: endDomain3.valueOf(),
      forwardLevel: 'Y',
      followCloackTick: false,
    };
    component.confZoom = confZoom;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });*/
});
