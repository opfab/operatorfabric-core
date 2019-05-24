import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InitChartComponent } from './init-chart.component';

describe('InitChartComponent', () => {
  let component: InitChartComponent;
  let fixture: ComponentFixture<InitChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InitChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InitChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
