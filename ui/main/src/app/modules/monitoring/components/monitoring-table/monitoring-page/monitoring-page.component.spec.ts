import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitoringPageComponent } from './monitoring-page.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DatetimeFilterModule} from '../../../../../components/share/datetime-filter/datetime-filter.module';
import {MultiFilterModule} from '../../../../../components/share/multi-filter/multi-filter.module';

describe('MonitoringPageComponent', () => {
  let component: MonitoringPageComponent;
  let fixture: ComponentFixture<MonitoringPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports:[                FormsModule,
        ReactiveFormsModule,
        DatetimeFilterModule,
        MultiFilterModule],
      declarations: [ MonitoringPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonitoringPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
