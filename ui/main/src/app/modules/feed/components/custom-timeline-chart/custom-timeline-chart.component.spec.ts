import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomTimelineChartComponent } from './custom-timeline-chart.component';
import {CommonModule} from "@angular/common";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {FormsModule} from "@angular/forms";
import {NgxChartsModule} from "@swimlane/ngx-charts";
import * as moment from 'moment';
import {DebugElement} from "@angular/core";

describe('CustomTimelineChartComponent', () => {
  let component: CustomTimelineChartComponent;
  let fixture: ComponentFixture<CustomTimelineChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule,
        BrowserAnimationsModule,
        FormsModule,
        NgxChartsModule ],
      declarations: [ CustomTimelineChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomTimelineChartComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should create without domain', () => {
    fixture.detectChanges();
    component.xDomain = null;
    component.getXDomain();
    expect(component).toBeTruthy();
  });

  it('simulate circle hovered',() => {
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
    component.feedCircleHovered(circleTest);
    component.feedCircleHovered(circleTestPeriod);
    expect(component).toBeTruthy();
  });

  it('check zoom function when zoom disabled',() => {
    fixture.detectChanges();
    component.enableZoom = false;
    component.onZoom(null, 'in');
    expect(component).toBeTruthy();
  });

  it('check zoom function when zoom on button actived',() => {
    fixture.detectChanges();
    component.enableZoom = true;
    component.zoomOnButton = true;
    component.onZoom(null, 'in');
    component.onZoom(null, 'out');
    expect(component).toBeTruthy();
  });

  it('check week ticks assignation more than 10 days',() => {
    fixture.detectChanges();
    // more than 10 days
    component.weekTicks([0, 964000000]);
    expect(component).toBeTruthy();
  });

  it('check week ticks assignation less than 10 days',() => {
    fixture.detectChanges();
    // more less 10 days ==> 864000000
    component.weekTicks([0, 664000000]);
    expect(component).toBeTruthy();
  });

  it('checheck week ticks assignation more than 45 days',() => {
    fixture.detectChanges();
    // more than 45 days
    component.monthTicks([0, 4888000000]);
    expect(component).toBeTruthy();
  });

  it('check week ticks assignation less than 45 days',() => {
    fixture.detectChanges();
    // more less 45 days ==> 3888000000
    component.monthTicks([0, 2888000000]);
    expect(component).toBeTruthy();
  });

  /*fit('check drag start function',() => {
    initMouseEvent(MouseEvent);
    inputEl = fixture.debugElement.query(By.css('ngx-charts-chart'));
    inputEl.triggerEventHandler('pointerup', {clientX: 5});
    inputEl.triggerEventHandler('move', {clientX: 0});
    inputEl.triggerEventHandler('pointerdown', {clientX: -5});
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });*/

  /*fit('check drag start function',() => {
    fixture.detectChanges();
    let event = instanceOfMouseEvent.clientX;
    event["clientX"] = 5;
    component.onDragStart(event);
    expect(component).toBeTruthy();
  });*/


 /* fit('should create', () => {
    fixture.detectChanges();
    const start = moment();
    start.hours(0).minutes(0).seconds(0).millisecond(0);
    const end = _.cloneDeep(start);
    end.startOf('month');
    end.add(2, 'months');
    const testCircle = {start, end, count: 4}
    component.clusterLevel = 'M';
    component.feedCircleHovered(testCircle);
    expect(component).toBeTruthy();
  });

  fit('should create', () => {
    fixture.detectChanges();
    const start = moment();
    start.hours(0).minutes(0).seconds(0).millisecond(0);
    const end = _.cloneDeep(start);
    end.startOf('month');
    end.add(2, 'months');
    const testCircle = {start, end, count: 4}
    component.clusterLevel = 'Y';
    component.feedCircleHovered(testCircle);
    expect(component).toBeTruthy();
  });*/
});
