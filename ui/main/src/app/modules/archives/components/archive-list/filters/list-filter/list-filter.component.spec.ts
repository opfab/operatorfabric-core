/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {Store} from "@ngrx/store";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {AppState} from "@ofStore/index";
import {of, zip} from "rxjs";
import {settingsInitialState} from "@ofStates/settings.state";
import {map} from "rxjs/operators";
import {configInitialState} from "@ofStates/config.state";
import {authInitialState} from "@ofStates/authentication.state";
import {PatchSettings} from "@ofActions/settings.actions";
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {I18n} from "@ofModel/i18n.model";
import createSpyObj = jasmine.createSpyObj;
import SpyObj = jasmine.SpyObj;
import {ListFilterComponent} from "./list-filter.component";
import {archiveInitialState} from "@ofStates/archive.state";
import {UpdateArchiveFilter} from "@ofActions/archive.actions";

describe('ListFilterComponent', () => {
    let component: ListFilterComponent;
    let fixture: ComponentFixture<ListFilterComponent>;
    let mockStore: SpyObj<Store<AppState>>;
    let translateService: TranslateService;
    let emptyAppState: AppState = {
        router: null,
        feed: null,
        timeline: null,
        authentication: {...authInitialState, identifier: 'test'},
        card: null,
        menu: null,
        config: configInitialState,
        settings: null,
        time: null,
        archive: null
    }
    beforeEach(async(() => {
        const storeSpy = createSpyObj('Store', ['dispatch', 'select']);

        TestBed.configureTestingModule({
            imports: [
                TranslateModule.forRoot(),
                FormsModule,
                ReactiveFormsModule,
            ],
            providers: [{provide: Store, useValue: storeSpy}],
            declarations: [ListFilterComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        translateService = TestBed.get(TranslateService);
        mockStore = TestBed.get(Store);
        mockStore.select.and.callFake(selector => {
            return of({
                ...emptyAppState, archive: {
                    ...archiveInitialState,
                    filters: new Map<string,string[]>().set("test",["old-value"]).set("empty",null)
                }
            }).pipe(
                map(v => selector(v))
            )
        });
        fixture = TestBed.createComponent(ListFilterComponent);
        component = fixture.componentInstance;
        translateService.setTranslation('en',{neww:{value:'v1',value2:'v2'}});
        translateService.use('en');
    });

    it('should create', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });
    it('should init', (done) => {
        component.filterPath = 'test';
        fixture.detectChanges();
        expect(component).toBeTruthy();
        setTimeout(() => {
            expect(component.form.get('filter').value).toEqual(["old-value"]);
            done();
        });
    });

    it('should compute correct value/label list : string', (done) => {
        component.filterPath = 'test';
        component.values = ['new-value', 'new-value2'];
        fixture.detectChanges();
        expect(component.preparedList[0].value).toEqual('new-value');
        expect(component.preparedList[1].value).toEqual('new-value2');
        zip(component.preparedList[0].label,component.preparedList[1].label)
            .subscribe(([l1,l2])=>{
                expect(l1).toEqual('new-value');
                expect(l2).toEqual('new-value2');
                done();
            });
    });

    it('should compute correct value/label list : {value:string,label:string}', (done) => {
        component.filterPath = 'test';
        component.values = [{value:'0',label:'new-value'}, {value:'1',label:'new-value2'}];
        fixture.detectChanges();
        expect(component.preparedList[0].value).toEqual('0');
        expect(component.preparedList[1].value).toEqual('1');
        zip(component.preparedList[0].label,component.preparedList[1].label)
            .subscribe(([l1,l2])=>{
                expect(l1).toEqual('new-value');
                expect(l2).toEqual('new-value2');
                done();
            });
    });

    it('should compute correct value/label list : {value:string,label:I18n}', (done) => {
        component.filterPath = 'test';
        component.values = [{value:'0',label:new I18n('neww.value')}, {value:'1',label:new I18n('neww.value2')}];
        fixture.detectChanges();
        expect(component.preparedList[0].value).toEqual('0');
        expect(component.preparedList[1].value).toEqual('1');
        zip(component.preparedList[0].label,component.preparedList[1].label)
            .subscribe(([l1,l2])=>{
                expect(l1).toEqual('v1');
                expect(l2).toEqual('v2');
                done();
            });
    });

    it('should submit', (done) => {
        component.filterPath = 'test';
        component.values = ['new-value', 'new-value2'];
        fixture.detectChanges();
        component.form.get('filter').setValue('new-value');
        setTimeout(() => {
            expect(component.form.valid).toBeTruthy();
            expect(mockStore.dispatch).toHaveBeenCalledTimes(1);
            const filterValues = ['new-value'];
            expect(mockStore.dispatch).toHaveBeenCalledWith(new UpdateArchiveFilter({filterPath: component.filterPath, filterValues: filterValues}));
            done();
        }, 1000);

    });

    it('should not submit if value not in list', (done) => {
        component.filterPath = 'test';
        fixture.detectChanges();
        component.form.get('filter').setValue("forbidden-value");
        setTimeout(() => {
            expect(component.form.valid).toBeFalsy();
            expect(mockStore.dispatch).toHaveBeenCalledTimes(0);
            done();
        }, 1000);

    });

    it('should not submit with required validator', (done) => {
        component.filterPath = 'empty';
        component.requiredField = true;
        fixture.detectChanges();
        component.form.get('filter').setValue(null);
        setTimeout(() => {
            expect(component.form.valid).toBeFalsy();
            expect(mockStore.dispatch).toHaveBeenCalledTimes(0);
            done();
        }, 1000);

    });

});
