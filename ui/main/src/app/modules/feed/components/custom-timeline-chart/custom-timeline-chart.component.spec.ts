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
import * as _ from 'lodash';

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
    expect(component.getXDomain()).toEqual([0, 1]);
    expect(component).toBeTruthy();
  });

  it('should return the same string which was received', () => {
    fixture.detectChanges();
    component.autoScale = true;
    expect(component.hideLabelsTicks('test')).toEqual('test');
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
    component.clusterLevel = 'M';
    const test = moment();
    test.date(3);
    expect(component.fctTickFormattingAdvanced(test)).toEqual(test.format('ddd DD MMM'));
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
    let tmp = _.cloneDeep(component.xTicks);
    component.clusterLevel = 'M';
    component.setXTicksValue([0, 2888000000]);
    expect(component.xTicks).not.toEqual(tmp);

    tmp = _.cloneDeep(component.xTicks);
    component.clusterLevel = 'Y';
    component.setXTicksValue([10000000000, 44888000000]);
    expect(component.xTicks).not.toEqual(tmp);

    tmp = _.cloneDeep(component.xTicks);
    component.clusterLevel = 'R';
    component.setXTicksValue([0, 1]);
    expect(component.xTicks).toEqual(tmp);
    expect(component).toBeTruthy();
  });

  it('check drag on left' +
    'check special case when dragDirection is false ' +
    'and the mouse x position is biggest than previous mouse x position ', () => {
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
