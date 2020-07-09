/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



import {Injectable} from '@angular/core';
import {HttpClient, HttpParams, HttpUrlEncodingCodec} from '@angular/common/http';
import {environment} from '@env/environment';
import {from, Observable, of, throwError} from 'rxjs';
import {TranslateLoader} from '@ngx-translate/core';
import {catchError, filter, map, reduce, switchMap, tap} from 'rxjs/operators';
import {Process, Menu, ResponseBtnColorEnum} from '@ofModel/processes.model';
import {Card} from '@ofModel/card.model';

@Injectable()
export class ProcessesService {
    readonly processesUrl: string;
    private urlCleaner: HttpUrlEncodingCodec;
    private processCache = new Map();

    constructor(private httpClient: HttpClient,
    ) {
        this.urlCleaner = new HttpUrlEncodingCodec();
        this.processesUrl = `${environment.urls.processes}`;
    }

    queryProcessFromCard(card: Card): Observable<Process> {
        return this.queryProcess(card.process, card.processVersion);
    }

    queryProcess(id: string, version: string): Observable<Process> {
        const key = `${id}.${version}`;
        const process = this.processCache.get(key);
        if (process) {
            return of(process);
        }
        return this.fetchProcess(id, version)
            .pipe(
                tap(t => {
                    if (t) {
                        Object.setPrototypeOf(t, Process.prototype);
                    }
                }),
                tap(t => {
                    if (t) {
                        this.processCache.set(key, t);
                    }
                })
            );
    }

    private fetchProcess(id: string, version: string): Observable<Process> {
        const params = new HttpParams()
            .set('version', version);
        return this.httpClient.get<Process>(`${this.processesUrl}/${id}/`, {
            params
        });
    }
    queryMenuEntryURL(id: string, version: string, menuEntryId: string): Observable<string> {
        return this.queryProcess(id, version).pipe(
            switchMap(process => {
                const entry = process.menuEntries.filter(e => e.id === menuEntryId);
                if (entry.length === 1) {
                    return entry;
                } else {
                    throwError(new Error('No such menu entry.'));
                }
            }),
            catchError((err, caught) => {
                console.log(err);
                return throwError(err);
            }),
            map(menuEntry => menuEntry.url)
        );
    }
    
    fetchHbsTemplate(process: string, version: string, name: string, locale: string): Observable<string> {
        const params = new HttpParams()
            .set('locale', locale)
            .set('version', version);
        return this.httpClient.get(`${this.processesUrl}/${process}/templates/${name}`, {
            params,
            responseType: 'text'
        });
    }

    computeBusinessconfigCssUrl(process: string, styleName: string, version: string) {
        // manage url character encoding
        const resourceUrl = this.urlCleaner.encodeValue(`${this.processesUrl}/${process}/css/${styleName}`);
        const versionParam = new HttpParams().set('version', version);
        return `${resourceUrl}?${versionParam.toString()}`;
    }

    private convertJsonToI18NObject(locale, process: string, version: string) {
        return r => {
            const object = {};
            object[process] = {};
            object[process][version] = r;
            return object;
        };
    }

    askForI18nJson(process: string, locale: string, version?: string): Observable<any> {
        let params = new HttpParams().set('locale', locale);
        if (version) {
            /*
            `params` override needed otherwise only locale is use in the request.
            It's so because HttpParams.set(...) return a new HttpParams,
            and basically that's why HttpParams can be set with fluent API...
             */
            params = params.set('version', version);
        }
        return this.httpClient.get(`${this.processesUrl}/${process}/i18n`, {params})
            .pipe(
                map(this.convertJsonToI18NObject(locale, process, version))
                , catchError(error => {
                    console.error(`error trying fetch i18n of '${process}' version:'${version}' for locale: '${locale}'`);
                    return error;
                })
            );
    }

    computeMenu(): Observable<Menu[]> {
        return this.httpClient.get<Process[]>(`${this.processesUrl}/`).pipe(
            switchMap(processes => from(processes)),
            filter((process: Process) => !(!process.menuEntries)),
            map(process =>
                new Menu(process.id, process.version, process.menuLabel, process.menuEntries)
            ),
            reduce((menus: Menu[], menu: Menu) => {
                menus.push(menu);
                return menus;
            }, [])
        );
    }

    getResponseBtnColorEnumValue(responseBtnColorEnum: ResponseBtnColorEnum): string {
        switch (responseBtnColorEnum) {
            case 'RED':
                return 'btn-danger';
            case 'GREEN':
                return 'btn-success'
            case 'YELLOW':
                return 'btn-warning';
            default:
                return 'btn-success';
        }
    }
}

export class BusinessconfigI18nLoader implements TranslateLoader {

    constructor(businessconfigService: ProcessesService) {
    }

    getTranslation(lang: string): Observable<any> {
        return of({});
    }

}

export function BusinessconfigI18nLoaderFactory(businessconfigService: ProcessesService): TranslateLoader {
    return new BusinessconfigI18nLoader(businessconfigService);
}
