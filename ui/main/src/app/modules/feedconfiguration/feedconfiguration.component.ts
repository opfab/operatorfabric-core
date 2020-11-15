/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, OnDestroy, OnInit} from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '@ofStore/index';
import { UserService } from '@ofServices/user.service';
import { Process } from '@ofModel/processes.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap/modal/modal-ref';
import { UserWithPerimeters } from '@ofModel/userWithPerimeters.model';
import { ProcessesService } from '@ofServices/processes.service';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import {SettingsService} from '@ofServices/settings.service';
import {Subject} from 'rxjs';


class Message {
    text: string;
    display: boolean;
}

function getI18nPrefixFromProcess(process: Process): string {
    return process.id + '.' + process.version + '.';
}

@Component({
    selector: 'of-feedconfiguration',
    templateUrl: './feedconfiguration.component.html',
    styleUrls: ['./feedconfiguration.component.scss']
})

export class FeedconfigurationComponent implements OnInit, OnDestroy {
    feedConfigurationForm: FormGroup;

    processesDefinition: Process[];
    processGroups: {idGroup: string, processes: string[]}[];
    processesWithoutGroup: string[];
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

    unsubscribe$: Subject<void> = new Subject<void>();

    constructor(private formBuilder: FormBuilder,
                private store: Store<AppState>,
                private userService: UserService,
                private processesService: ProcessesService,
                private modalService: NgbModal,
                private translateService: TranslateService,
                private settingsService: SettingsService,
    ) {
        this.processesDefinition = this.processesService.getAllProcesses();
        this.processGroups = this.processesService.getProcessGroups();
        this.currentUserWithPerimeters = this.userService.getCurrentUserWithPerimeters();
        this.feedConfigurationForm = this.formBuilder.group({
            processesStates: new FormArray([])
        });
        this.processesStatesLabels = new Map<string, {processLabel: string,
                                                        states:
                                                            { stateLabel: string,
                                                              stateControlIndex: number
                                                            }[]
                                                       }> ();
        this.preparedListOfProcessesStates = [];
        this.processesWithoutGroup = [];

        this.computePreparedListOfProcessesStatesAndProcessesStatesLabels();
        this.makeProcessesWithoutGroup();
        this.addCheckboxesInFormArray();
    }

    get processesStatesFormArray() {
        return this.feedConfigurationForm.controls.processesStates as FormArray;
    }

    private findInProcessGroups(processIdToFind: string): boolean {
        for (const processGroup of this.processGroups.values()) {
            if (processGroup.processes.includes(processIdToFind))
                return true;
        }
        return false;
    }

    private makeProcessesWithoutGroup() {
        this.processesDefinition.forEach(process => {
            if (! this.findInProcessGroups(process.id))
                this.processesWithoutGroup.push(process.id);
        });
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

                let processLabel = process.id;
                if (!!process.name)
                    this.translateService.get(getI18nPrefixFromProcess(process) + process.name)
                        .subscribe(result => processLabel = result);

                for (const key in process.states) {
                    const value = process.states[key];

                    let stateLabel = key;
                    if (!!value.name)
                        this.translateService.get(getI18nPrefixFromProcess(process) + value.name)
                            .subscribe(result => stateLabel = result);

                    statesArray.push({stateLabel: stateLabel, stateControlIndex: stateControlIndex});
                    this.preparedListOfProcessesStates.push({
                        processId: process.id,
                        stateId: key});
                    stateControlIndex++;
                }
                this.processesStatesLabels.set(process.id, {processLabel: processLabel,
                                                              states: statesArray});
            }
        }
    }

    ngOnInit() {
    }

    ngOnDestroy() {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
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
                        this.messageAfterSavingSettings = 'feedConfiguration.settingsSavedWithNoError';
                        this.displaySendResultOk = true;
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
}
