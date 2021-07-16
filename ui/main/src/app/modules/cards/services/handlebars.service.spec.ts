/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {getTestBed, TestBed} from '@angular/core/testing';

import {ProcessesService} from '@ofServices/processes.service';
import {HttpClientTestingModule, HttpTestingController, TestRequest} from '@angular/common/http/testing';
import {environment} from '@env/environment';
import {TranslateLoader, TranslateModule, TranslateService} from '@ngx-translate/core';
import {RouterTestingModule} from '@angular/router/testing';
import {Store, StoreModule} from '@ngrx/store';
import {appReducer, AppState} from '@ofStore/index';
import {AuthenticationImportHelperForSpecs, BusinessconfigI18nLoaderFactory, getOneRandomCard} from '@tests/helpers';
import {LightCard} from '@ofModel/light-card.model';
import {ServicesModule} from '@ofServices/services.module';
import {HandlebarsService} from './handlebars.service';
import {Guid} from 'guid-typescript';
import {I18n} from '@ofModel/i18n.model';
import * as moment from 'moment';
import {UserContext} from '@ofModel/user-context.model';
import {DetailContext} from '@ofModel/detail-context.model';

function computeTemplateUri(templateName) {
    return `${environment.urls.processes}/testProcess/templates/${templateName}`;
}

