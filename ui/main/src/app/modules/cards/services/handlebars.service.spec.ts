/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {getTestBed, TestBed} from '@angular/core/testing';

import {ThirdsI18nLoaderFactory, ThirdsService} from '../../../services/thirds.service';
import {HttpClientTestingModule, HttpTestingController, TestRequest} from '@angular/common/http/testing';
import {environment} from '@env/environment';
import {TranslateLoader, TranslateModule, TranslateService} from "@ngx-translate/core";
import {RouterTestingModule} from "@angular/router/testing";
import {Store, StoreModule} from "@ngrx/store";
import {appReducer, AppState} from "@ofStore/index";
import {getOneRandomCard} from "@tests/helpers";
import {LightCard} from "@ofModel/light-card.model";
import {ServicesModule} from "@ofServices/services.module";
import {HandlebarsService} from "./handlebars.service";
import {Guid} from "guid-typescript";
import {TimeService} from "@ofServices/time.service";
import {I18n} from "@ofModel/i18n.model";
import * as moment from "moment";
import {UserContext} from "@ofModel/user-context.model";
import {DetailContext} from "@ofModel/detail-context.model";

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
                {provide:'TimeEventSource',useValue:null},
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
        let userContext = new UserContext('jdoe','token','John', 'Doe');
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
        const simpleTemplate = 'English template {{card.data.name}}';
       it('compile simple template',()=>{
           handlebarsService.executeTemplate('testTemplate', new DetailContext(card,userContext))
               .subscribe((result)=>expect(result).toEqual('English template something'));
           let calls = httpMock.match(req => req.url == computeTemplateUri('testTemplate'));
           expect(calls.length).toEqual(1);
           calls.forEach(call=>{
               expect(call.request.method).toBe('GET');
               call.flush(simpleTemplate);
           });
           handlebarsService.executeTemplate('testTemplate', new DetailContext(card,userContext))
               .subscribe((result)=>expect(result).toEqual('English template something'));
        })
        function expectIfCond(card, v1, cond, v2, expectedResult:string) {
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName, new DetailContext(card,userContext))
                .subscribe((result) => {
                    console.debug(`testing [${v1} ${cond} ${v2}], result ${result}, expected ${expectedResult}`);
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
            expectIfCond(card, 'card.data.numbers.[0]', '==', 'card.data.numbers.[0]', 'true');
            expectIfCond(card, 'card.data.numbers.[0]', '==', 'card.data.numbers.[1]', 'false');
            expectIfCond(card, 'card.data.numbers.[0]', '==', 'card.data.numberStrings.[0]', 'true');
        });
        it('complile polyIf helper ===',()=>{
            expectIfCond(card, 'card.data.numbers.[0]', '===', 'card.data.numbers.[0]', 'true');
            expectIfCond(card, 'card.data.numbers.[0]', '===', 'card.data.numberStrings.[0]', 'false');
        });
        it('complile polyIf helper <',()=>{
            // expectIfCond(card, 'card.data.numbers.[0]', '<', 'card.data.numbers.[1]', 'true');
            expectIfCond(card, 'card.data.numbers.[0]', '<', 'card.data.numberStrings.[1]', 'true');
            expectIfCond(card, 'card.data.numbers.[1]', '<', 'card.data.numbers.[0]', 'false');
            expectIfCond(card, 'card.data.numbers.[1]', '<', 'card.data.numbers.[1]', 'false');
        });
        it('complile polyIf helper >',()=>{
            expectIfCond(card, 'card.data.numbers.[1]', '>', 'card.data.numbers.[0]', 'true');
            expectIfCond(card, 'card.data.numbers.[1]', '>', 'card.data.numberStrings.[0]', 'true');
            expectIfCond(card, 'card.data.numbers.[0]', '>', 'card.data.numbers.[1]', 'false');
            expectIfCond(card, 'card.data.numbers.[1]', '>', 'card.data.numbers.[1]', 'false');
        });
        it('complile polyIf helper <=',()=>{
            expectIfCond(card, 'card.data.numbers.[0]', '<=', 'card.data.numbers.[1]', 'true');
            expectIfCond(card, 'card.data.numbers.[0]', '<=', 'card.data.numberStrings.[1]', 'true');
            expectIfCond(card, 'card.data.numbers.[1]', '<=', 'card.data.numbers.[0]', 'false');
            expectIfCond(card, 'card.data.numbers.[1]', '<=', 'card.data.numbers.[1]', 'true');
            expectIfCond(card, 'card.data.numbers.[1]', '<=', 'card.data.numberStrings.[1]', 'true');
        });
        it('complile polyIf helper >=',()=>{
            expectIfCond(card, 'card.data.numbers.[1]', '>=', 'card.data.numbers.[0]', 'true');
            expectIfCond(card, 'card.data.numbers.[1]', '>=', 'card.data.numberStrings.[0]', 'true');
            expectIfCond(card, 'card.data.numbers.[0]', '>=', 'card.data.numbers.[1]', 'false');
            expectIfCond(card, 'card.data.numbers.[1]', '>=', 'card.data.numbers.[1]', 'true');
            expectIfCond(card, 'card.data.numbers.[1]', '>=', 'card.data.numberStrings.[1]', 'true');
        });
        it('complile polyIf helper !=',()=>{
            expectIfCond(card, 'card.data.numbers.[0]', '!=', 'card.data.numbers.[0]', 'false');
            expectIfCond(card, 'card.data.numbers.[0]', '!=', 'card.data.numbers.[1]', 'true');
            expectIfCond(card, 'card.data.numbers.[0]', '!=', 'card.data.numberStrings.[0]', 'false');
        });
        it('complile polyIf helper !==',()=>{
            expectIfCond(card, 'card.data.numbers.[0]', '!==', 'card.data.numbers.[0]', 'false');
            expectIfCond(card, 'card.data.numbers.[0]', '!==', 'card.data.numberStrings.[0]', 'true');
        });
        it('complile polyIf helper &&',()=>{
            expectIfCond(card, 'card.data.booleans.[0]', '&&', 'card.data.booleans.[0]', 'false');
            expectIfCond(card, 'card.data.booleans.[0]', '&&', 'card.data.numbers.[0]', 'false');
            expectIfCond(card, 'card.data.booleans.[0]', '&&', 'card.data.numberStrings.[0]', 'false');
            expectIfCond(card, 'card.data.booleans.[0]', '&&', 'card.data.booleans.[1]', 'false');
            expectIfCond(card, 'card.data.booleans.[1]', '&&', 'card.data.booleans.[1]', 'true');
            expectIfCond(card, 'card.data.booleans.[1]', '&&', 'card.data.numbers.[2]', 'true');
            expectIfCond(card, 'card.data.booleans.[1]', '&&', 'card.data.numberStrings.[3]', 'true');
        });
        it('complile polyIf helper ||',()=>{
            expectIfCond(card, 'card.data.booleans.[0]', '||', 'card.data.booleans.[0]', 'false');
            expectIfCond(card, 'card.data.booleans.[0]', '||', 'card.data.numbers.[0]', 'false');
            expectIfCond(card, 'card.data.booleans.[0]', '||', 'card.data.numberStrings.[0]', 'true');
            expectIfCond(card, 'card.data.booleans.[0]', '||', 'card.data.booleans.[1]', 'true');
            expectIfCond(card, 'card.data.booleans.[0]', '||', 'card.data.numberStrings.[1]', 'true');
            expectIfCond(card, 'card.data.booleans.[1]', '||', 'card.data.booleans.[1]', 'true');
            expectIfCond(card, 'card.data.booleans.[1]', '||', 'card.data.numbers.[2]', 'true');
            expectIfCond(card, 'card.data.booleans.[1]', '||', 'card.data.numberStrings.[3]', 'true');
        });
        it('compile arrayAtIndexLength', ()=>{
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName, new DetailContext(card,userContext))
                .subscribe((result)=>expect(result).toEqual('3'));
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call=>{
                expect(call.request.method).toBe('GET');
                call.flush('{{arrayAtIndexLength card.data.arrays 1}}');
            });
        })
        it('compile arrayAtIndexLength Alt', ()=>{
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName, new DetailContext(card,userContext))
                .subscribe((result)=>expect(result).toEqual('3'));
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call=>{
                expect(call.request.method).toBe('GET');
                call.flush('{{card.data.arrays.1.length}}');
            });
        });
        it('compile split', ()=>{
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName, new DetailContext(card,userContext))
                .subscribe((result)=>expect(result).toEqual('split'));
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call=>{
                expect(call.request.method).toBe('GET');
                call.flush('{{split card.data.splitString "." 1}}');
            });
        });
        function expectMath(v1,op,v2,expectedResult){
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName, new DetailContext(card,userContext))
                .subscribe((result)=>expect(result).toEqual(`${expectedResult}`));
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call=>{
                expect(call.request.method).toBe('GET');
                call.flush(`{{math ${v1} "${op}" ${v2}}}`);
            });
        }
        it('compile math +', ()=>{
            expectMath('card.data.numbers.[1]','+','card.data.numbers.[2]','3');
        });
        it('compile math -', ()=>{
            expectMath('card.data.numbers.[1]','-','card.data.numbers.[2]','-1');
        });
        it('compile math *', ()=>{
            expectMath('card.data.numbers.[1]','*','card.data.numbers.[2]','2');
        });
        it('compile math /', ()=>{
            expectMath('card.data.numbers.[1]','/','card.data.numbers.[2]','0.5');
        });
        it('compile math %', ()=>{
            expectMath('card.data.numbers.[1]','%','card.data.numbers.[2]','1');
        });
        it('compile arrayAtIndex', ()=>{
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName, new DetailContext(card,userContext))
                .subscribe((result)=>expect(result).toEqual('2'));
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call=>{
                expect(call.request.method).toBe('GET');
                call.flush('{{arrayAtIndex card.data.numbers 2}}');
            });
        });
        it('compile arrayAtIndex alt', ()=>{
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName, new DetailContext(card,userContext))
                .subscribe((result)=>expect(result).toEqual('2'));
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call=>{
                expect(call.request.method).toBe('GET');
                call.flush('{{card.data.numbers.[2]}}');
            });
        });
        it('compile slice', ()=>{
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName, new DetailContext(card,userContext))
                .subscribe((result)=>expect(result).toEqual('2 3 '));
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call=>{
                expect(call.request.method).toBe('GET');
                call.flush('{{#each (slice card.data.numbers 2 4)}}{{this}} {{/each}}');
            });
        });

        it('compile slice to end', ()=>{
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName, new DetailContext(card,userContext))
                .subscribe((result)=>expect(result).toEqual('2 3 4 5 '));
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call=>{
                expect(call.request.method).toBe('GET');
                call.flush('{{#each (slice card.data.numbers 2)}}{{this}} {{/each}}');
            });
        });

        it('compile each sort no field', ()=>{
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName, new DetailContext(card,userContext))
                .subscribe((result)=>expect(result).toEqual('Idle Chapman Cleese Palin Gillian Jones '));
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call=>{
                expect(call.request.method).toBe('GET');
                call.flush('{{#each (sort card.data.pythons)}}{{lastName}} {{/each}}');
            });
        });
        it('compile each sort primitive properties', ()=>{
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName, new DetailContext(card,userContext))
                .subscribe((result)=>expect(result).toEqual('Idle Chapman Cleese Palin Gillian Jones '));
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call=>{
                expect(call.request.method).toBe('GET');
                call.flush('{{#each (sort card.data.pythons2)}}{{value}} {{/each}}');
            });
        });

        it('compile each sort primitive array', ()=>{
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName, new DetailContext(card,userContext))
                .subscribe((result)=>expect(result).toEqual('0 1 2 3 4 5 '));
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call=>{
                expect(call.request.method).toBe('GET');
                call.flush('{{#each (sort card.data.unsortedNumbers)}}{{this}} {{/each}}');
            });
        });

        it('compile each sort', ()=>{
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName, new DetailContext(card,userContext))
                .subscribe((result)=>expect(result).toEqual('Chapman Cleese Gillian Idle Jones Palin '));
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call=>{
                expect(call.request.method).toBe('GET');
                call.flush('{{#each (sort card.data.pythons "lastName")}}{{lastName}} {{/each}}');
            });
        });
        it('compile i18n', ()=>{
            translate.setTranslation("en",{
                value: {subValue: "English value"}
            });
            translate.use("en");
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName, new DetailContext(card,userContext))
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
            handlebarsService.executeTemplate(templateName, new DetailContext(card,userContext))
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
            handlebarsService.executeTemplate(templateName, new DetailContext(card,userContext))
                .subscribe((result)=>expect(result).toEqual('English value: BAR'));
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call=>{
                expect(call.request.method).toBe('GET');
                call.flush('{{i18n card.data.i18n}}');
            });
        });
        it('compile numberFormat', ()=>{
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName, new DetailContext(card,userContext))
                .subscribe((result)=>{
                    expect(result)
                        .toEqual(new Intl.NumberFormat(translate.getBrowserLang(), {style:"currency", currency:"EUR"})
                            .format(5))
                });
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call=>{
                expect(call.request.method).toBe('GET');
                call.flush('{{numberFormat card.data.numbers.[5] style="currency" currency="EUR"}}');
            });
        });
        it('compile dateFormat now', ()=>{
            const nowMoment = moment(new Date(now));
            nowMoment.locale(translate.getBrowserLang())
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName, new DetailContext(card,userContext))
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
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName, new DetailContext(card,userContext))
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
        it('compile svg', ()=>{
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName, new DetailContext(card,userContext))
                .subscribe((result)=>{
                    const lines = result.split('\n');
                    expect(lines.length).toEqual(4);
                    expect(lines[0]).toMatch(/<embed type="image\/svg\+xml" src="\/some\/where" id=".+" \/>/);
                    expect(lines[1]).toMatch(/         <script>document\.getElementById\('.+'\).addEventListener\('load', function\(\){/);
                    expect(lines[2]).toMatch(/                 svgPanZoom\(document\.getElementById\('.+'\)\);}\);/);
                    expect(lines[3]).toMatch(/         <\/script>/);
                });
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call=>{
                expect(call.request.method).toBe('GET');
                call.flush('{{{svg "/some" "/where"}}}');
            });
        });
        it('compile action', ()=>{
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName, new DetailContext(card,userContext))
                .subscribe((result)=>{
                    expect(result).toEqual('<button action-id="action-id"><i></i></button>');
                });
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call=>{
                expect(call.request.method).toBe('GET');
                call.flush('{{{action "action-id"}}}');
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
