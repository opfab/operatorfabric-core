/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {TypeFilterComponent} from './type-filter.component';
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {Store, StoreModule} from "@ngrx/store";
import {appReducer, AppState, storeConfig} from "@ofStore/index";
import {FilterService, FilterType} from "@ofServices/filter.service";
import {InitFilters} from "@ofActions/feed.actions";
import {map} from "rxjs/operators";
import {By} from "@angular/platform-browser";
import {buildFilterSelector} from "@ofSelectors/feed.selectors";
import {cold} from "jasmine-marbles";

describe('TypeFilterComponent', () => {
    let component: TypeFilterComponent;
    let fixture: ComponentFixture<TypeFilterComponent>;
    let store: Store<AppState>;
    let filterService: FilterService;


    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                NgbModule.forRoot(),
                FormsModule,
                ReactiveFormsModule,
                StoreModule.forRoot(appReducer, storeConfig)],
            providers: [{provide: Store, useClass: Store}, FilterService],
            declarations: [TypeFilterComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        store = TestBed.get(Store);
        spyOn(store, 'dispatch').and.callThrough();
        filterService = TestBed.get(FilterService);
        store.dispatch(new InitFilters({filters: filterService.defaultFilters()}));
        fixture = TestBed.createComponent(TypeFilterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        //componenet state
        expect(component).toBeTruthy();
        expect(component.typeFilterForm.get('alarm').value).toBe(true);
        expect(component.typeFilterForm.get('action').value).toBe(true);
        expect(component.typeFilterForm.get('compliant').value).toBe(true);
        expect(component.typeFilterForm.get('information').value).toBe(true);
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
        let formQuery = [...new Set(debugElement.queryAll(By.css('#type-filter-form')))];
        let formDivQuery = [...new Set(debugElement.queryAll(By.css('#type-filter-form > div')))];
        let checkedQuery = [...new Set(debugElement.queryAll(By.css("input[type=checkbox]:checked")))];
        let uncheckedQuery = [...new Set(debugElement.queryAll(By.css("input[type=checkbox]:not(:checked)")))];
        expect(formQuery).toBeTruthy();
        expect(formQuery.length).toBe(1);
        expect(formDivQuery).toBeTruthy();
        expect(formDivQuery.length).toBe(4);
        expect(checkedQuery.length).toBe(4);
        expect(uncheckedQuery.length).toBe(0);
    });
    it('should update filter', (done) => {
        //component state
        expect(component).toBeTruthy();
        //dom structure
        let debugElement = fixture.debugElement;
        //dom interraction
        debugElement.queryAll(By.css('.btn'))[0].triggerEventHandler('click', null);
        fixture.detectChanges();
        const informationCheckboxQuery = debugElement.queryAll(By.css('#type-information'));
        informationCheckboxQuery[0].nativeElement.click();
        fixture.detectChanges();
        expect(component.typeFilterForm.get('information').value).toBe(false);
        setTimeout(() => {
            const expectedObs = cold('b', {b: {alarm: true, action: true, compliant: true, information: false}});

            const selectTypeFilter = store.select(buildFilterSelector(FilterType.TYPE_FILTER));
            expect(selectTypeFilter.pipe(map((filter => filter.status)))).toBeObservable(expectedObs);
            done();
        },1000);

    });
});
