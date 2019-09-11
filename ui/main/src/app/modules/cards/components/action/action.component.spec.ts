import {async, ComponentFixture, getTestBed, TestBed} from '@angular/core/testing';

import {ActionComponent} from './action.component';
import {NgbModal, NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {CommonModule} from "@angular/common";
import {TranslateLoader, TranslateModule, TranslateService} from "@ngx-translate/core";
import {UtilitiesModule} from "../../../utilities/utilities.module";
import {ThirdsI18nLoaderFactory, ThirdsService} from "@ofServices/thirds.service";
import {ThirdActionService} from "@ofServices/third-action.service";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {StoreModule} from "@ngrx/store";
import {appReducer} from "@ofStore/index";
import {Action, emptyAction} from "@ofModel/thirds.model";
import {AuthenticationService} from "@ofServices/authentication.service";
import {GuidService} from "@ofServices/guid.service";
import createSpyObj = jasmine.createSpyObj;
import {I18nService} from "@ofServices/i18n.service";
import {I18n} from "@ofModel/i18n.model";

describe('ActionComponent', () => {
    let component: ActionComponent;
    let fixture: ComponentFixture<ActionComponent>;
    let modalMock: NgbModal;
    let thirdActionMock: ThirdActionService;
    let translateService: TranslateService;
    let i18nService: I18nService;

    beforeEach(async(() => {
        modalMock = createSpyObj('NgBModal', ['open', 'dismissAll', 'hasOpenModals']);
        thirdActionMock = createSpyObj('ThirdActionService', ['submit']);
        TestBed.configureTestingModule({
            imports: [NgbModule,
                CommonModule,
                TranslateModule.forRoot({
                    loader: {
                        provide: TranslateLoader,
                        useFactory: ThirdsI18nLoaderFactory,
                        deps: [ThirdsService]
                    },
                    useDefaultLang: false
                }),
                UtilitiesModule,
                StoreModule.forRoot(appReducer),
                HttpClientTestingModule
            ],
            declarations: [ActionComponent],
            providers: [{provide: ThirdActionService, useValue: thirdActionMock}
                , {provide: NgbModal, useValue: modalMock}
                , ThirdsService
                , AuthenticationService
                , GuidService
                , I18nService
            ]
        })
            .compileComponents();
        const injector = getTestBed();
        translateService = injector.get(TranslateService);
        translateService.addLangs(['en', 'fr']);
        translateService.setDefaultLang('en');
        // translateService.use("en");
        i18nService = injector.get(I18nService);
        i18nService.changeLocale('en', 'Europe/Paris');

    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ActionComponent);
        component = fixture.componentInstance;

    });

    it('should create and call submit of ThirdActionService', () => {
        const actionUrlPath = `testActionUrl`;
        const key = 'testkey';
        const action = {
            ...emptyAction
            , key: key
            , label: new I18n(key)
        } as Action;

        component.actionUrlPath = actionUrlPath;
        component.action = action;
        component.lightCardId = 'testABCD';
        fixture.detectChanges();


        expect(component).toBeTruthy();
        component.submit();
        expect(thirdActionMock.submit).toBeDefined();
        expect(thirdActionMock.submit).toHaveBeenCalled();
        expect(thirdActionMock.submit).toHaveBeenCalledWith('testABCD', `${actionUrlPath}/${key}`, action, modalMock);
    });
});
