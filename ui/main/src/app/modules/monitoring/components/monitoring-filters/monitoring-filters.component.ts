/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {AbstractControl, FormControl, FormGroup} from '@angular/forms';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {ConfigService} from '@ofServices/config.service';
import {Observable, Subject} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {buildSettingsOrConfigSelector} from '@ofStore/selectors/settings.x.config.selectors';
import {takeUntil} from 'rxjs/operators';
import {TimeService} from '@ofServices/time.service';
import {ProcessesService} from '@ofServices/processes.service';
import {TypeOfStateEnum} from '@ofModel/processes.model';
import {TimelineButtonsComponent} from '../../../share/timeline-buttons/timeline-buttons.component';
import {LightCard} from '@ofModel/light-card.model';
import {Filter} from '@ofModel/feed-filter.model';
import {FilterService} from '@ofServices/filter.service';
import {ProcessStatesDropdownListService} from "@ofServices/process-states-dropdown-list.service";

@Component({
    selector: 'of-monitoring-filters',
    templateUrl: './monitoring-filters.component.html',
    styleUrls: ['./monitoring-filters.component.scss']
})
export class MonitoringFiltersComponent implements OnInit, OnDestroy {

    @ViewChild('timelineButtons')
    timelineButtons: TimelineButtonsComponent;

    unsubscribe$: Subject<void> = new Subject<void>();

    size = 10;
    monitoringForm: FormGroup;

    // We should decide on whether we want to use ngrx for this screen (see OC-1271).
    // If so, these can be replaced by storing the values in the monitoring state, and the summary of filters should
    // also take the information from there. If not, we should remove the monitoring state and associated actions (ApplyFilter etc.) altogether.
    private selectedProcessGroups;
    private selectedProcesses;
    private selectedTypeOfStates;

    processesDropdownListPerProcessGroups = new Map();
    processesWithoutProcessGroupDropdownList = [];
    processGroupDropdownList = [];
    processGroupDropdownSettings = {};
    processDropdownList = [];
    visibleProcessesId: string[] = [];
    processDropdownListWhenSelectedProcessGroup = [];
    processDropdownSettings = {};
    typeOfStateDropdownList = [];
    typeOfStateDropdownSettings = {};
    firstQuery: boolean = true;
    timeDomainChanged: boolean = false;

    processesGroups: Map<string, {name: string, processes: string[]}>;

    processFilter: Filter;
    typeOfStatesFilter: Filter;

    @Input()
    public visibleProcesses: [];

    @Output() 
    filters:  EventEmitter<Filter[]> = new EventEmitter<Filter[]>();

    timelineFilter: Filter;

    constructor(private store: Store<AppState>,
                private configService: ConfigService,
                private translate: TranslateService,
                private time: TimeService,
                private processesService: ProcessesService,
                private filterService: FilterService,
                private processStatesDropdownListService: ProcessStatesDropdownListService) {
    }

    ngOnInit() {
        this.size = this.configService.getConfigValue('archive.filters.page.size', 10);
        this.processesGroups = this.processesService.getProcessGroups();

        this.monitoringForm = new FormGroup(
            {
                processGroup: new FormControl([]),
                process: new FormControl([]),
                typeOfState: new FormControl([])
            }
        );
        this.processDropdownList = this.visibleProcesses;
        this.visibleProcessesId = this.processDropdownList.map(element => element.id);

        this.loadValuesForFilters();

        this.getLocale().pipe(takeUntil(this.unsubscribe$)).subscribe(locale => {
            this.translate.use(locale);
            this.translate.get(['shared.filters.selectProcessGroupText', 'shared.filters.selectProcessText',
                                    'monitoring.filters.typeOfState.selectTypeOfStateText',
                                    'shared.typeOfState.INPROGRESS', 'shared.typeOfState.FINISHED',
                                    'shared.typeOfState.CANCELED'])
              .subscribe(translations => {
                this.processGroupDropdownSettings = {
                    text: translations['shared.filters.selectProcessGroupText'],
                    enableSearchFilter: true,
                    badgeShowLimit: 4,
                    classes: 'custom-class-example'
                };
                this.processDropdownSettings = {
                    text: translations['shared.filters.selectProcessText'],
                    enableSearchFilter: true,
                    badgeShowLimit: 4,
                    classes: 'custom-class-example'
                };
                this.typeOfStateDropdownSettings = {
                    text: translations['monitoring.filters.typeOfState.selectTypeOfStateText'],
                    enableSearchFilter: true,
                    badgeShowLimit: 3,
                    classes: 'custom-class-example'
                };
                this.typeOfStateDropdownList =
                    [{id: TypeOfStateEnum.INPROGRESS, itemName: translations['shared.typeOfState.INPROGRESS']},
                     {id: TypeOfStateEnum.FINISHED, itemName: translations['shared.typeOfState.FINISHED']},
                     {id: TypeOfStateEnum.CANCELED, itemName: translations['shared.typeOfState.CANCELED']}];
              });
            });
        this.changeProcessesWhenSelectProcessGroup();
        this.sendQuery();
    }

    isThereProcessStateToDisplay(): boolean {
        return !!this.processDropdownList && this.processDropdownList.length > 0;
    }

    protected getLocale(): Observable<string> {
        return this.store.select(buildSettingsOrConfigSelector('locale'));
    }

