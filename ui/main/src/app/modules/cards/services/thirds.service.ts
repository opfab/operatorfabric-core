import {Injectable, Injector, OnInit} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "@env/environment";
import {AuthenticationService} from "@ofServices/authentication.service";
import {empty, from, merge, Observable, of, throwError} from "rxjs";
import {
    MissingTranslationHandler,
    MissingTranslationHandlerParams,
    TranslateLoader,
    TranslateService
} from "@ngx-translate/core";
import {Map} from "@ofModel/map";
import {catchError, map, reduce, switchMap, tap} from "rxjs/operators";
import * as _ from 'lodash';
import {Store} from "@ngrx/store";
import {AppState} from "@ofStore/index";
import {selectLastCards} from "@ofSelectors/light-card.selectors";
import {LightCard} from "@ofModel/light-card.model";

@Injectable()
export class ThirdsService {
    private thirdsUrl: string;
    private loaded: string[] = [];
    private loading: string[] = [];
    private initiated = false;

    constructor(private httpClient: HttpClient,
                private authenticationService: AuthenticationService,
                private store: Store<AppState>,
                private $injector: Injector) {
        this.thirdsUrl = `${environment.urls.thirds}`;
    }

    fetchHbsTemplate(publisher: string, version: string, name: string, locale: string): Observable<string> {
        const params = new HttpParams()
                .set("locale", locale)
                .set("version", version);
        return this.httpClient.get(`${this.thirdsUrl}/${publisher}/templates/${name}`,{
            params,
            headers: this.authenticationService.getSecurityHeader(),
            responseType: 'text'
        })
    }

    fetchI18nJson(publisher: string, version: string, locales: string[]): Observable<Map<any>> {
        let previous: Observable<any>;
        for (let locale of locales) {
            const params = new HttpParams()
                .set("locale", locale)
                .set("version", version);
            const httpCall = this.httpClient.get(`${this.thirdsUrl}/${publisher}/i18n`, {
                params,
                headers: this.authenticationService.getSecurityHeader()
            }).pipe(
                map(r => {
                        const object = {};
                        object[locale] = {};
                        object[locale][publisher] = {};
                        object[locale][publisher][version] = r;
                        return object;
                    }
                ));
            if (previous) {
                previous = merge(previous, httpCall);
            } else {
                previous = httpCall;
            }
        }
        if (previous == null) {
            return empty();
        }
        const result = previous.pipe(
            reduce((acc, val) => {
                return {...acc, ...val};
            })
        );

        return result;
    }

    init(): void {
        if(this.initiated) return;
        this.store.select(selectLastCards)
            .pipe(
                switchMap((cards:LightCard[])=>{
                    return from(cards).pipe( // we pipe map/reduce here so that reduce scope
                        map(card=> {  // is limited to the current card array
                            return card.publisher + '###' + card.publisherVersion
                        }),
                        reduce((ids:string[],id:string)=>{
                            ids.push(id);
                            return ids;
                        },[]),
                    )
                }),

                map(ids=>_.uniq(ids)),
                map(ids=>{
                    return _.difference<string>(ids,this.loading)
                }),
                switchMap(ids => {
                    return from(_.difference<string>(ids, this.loaded))
                }),
                tap(id=>this.loading.push(id)),
                switchMap((id: string) => {
                    const input = id.split('###');
                    return this.fetchI18nJson(input[0], input[1], this.translate().getLangs())
                        .pipe(map(trans=>{
                            return {id:id,translation:trans};
                        }),
                            catchError(err=>{
                                _.remove(this.loading,id);
                                return throwError(err);
                            })
                        );
                })
            )
            .subscribe(result=>{
                for (let lang of this.translate().getLangs()) {
                    if (result.translation[lang]) {
                        this.translate().setTranslation(lang, result.translation[lang], true);
                    }
                }
                this.loaded.push(result.id);
            });
        this.initiated = true;
    }

    private translate(): TranslateService {
        return this.$injector.get(TranslateService);
    }
}

export class ThirdsI18nLoader implements TranslateLoader {

    constructor(thirdsService: ThirdsService) {}

    getTranslation(lang: string): Observable<any> {
        return of({});
    }

}

export function ThirdsI18nLoaderFactory(thirdsService: ThirdsService): TranslateLoader {
    return new ThirdsI18nLoader(thirdsService);
}