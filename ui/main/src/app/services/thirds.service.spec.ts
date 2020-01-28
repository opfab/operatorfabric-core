
import {getTestBed, TestBed} from '@angular/core/testing';

import {ThirdsI18nLoaderFactory, ThirdsService} from './thirds.service';
import {HttpClientTestingModule, HttpTestingController, TestRequest} from '@angular/common/http/testing';
import {environment} from '@env/environment';
import {TranslateLoader, TranslateModule, TranslateService} from "@ngx-translate/core";
import {RouterTestingModule} from "@angular/router/testing";
import {Store, StoreModule} from "@ngrx/store";
import {appReducer, AppState} from "@ofStore/index";
import {generateThirdWithVersion, getOneRandomLigthCard, getRandomAlphanumericValue} from "@tests/helpers";
import * as _ from 'lodash';
import {LoadLightCardsSuccess} from "@ofActions/light-card.actions";
import {LightCard} from "@ofModel/light-card.model";
import {AuthenticationService} from "@ofServices/authentication/authentication.service";
import {GuidService} from "@ofServices/guid.service";
import {Third, ThirdMenu, ThirdMenuEntry} from "@ofModel/thirds.model";
import {EffectsModule} from "@ngrx/effects";
import {MenuEffects} from "@ofEffects/menu.effects";
import {UpdateTranslation} from "@ofActions/translate.actions";
import {TranslateEffects} from "@ofEffects/translate.effects";

