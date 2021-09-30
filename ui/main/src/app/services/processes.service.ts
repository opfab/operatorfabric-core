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
import {AppState} from '@ofStore/index';
import {selectLastCardLoaded} from '@ofStore/selectors/feed.selectors';


@Injectable()
export class ProcessesService {
    readonly processesUrl: string;
    readonly processGroupsUrl: string;
    readonly monitoringConfigUrl: string;
    private urlCleaner: HttpUrlEncodingCodec;
    private processCache = new Map();
    private translationsAlreadyLoaded = new Set<string>();
    private processes: Process[];
    private processGroups = new Map<string, {name: string, processes: string[]}>();
    private translationsLoaded = new Subject();
    private monitoringConfig: MonitoringConfig;

    private typeOfStatesPerProcessAndState: Map<string, TypeOfStateEnum>;

    constructor(private httpClient: HttpClient, private translateService: TranslateService, private store: Store<AppState>
    ) {
        this.urlCleaner = new HttpUrlEncodingCodec();
        this.processesUrl = `${environment.urls.processes}`;
        this.processGroupsUrl = `${environment.urls.processGroups}`;
        this.monitoringConfigUrl = `${environment.urls.monitoringConfig}`;
        this.loadTranslationIfNeededAfterLoadingCard();
    }

    private loadTranslationIfNeededAfterLoadingCard() {
        this.store.pipe(
            select(selectLastCardLoaded))
            .subscribe(card => { if (!!card) this.loadTranslationsForProcess(card.process, card.processVersion)});
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
                            this.translationsLoaded.next(null);
                        } else {
                            this.loadAllProcessesInCache();
                            this.loadAllTranslations();
                            console.log(new Date().toISOString(), 'List of processes loaded');
                        }
                    }
                }),
                    catchError(error => {
                        console.error(new Date().toISOString(), 'An error occurred when loading all processes', error);
                        return of(error);
                    })
                );
    }

    public loadProcessGroups(): Observable<any> {
        return this.queryProcessGroups()
            .pipe(
                map(processGroupsFile => {
                        if (!!processGroupsFile) {
                            const processGroupsList = processGroupsFile.groups;
                            if (!! processGroupsList)
                                processGroupsList.forEach(processGroup => {
                                    this.processGroups.set(processGroup.id, {name: processGroup.name, processes: processGroup.processes});
                                });
                            console.log(new Date().toISOString(), 'List of process groups loaded');
                        }
                }),
                    catchError(error => {
                        console.error(new Date().toISOString(), 'An error occurred when loading processGroups', error);
                        return of(error);
                    })
                );
    }

    private loadAllProcessesInCache() {
        this.processes.forEach(process => {
            this.processCache.set(`${process.id}.${process.version}` , Object.setPrototypeOf(process, Process.prototype)); 
        });
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
            this.translationsLoaded.next(null);
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
                    }), 
                    catchError(error => {
                        console.error(new Date().toISOString(), 'An error occurred when loading monitoringConfig', error);
                        return of(error);
                    }
                ));
    }
    public areTranslationsLoaded(): Observable<any> {
        return this.translationsLoaded;
    }

    public getAllProcesses(): Process[] {
        return this.processes;
    }

    public getProcessGroups(): Map<string, {name: string, processes: string[]}> {
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

        this.getProcessGroups().forEach((group, groupId) => {
            const processIdAndLabels = [];

            group.processes.forEach(processId => {
                const processDefinition = this.getProcess(processId);

                if (processDefinition)
                    processIdAndLabels.push({processId: processId, processLabel: ((!!processDefinition.name) ? processDefinition.name : processDefinition.id)});
                else
                    processIdAndLabels.push({processId: processId, processLabel: ''});
            });

            processGroupsAndLabels.push({ groupId: groupId,
                                          groupLabel: !! group.name ? group.name : groupId,
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

    fetchHbsTemplate(process: string, version: string, name: string): Observable<string> {
        const params = new HttpParams()
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

    public findProcessGroupForProcess(processId: string) {
        for (let [groupId, group] of this.processGroups) {
            if (group.processes.find(process => process === processId))
                return {id: groupId, name: group.name, processes: group.processes};
        }
        return null;
    }

    public getProcessesPerProcessGroups(processesFilter?: string[]): Map<any, any> {
        const processesPerProcessGroups = new Map();

        this.getAllProcesses().forEach(process => {

            if ((! processesFilter) || processesFilter.includes(process.id)) {
                const processGroup = this.findProcessGroupForProcess(process.id);
                if (!! processGroup) {
                    const processes = (!!processesPerProcessGroups.get(processGroup.id) ? processesPerProcessGroups.get(processGroup.id) : []);
                    processes.push({
                        id: process.id,
                        itemName: process.name
                    });
                    processesPerProcessGroups.set(processGroup.id, processes);
                }
            }
        });
        return processesPerProcessGroups;
    }

    public getProcessesWithoutProcessGroup(): any[] {
        const processesWithoutProcessGroup = [];

        this.getAllProcesses().forEach(process => {
            const processGroup = this.findProcessGroupForProcess(process.id);
            if (! processGroup)
                processesWithoutProcessGroup.push({ id: process.id, itemName: process.name });
        });
        return processesWithoutProcessGroup;
    }

    public findProcessGroupLabelForProcess(processId: string): string {
        const processGroup = this.findProcessGroupForProcess(processId);
        return (!! processGroup) ? processGroup.name : 'processGroup.defaultLabel';
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
