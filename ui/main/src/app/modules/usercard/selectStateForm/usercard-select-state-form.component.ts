/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {MultiSelectConfig, MultiSelectOption} from '@ofModel/multiselect.model';
import {RightsEnum} from '@ofModel/perimeter.model';
import {Process, UserCard} from '@ofModel/processes.model';
import {ComputedPerimeter, UserWithPerimeters} from '@ofModel/userWithPerimeters.model';
import {ProcessesService} from 'app/business/services/processes.service';
import {UserService} from 'app/business/services/user.service';
import {Utilities} from 'app/business/common/utilities';
import {MultiSelectComponent} from 'app/modules/share/multi-select/multi-select.component';
import {Subject} from 'rxjs';
import {debounceTime, takeUntil} from 'rxjs/operators';
import {EntitiesService} from 'app/business/services/entities.service';

@Component({
    selector: 'of-usercard-select-state-form',
    templateUrl: './usercard-select-state-form.component.html'
})
export class UserCardSelectStateFormComponent implements OnInit, OnDestroy {
    @Input() public cardIdToEditOrCopy;
    @Input() public initialProcess;
    @Input() public initialState;

    @Output() public stateChange: EventEmitter<any> = new EventEmitter<any>();
    @Output() public emptyProcessList: EventEmitter<any> = new EventEmitter<any>();

    @ViewChild('processGroupSelect') set processGroup(processGroupSelect: MultiSelectComponent) {
        if (processGroupSelect && this.cardIdToEditOrCopy) processGroupSelect.disable();
    }

    @ViewChild('processSelect') set process(processSelect: MultiSelectComponent) {
        if (processSelect && this.cardIdToEditOrCopy) processSelect.disable();
    }

    processesDefinition: Process[];
    currentUserWithPerimeters: UserWithPerimeters;
    statesPerProcesses = new Map();
    processGroups: Map<string, {name: string; processes: string[]}>;
    processGroupPerProcesses = new Map();
    processesPerProcessGroups = new Map();
    processesWithoutProcessGroup = [];

    selectStateForm: FormGroup<{
        usercardProcessGroup: FormControl<string | null>;
        usercardProcess: FormControl<string | null>;
        usercardState: FormControl<string | null>;
    }>;
    processOptions: Array<MultiSelectOption> = [];
    processOptionsWhenSelectedProcessGroup = [];
    processGroupOptions: Array<MultiSelectOption> = [];
    selectedProcessGroupOption: any;
    stateOptions: any[];

    selectedProcess: string;
    selectedState: string;

    unsubscribe$: Subject<void> = new Subject<void>();

    public multiSelectConfig: MultiSelectConfig = {
        labelKey: 'shared.filters.processGroup',
        multiple: false,
        search: true
    };

    public processMultiSelectConfig: MultiSelectConfig = {
        labelKey: 'shared.filters.process',
        multiple: false,
        sortOptions: false,
        search: true
    };

    public stateMultiSelectConfig: MultiSelectConfig = {
        labelKey: 'shared.filters.state',
        sortOptions: false,
        multiple: false,
        search: true
    };

    constructor(
        private processesService: ProcessesService,
        private userService: UserService,
        private entitiesService: EntitiesService,
        private translateService: TranslateService
    ) {}

    ngOnInit() {
        this.selectStateForm = new FormGroup({
            usercardProcessGroup: new FormControl(''),
            usercardProcess: new FormControl(''),
            usercardState: new FormControl('')
        });
        this.currentUserWithPerimeters = this.userService.getCurrentUserWithPerimeters();
        this.processGroups = this.processesService.getProcessGroups();
        this.loadAllProcessAndStateInUserPerimeter();
        this.changeStatesWhenSelectProcess();
        this.changeProcessesWhenSelectProcessGroup();
        this.loadAllProcessGroupsRelatingToUserPerimeter();

        if (!this.cardIdToEditOrCopy && this.processGroupOptions.length <= 1 && this.processOptions.length > 0) {
            this.selectedProcess = this.processOptions[0].value;
        }
        if (!this.cardIdToEditOrCopy && this.processGroupOptions.length > 1) {
            this.selectedProcessGroupOption = this.processGroupOptions[0].value;
        }
        this.initProcessState();
        this.listenForStateChange();
        if (!this.processOptions || this.processOptions.length < 1) this.emptyProcessList.emit(true);
    }

    isProcessGroupFilterVisible(): boolean {
        return this.processGroupOptions && this.processGroupOptions.length > 1;
    }

    loadAllProcessAndStateInUserPerimeter(): void {
        this.processesDefinition = this.processesService.getAllProcesses();
        const processesInPerimeter: Set<string> = new Set();
        this.currentUserWithPerimeters.computedPerimeters.forEach((perimeter) => {
            if (this.isUserAllowedToSendCard(perimeter)) processesInPerimeter.add(perimeter.process);
        });

        this.processesDefinition.forEach((process) => {
            if (processesInPerimeter.has(process.id)) {
                const label = process.name ? process.name : process.id;
                const processToShow = new MultiSelectOption(process.id, label);

                this.loadStatesForProcess(process);
                // Add process option only if there is at least one state
                if (this.statesPerProcesses.get(process.id).length > 0) this.processOptions.push(processToShow);
            }
        });
        this.processOptions.sort((a, b) => Utilities.compareObj(a.label, b.label));
    }

    private isUserAllowedToSendCard(perimeter: ComputedPerimeter): boolean {
        return perimeter.rights === RightsEnum.ReceiveAndWrite;
    }

