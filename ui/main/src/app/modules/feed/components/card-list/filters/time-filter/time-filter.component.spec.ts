/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {TimeFilterComponent} from './time-filter.component';
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {Store, StoreModule} from "@ngrx/store";
import {appReducer, AppState, storeConfig} from "@ofStore/index";
import {FilterService, FilterType} from "@ofServices/filter.service";
import {InitFilters} from "@ofActions/feed.actions";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {ServicesModule} from "@ofServices/services.module";
import {By} from "@angular/platform-browser";
import {buildFilterSelector} from "@ofSelectors/feed.selectors";
import {map} from "rxjs/operators";
import {hot} from "jasmine-marbles";

describe('TimeFilterComponent', () => {
    let component: TimeFilterComponent;
    let fixture: ComponentFixture<TimeFilterComponent>;
    let store: Store<AppState>;
    let filterService: FilterService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                NgbModule.forRoot(),
                FormsModule,
                ReactiveFormsModule,
                StoreModule.forRoot(appReducer, storeConfig),
                FontAwesomeModule,
                ServicesModule
            ],
            declarations: [TimeFilterComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        store = TestBed.get(Store);
        spyOn(store, 'dispatch').and.callThrough();
        filterService = TestBed.get(FilterService);
        const defaultFilters = filterService.defaultFilters;
        defaultFilters.get(FilterType.TIME_FILTER).status.start = null;
        defaultFilters.get(FilterType.TIME_FILTER).status.end = null;
        store.dispatch(new InitFilters({filters: defaultFilters}));
        fixture = TestBed.createComponent(TimeFilterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        //component state
        expect(component).toBeTruthy();
        expect(component.timeFilterForm.get('start').value).toBeNull();
        expect(component.timeFilterForm.get('end').value).toBeNull();
        //dom structure
        let debugElement = fixture.debugElement;
        expect(debugElement.queryAll(By.css('.btn'))).toBeTruthy();
        expect(debugElement.queryAll(By.css('.btn')).length).toBe(1);
    });
    it('should display popover', () => {
        //componenet state
        expect(component).toBeTruthy();
        //dom structure
        let debugElement = fixture.debugElement;
        //dom interraction
        debugElement.queryAll(By.css('.btn'))[0].triggerEventHandler('click', null);
        fixture.detectChanges();
        let formQuery = [...new Set(debugElement.queryAll(By.css('#time-filter-form')))];
        let formDivQuery = [...new Set(debugElement.queryAll(By.css('#time-filter-form > div')))];
        let checkedQuery = [...new Set(debugElement.queryAll(By.css("input[type=datetime-local]")))];
        expect(formQuery).toBeTruthy();
        expect(formQuery.length).toBe(1);
        expect(formDivQuery).toBeTruthy();
        expect(formDivQuery.length).toBe(2);
        expect(checkedQuery.length).toBe(2);
    });
    it('shouldupdate filter', () => {
        //componenet state
        expect(component).toBeTruthy();
        //dom structure
        let debugElement = fixture.debugElement;
        //dom interraction
        debugElement.queryAll(By.css('.btn'))[0].triggerEventHandler('click', null);
        fixture.detectChanges();
        const startInput = debugElement.queryAll(By.css('#time-start'));
        const dateStringValue = "2019-04-10T00:00";
        startInput[0].nativeElement.value = dateStringValue;
        startInput[0].nativeElement.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        expect(component.timeFilterForm.get('start').value).toBe(dateStringValue);
        fixture.whenStable().then(() => {
            expect(store.select(buildFilterSelector(FilterType.TYPE_FILTER)).pipe(map((filter => filter.status))))
                .toBeObservable(hot('---a', {a: {start: Date.parse(dateStringValue), end: null}}));
        });

    });
});
