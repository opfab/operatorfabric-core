/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {TagsFilterComponent} from './tags-filter.component';
import {TypeaheadModule} from "ngx-type-ahead";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {TranslateModule} from "@ngx-translate/core";
import {Store, StoreModule} from "@ngrx/store";
import {appReducer, AppState, storeConfig} from "@ofStore/index";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {ServicesModule} from "@ofServices/services.module";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {ApplyFilter, InitFilters} from "@ofActions/feed.actions";
import {FilterService, FilterType} from "@ofServices/filter.service";
import {PatchSettings} from "@ofActions/settings.actions";

describe('TagsFilterComponent', () => {
    let component: TagsFilterComponent;
    let fixture: ComponentFixture<TagsFilterComponent>;
    let store: Store<AppState>;
    let filterService: FilterService;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [TypeaheadModule,
                FormsModule,
                ReactiveFormsModule,
                TranslateModule.forRoot(),
                StoreModule.forRoot(appReducer, storeConfig),
                FontAwesomeModule,
                ServicesModule,
                HttpClientTestingModule],
            declarations: [TagsFilterComponent],
        })
            .compileComponents();
    }));

    beforeEach(() => {
        store = TestBed.get(Store);
        spyOn(store, 'dispatch').and.callThrough();
        filterService = TestBed.get(FilterService);
        const defaultFilters = filterService.defaultFilters();
        store.dispatch(new InitFilters({filters: defaultFilters}));
        fixture = TestBed.createComponent(TagsFilterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(component.tagFilterForm.get('tags').value).toEqual([]);
    });
    it('should update filter on state change', () => {
        //componenet state
        store.dispatch(new ApplyFilter({
            name: FilterType.TAG_FILTER,
            active: true,
            status: {
                tags: ["test1", "test2"]
            }
        }));
        fixture.detectChanges();
        expect(component.tagFilterForm.get('tags').value).toEqual(["test1", "test2"]);
    });
    it('should dispatch on state change', (done) => {

        //component state
        component.tagFilterForm.get('tags').setValue(['A','B']);
        setTimeout(()=> {
            expect(component.tagFilterForm.valid).toBeTruthy();
            expect(store.dispatch).toHaveBeenCalledTimes(2);
            expect(store.dispatch).toHaveBeenCalledWith(new ApplyFilter({
                name: FilterType.TAG_FILTER,
                active: true,
                status: {tags:['A','B']}
            }));
            done();
        },1000);
    });
});