    private loadStatesForProcess(process: Process): void {
        const statesList = [];
        this.currentUserWithPerimeters.computedPerimeters.forEach((perimeter) => {
            if (perimeter.process === process.id && this.isUserAllowedToSendCard(perimeter)) {
                const state = this.getStateFromProcessDefinition(process, perimeter.state);
                if (state) statesList.push(state);
            }
        });
        statesList.sort((a, b) => Utilities.compareObj(a.label, b.label));
        this.statesPerProcesses.set(process.id, statesList);
    }

    getStateFromProcessDefinition(process: Process, stateId: string): {value: string; label: string} {
        const stateFromProcessDefinition = process.states.get(stateId);
        if (stateFromProcessDefinition) {
            if (stateFromProcessDefinition.userCard && this.isUserAllowedToPublishCardForState(stateFromProcessDefinition.userCard)) {
                const label = stateFromProcessDefinition.name ? stateFromProcessDefinition.name : stateId;
                return {value: stateId, label: label};
            }
        } else
            console.log(
                'WARNING : state',
                stateId,
                'is present in perimeter for process',
                process.id,
                'but not in process definition'
            );
        return null;
    }

    isUserAllowedToPublishCardForState(userCard: UserCard) {
        if (userCard.publisherList?.length > 0) {
            const configuredPublisherList = [];
            this.entitiesService.resolveEntities(userCard.publisherList).forEach(e => configuredPublisherList.push(e.id));
            return this.currentUserWithPerimeters.userData.entities.filter( entity => configuredPublisherList.includes(entity)).length > 0;
        }
        return true;
    }

    private loadAllProcessGroupsRelatingToUserPerimeter(): void {
        let numberOfProcessesAttachedToAProcessGroup = 0;

        this.processGroups.forEach((group, groupId) => {
            const processOptions = [];
            this.processOptions.forEach((processOption) => {
                if (this.isProcessInProcessesGroup(processOption.value, group)) {
                    processOptions.push(processOption);
                    numberOfProcessesAttachedToAProcessGroup++;

                    this.processGroupPerProcesses.set(processOption.value, groupId);
                }
            });

            if (processOptions.length > 0) this.processesPerProcessGroups.set(groupId, processOptions);
        });

        for (const processGroupId of this.processesPerProcessGroups.keys())
            this.processGroupOptions.push(
                new MultiSelectOption(processGroupId, this.processGroups.get(processGroupId).name)
            );

        this.processGroupOptions.sort((a, b) => Utilities.compareObj(a.label, b.label));

        if (this.processOptions.length > numberOfProcessesAttachedToAProcessGroup) {
            this.loadProcessesWithoutProcessGroup();
            this.processGroupOptions.unshift(
                new MultiSelectOption('--', this.translateService.instant('processGroup.defaultLabel'))
            );
        }

        if (!this.cardIdToEditOrCopy && this.processGroupOptions.length > 0)
            this.selectedProcessGroupOption = this.processGroupOptions[0].value;
    }

    private isProcessInProcessesGroup(idProcess: string, processesGroup: {name: string; processes: string[]}): boolean {
        return processesGroup.processes.includes(idProcess);
    }

    private loadProcessesWithoutProcessGroup(): void {
        const processesWithProcessGroup = Array.from(this.processGroupPerProcesses.keys());
        this.processesWithoutProcessGroup = this.processOptions.filter(
            (processOption) => processesWithProcessGroup.indexOf(processOption.value) < 0
        );
    }

    changeProcessesWhenSelectProcessGroup(): void {
        this.selectStateForm.get('usercardProcessGroup').valueChanges.subscribe((processGroup) => {
            if (processGroup) {
                if (processGroup === '--')
                    this.processOptionsWhenSelectedProcessGroup = this.processesWithoutProcessGroup;
                else this.processOptionsWhenSelectedProcessGroup = this.processesPerProcessGroups.get(processGroup);
                this.processOptionsWhenSelectedProcessGroup.sort((a, b) => Utilities.compareObj(a.label, b.label));
                if (!this.cardIdToEditOrCopy) {
                    this.selectedProcess = this.processOptionsWhenSelectedProcessGroup[0].value;
                }
            }
        });
    }

    changeStatesWhenSelectProcess(): void {
        this.selectStateForm.get('usercardProcess').valueChanges.subscribe((process) => {
            if (process) {
                this.stateOptions = this.statesPerProcesses.get(process);
                if (!this.cardIdToEditOrCopy) {
                    const oldSelectedState = this.selectedState;
                    this.selectedState = this.stateOptions[0].value;

                   // in case the state is the same as before , the selected value does not change for the selected component
                   // so we need to send the event here instead of waiting for the event state change
                    if (this.selectedState === oldSelectedState) {
                        this.stateChange.emit({
                            selectedProcessId: this.selectStateForm.get('usercardProcess').value,
                            state: this.selectStateForm.get('usercardState').value
                        });
                    }
                }
            }
        });
    }

    private initProcessState() {
        if (this.cardIdToEditOrCopy) {
            const processGroupForCardToEdit = this.processGroupPerProcesses.get(this.initialProcess);
            if (processGroupForCardToEdit) this.selectedProcessGroupOption = processGroupForCardToEdit;
            else this.selectedProcessGroupOption = '--';
            this.selectedProcess = this.initialProcess;
            this.selectedState = this.initialState;
        }
    }

    private listenForStateChange() {
        this.selectStateForm
            .get('usercardState')
            .valueChanges.pipe(
                takeUntil(this.unsubscribe$),
                debounceTime(10) //See #1891 Cypress usercard test was flaky without this debounce
            )
            .subscribe((state) => {
                if (state) {
                    this.selectedState = this.selectStateForm.get('usercardState').value;
                    this.stateChange.emit({
                        selectedProcessId: this.selectStateForm.get('usercardProcess').value,
                        state: this.selectedState
                    });
                }
            });
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
