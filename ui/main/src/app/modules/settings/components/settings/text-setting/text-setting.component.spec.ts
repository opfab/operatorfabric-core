/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {TextSettingComponent} from './text-setting.component';
import {Store} from "@ngrx/store";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {AppState} from "@ofStore/index";
import {of} from "rxjs";
import {settingsInitialState} from "@ofStates/settings.state";
import {map} from "rxjs/operators";
import {PatchSettings} from "@ofActions/settings.actions";
import {emptyAppState4Test, injectedSpy} from '@tests/helpers';
import {authInitialState} from "@ofStates/authentication.state";
import {configInitialState} from "@ofStates/config.state";
import createSpyObj = jasmine.createSpyObj;
import SpyObj = jasmine.SpyObj;

describe('TextSettingComponent', () => {
    let component: TextSettingComponent;
    let fixture: ComponentFixture<TextSettingComponent>;
    let mockStore: SpyObj<Store<AppState>>;
    let emptyAppState: AppState = {
        ...emptyAppState4Test,
        authentication: {...authInitialState, identifier: 'test'},
        config: configInitialState
    };
    beforeEach(waitForAsync(() => {
        const storeSpy = createSpyObj('Store', ['dispatch', 'select']);

        TestBed.configureTestingModule({
            imports: [
                FormsModule,
                ReactiveFormsModule,
            ],
            providers: [{provide: Store, useValue: storeSpy}],
            declarations: [TextSettingComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        mockStore = injectedSpy(Store) as SpyObj<Store<AppState>>;
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
        fixture = TestBed.createComponent(TextSettingComponent);
        component = fixture.componentInstance;

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
    it('should submit', (done) => {
        component.settingPath = 'test';
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

    it('should not submit with pattern validator', (done) => {
        component.settingPath = 'empty';
        component.pattern = 'fr|en';
        fixture.detectChanges();
        component.form.get('setting').setValue('de');
        setTimeout(() => {
            expect(component.form.valid).toBeFalsy();
            expect(mockStore.dispatch).toHaveBeenCalledTimes(0);
            done();
        }, 1000);

    });

    it('should submit with pattern validator', (done) => {
        component.settingPath = 'empty';
        component.pattern = 'fr|en';
        fixture.detectChanges();
        component.form.get('setting').setValue('fr');
        setTimeout(() => {
            expect(component.form.valid).toBeTruthy();
            expect(mockStore.dispatch).toHaveBeenCalledTimes(1);
            const settings = {login: 'test'};
            settings[component.settingPath] = 'fr';
            expect(mockStore.dispatch).toHaveBeenCalledWith(new PatchSettings({settings: settings}));
            done();
        }, 1000);

    });
});
