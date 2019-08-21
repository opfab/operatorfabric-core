
import {async, ComponentFixture, getTestBed, TestBed} from '@angular/core/testing';
import { ArchiveFiltersComponent, FilterDateTypes, checkElement, transformToTimestamp } from './archive-filters.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MultiFilterComponent } from './multi-filter/multi-filter.component';
import { DatetimeFilterComponent } from './datetime-filter/datetime-filter.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Store, StoreModule } from '@ngrx/store';
import { appReducer, AppState } from '@ofStore/index';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { ThirdsI18nLoaderFactory, ThirdsService } from '@ofServices/thirds.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TimeService } from '@ofServices/time.service';
import { Router } from '@angular/router';
import SpyObj = jasmine.SpyObj;
import { I18nService } from '@ofServices/i18n.service';
import { ServicesModule } from '@ofServices/services.module';
import { RouterTestingModule } from '@angular/router/testing';
import createSpyObj = jasmine.createSpyObj;

describe('ArchiveFiltersComponent', () => {
  let component: ArchiveFiltersComponent;
  let fixture: ComponentFixture<ArchiveFiltersComponent>;
  let store: Store<AppState>;
  let router: SpyObj<Router>;
  let injector: TestBed;
  let translateService: TranslateService;
  let i18nService: I18nService;

  beforeEach(async(() => {
    const routerSpy = createSpyObj('Router', ['navigate']);
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        ServicesModule,
        StoreModule.forRoot(appReducer),
        RouterTestingModule,
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
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
      declarations: [
        ArchiveFiltersComponent,
        MultiFilterComponent,
        DatetimeFilterComponent
      ],
      providers: [
        {provide: store, useClass: Store},
        {provide: Router, useValue: routerSpy},
        ThirdsService,
        {provide: 'TimeEventSource', useValue: null},
        TimeService,
        I18nService
      ]}).compileComponents();
      store = TestBed.get(Store);
      spyOn(store, 'dispatch').and.callThrough();
      injector = getTestBed();
      translateService = injector.get(TranslateService);
      translateService.addLangs(['en', 'fr']);
      translateService.setDefaultLang('en');
      // translateService.use("en");
      i18nService = injector.get(I18nService);
      i18nService.changeLocale('en', 'Europe/Paris');

    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ArchiveFiltersComponent);
        component = fixture.debugElement.componentInstance;
        router = TestBed.get(Router);
    });

  it('should convert the filters object to a map if the map is empty', () => {
    // if all field forms are missing, the map should be empty
    const objectToSend = {activeFrom: '', activeTo: '', process: null, publishDateFrom: '', publishDateTo: '', publisher: ''};
    const expectedMap = component.filtersToMap(objectToSend);
    expect(expectedMap.size).toEqual(0);
  });
  it('should convert the filters object to a map if the map is empty', () => {
    // if all field forms are missing, the map should be empty
    const time = {hour: 3, minute: 3, second: 0};
    const date = {day: 12, month: 6, year: 2010};
    const objectToSend = {
      activeFrom: {time, date}, activeTo: '', process: null, publishDateFrom: '', publishDateTo: '',
      publisher: ['publisher1', 'publisher2']
    };
    console.log(objectToSend);
    const expectedMap = component.filtersToMap(objectToSend);
    console.log(expectedMap);
    expect(expectedMap.size).toEqual(2);
  });
  it('should check if element is in enum', () => {
    const enumTypes = FilterDateTypes;
    const toCheck = 'publishDateFrom';
    const notExisted = 'notExisted';
    expect(checkElement(enumTypes, toCheck)).toEqual(true);
    expect(checkElement(enumTypes, notExisted)).toEqual(false);
  });
  it('should transform ngb bootstrap date to string', () => {
    const time = {hour: 3, minute: 3, second: 0};
    const date = {day: 12, month: 6, year: 2010};
    const expected = transformToTimestamp(date, time);
    expect(expected).toEqual('2010-06-12T03:03');
  });

});
