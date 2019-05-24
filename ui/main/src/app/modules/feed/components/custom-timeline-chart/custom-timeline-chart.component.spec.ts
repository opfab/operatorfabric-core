import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CurstomTimelineChartComponent } from './custom-timeline-chart.component';

describe('CurstomTimelineChartComponent', () => {
  let component: CurstomTimelineChartComponent;
  let fixture: ComponentFixture<CurstomTimelineChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CurstomTimelineChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CurstomTimelineChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
