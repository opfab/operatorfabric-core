/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import * as Handlebars from 'handlebars';
import {JSDOM} from 'jsdom';
import * as fs from 'fs';
import {format, FormatOptions} from 'date-fns';
import {enUS, fr, nl} from 'date-fns/locale';

export class HandlebarsHelper {
    public static init(): void {
        HandlebarsHelper.registerPreserveSpace();
        HandlebarsHelper.registerNumberFormat();
        HandlebarsHelper.registerDateFormat();
        HandlebarsHelper.registerSort();
        HandlebarsHelper.registerSlice();
        HandlebarsHelper.registerArrayAtIndex();
        HandlebarsHelper.registerMath();
        HandlebarsHelper.registerSplit();
        HandlebarsHelper.registerArrayAtIndexLength();
        HandlebarsHelper.registerBool();
        HandlebarsHelper.registerNow();
        HandlebarsHelper.registerJson();
        HandlebarsHelper.registerKeyValue();
        HandlebarsHelper.registerToBreakage();
        HandlebarsHelper.registerArrayContains();
        HandlebarsHelper.registerArrayContainsOneOf();
        HandlebarsHelper.registerTimes();
        HandlebarsHelper.registerKeepSpacesAndEndOfLine();
        HandlebarsHelper.registerMergeArrays();
        HandlebarsHelper.registerConditionalAttribute();
        HandlebarsHelper.registerReplace();
        HandlebarsHelper.registerPadStart();
        HandlebarsHelper.registerObjectContainsKey();
        HandlebarsHelper.registerFindObjectByProperty();
        HandlebarsHelper.registerDeltaToHtml();
    }

    private static _locale: string;

    private static registerJson(): void {
        Handlebars.registerHelper('json', function (obj) {
            return new Handlebars.SafeString(JSON.stringify(obj));
        });
    }

    private static registerBool(): void {
        Handlebars.registerHelper('bool', function (v1, operator, v2) {
            switch (operator) {
                case '==':
                    // eslint-disable-next-line eqeqeq
                    return v1 == v2;
                case '===':
                    return v1 === v2;
                case '!=':
                    // eslint-disable-next-line eqeqeq
                    return v1 != v2;
                case '!==':
                    return v1 !== v2;
                case '<':
                    return v1 < v2;
                case '<=':
                    return v1 <= v2;
                case '>':
                    return v1 > v2;
                case '>=':
                    return v1 >= v2;
                case '&&':
                    return Boolean(v1) && v2;
                case '||':
                    return Boolean(v1) || v2;
                default:
                    return true;
            }
        });
    }

    private static registerArrayAtIndexLength(): void {
        Handlebars.registerHelper('arrayAtIndexLength', function (value, index) {
            return value[index].length;
        });
    }

    private static registerSplit(): void {
        Handlebars.registerHelper('split', function (...args: any[]) {
            if (args.length === 3) return args[0].split(args[1]);
            if (args.length === 4) return args[0].split(args[1])[args[2]];
        });
    }

    private static registerMath(): void {
        Handlebars.registerHelper('math', function (lvalue, operator, rvalue) {
            let result;
            switch (operator) {
                case '+':
                    result = lvalue + rvalue;
                    break;
                case '-':
                    result = lvalue - rvalue;
                    break;
                case '*':
                    result = lvalue * rvalue;
                    break;
                case '/':
                    result = lvalue / rvalue;
                    break;
                case '%':
                    result = lvalue % rvalue;
                    break;
            }
            return result;
        });
    }

    private static registerArrayAtIndex(): void {
        Handlebars.registerHelper('arrayAtIndex', function (value, index) {
            return value[index];
        });
    }

    private static registerObjectContainsKey(): void {
        Handlebars.registerHelper('objectContainsKey', function (obj, key) {
            return key in obj;
        });
    }

    private static registerSlice(): void {
        Handlebars.registerHelper('slice', function () {
            const args = [];
            for (let index = 0; index < arguments.length - 1; index++) {
                args.push(arguments[index]);
            }
            const value = args[0];
            const from = args[1];
            let to = null;
            if (args.length >= 3) {
                to = args[2];
                return value.slice(from, to);
            }
            return value.slice(from);
        });
    }

    private static registerPreserveSpace(): void {
        Handlebars.registerHelper('preserveSpace', function (value) {
            return value.replace(/ /g, '\u00A0');
        });
    }

    private static registerArrayContains(): void {
        Handlebars.registerHelper('arrayContains', function (arr, value) {
            return arr?.includes(value);
        });
    }

    private static registerArrayContainsOneOf(): void {
        Handlebars.registerHelper('arrayContainsOneOf', function (arr1, arr2) {
            return arr1.some((ai: any) => arr2.includes(ai));
        });
    }

    private static registerTimes(): void {
        Handlebars.registerHelper('times', function (n, block) {
            let accum = '';
            for (let i = 0; i < n; ++i) accum += block.fn(i);
            return accum;
        });
    }

    private static registerToBreakage(): void {
        Handlebars.registerHelper('toBreakage', function (word, breakage) {
            switch (breakage) {
                case 'lowercase':
                    return word.toLowerCase();
                case 'uppercase':
                    return word.toUpperCase();
                default:
                    /* eslint-disable-next-line no-console */
                    console.error(`Invalid parameter ${breakage} for the toBreakage helper`);
                    return 'ERROR';
            }
        });
    }

    private static registerKeyValue(): void {
        Handlebars.registerHelper('keyValue', function (obj, options) {
            if (Object.keys(obj).length === 0) {
                return options.fn({value: false});
            }
            let buffer, key, index;
            buffer = '';
            index = 0;
            for (key in obj) {
                if (!Object.hasOwnProperty.call(obj, key)) {
                    continue;
                }
                buffer +=
                    options.fn({
                        key: key,
                        value: obj[key],
                        index: index
                    }) || '';
                index++;
            }
            return buffer;
        });
    }

