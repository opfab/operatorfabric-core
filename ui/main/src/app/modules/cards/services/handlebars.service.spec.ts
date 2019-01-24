import {getTestBed, TestBed} from '@angular/core/testing';

import {ThirdsI18nLoaderFactory, ThirdsService} from './thirds.service';
import {HttpClientTestingModule, HttpTestingController, TestRequest} from '@angular/common/http/testing';
import {environment} from '@env/environment';
import {TranslateLoader, TranslateModule, TranslateService} from "@ngx-translate/core";
import {RouterTestingModule} from "@angular/router/testing";
import {Store, StoreModule} from "@ngrx/store";
import {appReducer, AppState} from "@ofStore/index";
import {getOneRandomCard, getOneRandomLigthCard} from "@tests/helpers";
import * as _ from 'lodash';
import {LoadLightCardsSuccess} from "@ofActions/light-card.actions";
import {LightCard} from "@ofModel/light-card.model";
import {ServicesModule} from "@ofServices/services.module";
import {HandlebarsService} from "./handlebars.service";
import {Guid} from "guid-typescript";
import {TimeService} from "@ofServices/time.service";
import {I18n} from "@ofModel/i18n.model";
import * as moment from "moment";

function computeTemplateUri(templateName) {
    return `${environment.urls.thirds}/testPublisher/templates/${templateName}`;
}

