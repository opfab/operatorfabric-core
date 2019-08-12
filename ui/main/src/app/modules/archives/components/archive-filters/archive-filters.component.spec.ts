import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchiveFiltersComponent } from './archive-filters.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MultiFilterComponent } from './multi-filter/multi-filter.component';
import { DatetimeFilterComponent } from './datetime-filter/datetime-filter.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { AppState } from '@ofStore/index';

describe('ArchiveFiltersComponent', () => {
  let component: ArchiveFiltersComponent;
  let fixture: ComponentFixture<ArchiveFiltersComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        FormsModule,
        NgbModule
      ],
      declarations: [ ArchiveFiltersComponent, MultiFilterComponent, DatetimeFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArchiveFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create 1', () => {
    expect(component).toBeTruthy();
  });
});
