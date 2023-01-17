/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {getOneRandomCard} from '@tests/helpers';

import {HandlebarsService} from './handlebars.service';
import * as moment from 'moment';
import {UserContext} from '@ofModel/user-context.model';
import {DetailContext} from '@ofModel/detail-context.model';
import {ConfigServer} from 'app/business/server/config.server';
import {ConfigServerMock} from '@tests/mocks/configServer.mock';
import {ProcessServerMock} from '@tests/mocks/processServer.mock';
import {ProcessesService} from 'app/business/services/processes.service';
import {ConfigService} from 'app/business/services/config.service';

describe('Handlebars Services', () => {
    let processesService: ProcessesService;
    let processServer: ProcessServerMock;
    let configService: ConfigService;
    let configServer: ConfigServer;
    let handlebarsService: HandlebarsService;

    const now = moment(Date.now());
    beforeEach(() => {
        processServer = new ProcessServerMock();
        configServer = new ConfigServerMock();
        processesService = new ProcessesService(null, processServer, configServer);
        configService = new ConfigService(configServer);
        handlebarsService = new HandlebarsService(processesService, configService);
    });

    describe('#executeTemplate', () => {
        const userContext = new UserContext('jdoe', 'token', 'John', 'Doe');
        const card = getOneRandomCard({
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
                    john: {firstName: 'John', lastName: 'Cleese'},
                    graham: {firstName: 'Graham', lastName: 'Chapman'},
                    terry1: {firstName: 'Terry', lastName: 'Gillian'},
                    eric: {firstName: 'Eric', lastName: 'Idle'},
                    terry2: {firstName: 'Terry', lastName: 'Jones'},
                    michael: {firstName: 'Michael', lastName: 'Palin'}
                },
                pythons2: {
                    john: 'Cleese',
                    graham: 'Chapman',
                    terry1: 'Gillian',
                    eric: 'Idle',
                    terry2: 'Jones',
                    michael: 'Palin'
                }
            }
        });

        function testTemplate(template, expectedResult, done, contextMessage?) {
            processServer.setTemplate(template);
            handlebarsService
                .executeTemplate("test", new DetailContext(card, userContext, null))
                .subscribe((result) => {
                    expect(result).withContext(contextMessage).toEqual(expectedResult);
                    done();
                });
        }

        it('compile simple template', (done) => {
            testTemplate('English template {{card.data.name}}', 'English template something', done);
        });

        function expectIfCond(card, v1, cond, v2, expectedResult: string, done) {
            testTemplate(
                `{{#if (bool ${v1} "${cond}" ${v2})}}true{{else}}false{{/if}}`,
                expectedResult,
                done,
                `Expected result to be ${expectedResult} when testing [${v1} ${cond} ${v2}]`
            );
        }

        // ==
        it('bool helper: 0 == 0  must return true', (done) =>
            expectIfCond(card, 'card.data.numbers.[0]', '==', 'card.data.numbers.[0]', 'true', done));
        it('bool helper: 0 == 1  must return false', (done) =>
            expectIfCond(card, 'card.data.numbers.[0]', '==', 'card.data.numbers.[1]', 'false', done));
        it("bool helper: 0 == '0' must return true ", (done) =>
            expectIfCond(card, 'card.data.numbers.[0]', '==', 'card.data.numberStrings.[0]', 'true', done));

        // ===
        it('bool helper: 0 === 0  must return true', (done) =>
            expectIfCond(card, 'card.data.numbers.[0]', '===', 'card.data.numbers.[0]', 'true', done));
        it("bool helper: 0 === '1'  must return false", (done) =>
            expectIfCond(card, 'card.data.numbers.[0]', '===', 'card.data.numbers.[1]', 'false', done));

        // <
        it("bool helper: 0 < '1'   must return true", (done) =>
            expectIfCond(card, 'card.data.numbers.[0]', '<', 'card.data.numberStrings.[1]', 'true', done));
        it('bool helper: 1 < 0   must return false', (done) =>
            expectIfCond(card, 'card.data.numbers.[1]', '<', 'card.data.numbers.[0]', 'false', done));
        it('bool helper: 1 < 1   must return false', (done) =>
            expectIfCond(card, 'card.data.numbers.[1]', '<', 'card.data.numbers.[1]', 'false', done));

        // >
        it('bool helper: 1 > 0   must return true', (done) =>
            expectIfCond(card, 'card.data.numbers.[1]', '>', 'card.data.numbers.[0]', 'true', done));
        it("bool helper: 1 > '0'   must return true", (done) =>
            expectIfCond(card, 'card.data.numbers.[1]', '>', 'card.data.numberStrings.[0]', 'true', done));
        it('bool helper: 0 > 1   must return false', (done) =>
            expectIfCond(card, 'card.data.numbers.[0]', '>', 'card.data.numbers.[1]', 'false', done));
        it('bool helper: 1 > 1   must return false', (done) =>
            expectIfCond(card, 'card.data.numbers.[1]', '>', 'card.data.numbers.[1]', 'false', done));

        // <=
        it('bool helper: 0 <= 1   must return true', (done) =>
            expectIfCond(card, 'card.data.numbers.[0]', '<=', 'card.data.numbers.[1]', 'true', done));
        it("bool helper: 0 <= '1'   must return true", (done) =>
            expectIfCond(card, 'card.data.numbers.[0]', '<=', 'card.data.numberStrings.[1]', 'true', done));
        it('bool helper: 1 <= 0   must return false', (done) =>
            expectIfCond(card, 'card.data.numbers.[1]', '<=', 'card.data.numbers.[0]', 'false', done));
        it('bool helper: 1 <= 1   must return true', (done) =>
            expectIfCond(card, 'card.data.numbers.[1]', '<=', 'card.data.numbers.[1]', 'true', done));
        it("bool helper: 1 <= '1'   must return true", (done) =>
            expectIfCond(card, 'card.data.numbers.[1]', '<=', 'card.data.numberStrings.[1]', 'true', done));

        // >=
        it('bool helper: 1 >= 0   must return true', (done) =>
            expectIfCond(card, 'card.data.numbers.[1]', '>=', 'card.data.numbers.[0]', 'true', done));
        it("bool helper: 1 >= '0'   must return true", (done) =>
            expectIfCond(card, 'card.data.numbers.[1]', '>=', 'card.data.numberStrings.[0]', 'true', done));
        it('bool helper: 0 >= 1   must return false', (done) =>
            expectIfCond(card, 'card.data.numbers.[0]', '>=', 'card.data.numbers.[1]', 'false', done));
        it('bool helper: 1 >= 1   must return true', (done) =>
            expectIfCond(card, 'card.data.numbers.[1]', '>=', 'card.data.numbers.[1]', 'true', done));
        it("bool helper: 1 >= '1'   must return true", (done) =>
            expectIfCond(card, 'card.data.numbers.[1]', '>=', 'card.data.numberStrings.[1]', 'true', done));

        // !=
        it('bool helper: 0 != 0   must return false', (done) =>
            expectIfCond(card, 'card.data.numbers.[0]', '!=', 'card.data.numbers.[0]', 'false', done));
        it('bool helper: 0 != 1   must return true', (done) =>
            expectIfCond(card, 'card.data.numbers.[0]', '!=', 'card.data.numbers.[1]', 'true', done));
        it("bool helper: 0 != '0'   must return false", (done) =>
            expectIfCond(card, 'card.data.numbers.[0]', '!=', 'card.data.numberStrings.[0]', 'false', done));

        // !==
        it('bool helper: 0 !== 0   must return false', (done) =>
            expectIfCond(card, 'card.data.numbers.[0]', '!==', 'card.data.numbers.[0]', 'false', done));
        it('bool helper: 0 !== 1   must return true', (done) =>
            expectIfCond(card, 'card.data.numbers.[0]', '!==', 'card.data.numbers.[1]', 'true', done));
        it("bool helper: 0 !== '0'   must return true", (done) =>
            expectIfCond(card, 'card.data.numbers.[0]', '!==', 'card.data.numberStrings.[0]', 'true', done));

        // &&
        it('bool helper: false && false   must return false', (done) =>
            expectIfCond(card, 'card.data.booleans.[0]', '&&', 'card.data.booleans.[0]', 'false', done));
        it('bool helper: false && 0   must return false', (done) =>
            expectIfCond(card, 'card.data.booleans.[0]', '&&', 'card.data.numbers.[0]', 'false', done));
        it("bool helper: false && 'false'   must return false", (done) =>
            expectIfCond(card, 'card.data.booleans.[0]', '&&', 'card.data.numberStrings.[0]', 'false', done));
        it('bool helper: false && true   must return false', (done) =>
            expectIfCond(card, 'card.data.booleans.[0]', '&&', 'card.data.booleans.[1]', 'false', done));
        it('bool helper: true && true   must return true', (done) =>
            expectIfCond(card, 'card.data.booleans.[1]', '&&', 'card.data.booleans.[1]', 'true', done));
        it('bool helper: true && 2   must return true', (done) =>
            expectIfCond(card, 'card.data.booleans.[1]', '&&', 'card.data.numbers.[2]', 'true', done));
        it("bool helper: true && '2'   must return true", (done) =>
            expectIfCond(card, 'card.data.booleans.[1]', '&&', 'card.data.numberStrings.[3]', 'true', done));

        // ||
        it('bool helper: false || false  must return false', (done) =>
            expectIfCond(card, 'card.data.booleans.[0]', '||', 'card.data.booleans.[0]', 'false', done));
        it('bool helper: false || 0  must return false', (done) =>
            expectIfCond(card, 'card.data.booleans.[0]', '||', 'card.data.numbers.[0]', 'false', done));
        it("bool helper: false || '0'  must return false", (done) =>
            expectIfCond(card, 'card.data.booleans.[0]', '||', 'card.data.numberStrings.[0]', 'true', done));
        it('bool helper: false || true  must return true', (done) =>
            expectIfCond(card, 'card.data.booleans.[0]', '||', 'card.data.booleans.[1]', 'true', done));
        it("bool helper: false || 'true'  must return true", (done) =>
            expectIfCond(card, 'card.data.booleans.[0]', '||', 'card.data.numberStrings.[1]', 'true', done));
        it('bool helper: true || true  must return true', (done) =>
            expectIfCond(card, 'card.data.booleans.[1]', '||', 'card.data.booleans.[1]', 'true', done));
        it('bool helper: true || 2  must return true', (done) =>
            expectIfCond(card, 'card.data.booleans.[1]', '||', 'card.data.numbers.[2]', 'true', done));
        it("bool helper: true || '3'  must return true", (done) =>
            expectIfCond(card, 'card.data.booleans.[1]', '||', 'card.data.numberStrings.[3]', 'true', done));

        it('compile arrayAtIndexLength', (done) => {
            testTemplate(`{{arrayAtIndexLength card.data.arrays 1}}`, '3', done);
        });

        function expectConditionalAttribute(card, condition, attribute, expectedResult: string, done) {
            testTemplate(
                `{{conditionalAttribute ${condition} ${attribute}}}`,
                expectedResult,
                done,
                `Expected result to be ${expectedResult} when testing [${condition}]`
            );
        }

        it('compile conditionalAttribute : if false, the attribute is not displayed', (done) =>
            expectConditionalAttribute(card, 'card.data.booleans.[0]', "'someAttribute'", '', done));

        it('compile conditionalAttribute : if true, the attribute is displayed', (done) =>
            expectConditionalAttribute(card, 'card.data.booleans.[1]', "'someAttribute'", 'someAttribute', done));

        it('compile conditionalAttribute : if string equals value condition valid, the attribute is displayed', (done) =>
            expectConditionalAttribute(card, 'card.data.name', "'someAttribute'", 'someAttribute', done));

        it('compile conditionalAttribute : if property does not exist, the attribute is not displayed', (done) =>
            expectConditionalAttribute(card, 'card.data.some.property.that.doesnt.exist', "'someAttribute'", '', done));

        it('compile conditionalAttribute : if property is undefined, the attribute is not displayed', (done) =>
            expectConditionalAttribute(card, 'card.data.undefinedValue', "'someAttribute'", '', done));

        it('compile conditionalAttribute : if property is null, the attribute is not displayed', (done) =>
            expectConditionalAttribute(card, 'card.data.nullValue', "'someAttribute'", '', done));

        it('compile conditionalAttribute : if condition using helper === is meet, the attribute is  displayed', (done) =>
            // The condition can also be an expression using other helpers
            expectConditionalAttribute(
                card,
                '(bool card.data.name "===" \'something\')',
                "'someAttribute'",
                'someAttribute',
                done
            ));
        it('compile conditionalAttribute : attribute coming from the card data is displayed', (done) =>
            expectConditionalAttribute(card, 'card.data.booleans.[1]', 'card.data.name', 'something', done));

        it('compile arrayAtIndexLength Alt', (done) => {
            testTemplate(`{{card.data.arrays.1.length}}`, '3', done);
        });

        it('compile split', (done) => {
            testTemplate('{{split card.data.splitString "." 1}}', 'split', done);
        });

        it('compile split for each', (done) => {
            testTemplate('{{#each (split card.data.splitString ".")}}-{{this}}{{/each}}', '-a-split-string', done);
        });

        function expectMath(v1, op, v2, expectedResult, done) {
            testTemplate(`{{math ${v1} "${op}" ${v2}}}`, `${expectedResult}`, done);
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
            testTemplate('{{arrayAtIndex card.data.numbers 2}}', '2', done);
        });

        it('compile arrayAtIndex alt', (done) => {
            testTemplate('{{card.data.numbers.[2]}}', '2', done);
        });

        it('compile slice', (done) => {
            testTemplate('{{#each (slice card.data.numbers 2 4)}}{{this}} {{/each}}', '2 3 ', done);
        });

        it('compile slice to end', (done) => {
            testTemplate('{{#each (slice card.data.numbers 2)}}{{this}} {{/each}}', '2 3 4 5 ', done);
        });

        it('compile each sort no field', (done) => {
            testTemplate(
                '{{#each (sort card.data.pythons)}}{{lastName}} {{/each}}',
                'Idle Chapman Cleese Palin Gillian Jones ',
                done
            );
        });
        it('compile each sort primitive properties', (done) => {
            testTemplate(
                '{{#each (sort card.data.pythons2)}}{{value}} {{/each}}',
                'Idle Chapman Cleese Palin Gillian Jones ',
                done
            );
        });

        it('compile each sort primitive array', (done) => {
            testTemplate('{{#each (sort card.data.unsortedNumbers)}}{{this}} {{/each}}', '0 1 2 3 4 5 ', done);
        });

        it('compile each sort', (done) => {
            testTemplate(
                '{{#each (sort card.data.pythons "lastName")}}{{lastName}} {{/each}}',
                'Chapman Cleese Gillian Idle Jones Palin ',
                done
            );
        });

        it('compile numberFormat using en locale fallback', (done) => {
            testTemplate(
                '{{numberFormat card.data.numbers.[5] style="currency" currency="EUR"}}',
                new Intl.NumberFormat('en', {style: 'currency', currency: 'EUR'}).format(5),
                done
            );
        });

        it('compile  now ', (done) => {
            processServer.setTemplate('{{now}}');
            handlebarsService
                .executeTemplate("test", new DetailContext(card, userContext, null))
                .subscribe((result) => {
                    // As it takes times to execute and the test are asynchronous we could not test the exact value
                    // so we test the range of the result
                    // taking into account asynchronous mechansim for test tool
                    // it can take more than 10s to have the execution done
                    // so we set the range starting form now to now plus one minute
                    expect(result).toBeGreaterThan(now.valueOf());
                    expect(result).toBeLessThan(now.valueOf() + 60000);
                    done();
                });
        });

        it('compile dateFormat with number for epoch date  (using en locale fallback)', (done) => {
            now.locale('en');
            testTemplate('{{dateFormat 1626685587000 format="MMMM Do YYYY"}}', 'July 19th 2021', done);
        });

        it('compile preserveSpace', (done) => {
            testTemplate('{{preserveSpace "   "}}', '\u00A0\u00A0\u00A0', done);
        });

        it('compile keepSpacesAndEndOfLine for two lines ', (done) => {
            testTemplate('{{keepSpacesAndEndOfLine "test\ntest"}}', 'test<br/>test', done);
        });

        it('compile keepSpacesAndEndOfLine for two lines with two spaces ', (done) => {
            testTemplate('{{keepSpacesAndEndOfLine "  test\ntest"}}', '&nbsp;&nbsp;test<br/>test', done);
        });

        it('compile keepSpacesAndEndOfLine for five lines and one space ', (done) => {
            testTemplate(
                '{{keepSpacesAndEndOfLine "test\ntest\n\n\nlast line"}}',
                'test<br/>test<br/><br/><br/>last line',
                done
            );
        });

        it('compile objectContainsKey - the object contains the key -> should return true', (done) => {
            testTemplate('{{objectContainsKey card.data.pythons "john"}}', 'true', done);
        });

        it("compile objectContainsKey - the object doesn't contains the key -> should return false", (done) => {
            testTemplate('{{objectContainsKey card.data.pythons "wrongKey"}}', 'false', done);
        });

        it('compile keyValue ', (done) => {
            testTemplate(
                '{{#keyValue card.data.pythons.john}}{{key}}:{{value}}:{{index}},{{/keyValue}}',
                'firstName:John:0,lastName:Cleese:1,',
                done
            );
        });
    });
});
