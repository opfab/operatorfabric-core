import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { TimeLineComponent } from './time-line.component';
import { CustomTimelineChartComponent } from '../custom-timeline-chart/custom-timeline-chart.component';
import { InitChartComponent } from '../init-chart/init-chart.component';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { DraggableDirective } from './app-draggable';

let component: CustomTimelineChartComponent;
let fixture: ComponentFixture<CustomTimelineChartComponent>;
let inputEl: DebugElement;

describe('Directive: AppMouseWheel', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [CommonModule,
                BrowserAnimationsModule,
                FormsModule,
                NgxChartsModule ],
            declarations: [ TimeLineComponent, CustomTimelineChartComponent, InitChartComponent, DraggableDirective ],
            schemas: [ NO_ERRORS_SCHEMA ]
        })
        .compileComponents();
        fixture = TestBed.createComponent(CustomTimelineChartComponent);
        component = fixture.componentInstance;
        inputEl = fixture.debugElement.query(By.css('ngx-charts-chart'));
    });

    it('simulate the combination of events when we drag on the chart', () => {
        inputEl.triggerEventHandler('pointerdown', null);
        inputEl.triggerEventHandler('pointermove', null);
        inputEl.triggerEventHandler('pointerup', null);
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('mouse drag pointer move event only', () => {
        inputEl.triggerEventHandler('pointermove', null);
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('mouse drag pointer up event only', () => {
        inputEl.triggerEventHandler('pointerup', null);
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });
});
