import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {MonitoringFiltersComponent} from './monitoring-filters.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DatetimeFilterModule} from '../../../../components/share/datetime-filter/datetime-filter.module';
import {MultiFilterModule} from '../../../../components/share/multi-filter/multi-filter.module';
import {appReducer, AppState, storeConfig} from '@ofStore/index';
import {Store, StoreModule} from '@ngrx/store';
import {ServicesModule} from '@ofServices/services.module';
import {HttpClientModule} from '@angular/common/http';
import {TranslateModule} from '@ngx-translate/core';

describe('MonitoringFiltersComponent', () => {
    let component: MonitoringFiltersComponent;
    let fixture: ComponentFixture<MonitoringFiltersComponent>;

    let store: Store<AppState>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [StoreModule.forRoot(appReducer, storeConfig),
                ServicesModule,
                HttpClientModule,
                TranslateModule.forRoot(),
                FormsModule,
                ReactiveFormsModule,
                DatetimeFilterModule,
                MultiFilterModule],
            declarations: [MonitoringFiltersComponent],
            providers: [
                {provide: Store, useClass: Store}
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        store = TestBed.get(Store);
        spyOn(store, 'dispatch').and.callThrough();
        fixture = TestBed.createComponent(MonitoringFiltersComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
