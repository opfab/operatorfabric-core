import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "@env/environment";
import {AuthenticationService} from "@ofServices/authentication.service";
import {merge, empty, Observable, of} from "rxjs";
import {MissingTranslationHandler, MissingTranslationHandlerParams} from "@ngx-translate/core";
import {Map} from "@ofModel/map";
import {map, reduce, switchMap, tap} from "rxjs/operators";
import * as _ from 'lodash';

@Injectable()
export class ThirdsService {
    private thirdsUrl: string;

    constructor(private httpClient: HttpClient, private authenticationService: AuthenticationService) {
        this.thirdsUrl = `${environment.urls.thirds}/thirds`;
    }

    fetchI18nJson(publisher: string, version: string, locales: string[]): Observable<Map<any>> {
        let previous:Observable<any>;
        for(let locale of locales) {
            const params = new HttpParams()
                .set("locale", locale)
                .set("version", version);
            const httpCall = this.httpClient.get(`${this.thirdsUrl}/${publisher}/i18n`, {
                params: params,
                headers: this.authenticationService.getSecurityHeader()
            }).pipe(
                map(r=> {
                    const object = {};
                    object[locale] = {};
                    object[locale][publisher] = {};
                    object[locale][publisher][version] = r;
                    return object;
                }
            ));
            if(previous){
                previous = merge(previous,httpCall);
            }else{
                previous = httpCall;
            }
        }
        if(previous == null){
            return empty();
        }
        return previous.pipe(
            reduce((acc,val)=>{return {...acc, ...val};})
        );
    }
}

export class ThirdsMissingTranslationHandler implements MissingTranslationHandler {

    loaded: Map<boolean>;

    constructor(private thirdsService: ThirdsService){}

    handle(params: MissingTranslationHandlerParams) {
        const keyElements = params.key.split(".");
        const publisher = keyElements[0];
        const version = keyElements[1];
        const translateService = params.translateService;
        const locale = translateService.getBrowserLang();
        // if(this.loaded[`${publisher}.${version}`])
            return of(params.key);
        // return this.thirdsService.fetchI18nJson(publisher,version,translateService.getLangs()).pipe(
        //     tap(data=>{
        //         for(let lang of params.translateService.getLangs()) {
        //             if(data[lang]) {
        //                 translateService.setTranslation(lang, data[lang],true);
        //             }
        //         }
        //         this.loaded[`${publisher}.${version}`]=true;
        //     }),
        //     switchMap(data=>{
        //         if(data[locale] && _.get(data[locale], params.key,params.key)){
        //             return translateService.get(params.key,params.interpolateParams)
        //         }else{
        //             return of(params.key);
        //         }
        //     })
        // );
    }
}

function checkContains(data: any, path: string) {
    return false;
}

export function ThirdsMissingTranslationHandlerFactory(thirdsService: ThirdsService){
    return new ThirdsMissingTranslationHandler(thirdsService);
}
