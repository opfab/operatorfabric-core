/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {FiltersComponent} from './filters.component';
import {TypeFilterComponent} from "./type-filter/type-filter.component";
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NO_ERRORS_SCHEMA} from "@angular/core";
import {Store, StoreModule} from "@ngrx/store";
import {appReducer, AppState, storeConfig} from "@ofStore/index";
import {FilterService} from "@ofServices/filter.service";
import {InitFilters} from "@ofActions/feed.actions";

describe('FiltersComponent', () => {
    let component: FiltersComponent;
    let fixture: ComponentFixture<FiltersComponent>;
    let filterService: FilterService;
    let store: Store<AppState>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                NgbModule.forRoot(),
                FormsModule,
                ReactiveFormsModule,
                StoreModule.forRoot(appReducer, storeConfig)],
            declarations: [FiltersComponent, TypeFilterComponent],
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        store = TestBed.get(Store);
        spyOn(store, 'dispatch').and.callThrough();
        filterService = TestBed.get(FilterService);
        store.dispatch(new InitFilters({filters:filterService.defaultFilters()}));
        fixture = TestBed.createComponent(FiltersComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
