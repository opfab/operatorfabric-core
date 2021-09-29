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
import {UserService} from '@ofServices/user.service';
import {LightCard} from '@ofModel/light-card.model';
import {Filter} from '@ofModel/feed-filter.model';
import {FilterService} from '@ofServices/filter.service';

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
    checkPerimeterForSearchFields: boolean;

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
                private userService: UserService) {
    }

    ngOnInit() {
        this.size = this.configService.getConfigValue('archive.filters.page.size', 10);
        this.checkPerimeterForSearchFields = this.configService.getConfigValue('checkPerimeterForSearchFields', false);
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

        this.loadProcessGroupDropdownListAndProcessesDropdownList();

        this.getLocale().pipe(takeUntil(this.unsubscribe$)).subscribe(locale => {
            this.translate.use(locale);
            this.translate.get(['monitoring.filters.selectProcessGroupText', 'monitoring.filters.selectProcessText',
                                    'monitoring.filters.typeOfState.selectTypeOfStateText',
                                    'monitoring.filters.typeOfState.INPROGRESS', 'monitoring.filters.typeOfState.FINISHED',
                                    'monitoring.filters.typeOfState.CANCELED'])
              .subscribe(translations => {
                this.processGroupDropdownSettings = {
                    text: translations['monitoring.filters.selectProcessGroupText'],
                    enableSearchFilter: true,
                    badgeShowLimit: 4,
                    classes: 'custom-class-example'
                };
                this.processDropdownSettings = {
                    text: translations['monitoring.filters.selectProcessText'],
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
                    [{id: TypeOfStateEnum.INPROGRESS, itemName: translations['monitoring.filters.typeOfState.INPROGRESS']},
                     {id: TypeOfStateEnum.FINISHED, itemName: translations['monitoring.filters.typeOfState.FINISHED']},
                     {id: TypeOfStateEnum.CANCELED, itemName: translations['monitoring.filters.typeOfState.CANCELED']}];
              });
            });
        this.changeProcessesWhenSelectProcessGroup();
        this.sendQuery();
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

    public loadProcessGroupDropdownListAndProcessesDropdownList(): void {

        this.processesDropdownListPerProcessGroups = this.processesService.getProcessesPerProcessGroups(this.visibleProcessesId);
        this.processesWithoutProcessGroupDropdownList = this.processesService.getProcessesWithoutProcessGroup();

        if (this.checkPerimeterForSearchFields)
            this.filterProcessesWithStatesWithReceiveRights();

        if (this.processesWithoutProcessGroupDropdownList.length > 0)
            this.processGroupDropdownList.push({ id: '--', itemName: 'processGroup.defaultLabel' });

        const processGroupIds = Array.from(this.processesDropdownListPerProcessGroups.keys());
        processGroupIds.forEach(processGroupId =>
            this.processGroupDropdownList.push({ id: processGroupId, itemName: this.processesGroups.get(processGroupId).name }));
    }

    private filterProcessesWithStatesWithReceiveRights(): void {
        this.processesWithoutProcessGroupDropdownList = this.processesWithoutProcessGroupDropdownList.filter(processData =>
            this.userService.isReceiveRightsForProcess(processData.id));

        this.processesDropdownListPerProcessGroups.forEach((processList, processGroupId) => {
            processList = processList.filter(processData => this.userService.isReceiveRightsForProcess(processData.id));
            if (! processList.length)
                this.processesDropdownListPerProcessGroups.delete(processGroupId);
            else
                this.processesDropdownListPerProcessGroups.set(processGroupId, processList);
        });
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
