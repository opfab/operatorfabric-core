/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ConfigService} from "@ofServices/config.service";
import {Card} from "@ofModel/card.model";
import {LightCard} from "@ofModel/light-card.model";
import {FormGroup} from "@angular/forms";
import {ProcessesService} from "@ofServices/processes.service";
import {takeUntil} from "rxjs/operators";
import {Observable, Subject} from "rxjs";
import {buildSettingsOrConfigSelector} from "@ofSelectors/settings.x.config.selectors";
import {Store} from "@ngrx/store";
import {AppState} from "@ofStore/index";
import {TranslateService} from "@ngx-translate/core";
import {TimeService} from "@ofServices/time.service";
import {NgbDateStruct, NgbTimeStruct} from "@ng-bootstrap/ng-bootstrap";
import {DateTimeNgb} from "@ofModel/datetime-ngb.model";

export enum FilterDateTypes {
    PUBLISH_DATE_FROM_PARAM = 'publishDateFrom',
    PUBLISH_DATE_TO_PARAM = 'publishDateTo',
    ACTIVE_FROM_PARAM = 'activeFrom',
    ACTIVE_TO_PARAM = 'activeTo'

}

export const checkElement = (enumeration: typeof FilterDateTypes, value: string): boolean => {
    let result = false;
    if (Object.values(enumeration).map(enumValue => enumValue.toString()).includes(value)) {
        result = true;
    }
    return result;
};

export const transformToTimestamp = (date: NgbDateStruct, time: NgbTimeStruct): string => {
    return new DateTimeNgb(date, time).formatDateTime();
};

@Component({
    selector: 'of-archives-logging-filters',
    templateUrl: './archives-logging-filters.component.html'
})
export class ArchivesLoggingFiltersComponent implements OnInit, OnDestroy {

    @Input() public card: Card | LightCard;
    @Input() parentForm: FormGroup;

    unsubscribe$: Subject<void> = new Subject<void>();

    tags: any[];
    filters;

    // Filter values
    serviceDropdownList = [];
    serviceDropdownSettings = {};
    processDropdownList = [];
    processDropdownListWhenSelectedService = [];
    processesWithoutServiceDropdownList = [];
    processDropdownSettings = {};
    stateDropdownListWhenSelectedProcess = [];
    stateDropdownSettings = {};
    tagsDropdownList = [];
    tagsDropdownSettings = {};

    processesDropdownListPerServices = new Map();
    statesDropdownListPerProcesses = new Map();
    processesGroups: {id: string, processes: string[]}[];

    constructor(private store: Store<AppState>,
                private translate: TranslateService,
                private configService: ConfigService,
                private timeService: TimeService,
                private processesService: ProcessesService) {
    }

    ngOnInit() {
        this.tags = this.configService.getConfigValue('archive.filters.tags.list');
        this.processesGroups = this.processesService.getProcessGroups();

        this.processesService.getAllProcesses().forEach((process) => {
            const id = process.id;
            let itemName = process.name;
            if (!itemName) {
                itemName = id;
            }
            this.processDropdownList.push({ id: id, itemName: itemName, i18nPrefix: `${process.id}.${process.version}` });
        });
        this.processDropdownListWhenSelectedService = [];
        this.stateDropdownListWhenSelectedProcess = [];

        if (!!this.tags) {
            this.tags.forEach(tag => this.tagsDropdownList.push({ id: tag.value, itemName: tag.label }));
        }

        this.loadAllProcessesPerServices();
        this.loadAllStatesPerProcesses();

        this.getLocale().pipe(takeUntil(this.unsubscribe$)).subscribe(locale => {
            this.translate.use(locale);
            this.translate.get(['filters.selectServiceText','filters.selectProcessText','filters.selectStateText',
                'filters.selectTagText'])
                .subscribe(translations => {
                    this.serviceDropdownSettings = {
                        text: translations['filters.selectServiceText'],
                        badgeShowLimit: 1,
                        enableSearchFilter: true
                    }
                    this.processDropdownSettings = {
                        text: translations['filters.selectProcessText'],
                        badgeShowLimit: 1,
                        enableSearchFilter: true
                    }
                    this.stateDropdownSettings = {
                        text: translations['filters.selectStateText'],
                        badgeShowLimit: 1,
                        enableSearchFilter: true
                    }
                    this.tagsDropdownSettings = {
                        text: translations['filters.selectTagText'],
                        badgeShowLimit: 1,
                        enableSearchFilter: true
                    };
                })
        });

        this.changeProcessesWhenSelectService();
        this.changeStatesWhenSelectProcess();
    }

