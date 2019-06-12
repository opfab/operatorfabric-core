import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InitChartComponent } from './init-chart.component';
import { CommonModule } from '@angular/common';
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
      providers: [{provide: Store, useClass: Store}, {provide: RouterStateSerializer, useClass: CustomRouterStateSerializer}],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
    store = TestBed.get(Store);
    spyOn(store, 'dispatch').and.callThrough();
    fixture = TestBed.createComponent(InitChartComponent);
    component = fixture.debugElement.componentInstance;
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

  it('should apply differents zoom levels on timeline' +
      'for simulate movement on timeline domain', () => {
    fixture.detectChanges();
    component.applyNewZoom('in');
    component.applyNewZoom('out');
    component.applyNewZoom('drag');
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
      'forward level conf is same than last button', () => {
    fixture.detectChanges();
    component.buttonList = [{forwardLevel: 'M'}, {forwardLevel: 'W'}];
    component.applyNewZoom('in');
    component.applyNewZoom('out');
    expect(component).toBeTruthy();
  });

  it('check getCircleValue & getColorSeverity functions' +
      'on switch default case (unused normally)' +
      'and with null params', () => {
    fixture.detectChanges();
    component.getCircleValue('0');
    component.getColorSeverity('NO');
    component.getCircleValue(null);
    component.getColorSeverity(null);
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
