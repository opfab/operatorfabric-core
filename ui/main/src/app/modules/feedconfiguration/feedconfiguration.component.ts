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


@Component({
    selector: 'of-feedconfiguration',
    templateUrl: './feedconfiguration.component.html',
    styleUrls: ['./feedconfiguration.component.scss']
})

export class FeedconfigurationComponent implements OnInit {
    feedConfigurationForm: FormGroup;

    processesDefinition: Process[];
    processGroupsData: {id: string, groupLabel?: string, processes: string[]}[];
    processesWithoutGroup: { idProcess: string,
        processLabel: string }[];
    currentUserWithPerimeters: UserWithPerimeters;
    processesStatesLabels: Map<string, { processLabel: string,
        states:
            { stateLabel: string,
                stateControlIndex: number
            }[]
    }>;
    preparedListOfProcessesStates: { processId: string,
        stateId: string }[];

    modalRef: NgbModalRef;

    public displaySendResultOk = false;
    public displaySendResultError = false;
    messageAfterSavingSettings: string;

    constructor(private formBuilder: FormBuilder,
                private store: Store<AppState>,
                private userService: UserService,
                private processesService: ProcessesService,
                private modalService: NgbModal,
                private settingsService: SettingsService,
                private cardService: CardService,
                private translateService: TranslateService
    ) {
        this.processesStatesLabels = new Map<string, {processLabel: string,
            states:
                { stateLabel: string,
                    stateControlIndex: number
                }[]
        }> ();
        this.preparedListOfProcessesStates = [];
        this.processesWithoutGroup = [];
        this.processesDefinition = this.processesService.getAllProcesses();
        this.initForm();
    }

    get processesStatesFormArray() {
        return this.feedConfigurationForm.controls.processesStates as FormArray;
    }

    private findInProcessGroups(processIdToFind: string): boolean {
        for (const processGroup of this.processGroupsData.values()) {
            if (processGroup.processes.includes(processIdToFind))
                return true;
        }
        return false;
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

        this.processesDefinition.forEach(process => {
            for (const key in process.states) {
                const notNotifiedStatesForThisProcess = ((!! processesStatesNotNotified) ? processesStatesNotNotified[process.id] : null);

                let isChecked = true;
                if ((!! notNotifiedStatesForThisProcess) && (notNotifiedStatesForThisProcess.includes(key)))
                    isChecked = false;
                this.processesStatesFormArray.push(new FormControl(isChecked));
            }
        });
    }

    private computePreparedListOfProcessesStatesAndProcessesStatesLabels() {
        if (this.processesDefinition) {
            let stateControlIndex = 0;

            for (const process of this.processesDefinition) {

                const statesArray: { stateLabel: string, stateControlIndex: number }[]
                    = new Array<{stateLabel: string, stateControlIndex: number}>();

                let processLabel = (!!process.name) ? Utilities.getI18nPrefixFromProcess(process) + process.name :
                    Utilities.getI18nPrefixFromProcess(process) + process.id;
                this.translateService.get(processLabel).subscribe(translate => { processLabel = translate; });

                for (const key in process.states) {
                    const value = process.states[key];
                    let stateLabel = (!!value.name) ? Utilities.getI18nPrefixFromProcess(process) + value.name :
                        Utilities.getI18nPrefixFromProcess(process) + key;

                    this.translateService.get(stateLabel).subscribe(translate => { stateLabel = translate; });

                    statesArray.push({stateLabel: stateLabel, stateControlIndex: stateControlIndex});
                    this.preparedListOfProcessesStates.push({
                        processId: process.id,
                        stateId: key});
                    stateControlIndex++;
                }
                statesArray.sort((obj1, obj2) => this.compareObj(obj1.stateLabel, obj2.stateLabel));
                this.processesStatesLabels.set(process.id, {processLabel: processLabel,
                    states: statesArray});
            }
        }
    }

    private initForm() {
        this.feedConfigurationForm = this.formBuilder.group({
            processesStates: new FormArray([])
        });
    }

    ngOnInit() {
        this.userService.currentUserWithPerimeters().subscribe(result => {
            this.currentUserWithPerimeters = result;

            this.processGroupsData = this.processesService.getProcessGroups();
            this.processGroupsData.forEach(group => {
                this.translateService.get(group.id).subscribe(translate => {
                    group.groupLabel = translate;
                });

                group.processes.sort();
            });

            this.processGroupsData.sort((obj1, obj2) => this.compareObj(obj1.groupLabel, obj2.groupLabel));

            this.computePreparedListOfProcessesStatesAndProcessesStatesLabels();
            this.makeProcessesWithoutGroup();
            this.addCheckboxesInFormArray();
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
            .subscribe(
                resp => {
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
                err => {
                    console.error('Error when saving settings :', err);
                    this.modalRef.close();
                    this.messageAfterSavingSettings = 'feedConfiguration.error.impossibleToSaveSettings';
                    this.displaySendResultError = true;
                }
            );
    }

    open(content) {
        this.modalRef = this.modalService.open(content);
    }

    compareObj(obj1, obj2) {
        if (obj1 > obj2)
            return 1;
        if (obj1 < obj2)
            return -1;
        return 0;
    }
}
