/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {async, TestBed} from '@angular/core/testing';
import {AppComponent} from './app.component';
import {RouterTestingModule} from '@angular/router/testing';
import {Store, StoreModule} from '@ngrx/store';
import {appReducer, AppState} from '@ofStore/index';
import {BrowserDynamicTestingModule, platformBrowserDynamicTesting} from '@angular/platform-browser-dynamic/testing';
import {of} from 'rxjs';
import {NavbarComponent} from './components/navbar/navbar.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {selectCurrentUrl} from '@ofSelectors/router.selectors';
import {IconComponent} from "./components/icon/icon.component";
import {TranslateModule} from "@ngx-translate/core";
import {NO_ERRORS_SCHEMA} from "@angular/core";
import {I18nService} from "@ofServices/i18n.service";


describe('AppComponent', () => {

    let store: Store<AppState>;

    let fixture;

    let component;

    beforeEach(async(() => {
        TestBed.resetTestEnvironment();
        TestBed.initTestEnvironment(BrowserDynamicTestingModule,
            platformBrowserDynamicTesting());
        TestBed.configureTestingModule({
            imports: [
                NgbModule.forRoot(),
                StoreModule.forRoot(appReducer),
                TranslateModule.forRoot(),
                // solution 4 RouterTestingModule: https://github.com/coreui/coreui-free-bootstrap-admin-template/issues/202
                RouterTestingModule
            ],
            declarations: [AppComponent,NavbarComponent, IconComponent],
            providers: [{provide: store, useClass: Store},I18nService],
            schemas: [ NO_ERRORS_SCHEMA ]
        }).compileComponents();
        store = TestBed.get(Store);
        spyOn(store, 'dispatch').and.callThrough();
        // avoid exceptions during construction and init of the component
        spyOn(store, 'select').and.callFake((obj) => {
            if (obj === selectCurrentUrl) {
                // called in ngOnInit and passed to mat-tab-url
                return of('/test/url');
            }
            return of({});
        }
    );
        fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;
    }));

    it('should create the app', async(() => {
        const app = fixture.debugElement.componentInstance;
        expect(app).toBeTruthy();
    }));

    it(`should have as title 'OperatorFabric'`, async(() => {
      const app = fixture.debugElement.componentInstance;
      expect(app.title).toEqual('OperatorFabric');
    }));

    it('should init the app', async(() => {
        const app = fixture.debugElement.componentInstance;
        app.ngOnInit()
        fixture.detectChanges();
        expect(app).toBeTruthy();
    }));

});
