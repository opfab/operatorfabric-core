/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ListSettingComponent} from './list-setting.component';
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
import createSpyObj = jasmine.createSpyObj;
import SpyObj = jasmine.SpyObj;
import {cold, hot} from "jasmine-marbles";
import {I18n} from "@ofModel/i18n.model";

describe('ListSettingComponent', () => {
    let component: ListSettingComponent;
    let fixture: ComponentFixture<ListSettingComponent>;
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
        time:null
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
            declarations: [ListSettingComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        translateService = TestBed.get(TranslateService);
        mockStore = TestBed.get(Store);
        mockStore.select.and.callFake(selector => {
            return of({
                ...emptyAppState, settings: {
                    ...settingsInitialState,
                    loaded: true,
                    settings: {
                        test: 'old-value',
                        empty: null
                    }
                }
            }).pipe(
                map(v => selector(v))
            )
        });
        fixture = TestBed.createComponent(ListSettingComponent);
        component = fixture.componentInstance;
        translateService.setTranslation('en',{neww:{value:'v1',value2:'v2'}});
        translateService.use('en');
    });

    it('should create', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });
    it('should init', (done) => {
        component.settingPath = 'test';
        fixture.detectChanges();
        expect(component).toBeTruthy();
        setTimeout(() => {
            expect(component.form.get('setting').value).toEqual('old-value');
            done();
        });
    });

    it('should compute correct value/label list : string', (done) => {
        component.settingPath = 'test';
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
        component.settingPath = 'test';
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
        component.settingPath = 'test';
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
        component.settingPath = 'test';
        component.values = ['new-value', 'new-value2'];
        fixture.detectChanges();
        // const settingInput = fixture.debugElement.queryAll(By.css('input'))[0];
        // settingInput.nativeElement.value = 'new-value';
        component.form.get('setting').setValue('new-value');
        setTimeout(() => {
            expect(component.form.valid).toBeTruthy();
            expect(mockStore.dispatch).toHaveBeenCalledTimes(1);
            const settings = {login: 'test'};
            settings[component.settingPath] = 'new-value';
            expect(mockStore.dispatch).toHaveBeenCalledWith(new PatchSettings({settings: settings}));
            done();
        }, 1000);

    });

    it('should not submit if value not in list', (done) => {
        component.settingPath = 'test';
        fixture.detectChanges();
        // const settingInput = fixture.debugElement.queryAll(By.css('input'))[0];
        // settingInput.nativeElement.value = 'new-value';
        component.form.get('setting').setValue('new-value');
        setTimeout(() => {
            expect(component.form.valid).toBeFalsy();
            expect(mockStore.dispatch).toHaveBeenCalledTimes(0);
            done();
        }, 1000);

    });

    it('should not submit with required validator', (done) => {
        component.settingPath = 'empty';
        component.requiredField = true;
        fixture.detectChanges();
        component.form.get('setting').setValue(null);
        setTimeout(() => {
            expect(component.form.valid).toBeFalsy();
            expect(mockStore.dispatch).toHaveBeenCalledTimes(0);
            done();
        }, 1000);

    });

});
