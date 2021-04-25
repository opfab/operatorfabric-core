/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
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
import {merge, Observable, of, Subject} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {catchError, map, skip, tap} from 'rxjs/operators';
import {Process, TypeOfStateEnum} from '@ofModel/processes.model';
import {MonitoringConfig} from '@ofModel/monitoringConfig.model';
import {Card} from '@ofModel/card.model';
import {select, Store} from '@ngrx/store';
import {selectLinesOfLoggingResult} from '@ofStore/selectors/logging.selectors';
import {AppState} from '@ofStore/index';
import {selectLastCards} from '@ofStore/selectors/feed.selectors';
import {Utilities} from '../common/utilities';


@Injectable()
export class ProcessesService {
    readonly processesUrl: string;
    readonly processGroupsUrl: string;
    readonly monitoringConfigUrl: string;
    private urlCleaner: HttpUrlEncodingCodec;
    private processCache = new Map();
    private translationsAlreadyLoaded = new Set<string>();
    private processes: Process[];
    private processGroups: {id: string, processes: string[]}[];
    private translationsLoaded = new Subject();
    private monitoringConfig: MonitoringConfig;

    private typeOfStatesPerProcessAndState: Map<string, TypeOfStateEnum>;

    constructor(private httpClient: HttpClient, private translateService: TranslateService, private store: Store<AppState>
    ) {
        this.urlCleaner = new HttpUrlEncodingCodec();
        this.processesUrl = `${environment.urls.processes}`;
        this.processGroupsUrl = `${environment.urls.processGroups}`;
        this.monitoringConfigUrl = `${environment.urls.monitoringConfig}`;
        this.loadTranslationIfNeededAfterLoadingLoggingCard();
        this.loadTranslationIfNeededAfterLoadingCard();
    }

    private loadTranslationIfNeededAfterLoadingCard() {
        this.store.pipe(
            select(selectLastCards))
            .subscribe(cards =>  cards.forEach(card => this.loadTranslationsForProcess(card.process, card.processVersion)));
    }


    private loadTranslationIfNeededAfterLoadingLoggingCard() {
        this.store.pipe(
            select(selectLinesOfLoggingResult))
            .subscribe(lines => lines.forEach(loggingResult =>
                this.loadTranslationsForProcess(loggingResult.process, loggingResult.processVersion)));
    }

    public loadTranslationsForProcess(process, version) {
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
                        if (this.processes.length === 0) {
                            console.log(new Date().toISOString(), 'WARNING : no processes configured');
                            this.translationsLoaded.next();
                            } else {
                            this.loadAllTranslations();
                            console.log(new Date().toISOString(), 'List of processes loaded');
                        }
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


    public loadMonitoringConfig(): Observable<MonitoringConfig> {
        return this.httpClient.get<MonitoringConfig>(this.monitoringConfigUrl)
            .pipe(
                map(monitoringConfig => {
                        if (!!monitoringConfig) {
                            this.monitoringConfig = monitoringConfig;
                            console.log(new Date().toISOString(), 'Monitoring config loaded');
                        }
                        else  console.log(new Date().toISOString(), 'No monitoring config to load');
                        return monitoringConfig;
                    }, (error) => console.error(new Date().toISOString(), 'An error occurred when loading monitoringConfig', error)
                ));
    }
    public areTranslationsLoaded(): Observable<any> {
        return this.translationsLoaded;
    }

    public getAllProcesses(): Process[] {
        return this.processes;
    }

    public getProcessGroups(): {id: string, processes: string[]}[] {
        return this.processGroups;
    }

    public getMonitoringConfig(): any {
        return this.monitoringConfig;
    }


    public getProcess(processId: string): Process {
        return this.processes.find(process => processId === process.id);
    }

    public getProcessGroupsAndLabels(): { groupId: string,
                                          groupLabel: string,
                                          processes:
                                              {
                                                 processId: string,
                                                 processLabel: string
                                              } []
                                        } [] {

        const processGroupsAndLabels = [];

        this.getProcessGroups().forEach(group => {
            let groupLabel = '';
            const processIdAndLabels = [];

            this.translateService.get(group.id).subscribe(translate => { groupLabel = translate; });

            group.processes.forEach(processId => {
                const processDefinition = this.getProcess(processId);

                if (processDefinition) {
                    const processLabel = (!!processDefinition.name) ?
                        Utilities.getI18nPrefixFromProcess(processDefinition) + processDefinition.name :
                        Utilities.getI18nPrefixFromProcess(processDefinition) + processDefinition.id;

                    this.translateService.get(processLabel).subscribe(translate => {
                        processIdAndLabels.push({ processId: processId, processLabel: translate });
                    });
                } else
                    processIdAndLabels.push({processId: processId, processLabel: ''});
            });

            processGroupsAndLabels.push({ groupId: group.id,
                                          groupLabel: groupLabel,
                                          processes: processIdAndLabels
                                        });
        });
        return processGroupsAndLabels;
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

    public findProcessGroupForProcess(processId: string): string {
        for (const group of this.processGroups) {
            if (group.processes.find(process => process === processId))
                return group.id;
        }
        return '';
    }

    public getProcessesPerProcessGroups(): Map<any, any> {
        const processesPerProcessGroups = new Map();

        this.getAllProcesses().forEach(process => {

            const processGroupId = this.findProcessGroupForProcess(process.id);
            if (processGroupId !== '') {
                const processes = (!! processesPerProcessGroups.get(processGroupId) ? processesPerProcessGroups.get(processGroupId) : []);
                processes.push({id: process.id, itemName: process.name, i18nPrefix: `${process.id}.${process.version}`});
                processesPerProcessGroups.set(processGroupId, processes);
            }
        });
        return processesPerProcessGroups;
    }

    public getProcessesWithoutProcessGroup(): any[] {
        const processesWithoutProcessGroup = [];

        this.getAllProcesses().forEach(process => {
            const processGroupId = this.findProcessGroupForProcess(process.id);
            if (processGroupId === '')
                processesWithoutProcessGroup.push({ id: process.id, itemName: process.name, i18nPrefix: `${process.id}.${process.version}` });
        });
        return processesWithoutProcessGroup;
    }

    public findProcessGroupLabelForProcess(processId: string): string {
        const processGroupId = this.findProcessGroupForProcess(processId);
        return (!! processGroupId && processGroupId !== '') ? processGroupId : 'processGroup.defaultLabel';
    }

    private loadTypeOfStatesPerProcessAndState() {
        this.typeOfStatesPerProcessAndState = new Map();

        for (const process of this.processes) {
            for (const state in process.states)
                this.typeOfStatesPerProcessAndState.set(process.id + '.' + state, process.states[state].type);
        }
    }

    public getTypeOfStatesPerProcessAndState(): Map<string, TypeOfStateEnum> {
        if (! this.typeOfStatesPerProcessAndState)
            this.loadTypeOfStatesPerProcessAndState();
        return this.typeOfStatesPerProcessAndState;
    }
}