describe('Thirds Services', () => {
    let injector: TestBed;
    let thirdsService: ThirdsService;
    let translateService: TranslateService;
    let httpMock: HttpTestingController;
    let store: Store<AppState>;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                StoreModule.forRoot(appReducer),
                EffectsModule.forRoot([MenuEffects, TranslateEffects]),
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
                AuthenticationService,
                GuidService
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
    });
    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(thirdsService).toBeTruthy();
    });
    describe('#computeThirdsMenu', () => {
        it('should return message on network problem', () => {
            thirdsService.computeThirdsMenu().subscribe(
                result => fail('expected message not raised'),
                error => expect(error.status).toBe(0));
            let calls = httpMock.match(req => req.url == `${environment.urls.thirds}/`);
            expect(calls.length).toEqual(1);
            calls[0].error(new ErrorEvent('Network message'))
        });
        it('should compute menu from thirds data', () => {
            thirdsService.computeThirdsMenu().subscribe(
                result => {
                    expect(result.length).toBe(2);
                    expect(result[0].label).toBe('tLabel1');
                    expect(result[0].id).toBe('t1');
                    expect(result[1].label).toBe('tLabel2');
                    expect(result[1].id).toBe('t2');
                    expect(result[0].entries.length).toBe(2);
                    expect(result[1].entries.length).toBe(1);
                    expect(result[0].entries[0].label).toBe('label1');
                    expect(result[0].entries[0].id).toBe('id1');
                    expect(result[0].entries[0].url).toBe('link1');
                    expect(result[0].entries[1].label).toBe('label2');
                    expect(result[0].entries[1].id).toBe('id2');
                    expect(result[0].entries[1].url).toBe('link2');
                    expect(result[1].entries[0].label).toBe('label3');
                    expect(result[1].entries[0].id).toBe('id3');
                    expect(result[1].entries[0].url).toBe('link3');
                });
            let calls = httpMock.match(req => req.url == `${environment.urls.thirds}/`);
            expect(calls.length).toEqual(1);
            calls[0].flush([
                new Third(
                    't1', '', 'tLabel1', [], [], [],
                    [new ThirdMenuEntry('id1', 'label1', 'link1'),
                        new ThirdMenuEntry('id2', 'label2', 'link2')]
                ),
                new Third(
                    't2', '', 'tLabel2', [], [], [],
                    [new ThirdMenuEntry('id3', 'label3', 'link3')]
                )
            ])
        });

    });
    describe('#fetchHbsTemplate', () => {
        const templates = {
            en: 'English template {{card.data.name}}',
            fr: 'Template Français {{card.data.name}}'
        };
        it('should return different files for each language', () => {
            thirdsService.fetchHbsTemplate('testPublisher', '0', 'testTemplate', 'en')
                .subscribe((result) => expect(result).toEqual('English template {{card.data.name}}'))
            thirdsService.fetchHbsTemplate('testPublisher', '0', 'testTemplate', 'fr')
                .subscribe((result) => expect(result).toEqual('Template Français {{card.data.name}}'))
            let calls = httpMock.match(req => req.url == `${environment.urls.thirds}/testPublisher/templates/testTemplate`)
            expect(calls.length).toEqual(2);
            calls.forEach(call => {
                expect(call.request.method).toBe('GET');
                call.flush(templates[call.request.params.get('locale')]);
            })
        })
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
        const translationToUpdate = generateThirdWithVersion(card.publisher, new Set([card.publisherVersion]));
        store.dispatch(
            new UpdateTranslation({versions: translationToUpdate})
        );
        let calls = httpMock.match(req => req.url == `${environment.urls.thirds}/testPublisher/i18n`);
        expect(calls.length).toEqual(2);

        expect(calls[0].request.method).toBe('GET');
        flushI18nJson(calls[0], i18n);
        expect(calls[1].request.method).toBe('GET');
        flushI18nJson(calls[1], i18n);
        setTimeout(() => {
            expect(setTranslationSpy.calls.count()).toEqual(2);
            translateService.use('fr')
            translateService.get(cardPrefix(card) + card.title.key)
                .subscribe(value => expect(value).toEqual('titre fr'))
            translateService.get(cardPrefix(card) + card.summary.key)
                .subscribe(value => expect(value).toEqual('résumé fr'))
            translateService.use('en')
            translateService.get(cardPrefix(card) + card.title.key)
                .subscribe(value => expect(value).toEqual('en title'))
            translateService.get(cardPrefix(card) + card.summary.key)
                .subscribe(value => expect(value).toEqual('en summary'))
            done();
        }, 1000);
    });
    
    it('should compute url with encoding special characters', () => {
        const urlFromPublishWithSpaces = thirdsService.computeThirdCssUrl('publisher with spaces'
            , getRandomAlphanumericValue(3, 12)
            , getRandomAlphanumericValue(2.5));
        expect(urlFromPublishWithSpaces.includes(' ')).toEqual(false);
        let dico = new Map();
        dico.set('À', '%C3%80');
        dico.set('à', '%C3%A0');
        dico.set('É', '%C3%89');
        dico.set('é', '%C3%A9');
        dico.set('È', '%C3%88');
        dico.set('è', '%C3%A8');
        dico.set('Â', '%C3%82');
        dico.set('â', '%C3%A2');
        dico.set('Ô', '%C3%94');
        dico.set('ô', '%C3%B4');
        dico.set('Ù', '%C3%99');
        dico.set('ù', '%C3%B9');
        dico.set('Ï', '%C3%8F');
        dico.set('ï', '%C3%AF');
        let stringToTest = "";
        for (let char of dico.keys()) {
            stringToTest += char;
        }
        const urlFromPublishWithAccentuatedChar = thirdsService.computeThirdCssUrl(`publisherWith${stringToTest}`
            , getRandomAlphanumericValue(3, 12)
            , getRandomAlphanumericValue(3, 4));
        dico.forEach((value, key) => {
            expect(urlFromPublishWithAccentuatedChar.includes(key)).toEqual(false);
            //`should normally contain '${value}'`
            expect(urlFromPublishWithAccentuatedChar.includes(value)).toEqual(true);
        });
        const urlWithSpacesInVersion = thirdsService.computeThirdCssUrl(getRandomAlphanumericValue(5, 12), getRandomAlphanumericValue(5.12),
            'some spaces in version');
        expect(urlWithSpacesInVersion.includes(' ')).toEqual(false);

        const urlWithAccentuatedCharsInVersion = thirdsService.computeThirdCssUrl(getRandomAlphanumericValue(5, 12), getRandomAlphanumericValue(5.12)
            , `${stringToTest}InVersion`);
        dico.forEach((value, key) => {
            expect(urlWithAccentuatedCharsInVersion.includes(key)).toEqual(false);
            //`should normally contain '${value}'`
            expect(urlWithAccentuatedCharsInVersion.includes(value)).toEqual(true);
        });

    });
    describe('#queryThird', () => {
        const third = new Third('testPublisher', '0', 'third.label');
        it('should load third from remote server', () => {
            thirdsService.queryThird('testPublisher', '0',)
                .subscribe((result) => expect(result).toEqual(third))
            let calls = httpMock.match(req => req.url == `${environment.urls.thirds}/testPublisher/`)
            expect(calls.length).toEqual(1);
            calls.forEach(call => {
                expect(call.request.method).toBe('GET');
                call.flush(third);
            })
        })
    });
    describe('#queryThird', () => {
        const third = new Third('testPublisher', '0', 'third.label');
        it('should load and cache third from remote server', () => {
            thirdsService.queryThird('testPublisher', '0',)
                .subscribe((result) => {
                    expect(result).toEqual(third);
                    thirdsService.queryThird('testPublisher', '0',)
                        .subscribe((result) => expect(result).toEqual(third));
                })
            let calls = httpMock.match(req => req.url == `${environment.urls.thirds}/testPublisher/`)
            expect(calls.length).toEqual(1);
            calls.forEach(call => {
                expect(call.request.method).toBe('GET');
                call.flush(third);
            })
        })
    });

    describe('#queryMenuEntryURL', () => {

        it('should retrieve menu entry url if provided parameters are correct', (done) => {
            const third = new Third(
                't1', '', 'tLabel1', [], [], [],
                [new ThirdMenuEntry('id1', 'label1', 'link1'),
                    new ThirdMenuEntry('id2', 'label2', 'link2')]
            )
            thirdsService.queryMenuEntryURL('t1', '1', 'id2').subscribe(
                result => {
                    expect(result).toBe('link2');
                    done();
                }
            )
            let calls = httpMock.match(req => req.url == `${environment.urls.thirds}/t1/`);
            expect(calls.length).toEqual(1);
            calls[0].flush(third)
        })

    })

})
;

function flushI18nJson(request: TestRequest, json: any, prefix?: string) {
    const locale = request.request.params.get('locale');
    console.debug(`flushing ${request.request.urlWithParams}`);
    console.debug(`request is ${request.cancelled ? '' : 'not'} canceled`);
    request.flush(_.get(json, prefix ? `${locale}.${prefix}` : locale));
}

function cardPrefix(card: LightCard) {
    return card.publisher + '.' + card.publisherVersion + '.';
}

function thirdPrefix(menu: ThirdMenu) {
    return menu.id + '.' + menu.version + '.';
}
