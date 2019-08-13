import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchiveFiltersComponent } from './archive-filters.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MultiFilterComponent } from './multi-filter/multi-filter.component';
import { DatetimeFilterComponent } from './datetime-filter/datetime-filter.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Store, StoreModule } from '@ngrx/store';
import { appReducer, storeConfig } from '@ofStore/index';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { ThirdsI18nLoaderFactory, ThirdsService } from '@ofServices/thirds.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

xdescribe('ArchiveFiltersComponent', () => {
  let component: ArchiveFiltersComponent;
  let fixture: ComponentFixture<ArchiveFiltersComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        StoreModule.forRoot(appReducer, storeConfig),
        FormsModule,
        HttpClientTestingModule,
        NgbModule,
        TranslateModule.forRoot({
          loader: {
              provide: TranslateLoader,
              useFactory: ThirdsI18nLoaderFactory,
              deps: [ThirdsService]
          },
          useDefaultLang: false
        })
      ],
      declarations: [ ArchiveFiltersComponent, MultiFilterComponent, DatetimeFilterComponent ],
      providers: [
        {provide: Store, useClass: Store},
        ThirdsService
      ]
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
