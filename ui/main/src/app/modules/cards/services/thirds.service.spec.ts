import {getTestBed, TestBed} from '@angular/core/testing';

import {ThirdsI18nLoaderFactory, ThirdsService} from './thirds.service';
import {HttpClientTestingModule, HttpTestingController, TestRequest} from '@angular/common/http/testing';
import {environment} from '@env/environment';
import {TranslateLoader, TranslateModule, TranslateService} from "@ngx-translate/core";
import {RouterTestingModule} from "@angular/router/testing";
import {Store, StoreModule} from "@ngrx/store";
import {appReducer, AppState} from "@ofStore/index";
import {getOneRandomLigthCard} from "@tests/helpers";
import * as _ from 'lodash';
import {LoadLightCardsSuccess} from "@ofActions/light-card.actions";
import {LightCard} from "@ofModel/light-card.model";
import {ServicesModule} from "@ofServices/services.module";

describe('Thirds Services', () => {
    let injector: TestBed;
    let thirdsService: ThirdsService;
    let translateService: TranslateService;
    let httpMock: HttpTestingController;
    let store: Store<AppState>;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                ServicesModule,
                StoreModule.forRoot(appReducer),
                HttpClientTestingModule,
                RouterTestingModule,
                TranslateModule.forRoot({
                    loader: {
                        provide: TranslateLoader,
                        useFactory: ThirdsI18nLoaderFactory,
                        deps: [ThirdsService]
                    },
                    useDefaultLang: false
                })],
            providers: [
                {provide: store, useClass: Store},
                ThirdsService,
            ]
        });
        injector = getTestBed();
        store = TestBed.get(Store);
        spyOn(store, 'dispatch').and.callThrough();
        // avoid exceptions during construction and init of the component
        // spyOn(store, 'select').and.callFake(() => of('/test/url'));
        httpMock = injector.get(HttpTestingController);
        thirdsService = TestBed.get(ThirdsService);
        translateService = injector.get(TranslateService);
        translateService.addLangs(["en", "fr"]);
        translateService.setDefaultLang("en");
        translateService.use("en");
        thirdsService.init();
    });
    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(thirdsService).toBeTruthy();
    });
    describe('#fetchHbsTemplate', () => {
        const templates = {en:'English template {{card.data.name}}',
        fr:'Template Français {{card.data.name}}'};
       it('should return different files for each language',()=>{
           thirdsService.fetchHbsTemplate('testPublisher','0','testTemplate','en')
               .subscribe((result)=>expect(result).toEqual('English template {{card.data.name}}'))
           thirdsService.fetchHbsTemplate('testPublisher','0','testTemplate','fr')
               .subscribe((result)=>expect(result).toEqual('Template Français {{card.data.name}}'))
           let calls = httpMock.match(req => req.url == `${environment.urls.thirds}/testPublisher/templates/testTemplate`)
           expect(calls.length).toEqual(2);
           calls.forEach(call=>{
               expect(call.request.method).toBe('GET');
               call.flush(templates[call.request.params.get('locale')]);
           })
        })
    });
    describe('#fetchI18nJson', () => {
        it('should return json object with single en language', () => {
            thirdsService.fetchI18nJson('testPublisher', '0', ['en'])
                .subscribe(result => {
                    expect(result.en.testPublisher['0'].menu.feed).toEqual('Feed')
                    expect(result.en.testPublisher['0'].menu.archives).toEqual('Archives')
                });

            let calls = httpMock.match(req => req.url == `${environment.urls.thirds}/testPublisher/i18n`)
            expect(calls.length).toEqual(1);
            expect(calls[0].request.method).toBe('GET');
            calls[0].flush({
                menu: {
                    feed: 'Feed',
                    archives: 'Archives'
                }
            });
        });
        it('should return json object with multiple languages', () => {
            thirdsService.fetchI18nJson('testPublisher', '0', ['en', 'fr'])
                .subscribe(result => {
                    expect(result.en.testPublisher['0'].menu.feed).toEqual('Feed')
                    expect(result.en.testPublisher['0'].menu.archives).toEqual('Archives')
                    expect(result.fr.testPublisher['0'].menu.feed).toEqual('Flux de Cartes')
                    expect(result.fr.testPublisher['0'].menu.archives).toEqual('Archives')
                });

            let calls = httpMock.match(req => req.url == `${environment.urls.thirds}/testPublisher/i18n`)
            expect(calls.length).toEqual(2);

            expect(calls[0].request.method).toBe('GET');
            expect(calls[0].request.params.get('locale')).toEqual('en');
            calls[0].flush({
                menu: {
                    feed: 'Feed',
                    archives: 'Archives'
                }
            });
            // req = httpMock.expectOne(`${environment.urls.thirds}/thirds/testPublisher/i18n`)
            expect(calls[1].request.method).toBe('GET');
            expect(calls[1].request.params.get('locale')).toEqual('fr');
            calls[1].flush({
                menu: {
                    feed: 'Flux de Cartes',
                    archives: 'Archives'
                }
            });
        });
    });
    it('should update translate service upon new card arrival', (done) => {
        let card = getOneRandomLigthCard();
        let i18n = {}
        _.set(i18n, `en.${card.title.key}`, 'en title');
        _.set(i18n, `en.${card.summary.key}`, 'en summary');
        _.set(i18n, `fr.${card.title.key}`, 'titre fr');
        _.set(i18n, `fr.${card.summary.key}`, 'résumé fr');
        const setTranslationSpy = spyOn(translateService, "setTranslation").and.callThrough();
        const getLangsSpy = spyOn(translateService, "getLangs").and.callThrough();
        store.dispatch(new LoadLightCardsSuccess({lightCards: [card]}));
        let calls = httpMock.match(req => req.url == `${environment.urls.thirds}/testPublisher/i18n`)
        expect(calls.length).toEqual(2);

        expect(calls[0].request.method).toBe('GET');
        flushI18nJson(calls[0], i18n);
        expect(calls[1].request.method).toBe('GET');
        flushI18nJson(calls[1], i18n);
        setTimeout(() => {
            expect(setTranslationSpy.calls.count()).toEqual(2);
            translateService.use('fr')
            translateService.get(prefix(card) + card.title.key)
                .subscribe(value => expect(value).toEqual('titre fr'))
            translateService.get(prefix(card) + card.summary.key)
                .subscribe(value => expect(value).toEqual('résumé fr'))
            translateService.use('en')
            translateService.get(prefix(card) + card.title.key)
                .subscribe(value => expect(value).toEqual('en title'))
            translateService.get(prefix(card) + card.summary.key)
                .subscribe(value => expect(value).toEqual('en summary'))
            done();
        }, 1000);
    });
    it('should update translate service upon new card arrival only if new publisher detected', (done) => {
        let card = getOneRandomLigthCard();
        let i18n = {}
        _.set(i18n, `en.${card.title.key}`, 'en title');
        _.set(i18n, `en.${card.summary.key}`, 'en summary');
        _.set(i18n, `fr.${card.title.key}`, 'titre fr');
        _.set(i18n, `fr.${card.summary.key}`, 'résumé fr');
        const setTranslationSpy = spyOn(translateService, "setTranslation").and.callThrough();
        const getLangsSpy = spyOn(translateService, "getLangs").and.callThrough();
        store.dispatch(new LoadLightCardsSuccess({lightCards: [card]}));
        let calls = httpMock.match(req => req.url == `${environment.urls.thirds}/testPublisher/i18n`);
        expect(calls.length).toEqual(2);

        expect(calls[0].request.method).toBe('GET');
        flushI18nJson(calls[0], i18n);
        expect(calls[1].request.method).toBe('GET');
        flushI18nJson(calls[1], i18n);
        store.dispatch(new LoadLightCardsSuccess({lightCards: [card]}));
        httpMock.expectNone(`${environment.urls.thirds}/testPublisher/i18n`);
        setTimeout(() => {
            expect(setTranslationSpy.calls.count()).toEqual(2);
            translateService.use('fr')
            translateService.get(prefix(card) + card.title.key)
                .subscribe(value => expect(value).toEqual('titre fr'))
            translateService.get(prefix(card) + card.summary.key)
                .subscribe(value => expect(value).toEqual('résumé fr'))
            translateService.use('en')
            translateService.get(prefix(card) + card.title.key)
                .subscribe(value => expect(value).toEqual('en title'))
            translateService.get(prefix(card) + card.summary.key)
                .subscribe(value => expect(value).toEqual('en summary'))
            done();
        }, 1000);
    });

});

function flushI18nJson(request: TestRequest, json: any) {
    const locale = request.request.params.get('locale');
    request.flush(json[locale]);
}

function prefix(card: LightCard) {
    return card.publisher + '.' + card.publisherVersion + '.';
}