    displayProcessGroupsFilter(): boolean {
        return !!this.processGroupDropdownList && this.processGroupDropdownList.length > 1 ;
    }

    isThereProcessGroup(): boolean {
        return !!this.processesGroups && this.processesGroups.size > 0;
    }

    addProcessesDropdownList(processesDropdownList: any[]): void {
        processesDropdownList.forEach( processDropdownList =>
            this.processDropdownListWhenSelectedProcessGroup.push(processDropdownList) );
    }

    changeProcessesWhenSelectProcessGroup(): void {
        this.monitoringForm.get('processGroup').valueChanges.subscribe((selectedProcessGroups) => {

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

    findProcessesIdForProcessGroups(processGroupIds: string[]): string[] {
        const processesId = [];

        processGroupIds.forEach(processGroupId => {
            if (processGroupId === '--')
                this.processesWithoutProcessGroupDropdownList.forEach(process => processesId.push(process.id));
            else
                this.processesDropdownListPerProcessGroups.get(processGroupId).forEach(process => processesId.push(process.id));
        });
        return processesId;
    }

    filterByProcesses(selectedProcessGroups: any, selectedProcesses: any) {
        const processGroupIds  = selectedProcessGroups.value ? Array.prototype.map.call(selectedProcessGroups.value, item => item.id) : [];
        let processesIdForFilter = this.findProcessesIdForProcessGroups(processGroupIds);

        const selectedProcessesId  = selectedProcesses.value ? Array.prototype.map.call(selectedProcesses.value, item => item.id) : [];
        if (selectedProcessesId.length)
            processesIdForFilter = selectedProcessesId;

        if (processesIdForFilter.length > 0) {
            this.processFilter = this.getProcessFilter(true, {processes: processesIdForFilter});
        } else {
            this.processFilter = this.getProcessFilter(false, null);
        }

    }

    filterByTypeOfStates(selectedTypeOfStates: any) {
        const typeOfStates  = selectedTypeOfStates.value ? Array.prototype.map.call(selectedTypeOfStates.value, item => item.id) : [];

        if (typeOfStates.length > 0) {
            const typeOfStatesPerProcessAndState = this.processesService.getTypeOfStatesPerProcessAndState();
            this.typeOfStatesFilter = this.getTypeOfStateFilter(true, {typeOfStates: typeOfStates, mapOfTypeOfStates: typeOfStatesPerProcessAndState});

        } else {
            this.typeOfStatesFilter = this.getTypeOfStateFilter(false, null);
        }
    }

    loadValuesForFilters() {
        this.processesWithoutProcessGroupDropdownList = this.processStatesDropdownListService.computeProcessesWithoutProcessGroupDropdownList(this.visibleProcessesId);
        this.processesDropdownListPerProcessGroups = this.processStatesDropdownListService.computeProcessesDropdownListPerProcessGroup(this.visibleProcessesId);
        this.processGroupDropdownList = this.processStatesDropdownListService.computeProcessGroupsDropdownList(this.processesWithoutProcessGroupDropdownList,
                                                                                                   this.processesDropdownListPerProcessGroups);
    }

    domainChanged(domain: number[]) {
        this.timeDomainChanged = true;
        this.timelineFilter = this.filterService.getNewBusinessDateFilter(true, domain[0], domain[1]);
        this.sendQuery();
        this.timeDomainChanged = false;
    }

    sendQuery() {

        this.selectedProcessGroups = this.monitoringForm.get('processGroup');
        this.selectedProcesses = this.monitoringForm.get('process');
        this.selectedTypeOfStates = this.monitoringForm.get('typeOfState');

        if (this.firstQuery || this.hasFormControlValueChanged( this.selectedProcesses)
            || this.hasFormControlValueChanged( this.selectedProcessGroups)
            || this.hasFormControlValueChanged( this.selectedTypeOfStates)
            || this.timeDomainChanged
            ) {

            this.filterByProcesses(this.selectedProcessGroups, this.selectedProcesses);
            this.filterByTypeOfStates(this.selectedTypeOfStates);

            this.filters.emit([this.timelineFilter, this.processFilter, this.typeOfStatesFilter]);

        }
        this.firstQuery = false;
    }

    hasFormControlValueChanged(control: AbstractControl): boolean {
        if (!!control) {
            const isNotPristine = !control.pristine;
            const valueIsNotDefault = control.value !== '';
            const result = isNotPristine && valueIsNotDefault;
            return result;
        }
        return false;
    }

    resetForm() {
        this.monitoringForm.reset();
        this.firstQuery = true;
        this.sendQuery();
    }

    private getProcessFilter(active, selectedStatus)  {
        return new Filter(
            (card: LightCard, status) => {
                const processList = status.processes;
                if (!! processList) {
                    return processList.includes(card.process);
                }
                // permissive filter
                return true;
            },
            active,
            selectedStatus
        );
    }

    private getTypeOfStateFilter(active, selectedStatus)  {
        return new Filter(
            (card: LightCard, status) => {
                const typeOfStatesList = status.typeOfStates;

                if (!! typeOfStatesList) {
                    const typeOfStateOfTheCard = status.mapOfTypeOfStates.get(card.process + '.' + card.state);
                    return typeOfStatesList.includes(typeOfStateOfTheCard);
                }
                // permissive filter
                return true;
            },
            active,
            selectedStatus
        );
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
