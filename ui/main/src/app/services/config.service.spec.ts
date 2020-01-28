
import {getTestBed, TestBed} from '@angular/core/testing';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {environment} from '../../environments/environment';
import {Store, StoreModule} from "@ngrx/store";
import {appReducer, AppState} from "../store/index";
import {ConfigService} from "@ofServices/config.service";
import {AcceptLogIn, PayloadForSuccessfulAuthentication} from "@ofActions/authentication.actions";

describe('Thirds Services', () => {
    let injector: TestBed;
    let configService: ConfigService;
    let httpMock: HttpTestingController;
    let store: Store<AppState>;
    let config = {
        level1:{
            level2: 'value'
        }
    };
    let url = `${environment.urls.config}`;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                StoreModule.forRoot(appReducer),
                HttpClientTestingModule,
                // RouterTestingModule,
                ],
            providers: [
                // {provide: store, useClass: Store},
                ConfigService,
            ]
        });
        injector = getTestBed();
        store = TestBed.get(Store);
        // spyOn(store, 'dispatch').and.callThrough();
        // avoid exceptions during construction and init of the component
        // spyOn(store, 'select').and.callFake(() => of('/test/url'));
        httpMock = injector.get(HttpTestingController);
        configService = TestBed.get(ConfigService);
        store.dispatch(new AcceptLogIn(new PayloadForSuccessfulAuthentication('test-user',null,null,null)))
    });
    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(configService).toBeTruthy();
    });
    describe('#fetchConfiguration', () => {
        it('should return configuration on 200', () => {
            configService.fetchConfiguration().subscribe(
                result => expect(eval(result)).toBe(config)
            )
            let calls = httpMock.match(req => req.url == url);
            expect(calls.length).toEqual(1);
            calls[0].flush(config);
        });

    });
})
;

