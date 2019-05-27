import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomTimelineChartComponent } from './custom-timeline-chart.component';
import {CommonModule} from "@angular/common";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {FormsModule} from "@angular/forms";
import {NgxChartsModule} from "@swimlane/ngx-charts";

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
});