describe('Handlebars Services', () => {
    let injector: TestBed;
    let handlebarsService: HandlebarsService;
    let httpMock: HttpTestingController;
    let store: Store<AppState>;
    let translate: TranslateService;
    const now = moment(Date.now());
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
                        useFactory: BusinessconfigI18nLoaderFactory
                    },
                    useDefaultLang: false
                })
            ],
            providers: [
                {provide: 'TimeEventSource', useValue: null},
                {provide: store, useClass: Store},
                ProcessesService,
                HandlebarsService,
                AuthenticationImportHelperForSpecs
            ]
        });
        injector = getTestBed();
        store = TestBed.inject(Store);
        spyOn(store, 'dispatch').and.callThrough();
        httpMock = injector.get(HttpTestingController);
        handlebarsService = TestBed.inject(HandlebarsService);
        translate = TestBed.inject(TranslateService)
    });
    afterEach(() => {
        httpMock.verify();
    });

    describe('#executeTemplate', () => {
        let userContext = new UserContext('jdoe', 'token', 'John', 'Doe');
        let card = getOneRandomCard({
            data: {
                name: 'something',
                numbers: [0, 1, 2, 3, 4, 5],
                unsortedNumbers: [2, 1, 4, 0, 5, 3],
                numberStrings: ['0', '1', '2', '3', '4', '5'],
                arrays: [[], [0, 1, 2], ['0', '1', '2', '3']],
                undefinedValue: undefined,
                nullValue: null,
                booleans: [false, true],
                splitString: 'a.split.string',
                pythons: {
                    john: {firstName: "John", lastName: "Cleese"},
                    graham: {firstName: "Graham", lastName: "Chapman"},
                    terry1: {firstName: "Terry", lastName: "Gillian"},
                    eric: {firstName: "Eric", lastName: "Idle"},
                    terry2: {firstName: "Terry", lastName: "Jones"},
                    michael: {firstName: "Michael", lastName: "Palin"}
                },
                pythons2: {
                    john: "Cleese",
                    graham: "Chapman",
                    terry1: "Gillian",
                    eric: "Idle",
                    terry2: "Jones",
                    michael: "Palin"
                },
                i18n: new I18n("value", {param: "BAR"})
            }
        });
        const simpleTemplate = 'English template {{card.data.name}}';
        it('compile simple template', (done) => {
            handlebarsService.executeTemplate('testTemplate', new DetailContext(card, userContext, null))
                .subscribe((result) => {
                    expect(result).toEqual('English template something');
                    done();
                });
            let calls = httpMock.match(req => req.url == computeTemplateUri('testTemplate'));
            expect(calls.length).toEqual(1);
            calls.forEach(call => {
                expect(call.request.method).toBe('GET');
                call.flush(simpleTemplate);
            });
        })

        function expectIfCond(card, v1, cond, v2, expectedResult: string, done) {
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName, new DetailContext(card, userContext, null))
                .subscribe((result) => {
                    expect(result).toEqual(expectedResult,
                        `Expected result to be ${expectedResult} when testing [${v1} ${cond} ${v2}]`);
                    done();
                });
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call => {
                expect(call.request.method).toBe('GET');
                call.flush(`{{#if (bool ${v1} "${cond}" ${v2})}}true{{else}}false{{/if}}`);
            });
        }

        it('compile polyIf helper ==', (done) => {
            expectIfCond(card, 'card.data.numbers.[0]', '==', 'card.data.numbers.[0]', 'true', done);
            expectIfCond(card, 'card.data.numbers.[0]', '==', 'card.data.numbers.[1]', 'false', done);
            expectIfCond(card, 'card.data.numbers.[0]', '==', 'card.data.numberStrings.[0]', 'true', done);
        });
        it('compile polyIf helper ===', (done) => {
            expectIfCond(card, 'card.data.numbers.[0]', '===', 'card.data.numbers.[0]', 'true', done);
            expectIfCond(card, 'card.data.numbers.[0]', '===', 'card.data.numberStrings.[0]', 'false', done);
        });
        it('compile polyIf helper <', (done) => {
            // expectIfCond(card, 'card.data.numbers.[0]', '<', 'card.data.numbers.[1]', 'true');
            expectIfCond(card, 'card.data.numbers.[0]', '<', 'card.data.numberStrings.[1]', 'true', done);
            expectIfCond(card, 'card.data.numbers.[1]', '<', 'card.data.numbers.[0]', 'false', done);
            expectIfCond(card, 'card.data.numbers.[1]', '<', 'card.data.numbers.[1]', 'false', done);
        });
        it('compile polyIf helper >', (done) => {
            expectIfCond(card, 'card.data.numbers.[1]', '>', 'card.data.numbers.[0]', 'true', done);
            expectIfCond(card, 'card.data.numbers.[1]', '>', 'card.data.numberStrings.[0]', 'true', done);
            expectIfCond(card, 'card.data.numbers.[0]', '>', 'card.data.numbers.[1]', 'false', done);
            expectIfCond(card, 'card.data.numbers.[1]', '>', 'card.data.numbers.[1]', 'false', done);
        });
        it('compile polyIf helper <=', (done) => {
            expectIfCond(card, 'card.data.numbers.[0]', '<=', 'card.data.numbers.[1]', 'true', done);
            expectIfCond(card, 'card.data.numbers.[0]', '<=', 'card.data.numberStrings.[1]', 'true', done);
            expectIfCond(card, 'card.data.numbers.[1]', '<=', 'card.data.numbers.[0]', 'false', done);
            expectIfCond(card, 'card.data.numbers.[1]', '<=', 'card.data.numbers.[1]', 'true', done);
            expectIfCond(card, 'card.data.numbers.[1]', '<=', 'card.data.numberStrings.[1]', 'true', done);
        });
        it('compile polyIf helper >=', (done) => {
            expectIfCond(card, 'card.data.numbers.[1]', '>=', 'card.data.numbers.[0]', 'true', done);
            expectIfCond(card, 'card.data.numbers.[1]', '>=', 'card.data.numberStrings.[0]', 'true', done);
            expectIfCond(card, 'card.data.numbers.[0]', '>=', 'card.data.numbers.[1]', 'false', done);
            expectIfCond(card, 'card.data.numbers.[1]', '>=', 'card.data.numbers.[1]', 'true', done);
            expectIfCond(card, 'card.data.numbers.[1]', '>=', 'card.data.numberStrings.[1]', 'true', done);
        });
        it('compile polyIf helper !=', (done) => {
            expectIfCond(card, 'card.data.numbers.[0]', '!=', 'card.data.numbers.[0]', 'false', done);
            expectIfCond(card, 'card.data.numbers.[0]', '!=', 'card.data.numbers.[1]', 'true', done);
            expectIfCond(card, 'card.data.numbers.[0]', '!=', 'card.data.numberStrings.[0]', 'false', done);
        });
        it('compile polyIf helper !==', (done) => {
            expectIfCond(card, 'card.data.numbers.[0]', '!==', 'card.data.numbers.[0]', 'false', done);
            expectIfCond(card, 'card.data.numbers.[0]', '!==', 'card.data.numberStrings.[0]', 'true', done);
        });
        it('compile polyIf helper &&', (done) => {
            expectIfCond(card, 'card.data.booleans.[0]', '&&', 'card.data.booleans.[0]', 'false', done);
            expectIfCond(card, 'card.data.booleans.[0]', '&&', 'card.data.numbers.[0]', 'false', done);
            expectIfCond(card, 'card.data.booleans.[0]', '&&', 'card.data.numberStrings.[0]', 'false', done);
            expectIfCond(card, 'card.data.booleans.[0]', '&&', 'card.data.booleans.[1]', 'false', done);
            expectIfCond(card, 'card.data.booleans.[1]', '&&', 'card.data.booleans.[1]', 'true', done);
            expectIfCond(card, 'card.data.booleans.[1]', '&&', 'card.data.numbers.[2]', 'true', done);
            expectIfCond(card, 'card.data.booleans.[1]', '&&', 'card.data.numberStrings.[3]', 'true', done);
        });
        it('compile polyIf helper ||', (done) => {
            expectIfCond(card, 'card.data.booleans.[0]', '||', 'card.data.booleans.[0]', 'false', done);
            expectIfCond(card, 'card.data.booleans.[0]', '||', 'card.data.numbers.[0]', 'false', done);
            expectIfCond(card, 'card.data.booleans.[0]', '||', 'card.data.numberStrings.[0]', 'true', done);
            expectIfCond(card, 'card.data.booleans.[0]', '||', 'card.data.booleans.[1]', 'true', done);
            expectIfCond(card, 'card.data.booleans.[0]', '||', 'card.data.numberStrings.[1]', 'true', done);
            expectIfCond(card, 'card.data.booleans.[1]', '||', 'card.data.booleans.[1]', 'true', done);
            expectIfCond(card, 'card.data.booleans.[1]', '||', 'card.data.numbers.[2]', 'true', done);
            expectIfCond(card, 'card.data.booleans.[1]', '||', 'card.data.numberStrings.[3]', 'true', done);
        });
        it('compile arrayAtIndexLength', (done) => {
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName, new DetailContext(card, userContext, null))
                .subscribe((result) => {
                    expect(result).toEqual('3');
                    done();
                });
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call => {
                expect(call.request.method).toBe('GET');
                call.flush('{{arrayAtIndexLength card.data.arrays 1}}');
            });
        });

        function expectConditionalAttribute(card, condition, attribute, expectedResult: string, done) {
            const templateName = Guid.create().toString();
            const testedExpression = `{{conditionalAttribute ${condition} ${attribute}}}`;
            handlebarsService.executeTemplate(templateName, new DetailContext(card, userContext, null))
                .subscribe((result) => {
                    expect(result).toEqual(expectedResult,
                        `Expected result to be ${expectedResult} when testing [${condition}]`);
                    done();
                });
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call => {
                expect(call.request.method).toBe('GET');
                call.flush(testedExpression);
            });
        }

        it('compile conditionalAttribute', (done) => {
            // The attribute will show up if the property exists and is truthy
            expectConditionalAttribute(card, 'card.data.booleans.[0]', '\'someAttribute\'', '', done);
            expectConditionalAttribute(card, 'card.data.booleans.[1]', '\'someAttribute\'', 'someAttribute', done);
            expectConditionalAttribute(card, 'card.data.name', '\'someAttribute\'', 'someAttribute', done);
            expectConditionalAttribute(card, 'card.data.some.property.that.doesnt.exist', '\'someAttribute\'', '', done);
            expectConditionalAttribute(card, 'card.data.undefinedValue', '\'someAttribute\'', '', done);
            expectConditionalAttribute(card, 'card.data.nullValue', '\'someAttribute\'', '', done);

            // The condition can also be an expression using other helpers
            expectConditionalAttribute(card, '(bool card.data.name "===" \'something\')', '\'someAttribute\'', 'someAttribute', done);

            // The attribute itself can also come from the card data
            expectConditionalAttribute(card, 'card.data.booleans.[1]', 'card.data.name', 'something', done);
        });

        it('compile arrayAtIndexLength Alt', (done) => {
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName, new DetailContext(card, userContext, null))
                .subscribe((result) => {
                    expect(result).toEqual('3');
                    done();
                });
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call => {
                expect(call.request.method).toBe('GET');
                call.flush('{{card.data.arrays.1.length}}');
            });
        });
        it('compile split', (done) => {
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName, new DetailContext(card, userContext, null))
                .subscribe((result) => {
                    expect(result).toEqual('split');
                    done();
                });
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call => {
                expect(call.request.method).toBe('GET');
                call.flush('{{split card.data.splitString "." 1}}');
            });
        });
        it('compile split for each', (done) => {
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName, new DetailContext(card, userContext, null))
                .subscribe((result) => {
                    expect(result).toEqual('-a-split-string');
                    done();
                });
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call => {
                expect(call.request.method).toBe('GET');
                call.flush('{{#each (split card.data.splitString ".")}}-{{this}}{{/each}}');
            });
        });

        function expectMath(v1, op, v2, expectedResult, done) {
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName, new DetailContext(card, userContext, null))
                .subscribe((result) => {
                    expect(result).toEqual(`${expectedResult}`);
                    done();
                });
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call => {
                expect(call.request.method).toBe('GET');
                call.flush(`{{math ${v1} "${op}" ${v2}}}`);
            });
        }

        it('compile math +', (done) => {
            expectMath('card.data.numbers.[1]', '+', 'card.data.numbers.[2]', '3', done);
        });
        it('compile math -', (done) => {
            expectMath('card.data.numbers.[1]', '-', 'card.data.numbers.[2]', '-1', done);
        });
        it('compile math *', (done) => {
            expectMath('card.data.numbers.[1]', '*', 'card.data.numbers.[2]', '2', done);
        });
        it('compile math /', (done) => {
            expectMath('card.data.numbers.[1]', '/', 'card.data.numbers.[2]', '0.5', done);
        });
        it('compile math %', (done) => {
            expectMath('card.data.numbers.[1]', '%', 'card.data.numbers.[2]', '1', done);
        });
        it('compile arrayAtIndex', (done) => {
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName, new DetailContext(card, userContext, null))
                .subscribe((result) => {
                    expect(result).toEqual('2');
                    done();
                });
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call => {
                expect(call.request.method).toBe('GET');
                call.flush('{{arrayAtIndex card.data.numbers 2}}');
            });
        });
        it('compile arrayAtIndex alt', (done) => {
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName, new DetailContext(card, userContext, null))
                .subscribe((result) => {
                    expect(result).toEqual('2');
                    done();
                });
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call => {
                expect(call.request.method).toBe('GET');
                call.flush('{{card.data.numbers.[2]}}');
            });
        });
        it('compile slice', (done) => {
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName, new DetailContext(card, userContext, null))
                .subscribe((result) => {
                    expect(result).toEqual('2 3 ');
                    done();
                });
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call => {
                expect(call.request.method).toBe('GET');
                call.flush('{{#each (slice card.data.numbers 2 4)}}{{this}} {{/each}}');
            });
        });

        it('compile slice to end', (done) => {
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName, new DetailContext(card, userContext, null))
                .subscribe((result) => {
                    expect(result).toEqual('2 3 4 5 ');
                    done();
                });
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call => {
                expect(call.request.method).toBe('GET');
                call.flush('{{#each (slice card.data.numbers 2)}}{{this}} {{/each}}');
            });
        });

        it('compile each sort no field', (done) => {
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName, new DetailContext(card, userContext, null))
                .subscribe((result) => {
                    expect(result).toEqual('Idle Chapman Cleese Palin Gillian Jones ');
                    done();
                });
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call => {
                expect(call.request.method).toBe('GET');
                call.flush('{{#each (sort card.data.pythons)}}{{lastName}} {{/each}}');
            });
        });
        it('compile each sort primitive properties', (done) => {
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName, new DetailContext(card, userContext, null))
                .subscribe((result) => {
                    expect(result).toEqual('Idle Chapman Cleese Palin Gillian Jones ');
                    done();
                });
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call => {
                expect(call.request.method).toBe('GET');
                call.flush('{{#each (sort card.data.pythons2)}}{{value}} {{/each}}');
            });
        });

        it('compile each sort primitive array', (done) => {
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName, new DetailContext(card, userContext, null))
                .subscribe((result) => {
                    expect(result).toEqual('0 1 2 3 4 5 ');
                    done();
                });
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call => {
                expect(call.request.method).toBe('GET');
                call.flush('{{#each (sort card.data.unsortedNumbers)}}{{this}} {{/each}}');
            });
        });

        it('compile each sort', (done) => {
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName, new DetailContext(card, userContext, null))
                .subscribe((result) => {
                    expect(result).toEqual('Chapman Cleese Gillian Idle Jones Palin ');
                    done();
                });
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call => {
                expect(call.request.method).toBe('GET');
                call.flush('{{#each (sort card.data.pythons "lastName")}}{{lastName}} {{/each}}');
            });
        });
        it('compile i18n', (done) => {
            translate.setTranslation("en", {
                value: {subValue: "English value"}
            });
            translate.use("en");
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName, new DetailContext(card, userContext, null))
                .subscribe((result) => {
                    expect(result).toEqual('English value');
                    done();
                });
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call => {
                expect(call.request.method).toBe('GET');
                call.flush('{{i18n "value" "subValue"}}');
            });
        });
        it('compile i18n with parameters', (done) => {
            translate.setTranslation("en", {
                value: "English value: {{param}}"
            });
            translate.use("en");
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName, new DetailContext(card, userContext, null))
                .subscribe((result) => {
                    expect(result).toEqual('English value: FOO');
                    done();
                });
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call => {
                expect(call.request.method).toBe('GET');
                call.flush('{{i18n "value" param="FOO"}}');
            });
        });
        it('compile i18n with i18n object', (done) => {
            translate.setTranslation("en", {
                value: "English value: {{param}}"
            });
            translate.use("en");
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName, new DetailContext(card, userContext, null))
                .subscribe((result) => {
                    expect(result).toEqual('English value: BAR');
                    done();
                });
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call => {
                expect(call.request.method).toBe('GET');
                call.flush('{{i18n card.data.i18n}}');
            });
        });
        it('compile numberFormat using en locale fallback', (done) => {
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName, new DetailContext(card, userContext, null))
                .subscribe((result) => {
                    expect(result)
                        .toEqual(new Intl.NumberFormat('en', {style: "currency", currency: "EUR"})
                            .format(5));
                    done();
                });
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call => {
                expect(call.request.method).toBe('GET');
                call.flush('{{numberFormat card.data.numbers.[5] style="currency" currency="EUR"}}');
            });
        });
        it('compile dateFormat now (using en locale fallback)', (done) => {
            now.locale('en')
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName, new DetailContext(card, userContext, null))
                .subscribe((result) => {
                    expect(result).toEqual(now.format('MMMM Do YYYY'));
                    done();
                });
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call => {
                expect(call.request.method).toBe('GET');
                call.flush('{{dateFormat (now "") format="MMMM Do YYYY"}}');
            });
        });
        it('compile preserveSpace', (done) => {
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName, new DetailContext(card, userContext, null))
                .subscribe((result) => {
                    expect(result).toEqual('\u00A0\u00A0\u00A0');
                    done();
                });
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call => {
                expect(call.request.method).toBe('GET');
                call.flush('{{preserveSpace "   "}}');
            });
        });
        it('compile svg', (done) => {
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName, new DetailContext(card, userContext, null))
                .subscribe((result) => {
                    const lines = result.split('\n');
                    expect(lines.length).toEqual(4);
                    expect(lines[0]).toMatch(/<embed type="image\/svg\+xml" src="\/some\/where" id=".+" \/>/);
                    expect(lines[1]).toMatch(/         <script>document\.getElementById\('.+'\).addEventListener\('load', function\(\){/);
                    expect(lines[2]).toMatch(/                 svgPanZoom\(document\.getElementById\('.+'\)\);}\);/);
                    expect(lines[3]).toMatch(/         <\/script>/);
                    done();
                });
            const calls = httpMock.match(req => req.url === computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call => {
                expect(call.request.method).toBe('GET');
                call.flush('{{{svg "/some" "/where"}}}');
            });
        });
        it('compile action', (done) => {
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName, new DetailContext(card, userContext, null))
                .subscribe((result) => {
                    expect(result).toEqual('<button action-id="action-id"><i></i></button>');
                    done();
                });
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call => {
                expect(call.request.method).toBe('GET');
                call.flush('{{{action "action-id"}}}');
            });
        });

        it('compile keepSpacesAndEndOfLine for two lines ', (done) => {
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName, new DetailContext(card, userContext, null))
                .subscribe((result) => {
                    expect(result).toEqual('test<br/>test');
                    done();
                });
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call => {
                expect(call.request.method).toBe('GET');
                call.flush('{{keepSpacesAndEndOfLine "test\ntest"}}');
            });
        });

        it('compile keepSpacesAndEndOfLine for two lines with two spaces ', (done) => {
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName, new DetailContext(card, userContext, null))
                .subscribe((result) => {
                    expect(result).toEqual('&nbsp;&nbsp;test<br/>test');
                    done();
                });
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call => {
                expect(call.request.method).toBe('GET');
                call.flush('{{keepSpacesAndEndOfLine "  test\ntest"}}');
            });
        });
        it('compile keepSpacesAndEndOfLine for five lines and one space ', (done) => {
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName, new DetailContext(card, userContext, null))
                .subscribe((result) => {
                    expect(result).toEqual('test<br/>test<br/><br/><br/>last line');
                    done();
                });
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call => {
                expect(call.request.method).toBe('GET');
                call.flush('{{keepSpacesAndEndOfLine "test\ntest\n\n\nlast line"}}');
            });
        });
        it('compile objectContainsKey - the object contains the key -> should return true', (done) => {
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName, new DetailContext(card, userContext, null))
                .subscribe((result) => {
                    expect(result).toEqual('true');
                    done();
                });
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call => {
                expect(call.request.method).toBe('GET');
                call.flush('{{objectContainsKey card.data.pythons "john"}}');
            });
        });
        it('compile objectContainsKey - the object doesn\'t contains the key -> should return false', (done) => {
            const templateName = Guid.create().toString();
            handlebarsService.executeTemplate(templateName, new DetailContext(card, userContext, null))
                .subscribe((result) => {
                    expect(result).toEqual('false');
                    done();
                });
            let calls = httpMock.match(req => req.url == computeTemplateUri(templateName));
            expect(calls.length).toEqual(1);
            calls.forEach(call => {
                expect(call.request.method).toBe('GET');
                call.flush('{{objectContainsKey card.data.pythons "wrongKey"}}');
            });
        });
    });

});

function flushI18nJson(request: TestRequest, json: any) {
    const locale = request.request.params.get('locale');
    request.flush(json[locale]);
}

function prefix(card: LightCard) {
    return card.process + '.' + card.processVersion + '.';
}
