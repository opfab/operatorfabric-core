
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
import {IconComponent} from './components/navbar/icon/icon.component';
import {TranslateModule} from '@ngx-translate/core';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {I18nService} from '@ofServices/i18n.service';
import {Title} from '@angular/platform-browser';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {emptyAppState4Test} from '@tests/helpers';
import {AuthenticationImportHelperForSpecs} from '@ofServices/authentication/authentication.service.spec';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import createSpyObj = jasmine.createSpyObj;
import {AuthenticationService} from '@ofServices/authentication/authentication.service';


describe('AppComponent', () => {

    let store: Store<AppState>;
    let fixture;

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
                RouterTestingModule,
                HttpClientTestingModule
            ],
            declarations: [AppComponent, NavbarComponent, IconComponent],
            providers: [{provide: store, useClass: Store}, I18nService, AuthenticationImportHelperForSpecs],
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
    const authServiceSpy = createSpyObj('AuthenticationService', ['intializeAuthentication',
        'linkAuthenticationStatus']);

    let titleService: Title;

    const initialState = {
        ...emptyAppState4Test
        , authentication: { expirationDate: null}
    } as AppState;
    /* Using authInitialState to declare expirationDate (required) caused an error because it is not
    * defined in this scope.*/

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
                {provide: I18nService, useValue: i18nServiceSpy},
                Title,
                {provide: AuthenticationService, useValue: authServiceSpy}],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
        store = TestBed.get(Store);
        fixture = TestBed.createComponent(AppComponent);
        titleService = TestBed.get(Title);
    }));

    it(`should have the title 'toto' as set in Config service`, async(() => {

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

    it(`should have the default title 'OperatorFabric' when title is set to '' in Config service`,
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

    it(`should have the default title 'OperatorFabric' when title parameter not present in Config service`,
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

