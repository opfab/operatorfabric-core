/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable, Injector} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {AuthenticationService} from "@ofServices/authentication.service";
import {empty, from, merge, Observable, of, throwError} from "rxjs";
import {TranslateLoader, TranslateService} from "@ngx-translate/core";
import {Map} from "../model/map";
import {catchError, map, reduce, switchMap, tap} from "rxjs/operators";
import * as _ from 'lodash';
import {Store} from "@ngrx/store";
import {AppState} from "../store/index";
import {LightCard} from "../model/light-card.model";
import {Third, ThirdMenu} from "@ofModel/thirds.model";

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
            reduce((acc, val) => _.merge(acc,val))
        );

        return result;
    }

    computeThirdsMenu(): Observable<ThirdMenu[]>{
        // return of([new ThirdMenu('tLabel1','t1',[
        //     new ThirdMenuEntry('id1','label1','link1'),
        //     new ThirdMenuEntry('id2','label2','link2'),
        // ]),
        //     new ThirdMenu('tLabel2','t2',[
        //         new ThirdMenuEntry('id3','label3','link3'),
        //     ])])
        return this.httpClient.get<Third[]>(`${this.thirdsUrl}/`, {
            headers: this.authenticationService.getSecurityHeader()
        }).pipe(
            switchMap(ts=>from(ts)),
            map(t=>
                new ThirdMenu(t.name, t.version, t.i18nLabelKey, t.menuEntries)
            ),
            reduce((menus:ThirdMenu[],menu:ThirdMenu)=>{
                menus.push(menu);
                return menus;
            },[])
        );
    }

    loadI18nForLightCards(cards:LightCard[]){
        let observable = from(cards).pipe(map(card=> card.publisher + '###' + card.publisherVersion));
        return this.subscribeToLoadI18n(observable);
    }

    loadI18nForMenuEntries(menus:ThirdMenu[]){
        const observable = from(menus).pipe(map(menu=> menu.id + '###' + menu.version));
        return this.subscribeToLoadI18n(observable);
    }

    private subscribeToLoadI18n(observable) {
        return observable
            .pipe(
                reduce((ids: string[], id: string) => {
                    ids.push(id);
                    return ids;
                }, []),
                switchMap((ids:string[]) => {
                    let work = _.uniq(ids);
                    work = _.difference<string>(work, this.loading)
                    return from(_.difference<string>(work, this.loaded))
                }),
                switchMap((id: string) => {
                    this.loading.push(id);
                    const input = id.split('###');
                    return this.fetchI18nJson(input[0], input[1], this.translate().getLangs())
                        .pipe(map(trans => {
                            console.debug(`translation received for ${id}`);
                                return {id: id, translation: trans};
                            }),
                            catchError(err => {
                                console.error(`translation error for ${id}`);
                                _.remove(this.loading, id);
                                return throwError(err);
                            })
                        );
                }),
                catchError(error =>{
                    console.error(error);
                    return throwError(error);
                }),
                reduce((acc, val) => _.merge(acc,val)),
                map(
                    (result:any) => {
                        console.debug(`receiving i18n data`)
                        for (let lang of this.translate().getLangs()) {
                            if (result.translation[lang]) {
                                this.translate().setTranslation(lang, result.translation[lang], true);
                            }
                        }
                        _.remove(this.loading, result.id);
                        this.loaded.push(result.id);
                        return true;
                    }
                )
            )
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