    /**
     * Transforms the filters list to Map
     */
    filtersToMap = (filters: any) : void => {
        this.filters = new Map();
        Object.keys(filters).forEach(key => {
            const element = filters[key];
            // if the form element is date
            if (element) {
                if (checkElement(FilterDateTypes, key))
                    this.dateFilterToMap(key, element);
                else {
                    if (element.length) {
                        const ids = [];
                        if (key == 'state')
                            this.stateFilterToMap(element);
                        else if (key == 'service')
                            this.serviceFilterToMap(element);
                        else {
                            element.forEach(val => ids.push(val.id));
                            this.filters.set(key, ids);
                        }
                    }
                }
            }
        });
    }

    dateFilterToMap(key: string, element: any) {
        const { date, time } = element;
        if (date) {
            const timeStamp = this.timeService.toNgBTimestamp(transformToTimestamp(date, time));
            if (timeStamp !== 'NaN')
                this.filters.set(key, [timeStamp]);
        }
    }

    stateFilterToMap(element: any) {
        const ids = [];
        element.forEach(val => ids.push(val.id.substring(val.id.indexOf('.') + 1)));
        this.filters.set('state', ids);
    }

    serviceFilterToMap(element: any) {
        const ids = [];

        element.forEach(service => {
            if (service.id == '--')
                this.processesWithoutServiceDropdownList.forEach(process => ids.push(process.id))
            else
                this.processesDropdownListPerServices.get(service.id).forEach(process => ids.push(process.id))
        });

        if (!this.filters.get('process'))
            this.filters.set('process', ids);
    }

    addProcessesDropdownList(processesDropdownList: any[]): void {
        processesDropdownList.forEach( processDropdownList =>
            this.processDropdownListWhenSelectedService.push(processDropdownList) );
    }

    addStatesDropdownList(statesDropdownList: any[]): void {
        statesDropdownList.forEach( stateDropdownList =>
            this.stateDropdownListWhenSelectedProcess.push(stateDropdownList) );
    }

    changeProcessesWhenSelectService(): void {
        this.parentForm.get('service').valueChanges.subscribe((selectedServices) => {

            if (!! selectedServices && selectedServices.length > 0) {
                this.processDropdownListWhenSelectedService = [];
                selectedServices.forEach(service => {

                    if (service.id == '--')
                        this.addProcessesDropdownList(this.processesWithoutServiceDropdownList);
                    else
                        this.addProcessesDropdownList(this.processesDropdownListPerServices.get(service.id));
                });
            }
            else
                this.processDropdownListWhenSelectedService = [];
        });
    }

    changeStatesWhenSelectProcess(): void {
        this.parentForm.get('process').valueChanges.subscribe((selectedProcesses) => {

            if (!! selectedProcesses && selectedProcesses.length > 0) {
                this.stateDropdownListWhenSelectedProcess = [];
                selectedProcesses.forEach(process =>
                    this.addStatesDropdownList(this.statesDropdownListPerProcesses.get(process.id))
                );
            }
            else
                this.stateDropdownListWhenSelectedProcess = [];
        });
    }

    findServiceForProcess(processId : string) : string {
        for (let group of this.processesGroups) {
            if (group.processes.find(process => process == processId))
                return group.id;
        }
        return '';
    }

    loadAllProcessesPerServices(): void {
        this.processesService.getAllProcesses().forEach(process => {

            const service = this.findServiceForProcess(process.id);
            if (service != '') {
                let processes = (!! this.processesDropdownListPerServices.get(service) ? this.processesDropdownListPerServices.get(service) : []);
                processes.push({id: process.id, itemName: process.name, i18nPrefix: `${process.id}.${process.version}`});
                this.processesDropdownListPerServices.set(service, processes);
            }
            else
                this.processesWithoutServiceDropdownList.push({ id: process.id, itemName: process.name, i18nPrefix: `${process.id}.${process.version}` });
        });
        if (this.processesWithoutServiceDropdownList.length > 0)
            this.serviceDropdownList.push({ id: '--', itemName: "service.defaultLabel" });

        const services = Array.from(this.processesDropdownListPerServices.keys());
        services.forEach(service => this.serviceDropdownList.push({ id: service, itemName: service }));
    }

    loadAllStatesPerProcesses(): void {
        this.processesService.getAllProcesses().forEach(process => {

            let statesDropdownList = [];
            for (let state in process.states)
                statesDropdownList.push({id: process.id + '.' + state, itemName: process.states[state].name, i18nPrefix: `${process.id}.${process.version}`});
            this.statesDropdownListPerProcesses.set(process.id, statesDropdownList);
        });
    }

    displayServiceFilter() {
        return !!this.serviceDropdownList && this.serviceDropdownList.length > 1 ;
    }

    protected getLocale(): Observable<string> {
        return this.store.select(buildSettingsOrConfigSelector('locale'));
    }

    findServiceLabelForProcess(processId : string) : string {
        const serviceId = this.findServiceForProcess(processId);
        return (!! serviceId && serviceId != '') ? serviceId : "service.defaultLabel";
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
