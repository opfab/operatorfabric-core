/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {TextSettingComponent} from './text-setting.component';
import {Store} from "@ngrx/store";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {AppState} from "@ofStore/index";
import {of} from "rxjs";
import {settingsInitialState} from "@ofStates/settings.state";
import {map, timeout} from "rxjs/operators";
import {configInitialState} from "@ofStates/config.state";
import createSpyObj = jasmine.createSpyObj;
import SpyObj = jasmine.SpyObj;
import {authInitialState} from "@ofStates/authentication.state";

describe('TextSettingComponent', () => {
    let component: TextSettingComponent;
    let fixture: ComponentFixture<TextSettingComponent>;
    let mockStore:SpyObj<Store<AppState>>;
    let emptyAppState: AppState = {
        router: null,
        feed: null,
        timeline: null,
        authentication: {...authInitialState, identifier: 'test'},
        card: null,
        menu: null,
        config: configInitialState,
        settings: null,
    }
    beforeEach(async(() => {
    const storeSpy = createSpyObj('Store', ['dispatch', 'select']);

        TestBed.configureTestingModule({
            imports: [
                FormsModule,
                ReactiveFormsModule,
            ],
            providers:[{provide: Store, useValue: storeSpy}],
            declarations: [TextSettingComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        mockStore = TestBed.get(Store);
        mockStore.select.and.callFake(selector=>{
            return of({
                ...emptyAppState, settings: {
                    ...settingsInitialState,
                    loaded: true,
                    settings: {
                        test: 'old-value'
                    }
                }
            }).pipe(
                map(v => selector(v))
            )
        });
        fixture = TestBed.createComponent(TextSettingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should init', (done) => {
        component.settingPath = 'test';
        component.ngOnInit();
        fixture.detectChanges();
        expect(component).toBeTruthy();
        setTimeout(()=>{
            expect(component.form.get('setting').value).toEqual('old-value');
            done();
        });
    });
});
