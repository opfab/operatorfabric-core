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

function computeTemplateUri(templateName) {
    return `${environment.urls.thirds}/testPublisher/templates/${templateName}`;
}

describe('Handlebars Services', () => {
    let injector: TestBed;
    let handlebarsService: HandlebarsService;
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
                })
            ],
            providers: [
                {provide: store, useClass: Store},
                ThirdsService, HandlebarsService
            ]
        });
        injector = getTestBed();
        store = TestBed.get(Store);
        spyOn(store, 'dispatch').and.callThrough();
        // avoid exceptions during construction and init of the component
        // spyOn(store, 'select').and.callFake(() => of('/test/url'));
        httpMock = injector.get(HttpTestingController);
        handlebarsService = TestBed.get(HandlebarsService);
    });
    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(handlebarsService).toBeTruthy();
    });

    describe('#executeTemplate', () => {
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
                call.flush(ifCondTemplate(v1,cond,v2));
            });
        }
        let card = getOneRandomCard({data:{
            name:'something',
            numbers:[0,1,2,3,4,5],
            numberStrings:['0','1','2','3','4','5'],
            arrays:[[],[0,1,2],['0','1','2','3']],
            booleans: [false,true],
            splitString: 'a.split.string'
        }});
        const simpleTemplate = 'English template {{data.name}}';
        const ifCondTemplate = (v1,cond,v2)=>
            `{{#ifCond ${v1} "${cond}" ${v2}}}true{{else}}false{{/ifCond}}`;
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
        it('compile add', ()=>{
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName,card)
                .subscribe((result)=>expect(result).toEqual('3'));
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call=>{
                expect(call.request.method).toBe('GET');
                call.flush('{{add data.numbers.[1] data.numbers.[2]}}');
            });
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
        it('compile fromIndex', ()=>{
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName,card)
                .subscribe((result)=>expect(result).toEqual('3'));
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call=>{
                expect(call.request.method).toBe('GET');
                call.flush('{{add data.numbers.[1] data.numbers.[2]}}');
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