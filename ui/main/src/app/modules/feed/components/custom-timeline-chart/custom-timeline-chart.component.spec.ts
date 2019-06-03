import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomTimelineChartComponent } from './custom-timeline-chart.component';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { DebugElement } from '@angular/core';
import * as moment from 'moment';

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
      declarations: [ CustomTimelineChartComponent ]
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

  it('check setXTicksValue function', () => {
    fixture.detectChanges();
    component.clusterLevel = 'M';
    component.setXTicksValue([0, 2888000000]);
    component.clusterLevel = 'Y';
    component.setXTicksValue([0, 34888000000]);
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

  /*fit('check drag start function',() => {
    fixture.detectChanges();
    let event = new PointerEvent('click', {
      bubbles: true,
      cancelable: true,
      clientX: 100,
      clientY: 100
    });
    let event2 = new PointerEvent('click', {
      bubbles: true,
      cancelable: true,
      clientX: 200,
      clientY: 100
    });
    let event3 = new PointerEvent('click', {
      bubbles: true,
      cancelable: true,
      clientX: 300,
      clientY: 100
    });
    inputEl = fixture.debugElement.query(By.css('ngx-charts-chart'));
    inputEl.triggerEventHandler('pointerdown', event);
    inputEl.triggerEventHandler('move', event2);
    inputEl.triggerEventHandler('pointerup', event3);

    fixture.detectChanges();
    expect(component).toBeTruthy();
  });*/

 /* fit('check drag start function',() => {
    fixture.detectChanges();
    let event = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      clientX: 100,
      clientY: 100
    });
    let event2 = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      clientX: 150,
      clientY: 100
    });
    console.log('EVENT=', event);
    component.startDragX = 90;
    component.onDragStart(event);
    component.onDragMove(event2);
    expect(component).toBeTruthy();
  });*/
});
