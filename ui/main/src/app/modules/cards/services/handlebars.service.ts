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

@Injectable()
export class HandlebarsService {

    private templateCache:Map<Function> = new Map();

    constructor(private time:TimeService,
                private translate: TranslateService,
                private thirds: ThirdsService){
        this.registerPreserveSpace();
        this.registerIfEquals();
        this.registerIfGreater();
        this.registerIfGreaterEq();
        this.registerIfLower();
        this.registerIfLowerEq();
        this.registerIfLowerNow();
        this.registerIfGreaterNow();
        this.registerNumberFormat();
        this.registerDateFormat();
        this.registerCardAction();
        this.registerSvg();
        this.registerI18n();
        this.registerEachSorted();
        this.registerFomIndex();
        this.registerArrayAtIndex();
        this.registerAdd();
        this.registerSplit();
        this.registerArrayAtIndexLength();
        this.registerPolyIf();
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

    private registerPolyIf() {
        Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {

            switch (operator) {
                case '==':
                    return (v1 == v2) ? options.fn(this) : options.inverse(this);
                case '===':
                    return (v1 === v2) ? options.fn(this) : options.inverse(this);
                case '!=':
                    return (v1 != v2) ? options.fn(this) : options.inverse(this);
                case '!==':
                    return (v1 !== v2) ? options.fn(this) : options.inverse(this);
                case '<':
                    return (v1 < v2) ? options.fn(this) : options.inverse(this);
                case '<=':
                    return (v1 <= v2) ? options.fn(this) : options.inverse(this);
                case '>':
                    return (v1 > v2) ? options.fn(this) : options.inverse(this);
                case '>=':
                    return (v1 >= v2) ? options.fn(this) : options.inverse(this);
                case '&&':
                    return (v1 && v2) ? options.fn(this) : options.inverse(this);
                case '||':
                    return (v1 || v2) ? options.fn(this) : options.inverse(this);
                default:
                    return options.inverse(this);
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

    private registerAdd() {
        Handlebars.registerHelper('add', function (value, nbToAdd, options) {
            return value + nbToAdd;
        });
    }

    private registerArrayAtIndex() {
        Handlebars.registerHelper('arrayAtIndex', function (value, index, options) {
            return value[index];
        });
    }

    private registerFomIndex() {
        Handlebars.registerHelper('fromIndex', function (value, from, options) {
            return value.slice(from, value.length);
        });
    }

    private registerEachSorted() {
        Handlebars.registerHelper('eachSorted', function () {


            function appendContextPath(contextPath, id) {
                return (contextPath ? contextPath + '.' : '') + id;
            }

            function blockParams(params, ids) {
                params.path = ids;
                return params;
            }

            var args = [],
                options = arguments[arguments.length - 1];
            for (var index = 0; index < arguments.length - 1; index++) {
                args.push(arguments[index]);
            }
            var context: any | any[] | Function = args[0];
            if (typeof context === 'function') {
                context = context.call(this);
            }
            var sortKey = args[1];
            var arrayToSort: any[];
            var isObject = false;
            if (typeof context == 'object') {
                if (context.length !== undefined && context.length !== null) {
                    arrayToSort = context;
                } else {
                    isObject = true;
                    arrayToSort = [];
                    for (var property in context) {
                        if (context.hasOwnProperty(property)) {
                            if (typeof context[property] == 'object') {
                                arrayToSort.push(Object.assign({templatedObjectkey: property}, context[property]));
                            } else {
                                arrayToSort.push({
                                    templatedObjectkey: property,
                                    templatedObjectValue: context[property]
                                });
                            }
                        }
                    }
                }
                if (sortKey) {
                    arrayToSort.sort(sortOnKey(sortKey));
                } else if (isObject) {
                    arrayToSort.sort(sortOnKey('templatedObjectkey'));
                }
            }
            context = arrayToSort;

            let fn = options.fn,
                inverse = options.inverse,
                i = 0,
                ret = '',
                data,
                contextPath;

            if (options.data && options.ids) {
                contextPath = appendContextPath(options.data.contextPath, options.ids[0]) + '.';
            }

            if (options.data) {
                data = {...options.data};
            }

            function execIteration(field, index, last) {
                if (data) {
                    data.key = field;
                    data.index = index;
                    data.first = index === 0;
                    data.last = !!last;

                    if (contextPath) {
                        data.contextPath = contextPath + field;
                    }
                    if (context[field].templatedObjectkey) {
                        data.key = context[field].templatedObjectkey;
                    }
                }
                if (context[field].templatedObjectkey) {
                    delete context[field].templatedObjectkey;
                }
                let subContext;
                if (context[field].templatedObjectValue) {
                    subContext = context[field].templatedObjectValue;
                } else {
                    subContext = context[field];
                }
                ret = ret + fn(subContext, {
                    data: data,
                    blockParams: blockParams([subContext, field], [contextPath + field, null])
                });
            }

            for (let j = context.length; i < j; i++) {
                if (i in context) {
                    execIteration(i, i, i === context.length - 1);
                }
            }

            if (i === 0) {
                ret = inverse(this);
            }

            return ret;

        });
    }

    private registerI18n() {
        Handlebars.registerHelper('i18n', (...fctArgs) => {
            var args = [],
                options = fctArgs[fctArgs.length - 1];
            for (var i = 0; i < fctArgs.length - 1; i++) {
                args.push(fctArgs[i]);
            }

            let i18nKey: string, i18nParams: string[];
            if (typeof args[0] == 'object') {
                i18nKey = args[0].key;
                i18nParams = args[0].parameters;
            } else {
                i18nKey = "";
                for (var i = 0; i < args.length; i++) {
                    if (i18nKey)
                        i18nKey += "."
                    i18nKey += args[i];
                }
                i18nParams = options.hash;
            }

            return this.translate.get(i18nKey, i18nParams);
        });
    }

    private registerSvg() {
        Handlebars.registerHelper('svg', function () {
            var args = [],
                options = arguments[arguments.length - 1];
            for (var i = 0; i < arguments.length - 1; i++) {
                args.push(arguments[i]);
            }
            var imageUrl = "";
            for (var i = 0; i < args.length; i++) {
                imageUrl += args[i];
            }
            // return '<ap-action action="card.actions[\'actionId\']" card="card"></ap-action>';
            return '<ap-svg is-archived="false" url="\'' + imageUrl + '\'" pan-zoom="false"></ap-svg>';
        });
    }

    private registerCardAction() {
        Handlebars.registerHelper('cardAction', function () {
            var args = [],
                options = arguments[arguments.length - 1];
            for (var i = 0; i < arguments.length - 1; i++) {
                args.push(arguments[i]);
            }
            var actionId = "";
            for (var i = 0; i < args.length; i++) {
                actionId += args[i];
            }
            // return '<ap-action action="card.actions[\'actionId\']" card="card"></ap-action>';
            return '<ap-action action="\'' + actionId + '\'" card="card"></ap-action>';
        });
    }

    private registerDateFormat() {
        Handlebars.registerHelper('dateFormat', (value, options) => {
            const time = moment(new Date(value));
            time.locale(this.translate.getBrowserLang());
            return time.format(options.hash.format);
        });
    }

    private registerNumberFormat() {
        Handlebars.registerHelper('numberFormat', (value, options) => {
            const formatter = new Intl.NumberFormat(this.translate.getBrowserLang(), options.hash);
            return formatter.format(value);
        });
    }

    private registerIfGreaterNow() {
        const that = this;
        Handlebars.registerHelper('ifGreaterNow', function (value, options) {
            if (value > that.time.currentTime()) {
                return options.fn(this);
            } else {
                return options.inverse(this)
            }
        })
    }

    private registerIfLowerNow() {
        const that = this;
        Handlebars.registerHelper('ifLowerNow', function (value, options) {
            if (value < that.time.currentTime()) {
                return options.fn(this);
            } else {
                return options.inverse(this)
            }
        });
    }

    private registerIfLowerEq() {
        Handlebars.registerHelper('ifLowerEq', function (value, limit, options) {
            if (value <= limit) {
                return options.fn(this);
            } else {
                return options.inverse(this)
            }
        });
    }

    private registerIfLower() {
        Handlebars.registerHelper('ifLower', function (value, limit, options) {
            if (value < limit) {
                return options.fn(this);
            } else {
                return options.inverse(this)
            }
        });
    }

    private registerIfGreaterEq() {
        Handlebars.registerHelper('ifGreaterEq', function (value, limit, options) {
            if (value >= limit) {
                return options.fn(this);
            } else {
                return options.inverse(this)
            }
        });
    }

    private registerIfGreater() {
        Handlebars.registerHelper('ifGreater', function (value, limit, options) {
            if (value > limit) {
                return options.fn(this);
            } else {
                return options.inverse(this)
            }
        });
    }

    private registerIfEquals() {
        Handlebars.registerHelper('ifEquals', function (value, test, options) {
            if (value === test) {
                return options.fn(this);
            } else {
                return options.inverse(this)
            }
        });
    }

    private registerPreserveSpace() {
        Handlebars.registerHelper("preserveSpace", function (value, options) {
            return value.replace(/ /g, '&nbsp')
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
