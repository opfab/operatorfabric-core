import {Injectable} from "@angular/core";
import {Card} from "@ofModel/card.model";
import * as Handlebars from "handlebars/dist/handlebars.js"
import {TimeService} from "@ofServices/time.service";
import {TranslateService} from "@ngx-translate/core";
import * as moment from 'moment';
import {Map} from "@ofModel/map";
import {Observable, of} from "rxjs";
import {map, tap} from "rxjs/operators";
import {ThirdsService} from "./thirds.service";
import {Guid} from "guid-typescript";

@Injectable()
export class HandlebarsService {

    private templateCache:Map<Function> = new Map();

    constructor(private time:TimeService,
                private translate: TranslateService,
                private thirds: ThirdsService){
        this.registerPreserveSpace();
        this.registerNumberFormat();
        this.registerDateFormat();
        this.registerCardAction();
        this.registerSvg();
        this.registerI18n();
        this.registerSort();
        this.registerSlice();
        this.registerSliceEnd();
        this.registerArrayAtIndex();
        this.registerMath();
        this.registerSplit();
        this.registerArrayAtIndexLength();
        this.registerBool();
        this.registerNow();
    }

    public executeTemplate(templateName: string, card: Card):Observable<string> {
        return this.queryTemplate(card.publisher,card.publisherVersion,templateName).pipe(
            map(t=>t(card)));
    }

    private queryTemplate(publisher:string, version:string, name: string):Observable<Function> {
        const locale = this.translate.getBrowserLang();
        const key = `${publisher}.${version}.${name}.${locale}`;
        let template = this.templateCache[key];
        if(template){
           return of(template);
        }
        return this.thirds.fetchHbsTemplate(publisher,version,name,locale).pipe(
            map(s=>Handlebars.compile(s)),
            tap(t=>this.templateCache[key]=t)
        );
    }

    private registerBool() {
        Handlebars.registerHelper('bool', function (v1, operator, v2, options) {
            switch (operator) {
                case '==':
                    return (v1 == v2);
                case '===':
                    return (v1 === v2);
                case '!=':
                    return (v1 != v2);
                case '!==':
                    return (v1 !== v2);
                case '<':
                    return (v1 < v2);
                case '<=':
                    return (v1 <= v2);
                case '>':
                    return (v1 > v2);
                case '>=':
                    return (v1 >= v2);
                case '&&':
                    return (v1 && v2);
                case '||':
                    return (v1 || v2);
                default:
                    return true;
            }
        });
    }

    private registerArrayAtIndexLength() {
        Handlebars.registerHelper('arrayAtIndexLength', function (value, index, options) {
            return value[index].length;
        });
    }

    private registerSplit() {
        Handlebars.registerHelper('split', function (value, splitValue, index, options) {
            return value.split(splitValue)[index];
        });
    }

    private registerMath(){
        Handlebars.registerHelper("math", function(lvalue, operator, rvalue, options) {
            let result;
            switch(operator) {
                case "+": result = lvalue + rvalue; break;
                case "-": result = lvalue - rvalue; break;
                case "*": result = lvalue * rvalue; break;
                case "/": result = lvalue / rvalue; break;
                case "%": result = lvalue % rvalue; break;
            };
            return result;
        });
    }

    private registerArrayAtIndex() {
        Handlebars.registerHelper('arrayAtIndex', function (value, index, options) {
            return value[index];
        });
    }

    private registerSlice() {
        Handlebars.registerHelper('slice', function (value, from, to, options) {
            return value.slice(from, to);
        });
    }

    private registerSliceEnd() {
        Handlebars.registerHelper('sliceEnd', function (value, from, options) {
            return value.slice(from, value.length);
        });
    }

    private registerSort() {
        Handlebars.registerHelper('sort', function () {
            let args = [];
            for (let index = 0; index < arguments.length - 1; index++) {
                args.push(arguments[index]);
            }
            const context: any | any[] = args[0];
            const sortKey = args[1];
            let arrayToSort: any[];
            let isObject:boolean;
            if (typeof context == 'object') {
                if (context.length !== undefined && context.length !== null) {
                    arrayToSort = context;
                    isObject = (typeof arrayToSort[0] == 'object')
                } else {
                    isObject = true;
                    arrayToSort = [];
                    for (let property in context) {
                        if (context.hasOwnProperty(property)) {
                            if (typeof context[property] == 'object') {
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
                    arrayToSort.sort();
                }
            }
            return arrayToSort;
        });
    }

    private registerI18n() {
        Handlebars.registerHelper('i18n', (...fctArgs) => {
            let args = [],
                options = fctArgs[fctArgs.length - 1];
            for (let i = 0; i < fctArgs.length - 1; i++) {
                args.push(fctArgs[i]);
            }

            let i18nKey: string, i18nParams: string[];
            if (typeof args[0] == 'object') {
                i18nKey = args[0].key;
                i18nParams = args[0].parameters;
            } else {
                i18nKey = "";
                for (let i = 0; i < args.length; i++) {
                    if (i18nKey)
                        i18nKey += "."
                    i18nKey += args[i];
                }
                i18nParams = options.hash;
            }

            return this.translate.instant(i18nKey, i18nParams);
        });
    }

    private registerSvg() {
        const svgUid = Guid.create().toString();
        Handlebars.registerHelper('svg', function () {
            let args = [];
            for (let i = 0; i < arguments.length - 1; i++) {
                args.push(arguments[i]);
            }
            let imageUrl = "";
            for (let i = 0; i < args.length; i++) {
                imageUrl += args[i];
            }
            return `<embed type="image/svg+xml" src="${imageUrl}" id="${svgUid}" />
                    <script>document.getElementById('${svgUid}').addEventListener('load', function(){
                            svgPanZoom(document.getElementById('${svgUid}'));});
                    </script>`
        });
    }

    private registerCardAction() {
        Handlebars.registerHelper('action', function () {
            let args = [];
            for (let i = 0; i < arguments.length - 1; i++) {
                args.push(arguments[i]);
            }
            let actionId = "";
            for (let i = 0; i < args.length; i++) {
                actionId += args[i];
            }
            return `<button action-id="${actionId}"><i></i></button>`
        });
    }

    private registerDateFormat() {
        Handlebars.registerHelper('dateFormat', (value, options) => {
            const m = moment(new Date(value));
            m.locale(this.translate.getBrowserLang());
            return m.format(options.hash.format);
        });
    }

    private registerNumberFormat() {
        Handlebars.registerHelper('numberFormat', (value, options) => {
            const formatter = new Intl.NumberFormat(this.translate.getBrowserLang(), options.hash);
            return formatter.format(value);
        });
    }

    private registerNow() {
        const that = this;
        Handlebars.registerHelper('now', function (options) {
            return that.time.currentTime();
        })
    }

    private registerPreserveSpace() {
        Handlebars.registerHelper("preserveSpace", function (value, options) {
            return value.replace(/ /g, '\u00A0')
        });
    }
}

function sortOnKey(key){
    return function(a,b){
        if(typeof  a[key] == 'string' && typeof b[key] == 'string'){
            if(a[key]<b[key])
                return -1;
            else if(a[key]>b[key])
                return 1
            return 0;
        }else if(typeof  a[key] == 'number' && typeof b[key] == 'number'){
            return a[key]-b[key];
        }
        return 0;
    }
}
