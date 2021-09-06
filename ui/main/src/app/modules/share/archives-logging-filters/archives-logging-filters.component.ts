/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ConfigService} from '@ofServices/config.service';
import {Card} from '@ofModel/card.model';
import {LightCard} from '@ofModel/light-card.model';
import {FormGroup} from '@angular/forms';
import {ProcessesService} from '@ofServices/processes.service';
import {takeUntil} from 'rxjs/operators';
import {Observable, Subject} from 'rxjs';
import {buildSettingsOrConfigSelector} from '@ofSelectors/settings.x.config.selectors';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {TranslateService} from '@ngx-translate/core';
import {TimeService} from '@ofServices/time.service';
import {NgbDateStruct, NgbTimeStruct} from '@ng-bootstrap/ng-bootstrap';
import {DateTimeNgb} from '@ofModel/datetime-ngb.model';
import {UserService} from '@ofServices/user.service';

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
    @Input() visibleProcesses: [];
    @Input() hideChildStates?: boolean;

    unsubscribe$: Subject<void> = new Subject<void>();

    tags: any[];
    filters;

    // Filter values
    processesDropdownListPerProcessGroups = new Map();
    processesWithoutProcessGroupDropdownList = [];
    processGroupDropdownList = [];
    processGroupDropdownSettings = {};
    processDropdownList = [];
    visibleProcessesId: string[] = [];
    processDropdownListWhenSelectedProcessGroup = [];
    processDropdownSettings = {};
    stateDropdownListWhenSelectedProcess = [];
    stateDropdownSettings = {};
    tagsDropdownList = [];
    tagsDropdownSettings = {};

    statesDropdownListPerProcesses = new Map();
    processesGroups: {id: string, processes: string[]}[];
    checkPerimeterForSearchFields: boolean;

    constructor(private store: Store<AppState>,
                private translate: TranslateService,
                private configService: ConfigService,
                private timeService: TimeService,
                private processesService: ProcessesService,
                private userService: UserService) {
    }

    ngOnInit() {
        this.tags = this.configService.getConfigValue('archive.filters.tags.list');
        this.checkPerimeterForSearchFields = this.configService.getConfigValue('checkPerimeterForSearchFields', false);
        this.processesGroups = this.processesService.getProcessGroups();
        this.processDropdownList = this.visibleProcesses;
        this.processDropdownListWhenSelectedProcessGroup = [];
        this.stateDropdownListWhenSelectedProcess = [];
        this.visibleProcessesId = this.processDropdownList.map(element => element.id);

        if (!!this.tags) {
            this.tags.forEach(tag => this.tagsDropdownList.push({ id: tag.value, itemName: tag.label }));
        }

        this.loadAllStatesPerProcesses();
        this.loadProcessGroupDropdownListAndProcessesDropdownList();

        this.getLocale().pipe(takeUntil(this.unsubscribe$)).subscribe(locale => {
            this.translate.use(locale);
            this.translate.get(['filters.selectProcessGroupText', 'filters.selectProcessText', 'filters.selectStateText',
                'filters.selectTagText'])
                .subscribe(translations => {
                    this.processGroupDropdownSettings = {
                        text: translations['filters.selectProcessGroupText'],
                        badgeShowLimit: 1,
                        enableSearchFilter: true
                    };
                    this.processDropdownSettings = {
                        text: translations['filters.selectProcessText'],
                        badgeShowLimit: 1,
                        enableSearchFilter: true
                    };
                    this.stateDropdownSettings = {
                        text: translations['filters.selectStateText'],
                        badgeShowLimit: 1,
                        enableSearchFilter: true
                    };
                    this.tagsDropdownSettings = {
                        text: translations['filters.selectTagText'],
                        badgeShowLimit: 1,
                        enableSearchFilter: true
                    };
                });
        });

        this.changeProcessesWhenSelectProcessGroup();
        this.changeStatesWhenSelectProcess();
    }

    public loadProcessGroupDropdownListAndProcessesDropdownList(): void {

        this.processesDropdownListPerProcessGroups = this.processesService.getProcessesPerProcessGroups(this.visibleProcessesId);
        this.processesWithoutProcessGroupDropdownList = this.processesService.getProcessesWithoutProcessGroup();

        if (this.checkPerimeterForSearchFields)
            this.filterProcessesWithStatesWithReceiveRights();

        if (this.processesWithoutProcessGroupDropdownList.length > 0)
            this.processGroupDropdownList.push({ id: '--', itemName: 'processGroup.defaultLabel' });

        const processGroups = Array.from(this.processesDropdownListPerProcessGroups.keys());
        processGroups.forEach(processGroup => this.processGroupDropdownList.push({ id: processGroup, itemName: processGroup }));
    }

    private filterProcessesWithStatesWithReceiveRights(): void {
        this.processesWithoutProcessGroupDropdownList = this.processesWithoutProcessGroupDropdownList.filter(processData =>
            !!this.statesDropdownListPerProcesses.get(processData.id));

        this.processesDropdownListPerProcessGroups.forEach((processList, processGroupId) => {
            processList = processList.filter(processData => !!this.statesDropdownListPerProcesses.get(processData.id));
            if (! processList.length)
                this.processesDropdownListPerProcessGroups.delete(processGroupId);
            else
                this.processesDropdownListPerProcessGroups.set(processGroupId, processList);
        });
    }

    /**
     * Transforms the filters list to Map
     */
    filtersToMap = (filters: any): void => {
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
                        if (key === 'state')
                            this.stateFilterToMap(element);
                        else if (key === 'processGroup')
                            this.processGroupFilterToMap(element);
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

    processGroupFilterToMap(element: any) {
        const ids = [];

        element.forEach(processGroup => {
            if (processGroup.id === '--')
                this.processesWithoutProcessGroupDropdownList.forEach(process => ids.push(process.id));
            else
                this.processesDropdownListPerProcessGroups.get(processGroup.id).forEach(process => ids.push(process.id));
        });

        if (!this.filters.get('process'))
            this.filters.set('process', ids);
    }

    addProcessesDropdownList(processesDropdownList: any[]): void {
        processesDropdownList.forEach( processDropdownList =>
            this.processDropdownListWhenSelectedProcessGroup.push(processDropdownList) );
    }

    addStatesDropdownList(statesDropdownList: any[]): void {
        statesDropdownList.forEach( stateDropdownList =>
            this.stateDropdownListWhenSelectedProcess.push(stateDropdownList) );
    }

    changeProcessesWhenSelectProcessGroup(): void {
        this.parentForm.get('processGroup').valueChanges.subscribe((selectedProcessGroups) => {

            if (!! selectedProcessGroups && selectedProcessGroups.length > 0) {
                this.processDropdownListWhenSelectedProcessGroup = [];
                selectedProcessGroups.forEach(processGroup => {

                    if (processGroup.id === '--')
                        this.addProcessesDropdownList(this.processesWithoutProcessGroupDropdownList);
                    else
                        this.addProcessesDropdownList(this.processesDropdownListPerProcessGroups.get(processGroup.id));
                });
            } else
                this.processDropdownListWhenSelectedProcessGroup = [];
        });
    }

    changeStatesWhenSelectProcess(): void {
        this.parentForm.get('process').valueChanges.subscribe((selectedProcesses) => {

            if (!! selectedProcesses && selectedProcesses.length > 0) {
                this.stateDropdownListWhenSelectedProcess = [];
                selectedProcesses.forEach(process =>
                    this.addStatesDropdownList(this.statesDropdownListPerProcesses.get(process.id))
                );
            } else
                this.stateDropdownListWhenSelectedProcess = [];
        });
    }

    loadAllStatesPerProcesses(): void {
        this.processesService.getAllProcesses().forEach(process => {

            const statesDropdownList = [];
            for (const state in process.states) {

                if (!(this.hideChildStates && process.states[state].isOnlyAChildState) &&
                    ((!this.checkPerimeterForSearchFields) || this.userService.isReceiveRightsForProcessAndState(process.id, state))) {
                    statesDropdownList.push({
                        id: process.id + '.' + state,
                        itemName: process.states[state].name,
                        i18nPrefix: `${process.id}.${process.version}`
                    });
                }
            }
            if (statesDropdownList.length)
                this.statesDropdownListPerProcesses.set(process.id, statesDropdownList);
        });
    }

    displayProcessGroupFilter() {
        return !!this.processGroupDropdownList && this.processGroupDropdownList.length > 1 ;
    }

    isThereProcessGroup(): boolean {
        return !!this.processesGroups && this.processesGroups.length > 0;
    }

    protected getLocale(): Observable<string> {
        return this.store.select(buildSettingsOrConfigSelector('locale'));
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
