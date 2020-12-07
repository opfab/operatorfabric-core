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
import {Observable, of, Subject} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {catchError, map, skip, tap} from 'rxjs/operators';
import {Process} from '@ofModel/processes.model';
import {Card} from '@ofModel/card.model';
import {merge} from 'rxjs';
import { Store, select } from '@ngrx/store';
import { selectArchiveLightCards } from '@ofStore/selectors/archive.selectors';
import { selectLinesOfLoggingResult } from '@ofStore/selectors/logging.selectors';
import { AppState } from '@ofStore/index';
import { selectFeed, selectLastCards } from '@ofStore/selectors/feed.selectors';


@Injectable()
export class ProcessesService {
    readonly processesUrl: string;
    readonly processGroupsUrl: string;
    private urlCleaner: HttpUrlEncodingCodec;
    private processCache = new Map();
    private translationsAlreadyLoaded = new Set<string>();
    private processes: Process[];
    private processGroups: {idGroup: string, processes: string[]}[];
    private translationsLoaded = new Subject();

    constructor(private httpClient: HttpClient, private translateService: TranslateService, private store: Store<AppState>
    ) {
        this.urlCleaner = new HttpUrlEncodingCodec();
        this.processesUrl = `${environment.urls.processes}`;
        this.processGroupsUrl = `${environment.urls.processGroups}`;
        this.loadTranslationIfNeededAfterLoadingArchiveCard();
        this.loadTranslationIfNeededAfterLoadingLoggingCard();
        this.loadTranslationIfNeededAfterLoadingCard();
    }

    private loadTranslationIfNeededAfterLoadingCard() {
        this.store.pipe(
            select(selectLastCards))
            .subscribe(cards =>  cards.forEach(card => this.loadTranslationsForProcess(card.process, card.processVersion)));
    }

    private loadTranslationIfNeededAfterLoadingArchiveCard() {
        this.store.pipe(
            select(selectArchiveLightCards))
            .subscribe(cards => cards.forEach(card => this.loadTranslationsForProcess(card.process, card.processVersion)));
    }

    private loadTranslationIfNeededAfterLoadingLoggingCard() {
        this.store.pipe(
            select(selectLinesOfLoggingResult))
            .subscribe(lines => lines.forEach(loggingResult =>
                this.loadTranslationsForProcess(loggingResult.process, loggingResult.processVersion)));
    }

    private loadTranslationsForProcess(process,version) {
        this.translateService.getLangs().forEach(
            local => this.addTranslationIfNeeded(local, process, version ));
    }

    public addTranslationIfNeeded(locale: string, process: string, version: string) {
        if (!this.translationsAlreadyLoaded.has(locale + '/' + process + '/' + version)) {
            this.translationsAlreadyLoaded.add(locale + '/' + process + '/' + version);
            this.askForI18nJson(process, locale, version)
                .pipe(map(i18n => this.translateService.setTranslation(locale, i18n, true))).subscribe();
        }
    }

    public loadAllProcesses(): Observable<any> {
        return this.queryAllProcesses()
            .pipe(
                map(processesLoaded => {
                    if (!!processesLoaded) {
                        this.processes = processesLoaded;
                        this.loadAllTranslations();
                        console.log(new Date().toISOString(), 'List of processes loaded');
                    }
                }, (error) => console.error(new Date().toISOString(), 'an error occurred', error)
                ));
    }

    public loadProcessGroups(): Observable<any> {
        return this.queryProcessGroups()
            .pipe(
                map(processGroupsFile => {
                        if (!!processGroupsFile) {
                            this.processGroups = processGroupsFile.groups;

                            for (const language in processGroupsFile.locale)
                                 this.translateService.setTranslation(language, processGroupsFile.locale[language], true);

                            console.log(new Date().toISOString(), 'List of process groups loaded');
                        }
                    }, (error) => console.error(new Date().toISOString(), 'An error occurred when loading processGroups', error)
                ));
    }

    private loadAllTranslations() {
        const requests$ = [];
        this.processes.forEach(process => {
            this.translateService.getLangs().forEach(
                local => {
                    this.translationsAlreadyLoaded.add(local + '/' + process.id + '/' + process.version);
                    requests$.push(this.askForI18nJson(process.id, local, process.version)
                        .pipe(map(i18n => this.translateService.setTranslation(local, i18n, true))));
                }
            );
        });
        // Wait for all translation request to complete before setting translations to load
        merge(...requests$).pipe(skip(requests$.length - 1)).subscribe(() =>  {
            this.translationsLoaded.next();
            console.log(new Date().toISOString(), 'Translations for processes loaded');
        });
    }

    public areTranslationsLoaded(): Observable<any> {
        return this.translationsLoaded;
    }

    public getAllProcesses(): Process[] {
        return this.processes;
    }

    public getProcessGroups(): {idGroup: string, processes: string[]}[] {
        return this.processGroups;
    }

    queryProcessFromCard(card: Card): Observable<Process> {
        return this.queryProcess(card.process, card.processVersion);
    }

    queryAllProcesses(): Observable<Process[]> {
        return this.httpClient.get<Process[]>(this.processesUrl);
    }

    queryProcessGroups(): Observable<any> {
        return this.httpClient.get(this.processGroupsUrl);
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
                map(this.convertJsonToI18NObject(process, version))
                , catchError(error => {
                    console.error(new Date().toISOString(),
                    `error trying fetch i18n of '${process}' version:'${version}' for locale: '${locale}'`);
                    return of(error);
                })
            );
    }

    private convertJsonToI18NObject(process: string, version: string) {
        return r => {
            const object = {};
            object[process] = {};
            object[process][version] = r;
            return object;
        };
    }

}
