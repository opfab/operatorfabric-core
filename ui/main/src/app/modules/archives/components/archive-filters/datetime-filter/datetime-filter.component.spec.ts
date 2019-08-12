import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatetimeFilterComponent } from './datetime-filter.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

describe('DatetimeFilterComponent', () => {
  let component: DatetimeFilterComponent;
  let fixture: ComponentFixture<DatetimeFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        FormsModule,
        NgbModule
      ],
      declarations: [ DatetimeFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatetimeFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create datetime-filter component', () => {
    expect(component).toBeTruthy();
  });
});