describe('Handlebars Services', () => {
    let injector: TestBed;
    let handlebarsService: HandlebarsService;
    let httpMock: HttpTestingController;
    let store: Store<AppState>;
    let time: TimeService;
    let translate: TranslateService;
    const now = Date.now();
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
                })
            ],
            providers: [
                {provide: store, useClass: Store},
                {provide: time, useClass: TimeService},
                ThirdsService, HandlebarsService
            ]
        });
        injector = getTestBed();
        store = TestBed.get(Store);
        spyOn(store, 'dispatch').and.callThrough();
        time = TestBed.get(TimeService);
        spyOn(time, "currentTime").and.returnValue(now);
        // avoid exceptions during construction and init of the component
        // spyOn(store, 'select').and.callFake(() => of('/test/url'));
        httpMock = injector.get(HttpTestingController);
        handlebarsService = TestBed.get(HandlebarsService);
        translate = TestBed.get(TranslateService)
    });
    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(handlebarsService).toBeTruthy();
    });

    describe('#executeTemplate', () => {
        let card = getOneRandomCard({data:{
            name:'something',
            numbers:[0,1,2,3,4,5],
            unsortedNumbers:[2, 1, 4, 0, 5, 3],
            numberStrings:['0','1','2','3','4','5'],
            arrays:[[],[0,1,2],['0','1','2','3']],
            booleans: [false,true],
            splitString: 'a.split.string',
            pythons: {john: { firstName: "John", lastName: "Cleese"},
                graham: { firstName: "Graham", lastName: "Chapman"},
                terry1: { firstName: "Terry", lastName: "Gillian"},
                eric: { firstName: "Eric", lastName: "Idle"},
                terry2: { firstName: "Terry", lastName: "Jones"},
                michael: { firstName: "Michael", lastName: "Palin"}},
            pythons2: {john: "Cleese",
                graham:  "Chapman",
                terry1:  "Gillian",
                eric:  "Idle",
                terry2:  "Jones",
                michael:  "Palin"},
            i18n: new I18n("value",{param: "BAR"})
        }});
        const simpleTemplate = 'English template {{data.name}}';
       it('compile simple template',()=>{
           handlebarsService.executeTemplate('testTemplate',card)
               .subscribe((result)=>expect(result).toEqual('English template something'));
           let calls = httpMock.match(req => req.url == computeTemplateUri('testTemplate'));
           expect(calls.length).toEqual(1);
           calls.forEach(call=>{
               expect(call.request.method).toBe('GET');
               call.flush(simpleTemplate);
           });
           handlebarsService.executeTemplate('testTemplate',card)
               .subscribe((result)=>expect(result).toEqual('English template something'));
        })
        function expectIfCond(card, v1, cond, v2, expectedResult:string) {
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName, card)
                .subscribe((result) => {
                    // console.log(`testing [${v1} ${cond} ${v2}], result ${result}, expected ${expectedResult}`);
                    expect(result).toEqual(expectedResult,
                        `Expected result to be ${expectedResult} when testing [${v1} ${cond} ${v2}]`);
                });
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call => {
                expect(call.request.method).toBe('GET');
                call.flush(`{{#if (bool ${v1} "${cond}" ${v2})}}true{{else}}false{{/if}}`);
            });
        }
        it('complile polyIf helper ==',()=>{
            expectIfCond(card, 'data.numbers.[0]', '==', 'data.numbers.[0]', 'true');
            expectIfCond(card, 'data.numbers.[0]', '==', 'data.numbers.[1]', 'false');
            expectIfCond(card, 'data.numbers.[0]', '==', 'data.numberStrings.[0]', 'true');
        });
        it('complile polyIf helper ===',()=>{
            expectIfCond(card, 'data.numbers.[0]', '===', 'data.numbers.[0]', 'true');
            expectIfCond(card, 'data.numbers.[0]', '===', 'data.numberStrings.[0]', 'false');
        });
        it('complile polyIf helper <',()=>{
            // expectIfCond(card, 'data.numbers.[0]', '<', 'data.numbers.[1]', 'true');
            expectIfCond(card, 'data.numbers.[0]', '<', 'data.numberStrings.[1]', 'true');
            expectIfCond(card, 'data.numbers.[1]', '<', 'data.numbers.[0]', 'false');
            expectIfCond(card, 'data.numbers.[1]', '<', 'data.numbers.[1]', 'false');
        });
        it('complile polyIf helper >',()=>{
            expectIfCond(card, 'data.numbers.[1]', '>', 'data.numbers.[0]', 'true');
            expectIfCond(card, 'data.numbers.[1]', '>', 'data.numberStrings.[0]', 'true');
            expectIfCond(card, 'data.numbers.[0]', '>', 'data.numbers.[1]', 'false');
            expectIfCond(card, 'data.numbers.[1]', '>', 'data.numbers.[1]', 'false');
        });
        it('complile polyIf helper <=',()=>{
            expectIfCond(card, 'data.numbers.[0]', '<=', 'data.numbers.[1]', 'true');
            expectIfCond(card, 'data.numbers.[0]', '<=', 'data.numberStrings.[1]', 'true');
            expectIfCond(card, 'data.numbers.[1]', '<=', 'data.numbers.[0]', 'false');
            expectIfCond(card, 'data.numbers.[1]', '<=', 'data.numbers.[1]', 'true');
            expectIfCond(card, 'data.numbers.[1]', '<=', 'data.numberStrings.[1]', 'true');
        });
        it('complile polyIf helper >=',()=>{
            expectIfCond(card, 'data.numbers.[1]', '>=', 'data.numbers.[0]', 'true');
            expectIfCond(card, 'data.numbers.[1]', '>=', 'data.numberStrings.[0]', 'true');
            expectIfCond(card, 'data.numbers.[0]', '>=', 'data.numbers.[1]', 'false');
            expectIfCond(card, 'data.numbers.[1]', '>=', 'data.numbers.[1]', 'true');
            expectIfCond(card, 'data.numbers.[1]', '>=', 'data.numberStrings.[1]', 'true');
        });
        it('complile polyIf helper !=',()=>{
            expectIfCond(card, 'data.numbers.[0]', '!=', 'data.numbers.[0]', 'false');
            expectIfCond(card, 'data.numbers.[0]', '!=', 'data.numbers.[1]', 'true');
            expectIfCond(card, 'data.numbers.[0]', '!=', 'data.numberStrings.[0]', 'false');
        });
        it('complile polyIf helper !==',()=>{
            expectIfCond(card, 'data.numbers.[0]', '!==', 'data.numbers.[0]', 'false');
            expectIfCond(card, 'data.numbers.[0]', '!==', 'data.numberStrings.[0]', 'true');
        });
        it('complile polyIf helper &&',()=>{
            expectIfCond(card, 'data.booleans.[0]', '&&', 'data.booleans.[0]', 'false');
            expectIfCond(card, 'data.booleans.[0]', '&&', 'data.numbers.[0]', 'false');
            expectIfCond(card, 'data.booleans.[0]', '&&', 'data.numberStrings.[0]', 'false');
            expectIfCond(card, 'data.booleans.[0]', '&&', 'data.booleans.[1]', 'false');
            expectIfCond(card, 'data.booleans.[1]', '&&', 'data.booleans.[1]', 'true');
            expectIfCond(card, 'data.booleans.[1]', '&&', 'data.numbers.[2]', 'true');
            expectIfCond(card, 'data.booleans.[1]', '&&', 'data.numberStrings.[3]', 'true');
        });
        it('complile polyIf helper ||',()=>{
            expectIfCond(card, 'data.booleans.[0]', '||', 'data.booleans.[0]', 'false');
            expectIfCond(card, 'data.booleans.[0]', '||', 'data.numbers.[0]', 'false');
            expectIfCond(card, 'data.booleans.[0]', '||', 'data.numberStrings.[0]', 'true');
            expectIfCond(card, 'data.booleans.[0]', '||', 'data.booleans.[1]', 'true');
            expectIfCond(card, 'data.booleans.[0]', '||', 'data.numberStrings.[1]', 'true');
            expectIfCond(card, 'data.booleans.[1]', '||', 'data.booleans.[1]', 'true');
            expectIfCond(card, 'data.booleans.[1]', '||', 'data.numbers.[2]', 'true');
            expectIfCond(card, 'data.booleans.[1]', '||', 'data.numberStrings.[3]', 'true');
        });
        it('compile arrayAtIndexLength', ()=>{
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName,card)
                .subscribe((result)=>expect(result).toEqual('3'));
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call=>{
                expect(call.request.method).toBe('GET');
                call.flush('{{arrayAtIndexLength data.arrays 1}}');
            });
        })
        it('compile arrayAtIndexLength Alt', ()=>{
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName,card)
                .subscribe((result)=>expect(result).toEqual('3'));
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call=>{
                expect(call.request.method).toBe('GET');
                call.flush('{{data.arrays.1.length}}');
            });
        });
        it('compile split', ()=>{
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName,card)
                .subscribe((result)=>expect(result).toEqual('split'));
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call=>{
                expect(call.request.method).toBe('GET');
                call.flush('{{split data.splitString "." 1}}');
            });
        });
        function expectMath(v1,op,v2,expectedResult){
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName,card)
                .subscribe((result)=>expect(result).toEqual(`${expectedResult}`));
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call=>{
                expect(call.request.method).toBe('GET');
                call.flush(`{{math ${v1} "${op}" ${v2}}}`);
            });
        }
        it('compile math +', ()=>{
            expectMath('data.numbers.[1]','+','data.numbers.[2]','3');
        });
        it('compile math -', ()=>{
            expectMath('data.numbers.[1]','-','data.numbers.[2]','-1');
        });
        it('compile math *', ()=>{
            expectMath('data.numbers.[1]','*','data.numbers.[2]','2');
        });
        it('compile math /', ()=>{
            expectMath('data.numbers.[1]','/','data.numbers.[2]','0.5');
        });
        it('compile math %', ()=>{
            expectMath('data.numbers.[1]','%','data.numbers.[2]','1');
        });
        it('compile arrayAtIndex', ()=>{
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName,card)
                .subscribe((result)=>expect(result).toEqual('2'));
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call=>{
                expect(call.request.method).toBe('GET');
                call.flush('{{arrayAtIndex data.numbers 2}}');
            });
        });
        it('compile arrayAtIndex alt', ()=>{
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName,card)
                .subscribe((result)=>expect(result).toEqual('2'));
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call=>{
                expect(call.request.method).toBe('GET');
                call.flush('{{data.numbers.[2]}}');
            });
        });
        it('compile slice', ()=>{
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName,card)
                .subscribe((result)=>expect(result).toEqual('2 3 '));
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call=>{
                expect(call.request.method).toBe('GET');
                call.flush('{{#each (slice data.numbers 2 4)}}{{this}} {{/each}}');
            });
        });

        it('compile sliceEnd', ()=>{
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName,card)
                .subscribe((result)=>expect(result).toEqual('2 3 4 5 '));
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call=>{
                expect(call.request.method).toBe('GET');
                call.flush('{{#each (sliceEnd data.numbers 2)}}{{this}} {{/each}}');
            });
        });

        it('compile each sort no field', ()=>{
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName,card)
                .subscribe((result)=>expect(result).toEqual('Idle Chapman Cleese Palin Gillian Jones '));
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call=>{
                expect(call.request.method).toBe('GET');
                call.flush('{{#each (sort data.pythons)}}{{lastName}} {{/each}}');
            });
        });
        it('compile each sort primitive properties', ()=>{
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName,card)
                .subscribe((result)=>expect(result).toEqual('Idle Chapman Cleese Palin Gillian Jones '));
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call=>{
                expect(call.request.method).toBe('GET');
                call.flush('{{#each (sort data.pythons2)}}{{value}} {{/each}}');
            });
        });

        it('compile each sort primitive array', ()=>{
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName,card)
                .subscribe((result)=>expect(result).toEqual('0 1 2 3 4 5 '));
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call=>{
                expect(call.request.method).toBe('GET');
                call.flush('{{#each (sort data.unsortedNumbers)}}{{this}} {{/each}}');
            });
        });

        it('compile each sort', ()=>{
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName,card)
                .subscribe((result)=>expect(result).toEqual('Chapman Cleese Gillian Idle Jones Palin '));
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call=>{
                expect(call.request.method).toBe('GET');
                call.flush('{{#each (sort data.pythons "lastName")}}{{lastName}} {{/each}}');
            });
        });
        it('compile i18n', ()=>{
            translate.setTranslation("en",{
                value: {subValue: "English value"}
            });
            translate.use("en");
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName,card)
                .subscribe((result)=>expect(result).toEqual('English value'));
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call=>{
                expect(call.request.method).toBe('GET');
                call.flush('{{i18n "value" "subValue"}}');
            });
        });
        it('compile i18n with parameters', ()=>{
            translate.setTranslation("en",{
                value: "English value: {{param}}"
            });
            translate.use("en");
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName,card)
                .subscribe((result)=>expect(result).toEqual('English value: FOO'));
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call=>{
                expect(call.request.method).toBe('GET');
                call.flush('{{i18n "value" param="FOO"}}');
            });
        });
        it('compile i18n with i18n object', ()=>{
            translate.setTranslation("en",{
                value: "English value: {{param}}"
            });
            translate.use("en");
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName,card)
                .subscribe((result)=>expect(result).toEqual('English value: BAR'));
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call=>{
                expect(call.request.method).toBe('GET');
                call.flush('{{i18n data.i18n}}');
            });
        });
        it('compile numberFormat', ()=>{
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName,card)
                .subscribe((result)=>{
                    expect(result)
                        .toEqual(new Intl.NumberFormat(translate.getBrowserLang(), {style:"currency", currency:"EUR"})
                            .format(5))
                });
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call=>{
                expect(call.request.method).toBe('GET');
                call.flush('{{numberFormat data.numbers.[5] style="currency" currency="EUR"}}');
            });
        });
        it('compile dateFormat now', ()=>{
            const nowMoment = moment(new Date(now));
            nowMoment.locale(translate.getBrowserLang())
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName,card)
                .subscribe((result)=>{
                    expect(result).toEqual(nowMoment.format('MMMM Do YYYY, h:mm:ss a'))
                });
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call=>{
                expect(call.request.method).toBe('GET');
                call.flush('{{dateFormat (now "") format="MMMM Do YYYY, h:mm:ss a"}}');
            });
        });
        it('compile preserveSpace', ()=>{
            const nowMoment = moment(new Date(now));
            nowMoment.locale(translate.getBrowserLang())
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName,card)
                .subscribe((result)=>{
                    expect(result).toEqual('\u00A0\u00A0\u00A0')
                });
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call=>{
                expect(call.request.method).toBe('GET');
                call.flush('{{preserveSpace "   "}}');
            });
        });
    });

});

function flushI18nJson(request: TestRequest, json: any) {
    const locale = request.request.params.get('locale');
    request.flush(json[locale]);
}

function prefix(card: LightCard) {
    return card.publisher + '.' + card.publisherVersion + '.';
}