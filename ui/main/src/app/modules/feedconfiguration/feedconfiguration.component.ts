/* Copyright (c) 2020-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {UserService} from '@ofServices/user.service';
import {Process} from '@ofModel/processes.model';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {NgbModalRef} from '@ng-bootstrap/ng-bootstrap/modal/modal-ref';
import {UserWithPerimeters} from '@ofModel/userWithPerimeters.model';
import {ProcessesService} from '@ofServices/processes.service';
import {FormArray, FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {SettingsService} from '@ofServices/settings.service';
import {CardService} from '@ofServices/card.service';
import {EmptyLightCards} from '@ofActions/light-card.actions';
import {TranslateService} from '@ngx-translate/core';
import {Utilities} from '../../common/utilities';
import {ConfigService} from '@ofServices/config.service';


@Component({
    selector: 'of-feedconfiguration',
    templateUrl: './feedconfiguration.component.html',
    styleUrls: ['./feedconfiguration.component.scss']
})

export class FeedconfigurationComponent implements OnInit {
    feedConfigurationForm: FormGroup;

    processesDefinition: Process[];
    checkPerimeterForSearchFields: boolean;
    processGroupsAndLabels: { groupId: string,
                              groupLabel: string,
                              processes:
                                  {
                                      processId: string,
                                      processLabel: string
                                  } []
                            } [];
    processIdsByProcessGroup: Map<string, string[]>;
    processesWithoutGroup: { idProcess: string,
                             processLabel: string
                           } [];
    currentUserWithPerimeters: UserWithPerimeters;
    processesStatesLabels: Map<string, { processLabel: string,
                                         states:
                                             { stateId: string,
                                               stateLabel: string,
                                               stateControlIndex: number
                                             } []
                                       } >;
    preparedListOfProcessesStates: { processId: string,
                                     stateId: string
                                   } [];
    isAllStatesSelectedPerProcess: Map<string, boolean>;
    isAllProcessesSelectedPerProcessGroup: Map<string, boolean>;

    modalRef: NgbModalRef;

    public displaySendResultError = false;
    messageAfterSavingSettings: string;

    constructor(private formBuilder: FormBuilder,
                private store: Store<AppState>,
                private userService: UserService,
                private processesService: ProcessesService,
                private modalService: NgbModal,
                private settingsService: SettingsService,
                private cardService: CardService,
                private translateService: TranslateService,
                private configService: ConfigService
    ) {
        this.processesStatesLabels = new Map();
        this.processIdsByProcessGroup = new Map();
        this.preparedListOfProcessesStates = [];
        this.processesWithoutGroup = [];
        this.processesDefinition = this.processesService.getAllProcesses();
        this.isAllStatesSelectedPerProcess = new Map();
        this.isAllProcessesSelectedPerProcessGroup = new Map();
        this.initForm();
    }

    get processesStatesFormArray() {
        return this.feedConfigurationForm.controls.processesStates as FormArray;
    }

    private findInProcessGroups(processIdToFind: string): boolean {
        for (const processGroup of this.processGroupsAndLabels.values()) {
            if (processGroup.processes.find(process => process.processId === processIdToFind))
                return true;
        }
        return false;
    }

    private toggleSelectAllStates(idProcess: string) {
        if (this.isAllStatesSelectedPerProcess.get(idProcess)) {
            for (let state of this.processesStatesLabels.get(idProcess).states)
                if (this.feedConfigurationForm.value.processesStates[state.stateControlIndex])
                    document.getElementById('' + state.stateControlIndex).click();
        }
        else {
            for (let state of this.processesStatesLabels.get(idProcess).states)
                if (! this.feedConfigurationForm.value.processesStates[state.stateControlIndex])
                    document.getElementById('' + state.stateControlIndex).click();
        }
    }

    private toggleSelectAllProcesses(idProcessGroup: string) {
        if (this.isAllProcessesSelectedPerProcessGroup.get(idProcessGroup)) {
            for (let processId of this.processIdsByProcessGroup.get(idProcessGroup))
                if (this.isAllStatesSelectedPerProcess.get(processId))
                    this.toggleSelectAllStates(processId);
        }
        else {
            for (let processId of this.processIdsByProcessGroup.get(idProcessGroup))
                if (! this.isAllStatesSelectedPerProcess.get(processId))
                    this.toggleSelectAllStates(processId);
        }
    }

    private loadIsAllStatesSelected() {
        for (let idProcess of Array.from(this.processesStatesLabels.keys()))
            this.updateIsAllStatesSelected(idProcess, '');
    }

    private loadIsAllProcessesSelected() {
        for (let idProcessGroup of this.processIdsByProcessGroup.keys())
            this.isAllProcessesSelectedPerProcessGroup.set(idProcessGroup, this.isAllProcessesSelected(idProcessGroup));
    }

    private isAllStatesSelected(idProcess) {
        for (let state of this.processesStatesLabels.get(idProcess).states) {
            if (! this.feedConfigurationForm.value.processesStates[state.stateControlIndex])
                return false;
        }
        return true;
    }

    private isAllProcessesSelected(idProcessGroup) {
        for (let processId of this.processIdsByProcessGroup.get(idProcessGroup)) {
            if (! this.isAllStatesSelectedPerProcess.get(processId))
                return false;
        }
        return true;
    }

    private updateIsAllStatesSelected(idProcess, idProcessGroup) {
        this.isAllStatesSelectedPerProcess.set(idProcess, this.isAllStatesSelected(idProcess));

        if (idProcessGroup !== '' )
            this.isAllProcessesSelectedPerProcessGroup.set(idProcessGroup, this.isAllProcessesSelected(idProcessGroup));
    }

    private makeProcessesWithoutGroup() {
        this.processesDefinition.forEach(process => {
            if (! this.findInProcessGroups(process.id)) {
                let processLabel = (!!process.name) ? Utilities.getI18nPrefixFromProcess(process) + process.name :
                    Utilities.getI18nPrefixFromProcess(process) + process.id;

                this.translateService.get(processLabel).subscribe(translate => { processLabel = translate; });
                this.processesWithoutGroup.push({idProcess: process.id,
                    processLabel: processLabel});
            }
        });
        this.processesWithoutGroup.sort((obj1, obj2) => this.compareObj(obj1.processLabel, obj2.processLabel));
    }

    private addCheckboxesInFormArray() {

        const processesStatesNotNotified = ((!! this.currentUserWithPerimeters.processesStatesNotNotified) ?
            this.currentUserWithPerimeters.processesStatesNotNotified :
            null);

        this.preparedListOfProcessesStates.forEach(processState => {
            const notNotifiedStatesForThisProcess = ((!! processesStatesNotNotified) ? processesStatesNotNotified[processState.processId] : null);

            let isChecked = true;
            if ((!! notNotifiedStatesForThisProcess) && (notNotifiedStatesForThisProcess.includes(processState.stateId)))
                isChecked = false;
            this.processesStatesFormArray.push(new FormControl(isChecked));
        });
    }

    private computePreparedListOfProcessesStatesAndProcessesStatesLabels() {
        if (this.processesDefinition) {
            let stateControlIndex = 0;

            for (const process of this.processesDefinition) {

                const states: { stateId: string, stateLabel: string, stateControlIndex: number }[] = [];

                let processLabel = this.computeI18n(process, process.name, process.id);
                this.translateService.get(processLabel).subscribe(translate => { processLabel = translate; });

                for (const stateId of Object.keys(process.states)) {
                    const state = process.states[stateId];

                    if ((! state.isOnlyAChildState) && ((!this.checkPerimeterForSearchFields) || this.userService.isReceiveRightsForProcessAndState(process.id, stateId))) {
                        let stateLabel = this.computeI18n(process, state.name, stateId);
                        this.translateService.get(stateLabel).subscribe(translate => { stateLabel = translate; });

                        states.push({stateId, stateLabel, stateControlIndex});
                        this.preparedListOfProcessesStates.push({processId: process.id, stateId});
                        stateControlIndex++;
                    }
                }
                if (states.length) {
                    states.sort((obj1, obj2) => this.compareObj(obj1.stateLabel, obj2.stateLabel));
                    this.processesStatesLabels.set(process.id, {processLabel, states});
                }
            }
        }
    }

    computeI18n(process: Process, dataToFind: string, defaultValue: string): string {
        return Utilities.getI18nPrefixFromProcess(process) + ((!! dataToFind) ? dataToFind : defaultValue);
    }

    /** cleaning of the two arrays : processGroupsAndLabels and processesWithoutGroup
     * processGroupsAndLabels : we don't display process which doesn't have any state with Receive right
     *                          and we don't display process group which doesn't have any process
     * processesWithoutGroup : we don't display process which doesn't have any state with Receive or ReceiveAndWrite right*/
    private removeProcessesWithoutStatesWithReceiveRights() {
        this.processGroupsAndLabels.forEach((processGroupData, index) => {
            processGroupData.processes = processGroupData.processes.filter(processData => !! this.processesStatesLabels.get(processData.processId));
            if (processGroupData.processes.length === 0)
                this.processGroupsAndLabels.splice(index, 1);
        });
        this.processesWithoutGroup = this.processesWithoutGroup.filter(processData => !! this.processesStatesLabels.get(processData.idProcess));
    }

    private initForm() {
        this.feedConfigurationForm = this.formBuilder.group({
            processesStates: new FormArray([])
        });
    }

    ngOnInit() {
        this.checkPerimeterForSearchFields = this.configService.getConfigValue('checkPerimeterForSearchFields', false);
        this.userService.currentUserWithPerimeters().subscribe(result => {
            this.currentUserWithPerimeters = result;

            this.processGroupsAndLabels = this.processesService.getProcessGroupsAndLabels();
            this.processGroupsAndLabels.forEach(group => {
                group.processes.sort((obj1, obj2) => this.compareObj(obj1.processLabel, obj2.processLabel));
            });

            this.processGroupsAndLabels.sort((obj1, obj2) => this.compareObj(obj1.groupLabel, obj2.groupLabel));

            this.computePreparedListOfProcessesStatesAndProcessesStatesLabels();
            this.makeProcessesWithoutGroup();
            this.addCheckboxesInFormArray();
            if (this.checkPerimeterForSearchFields)
                this.removeProcessesWithoutStatesWithReceiveRights();
            this.loadIsAllStatesSelected();
            this.makeProcessIdsByProcessGroup();
            this.loadIsAllProcessesSelected();
        });
    }

    makeProcessIdsByProcessGroup() {
        this.processGroupsAndLabels.forEach(element => {
            let processIds = [];
            element.processes.forEach(process => processIds.push(process.processId));
            this.processIdsByProcessGroup.set(element.groupId, processIds);
        });
    }

    confirmSaveSettings() {
        this.modalRef.close();

        const processesStatesNotNotifiedUpdate = new Map<string, string[]>();
        this.feedConfigurationForm.value.processesStates.map((checked, i) => {
            if (! checked) {
                const currentProcessId = this.preparedListOfProcessesStates[i].processId;
                const currentStateId = this.preparedListOfProcessesStates[i].stateId;

                const statesNotNotifiedUpdate = processesStatesNotNotifiedUpdate.get(currentProcessId);
                if (!! statesNotNotifiedUpdate)
                    statesNotNotifiedUpdate.push(this.preparedListOfProcessesStates[i].stateId);
                else
                    processesStatesNotNotifiedUpdate.set(currentProcessId, [currentStateId]);
            }
        });

        this.settingsService.patchUserSettings({login: this.currentUserWithPerimeters.userData.login,
            processesStatesNotNotified: Object.fromEntries(processesStatesNotNotifiedUpdate)})
            .subscribe({
                next: resp => {
                    this.messageAfterSavingSettings = '';
                    const msg = resp.message;
                    if (!!msg && msg.includes('unable')) {
                        console.log('Impossible to save settings, error message from service : ', msg);
                        this.messageAfterSavingSettings = 'feedConfiguration.error.impossibleToSaveSettings';
                        this.displaySendResultError = true;
                    } else {
                        this.cardService.resetStartOfAlreadyLoadedPeriod();
                        this.store.dispatch(new EmptyLightCards());
                    }
                    this.modalRef.close();
                },
                error: err => {
                    console.error('Error when saving settings :', err);
                    this.modalRef.close();
                    this.messageAfterSavingSettings = 'feedConfiguration.error.impossibleToSaveSettings';
                    this.displaySendResultError = true;
                }
            });
    }

    open(content) {
        this.modalRef = this.modalService.open(content, {centered: true});
    }

    compareObj(obj1, obj2) {
        if (obj1 > obj2)
            return 1;
        if (obj1 < obj2)
            return -1;
        return 0;
    }
}
