/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {RightsEnum} from '@ofModel/perimeter.model';
import {Process} from '@ofModel/processes.model';
import {ComputedPerimeter, UserWithPerimeters} from '@ofModel/userWithPerimeters.model';
import {ProcessesService} from '@ofServices/processes.service';
import {UserService} from '@ofServices/user.service';
import {Subject} from 'rxjs';
import {debounceTime, takeUntil} from 'rxjs/operators';


@Component({
    selector: 'of-usercard-select-state-form',
    templateUrl: './usercard-select-state-form.component.html',

})
export class UserCardSelectStateFormComponent implements OnInit, OnDestroy {

    @Input() public cardIdToEdit;
    @Input() public initialProcess;
    @Input() public initialState;

    @Output() public stateChange: EventEmitter<any> = new EventEmitter<any>();
    @Output() public emptyProcessList: EventEmitter<any> = new EventEmitter<any>();

    processesDefinition: Process[];
    currentUserWithPerimeters: UserWithPerimeters;
    statesPerProcesses = new Map();
    processGroups: Map<string, {name: string, processes: string[]}>;
    processGroupPerProcesses = new Map();
    processesPerProcessGroups = new Map();
    processesWithoutProcessGroup = [];

    selectStateForm: FormGroup;
    processOptions = [];
    processOptionsWhenSelectedProcessGroup = [];
    processGroupOptions = [];
    stateOptions: any[];

    selectedProcess: Process;
    selectedState: string;

    unsubscribe$: Subject<void> = new Subject<void>();

    constructor(private processesService: ProcessesService, private userService: UserService
    ) {
    }

    ngOnInit() {

        this.selectStateForm = new FormGroup({
            processGroup: new FormControl(''),
            process: new FormControl(''),
            state: new FormControl('')
        });
        this.currentUserWithPerimeters = this.userService.getCurrentUserWithPerimeters();
        this.processGroups = this.processesService.getProcessGroups();
        this.loadAllProcessAndStateInUserPerimeter();
        this.changeStatesWhenSelectProcess();
        this.changeProcessesWhenSelectProcessGroup();
        this.loadAllProcessGroupsRelatingToUserPerimeter();

        if (!this.cardIdToEdit && this.processGroupOptions.length === 0 && this.processOptions.length > 0) {
            this.selectedProcess = this.processOptions[0].value;
            this.selectStateForm.get('process').setValue(this.selectedProcess);
        }

        this.InitProcessState();
        this.listenForStateChange();
        if (!this.processOptions || this.processOptions.length < 1) this.emptyProcessList.emit(true);

    }

    displayProcessGroupFilter() {
        return !!this.processGroupOptions && this.processGroupOptions.length > 1;
    }

    loadAllProcessAndStateInUserPerimeter(): void {
        this.processesDefinition = this.processesService.getAllProcesses();
        const processesInPerimeter: Set<string> = new Set();
        this.currentUserWithPerimeters.computedPerimeters.forEach(perimeter => {
            if (this.userCanSendCard(perimeter)) processesInPerimeter.add(perimeter.process);
        });

        this.processesDefinition.forEach(process => {
            if (processesInPerimeter.has(process.id)) {
                const label = process.name ? process.name : process.id;
                const processToShow = {value: process.id, label: label};

                this.loadStatesForProcess(process);
                // Add process option only if there is at least one state
                if (this.statesPerProcesses.get(process.id).length > 0) this.processOptions.push(processToShow);
            }
        });
    }

    private userCanSendCard(perimeter: ComputedPerimeter): boolean {
        return ((perimeter.rights === RightsEnum.ReceiveAndWrite)
            || (perimeter.rights === RightsEnum.Write));
    }



    private loadStatesForProcess(process: Process): void {
        const statesList = [];
        this.currentUserWithPerimeters.computedPerimeters.forEach(
            perimeter => {
                if ((perimeter.process === process.id) && this.userCanSendCard(perimeter)) {
                    const state = this.getStateFromProcessDefinition(process, perimeter.state);
                    if (!!state) statesList.push(state);
                }
            });
        this.statesPerProcesses.set(process.id, statesList);

    }

