/* Copyright (c) 2021-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ConfigService} from '@ofServices/config.service';
import {Card} from '@ofModel/card.model';
import {LightCard} from '@ofModel/light-card.model';
import {FormGroup} from '@angular/forms';
import {ProcessesService} from '@ofServices/processes.service';
import {debounceTime, takeUntil} from 'rxjs/operators';
import {Observable, Subject} from 'rxjs';
import {buildSettingsOrConfigSelector} from '@ofSelectors/settings.x.config.selectors';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {TranslateService} from '@ngx-translate/core';
import {TimeService} from '@ofServices/time.service';
import {NgbDateStruct, NgbTimeStruct} from '@ng-bootstrap/ng-bootstrap';
import {DateTimeNgb} from '@ofModel/datetime-ngb.model';
import {ProcessStatesDropdownListService} from '@ofServices/process-states-dropdown-list.service';
import moment from 'moment';

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
    templateUrl: './archives-logging-filters.component.html',
    styleUrls: ['./archives-logging-filters.component.scss']
})
export class ArchivesLoggingFiltersComponent implements OnInit, OnDestroy {

    @Input() public card: Card | LightCard;
    @Input() parentForm: FormGroup;
    @Input() visibleProcesses: any[];
    @Input() hideChildStates: boolean;
    @Input() tags: any[];
    @Output() search = new EventEmitter<string>();
    @Output() reset = new EventEmitter<string>();

    unsubscribe$: Subject<void> = new Subject<void>();

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
    processesGroups: Map<string, {name: string, processes: string[]}>;

    dateTimeFilterChange = new Subject();

    publishMinDate : {year: number, month: number, day: number} = null;
    publishMaxDate : {year: number, month: number, day: number} = null;
    activeMinDate : {year: number, month: number, day: number} = null;
    activeMaxDate : {year: number, month: number, day: number} = null;

    defaultMinPublishDate: NgbDateStruct;
    defaultMaxPublishDate: NgbDateStruct;

    constructor(private store: Store<AppState>,
                private translate: TranslateService,
                private configService: ConfigService,
                private timeService: TimeService,
                private processesService: ProcessesService,
                private processStatesDropdownListService: ProcessStatesDropdownListService) {
    }

    ngOnInit() {
        this.processesGroups = this.processesService.getProcessGroups();
        this.processDropdownListWhenSelectedProcessGroup = [];
        this.stateDropdownListWhenSelectedProcess = [];
        this.visibleProcessesId = this.visibleProcesses.map(element => element.id);

        if (!!this.tags) {
            this.tags.forEach(tag => this.tagsDropdownList.push({ id: tag.value, itemName: tag.label }));
        }

        this.loadValuesForFilters();

        this.getLocale().pipe(takeUntil(this.unsubscribe$)).subscribe(locale => {
            this.translate.use(locale);
            this.translate.get(['shared.filters.selectProcessGroupText', 'shared.filters.selectProcessText', 'shared.filters.selectStateText',
                'shared.filters.selectTagText'])
                .subscribe(translations => {
                    this.processGroupDropdownSettings = {
                        text: translations['shared.filters.selectProcessGroupText'],
                        badgeShowLimit: 1,
                        enableSearchFilter: true
                    };
                    this.processDropdownSettings = {
                        text: translations['shared.filters.selectProcessText'],
                        badgeShowLimit: 1,
                        enableSearchFilter: true
                    };
                    this.stateDropdownSettings = {
                        text: translations['shared.filters.selectStateText'],
                        badgeShowLimit: 1,
                        enableSearchFilter: true,
                        groupBy: "itemCategory"
                    };
                    this.tagsDropdownSettings = {
                        text: translations['shared.filters.selectTagText'],
                        badgeShowLimit: 1,
                        enableSearchFilter: true
                    };
                });
        });

        this.changeProcessesWhenSelectProcessGroup();
        this.changeStatesWhenSelectProcess();

        this. setDefaultPublishDateFilter();

        this.dateTimeFilterChange.pipe(
            takeUntil(this.unsubscribe$),
            debounceTime(1000),
        ).subscribe(() => this.setDateFilterBounds());
    }

    loadValuesForFilters() {
        this.statesDropdownListPerProcesses = this.processStatesDropdownListService.computeStatesDropdownListPerProcess(this.hideChildStates);
        this.processesWithoutProcessGroupDropdownList = this.processStatesDropdownListService.computeProcessesWithoutProcessGroupDropdownList(this.visibleProcessesId);
        this.processesDropdownListPerProcessGroups = this.processStatesDropdownListService.computeProcessesDropdownListPerProcessGroup(this.visibleProcessesId);
        this.processGroupDropdownList = this.processStatesDropdownListService.computeProcessGroupsDropdownList(this.processesWithoutProcessGroupDropdownList,
                                                                                                   this.processesDropdownListPerProcessGroups);

        // we must filter visibleProcesses to keep only the processes in the perimeter of the user
        const processesIds = Array.from(this.statesDropdownListPerProcesses.keys());
        this.processDropdownList = this.visibleProcesses.filter(visibleProcess => processesIds.includes(visibleProcess.id));
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

    displayProcessGroupFilter() {
        return !!this.processGroupDropdownList && this.processGroupDropdownList.length > 1 ;
    }

    isThereProcessGroup(): boolean {
        return !!this.processesGroups && this.processesGroups.size > 0;
    }

    isThereOnlyOneProcessGroupInDropdownList(): boolean {
        return !!this.processGroupDropdownList && this.processGroupDropdownList.length == 1;
    }

    isThereProcessStateToDisplay(): boolean {
        return !!this.statesDropdownListPerProcesses && this.statesDropdownListPerProcesses.size > 0;
    }


    setDefaultPublishDateFilter() {
        const defaultPublishDateInterval = this.configService.getConfigValue('archive.filters.publishDate.days', 10);

        const min = moment(Date.now());
        min.subtract(defaultPublishDateInterval, 'day');
        var minDate = min.toDate();
        this.defaultMinPublishDate = { day: minDate.getDate(), month: minDate.getMonth() + 1, year: minDate.getFullYear()};
    }

    setDateFilterBounds(): void {

        if (this.parentForm.value.publishDateFrom?.date) {
            this.publishMinDate = {year: this.parentForm.value.publishDateFrom.date.year, month: this.parentForm.value.publishDateFrom.date.month, day: this.parentForm.value.publishDateFrom.date.day};
        }
        if (this.parentForm.value.publishDateTo?.date) {
            this.publishMaxDate = {year: this.parentForm.value.publishDateTo.date.year, month: this.parentForm.value.publishDateTo.date.month, day: this.parentForm.value.publishDateTo.date.day};
        }

        if (this.parentForm.value.activeFrom?.date) {
            this.activeMinDate = {year: this.parentForm.value.activeFrom.date.year, month: this.parentForm.value.activeFrom.date.month, day: this.parentForm.value.activeFrom.date.day};
        }
        if (this.parentForm.value.activeTo?.date) {
            this.activeMaxDate = {year: this.parentForm.value.activeTo.date.year, month: this.parentForm.value.activeTo.date.month, day: this.parentForm.value.activeTo.date.day};
        }
    }
    
    onDateTimeChange(event: Event) {
        this.dateTimeFilterChange.next(null);
    }

    query(): void {
        this.search.emit(null);
    }

    resetForm() {
        this.publishMinDate = null;
        this.publishMaxDate = null;
        this.activeMinDate = null;
        this.activeMaxDate = null;
        this.reset.emit(null);
    }

    protected getLocale(): Observable<string> {
        return this.store.select(buildSettingsOrConfigSelector('locale'));
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
