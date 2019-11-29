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
import {Title} from "@angular/platform-browser";
import createSpyObj = jasmine.createSpyObj;
import {MockStore, provideMockStore} from "@ngrx/store/testing";
import {emptyAppState4Test} from "@tests/helpers";
import {authInitialState} from "@ofStates/authentication.state";


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
            return of(null);
        }
    );
        fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;
    }));

    it('should create the app', async(() => {
        const app = fixture.debugElement.componentInstance;
        expect(app).toBeTruthy();
    }));

    it(`should have the title 'OperatorFabric' by default`, async(() => {
      const app = fixture.debugElement.componentInstance;
      expect(app.title).toEqual('OperatorFabric');
    }));

    it('should init the app', async(() => {
        const app = fixture.debugElement.componentInstance;
        app.ngOnInit();
        fixture.detectChanges();
        expect(app).toBeTruthy();
    }));

});

describe('AppComponent', () => {

    let store: MockStore<AppState>;
    let fixture;
    const i18nServiceSpy = createSpyObj('i18NService', ['changeLocale']);

    let titleService: Title;

    const initialState = {
        ...emptyAppState4Test
        , authentication: {...authInitialState}
    };
    beforeEach(async(() => {
        TestBed.resetTestEnvironment();
        TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());

        TestBed.configureTestingModule({
            imports: [
                NgbModule.forRoot(),
                // solution 4 RouterTestingModule: https://github.com/coreui/coreui-free-bootstrap-admin-template/issues/202
                RouterTestingModule
            ],
            declarations: [AppComponent],
            providers: [
                provideMockStore({initialState}),
                {provide: I18nService, useValue: i18nServiceSpy}
                , Title],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
        store = TestBed.get(Store);
        fixture = TestBed.createComponent(AppComponent);
        titleService = TestBed.get(Title);
    }));

    it(`should have the title 'toto' as setted in Config microservice`, async(() => {

        store.setState({
            ...initialState
            , config: {
                loading: false,
                loaded: false,
                error: null,
                retry: 0,
                config: {title: 'toto'}
            }
        });
        fixture.detectChanges();
        expect(titleService.getTitle()).toEqual('toto');
    }));

    it(`should have the default title 'OperatorFabric' (because of '' setted as title in Config microservice)`,
        async(() => {

        store.setState({
            ...initialState
            , config: {
                loading: false,
                loaded: false,
                error: null,
                retry: 0,
                config: {title: ''}
            }
        });
        fixture.detectChanges();
        expect(titleService.getTitle()).toEqual('OperatorFabric');
    }));

    it(`should have the default title 'OperatorFabric' (because of title parameter not present in Config microservice)`,
        async(() => {

            store.setState({
                ...initialState
                , config: {
                    loading: false,
                    loaded: false,
                    error: null,
                    retry: 0,
                    config: {}
                }
            });
            fixture.detectChanges();
            expect(titleService.getTitle()).toEqual('OperatorFabric');
        }));
});

