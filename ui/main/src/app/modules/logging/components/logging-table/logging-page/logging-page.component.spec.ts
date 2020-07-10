import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {LoggingPageComponent} from './logging-page.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DatetimeFilterModule} from '../../../../../components/share/datetime-filter/datetime-filter.module';
import {MultiFilterModule} from '../../../../../components/share/multi-filter/multi-filter.module';
import {Store, StoreModule} from '@ngrx/store';
import {appReducer, AppState, storeConfig} from '@ofStore/index';
import {ServicesModule} from '@ofServices/services.module';
import {HttpClientModule} from '@angular/common/http';
import {TranslateModule} from '@ngx-translate/core';
import {RouterTestingModule} from '@angular/router/testing';
import {StoreRouterConnectingModule} from '@ngrx/router-store';
import {NO_ERRORS_SCHEMA} from '@angular/core';

describe('LoggingPageComponent', () => {
    let component: LoggingPageComponent;
    let fixture: ComponentFixture<LoggingPageComponent>;
  let store: Store<AppState>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [StoreModule.forRoot(appReducer, storeConfig),
                ServicesModule,
                HttpClientModule,
                TranslateModule.forRoot(),
              RouterTestingModule,
              StoreRouterConnectingModule,
              FormsModule,
                ReactiveFormsModule,
                DatetimeFilterModule,
                MultiFilterModule],
            declarations: [LoggingPageComponent],
          schemas: [ NO_ERRORS_SCHEMA ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
      store = TestBed.get(Store);
      spyOn(store, 'dispatch').and.callThrough();
          fixture = TestBed.createComponent(LoggingPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