    getStateFromProcessDefinition(process: Process, stateId: string) {
        const stateFromProcessDefinition = process.states[stateId];
        if (!!stateFromProcessDefinition) {
            if (!!stateFromProcessDefinition.userCard) {
                const label = !!stateFromProcessDefinition.name ? stateFromProcessDefinition.name : stateId;
                return {value: stateId, label: label};
            }
        } else console.log('WARNING : state', stateId, 'is present in perimeter for process'
            , process.id, 'but not in process definition');
        return null;
    }


    private loadAllProcessGroupsRelatingToUserPerimeter(): void {
        let numberOfProcessesAttachedToAProcessGroup = 0;

        this.processGroups.forEach((group, groupId) => {

            const processOptions = [];
            this.processOptions.forEach(processOption => {
                if (this.isProcessInProcessesGroup(processOption.value, group)) {
                    processOptions.push(processOption);
                    numberOfProcessesAttachedToAProcessGroup++;

                    this.processGroupPerProcesses.set(processOption.value, groupId);
                }
            });

            if (processOptions.length > 0)
                this.processesPerProcessGroups.set(groupId, processOptions);
        });

        if (this.processOptions.length > numberOfProcessesAttachedToAProcessGroup) {
            this.loadProcessesWithoutProcessGroup();
            this.processGroupOptions.push({value: '--', label: 'processGroup.defaultLabel'});
        }
        for (const processGroupId of this.processesPerProcessGroups.keys())
            this.processGroupOptions.push({value: processGroupId, label: this.processGroups.get(processGroupId).name});

        if (!this.cardIdToEdit && this.processGroupOptions.length > 0) {
            this.selectStateForm.get('processGroup').setValue(this.processGroupOptions[0].value);
        }
    }


    private isProcessInProcessesGroup(idProcess: string, processesGroup: {name: string, processes: string[]}): boolean {
        return !!processesGroup.processes.find(process => process === idProcess);
    }

    private loadProcessesWithoutProcessGroup(): void {
        const processesWithProcessGroup = Array.from(this.processGroupPerProcesses.keys());
        this.processesWithoutProcessGroup = this.processOptions.filter(
            processOption => processesWithProcessGroup.indexOf(processOption.value) < 0);
    }


    changeProcessesWhenSelectProcessGroup(): void {
        this.selectStateForm.get('processGroup').valueChanges.subscribe((processGroup) => {
            if (!!processGroup) {
                if (processGroup === '--')
                    this.processOptionsWhenSelectedProcessGroup = this.processesWithoutProcessGroup;
                else
                    this.processOptionsWhenSelectedProcessGroup = this.processesPerProcessGroups.get(processGroup);

                this.selectedProcess = this.processOptionsWhenSelectedProcessGroup[0].value;
                this.selectStateForm.get('process').setValue(this.selectedProcess);
            }
        });
    }


    changeStatesWhenSelectProcess(): void {
        this.selectStateForm.get('process').valueChanges.subscribe((process) => {
            if (!!process) {
                this.stateOptions = this.statesPerProcesses.get(process);
                this.selectedState = this.stateOptions[0].value;
                this.selectedProcess = this.processesDefinition.find(processDefinition => {
                    return processDefinition.id === process;
                });
                this.selectStateForm.get('state').setValue(this.selectedState);
            }
        });
    }

    private InitProcessState() {
        if (this.cardIdToEdit) {
            const processGroupForCardToEdit = this.processGroupPerProcesses.get(this.initialProcess);
            if (processGroupForCardToEdit)
                this.selectStateForm.get('processGroup').setValue(processGroupForCardToEdit);
            else
                this.selectStateForm.get('processGroup').setValue('--');

            this.selectStateForm.get('processGroup').disable();

            this.selectStateForm.get('process').setValue(this.initialProcess);
            this.selectStateForm.get('process').disable();
            this.selectStateForm.get('state').setValue(this.initialState);
            this.stateChange.emit(
                {
                    'selectedProcessId': this.initialProcess,
                    'state': this.initialState
                });
        }
    }

    private listenForStateChange() {
        this.selectStateForm.get('state').valueChanges
            .pipe(
                takeUntil(this.unsubscribe$),
                debounceTime(10) //See #1891 Cypress usercard test was flaky without this debounce
            )
            .subscribe((state) => {
                if (!!state) {
                    this.stateChange.emit(
                        {
                            'selectedProcessId': this.selectStateForm.get('process').value,
                            'state': this.selectStateForm.get('state').value
                        });

                }
            });
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