    private static registerKeepSpacesAndEndOfLine(): void {
        Handlebars.registerHelper('keepSpacesAndEndOfLine', function (value: string) {
            let result = Handlebars.escapeExpression(value);
            result = result.replace(/\n/g, '<br/>');
            result = result.replace(/\s\s/g, '&nbsp;&nbsp;');
            return new Handlebars.SafeString(result);
        });
    }

    private static registerMergeArrays(): void {
        Handlebars.registerHelper('mergeArrays', function (arr1, arr2) {
            return arr1.concat(arr2);
        });
    }

    private static registerReplace(): void {
        Handlebars.registerHelper('replace', function (find, replace, string) {
            return string.replaceAll(find, replace);
        });
    }

    private static registerPadStart(): void {
        Handlebars.registerHelper(
            'padStart',
            function (stringToPad, targetLength: number, characterForPadding: string) {
                return String(stringToPad).padStart(targetLength, characterForPadding);
            }
        );
    }

    private static registerConditionalAttribute(): void {
        Handlebars.registerHelper('conditionalAttribute', function (condition, attribute) {
            return condition ? attribute : '';
        });
    }

    private static registerFindObjectByProperty(): void {
        Handlebars.registerHelper('findObjectByProperty', function (list, propertyName, propertyValue) {
            return list.find((obj: {[x: string]: any}) => obj[propertyName] === propertyValue);
        });
    }

    public static changeLocale(locale: string): void {
        if (locale != null) {
            HandlebarsHelper._locale = locale;
        } else {
            HandlebarsHelper._locale = 'en';
        }
    }
    /* eslint-disable */
    private static registerSort(): void {
        Handlebars.registerHelper('sort', function () {
            const args = [];
            for (let index = 0; index < arguments.length - 1; index++) {
                args.push(arguments[index]);
            }
            const context: any = args[0];
            const sortKey = args[1];
            let arrayToSort = [];
            let isObject: boolean;
            if (typeof context === 'object') {
                if (context.length !== undefined && context.length !== null) {
                    arrayToSort = context;
                    isObject = typeof arrayToSort[0] === 'object';
                } else {
                    isObject = true;
                    for (const property in context) {
                        if (context.hasOwnProperty(property)) {
                            if (typeof context[property] === 'object') {
                                arrayToSort.push({templatedObjectkey: property, ...context[property]});
                            } else {
                                arrayToSort.push({
                                    templatedObjectkey: property,
                                    value: context[property]
                                });
                            }
                        }
                    }
                }
                if (sortKey) {
                    arrayToSort.sort(sortOnKey(sortKey));
                } else if (isObject) {
                    arrayToSort.sort(sortOnKey('templatedObjectkey'));
                } else {
                    if (typeof arrayToSort[0] === 'string') {
                        arrayToSort.sort((a: string, b: any) => a.localeCompare(b));
                    } else {
                        arrayToSort.sort((a: number, b: number) => a - b);
                    }
                }
            }
            return arrayToSort;
        });
    }
    /* eslint-enable */

    private static registerDateFormat(): void {
        Handlebars.registerHelper('dateFormat', (value: string | number, options) => {
            if (typeof value === 'string') {
                value = parseInt(value);
            }
            const m = new Date(value);
            return format(m, options.hash.format as string, this.getDateFnsLocaleOption(HandlebarsHelper._locale));
        });
    }

    private static getDateFnsLocaleOption(locale: string): FormatOptions {
        switch (locale) {
            case 'fr':
                return {locale: fr};
            case 'nl':
                return {locale: nl};
            default:
                return {locale: {...enUS, options: {...enUS.options, weekStartsOn: 6}}};
        }
    }

    private static registerNumberFormat(): void {
        Handlebars.registerHelper('numberFormat', (value: number | bigint, options) => {
            const formatter = new Intl.NumberFormat(HandlebarsHelper._locale, options.hash as Intl.NumberFormatOptions);
            return formatter.format(value);
        });
    }

    private static registerNow(): void {
        Handlebars.registerHelper('now', function () {
            return new Date().valueOf();
        });
    }

    private static registerDeltaToHtml(): void {
        Handlebars.registerHelper('deltaToHtml', (delta: string) => {
            const quillFilePath = require.resolve('quill');

            const quillLibrary = fs.readFileSync(quillFilePath);
            const TEMPLATE = `<div id="editor"></div>
            <script>${quillLibrary.toString()}</script>
            <script>
              document.getSelection = function() {
                return {
                  getRangeAt: function() { }
                };
              };
              document.execCommand = function (command, showUI, value) {
                try {
                    return document.execCommand(command, showUI, value);
                } catch(e) {}
                return false;
              };
            </script>`;

            const DOM = new JSDOM(TEMPLATE, {runScripts: 'dangerously', resources: 'usable'});
            const quill = new DOM.window.Quill('#editor');

            quill.setContents(JSON.parse(delta));
            const html = quill.root.innerHTML;
            return html;
        });
    }
}

function sortOnKey(key: string) {
    return function (a: {[x: string]: number}, b: {[x: string]: number}) {
        if (typeof a[key] === 'string' && typeof b[key] === 'string') {
            if (a[key] < b[key]) return -1;
            else if (a[key] > b[key]) return 1;
            return 0;
        } else if (typeof a[key] === 'number' && typeof b[key] === 'number') {
            return a[key] - b[key];
        }
        return 0;
    };
}
