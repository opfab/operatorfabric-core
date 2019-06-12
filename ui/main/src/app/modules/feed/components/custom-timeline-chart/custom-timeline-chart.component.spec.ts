import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomTimelineChartComponent } from './custom-timeline-chart.component';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { DebugElement } from '@angular/core';
import * as moment from 'moment';
import { By } from '@angular/platform-browser';
import { DraggableDirective } from '../time-line/app-draggable';
import { MouseWheelDirective } from '../time-line/mouse-wheel.directive';
import { XAxisTickFormatPipe } from '../time-line/x-axis-tick-format.pipe';

describe('CustomTimelineChartComponent', () => {
  let component: CustomTimelineChartComponent;
  let fixture: ComponentFixture<CustomTimelineChartComponent>;
  let inputEl: DebugElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule,
        BrowserAnimationsModule,
        FormsModule,
        NgxChartsModule ],
      declarations: [ CustomTimelineChartComponent,
        DraggableDirective, MouseWheelDirective,
        XAxisTickFormatPipe]
    })
    .compileComponents();
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

  it('should return the same string which was received', () => {
    fixture.detectChanges();
    component.autoScale = true;
    component.hideLabelsTicks('test');
    expect(component).toBeTruthy();
  });

  it('should return without effect', () => {
    fixture.detectChanges();
    component.enableDrag = false;
    component.onDragMove(null);
    expect(component).toBeTruthy();
  });

  it('should set zoomLevel', () => {
    fixture.detectChanges();
    component.zoomLevel = 2;
    expect(component).toBeTruthy();
  });

  it('should return without effect', () => {
    fixture.detectChanges();
    component.clusterLevel = 'M';
    const test = moment();
    component.fctTickFormattingAdvanced(test);
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
    component.feedCircleHovered(circleTest);
    component.feedCircleHovered(circleTestPeriod);
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

  it('check setXTicksValue function', () => {
    fixture.detectChanges();
    component.clusterLevel = 'M';
    component.setXTicksValue([0, 2888000000]);
    component.clusterLevel = 'Y';
    component.setXTicksValue([0, 34888000000]);
    component.clusterLevel = 'R';
    component.setXTicksValue([0, 1]);
    expect(component).toBeTruthy();
  });

  it('check week ticks assignation more than 10 days', () => {
    fixture.detectChanges();
    // more than 10 days
    component.weekTicks([0, 964000000]);
    expect(component).toBeTruthy();
  });

  it('check week ticks assignation less than 10 days', () => {
    fixture.detectChanges();
    // less than 10 days ==> 864000000
    component.weekTicks([0, 664000000]);
    expect(component).toBeTruthy();
  });

  it('checheck week ticks assignation more than 45 days', () => {
    fixture.detectChanges();
    // more than 45 days
    component.monthTicks([0, 4888000000]);
    expect(component).toBeTruthy();
  });

  it('check week ticks assignation less than 45 days', () => {
    fixture.detectChanges();
    // less than 45 days ==> 3888000000
    component.monthTicks([0, 2888000000]);
    expect(component).toBeTruthy();
  });

  it('check year ticks assignation', () => {
    fixture.detectChanges();
    // more than 13 months ==> 34888000000
    component.yearTicks([0, 34888000000]);
    expect(component).toBeTruthy();
  });

  it('check drag on left', () => {
    fixture.detectChanges();
    component.valueDomain = [0, 5];
    component.enableDrag = true;
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
    component.dragDirection = false;
    inputEl.triggerEventHandler('pointerdown', event);
    inputEl.triggerEventHandler('pointermove', event2);
    inputEl.triggerEventHandler('pointermove', event3);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('check drag on right', () => {
    fixture.detectChanges();
    component.valueDomain = [0, 5];
    component.enableDrag = true;
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
    component.dragDirection = true;
    inputEl.triggerEventHandler('pointerdown', event);
    inputEl.triggerEventHandler('pointermove', event3);
    inputEl.triggerEventHandler('pointermove', event2);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
