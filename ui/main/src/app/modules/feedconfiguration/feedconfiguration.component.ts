/* Copyright (c) 2020-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {UserService} from '@ofServices/user.service';
import {Process, State} from '@ofModel/processes.model';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {NgbModalRef} from '@ng-bootstrap/ng-bootstrap/modal/modal-ref';
import {UserWithPerimeters} from '@ofModel/userWithPerimeters.model';
import {ProcessesService} from '@ofServices/processes.service';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {SettingsService} from '@ofServices/settings.service';
import {CardService} from '@ofServices/card.service';
import {TranslateService} from '@ngx-translate/core';
import {Utilities} from '../../common/utilities';

@Component({
    selector: 'of-feedconfiguration',
    templateUrl: './feedconfiguration.component.html',
    styleUrls: ['./feedconfiguration.component.scss']
})
export class FeedconfigurationComponent implements OnInit {
    feedConfigurationForm: FormGroup<{
        processesStates: FormArray;
    }>;

    processesDefinition: Process[];
    processGroupsAndLabels: {
        groupId: string;
        groupLabel: string;
        processes: {
            processId: string;
            processLabel: string;
        }[];
    }[];
    processIdsByProcessGroup: Map<string, string[]>;
    processesWithoutGroup: {idProcess: string; processLabel: string}[];
    currentUserWithPerimeters: UserWithPerimeters;
    processesStatesLabels: Map<
        string,
        {processLabel: string;
         states: {stateId: string; stateLabel: string; stateControlIndex: number; filteringNotificationAllowed: boolean}[]}
    >;
    statesUnsubscribedButWithFilteringNotificationNotAllowed = '';
    @ViewChild('statesUnsubscribedButWithFilteringNotificationNotAllowedPopup') statesUnsubscribedTemplate: ElementRef;
    preparedListOfProcessesStates: {processId: string; stateId: string}[];
    isAllStatesSelectedPerProcess: Map<string, boolean>;
    isAllProcessesSelectedPerProcessGroup: Map<string, boolean>;
    isAllProcessesCheckboxDisabledPerProcessGroup: Map<string, boolean>;
    isAllStatesCheckboxDisabledPerProcessId: Map<string, boolean>;

    modalRef: NgbModalRef;
    private saveSettingsInProgress = false;

    public displaySendResultError = false;
    messageAfterSavingSettings: string;
    isThereProcessStateToDisplay: boolean;

    constructor(
        private userService: UserService,
        private processesService: ProcessesService,
        private modalService: NgbModal,
        private settingsService: SettingsService,
        private cardService: CardService,
        private translateService: TranslateService
    ) {
        this.processesStatesLabels = new Map();
        this.processIdsByProcessGroup = new Map();
        this.preparedListOfProcessesStates = [];
        this.processesWithoutGroup = [];
        this.processesDefinition = this.processesService.getAllProcesses();
        this.isAllStatesSelectedPerProcess = new Map();
        this.isAllProcessesSelectedPerProcessGroup = new Map();
        this.isAllProcessesCheckboxDisabledPerProcessGroup = new Map();
        this.isAllStatesCheckboxDisabledPerProcessId = new Map();
        this.initForm();
    }

    get processesStatesFormArray() {
        return this.feedConfigurationForm.controls.processesStates as FormArray;
    }

    private findInProcessGroups(processIdToFind: string): boolean {
        for (const processGroup of this.processGroupsAndLabels.values()) {
            if (processGroup.processes.find((process) => process.processId === processIdToFind)) return true;
        }
        return false;
    }

    private toggleSelectAllStates(idProcess: string) {
        if (this.isAllStatesSelectedPerProcess.get(idProcess)) {
            for (const state of this.processesStatesLabels.get(idProcess).states)
                if (this.feedConfigurationForm.value.processesStates[state.stateControlIndex])
                    document.getElementById('' + state.stateControlIndex).click();
        } else {
            for (const state of this.processesStatesLabels.get(idProcess).states)
                if (!this.feedConfigurationForm.value.processesStates[state.stateControlIndex])
                    document.getElementById('' + state.stateControlIndex).click();
        }
    }

    private toggleSelectAllProcesses(idProcessGroup: string) {
        if (this.isAllProcessesSelectedPerProcessGroup.get(idProcessGroup)) {
            for (const processId of this.processIdsByProcessGroup.get(idProcessGroup))
                if (this.isAllStatesSelectedPerProcess.get(processId)) this.toggleSelectAllStates(processId);
        } else {
            for (const processId of this.processIdsByProcessGroup.get(idProcessGroup))
                if (!this.isAllStatesSelectedPerProcess.get(processId)) this.toggleSelectAllStates(processId);
        }
    }

    private loadIsAllStatesSelected() {
        for (const idProcess of Array.from(this.processesStatesLabels.keys()))
            this.updateIsAllStatesSelected(idProcess, '');
    }

    private loadIsAllProcessesSelected() {
        for (const idProcessGroup of this.processIdsByProcessGroup.keys())
            this.isAllProcessesSelectedPerProcessGroup.set(idProcessGroup, this.isAllProcessesSelected(idProcessGroup));
    }

    private isAllStatesSelected(idProcess) {
        for (const state of this.processesStatesLabels.get(idProcess).states) {
            if (!this.feedConfigurationForm.value.processesStates[state.stateControlIndex]) return false;
        }
        return true;
    }

    private isAllProcessesSelected(idProcessGroup) {
        for (const processId of this.processIdsByProcessGroup.get(idProcessGroup)) {
            if (!this.isAllStatesSelectedPerProcess.get(processId)) return false;
        }
        return true;
    }

    private updateIsAllStatesSelected(idProcess, idProcessGroup) {
        this.isAllStatesSelectedPerProcess.set(idProcess, this.isAllStatesSelected(idProcess));

        if (idProcessGroup !== '')
            this.isAllProcessesSelectedPerProcessGroup.set(idProcessGroup, this.isAllProcessesSelected(idProcessGroup));
    }

    private makeProcessesWithoutGroup() {
        this.processesDefinition.forEach((process) => {
            if (!this.findInProcessGroups(process.id)) {
                let processLabel = !!process.name ? process.name : process.id;

                this.translateService.get(processLabel).subscribe((translate) => {
                    processLabel = translate;
                });
                this.processesWithoutGroup.push({idProcess: process.id, processLabel: processLabel});
            }
        });
        this.processesWithoutGroup.sort((obj1, obj2) => Utilities.compareObj(obj1.processLabel, obj2.processLabel));
    }

    private addCheckboxesInFormArray() {
        const processesStatesNotNotified = !!this.currentUserWithPerimeters.processesStatesNotNotified
            ? this.currentUserWithPerimeters.processesStatesNotNotified
            : null;

        this.preparedListOfProcessesStates.forEach((processState) => {
            const notNotifiedStatesForThisProcess = !!processesStatesNotNotified
                ? processesStatesNotNotified[processState.processId]
                : null;

            let isChecked = true;

            if (!!notNotifiedStatesForThisProcess && notNotifiedStatesForThisProcess.includes(processState.stateId)) {
                isChecked = false;
                if (this.checkStateUnsubscribedButWithFilteringNotificationNotAllowed(processState.processId, processState.stateId)) {
                    isChecked = true; // We force the subscription to this state
                }
            }

            this.processesStatesFormArray.push(new FormControl<boolean | null>(isChecked));
        });
    }

    private checkStateUnsubscribedButWithFilteringNotificationNotAllowed(processId: string, stateId: string): boolean {
        const processInfo = this.processesStatesLabels.get(processId);
        const stateInfo = processInfo.states.find((stateInfo) => stateInfo.stateId === stateId);

        if (! stateInfo.filteringNotificationAllowed) {
            this.statesUnsubscribedButWithFilteringNotificationNotAllowed += '\n' + processInfo.processLabel + ' / ' + stateInfo.stateLabel;
            return true;
        }
        return false;
    }

    private computePreparedListOfProcessesStatesAndProcessesStatesLabels() {
        let stateControlIndex = 0;

        for (const process of this.processesDefinition) {
            const states: {stateId: string; stateLabel: string; stateControlIndex: number; filteringNotificationAllowed: boolean}[] = [];

            const processLabel = !!process.name ? process.name : process.id;

            for (const stateId of Object.keys(process.states)) {
                const state = process.states[stateId];

                if (this.checkIfStateMustBeDisplayed(state, process, stateId)) {
                    const stateLabel = !!state.name ? state.name : stateId;

                    const filteringNotificationAllowed = this.userService.isFilteringNotificationAllowedForProcessAndState(process.id, stateId);
                    this.checkIfProcessAndProcessGroupCheckboxesAreEnabled(process.id, filteringNotificationAllowed);

                    states.push({stateId, stateLabel, stateControlIndex, filteringNotificationAllowed});
                    this.preparedListOfProcessesStates.push({processId: process.id, stateId});
                    stateControlIndex++;
                }
            }
            if (states.length) {
                states.sort((obj1, obj2) => Utilities.compareObj(obj1.stateLabel, obj2.stateLabel));

                this.processesStatesLabels.set(process.id, {processLabel, states});
            }
        }
    }

    private checkIfProcessAndProcessGroupCheckboxesAreEnabled(processId: string, filteringNotificationAllowed: boolean) {
        if (filteringNotificationAllowed === true) {
            this.isAllStatesCheckboxDisabledPerProcessId.set(processId, false);
            const processGroupId = this.processesService.findProcessGroupIdForProcessId(processId);
            if (!! processGroupId) {
                this.isAllProcessesCheckboxDisabledPerProcessGroup.set(processGroupId, false);
            }
        }
    }

    private checkIfStateMustBeDisplayed(state: State, process: Process, stateId: string): boolean {
        return !state.isOnlyAChildState && this.userService.isReceiveRightsForProcessAndState(process.id, stateId);
    }

    /** cleaning of the two arrays : processGroupsAndLabels and processesWithoutGroup
     * processGroupsAndLabels : we don't display process which doesn't have any displayed state (a state is not displayed
     *                          if user doesn't have received right on it, or if the state is 'isOnlyAChildState'
     *                          and we don't display process group which doesn't have any process
     * processesWithoutGroup : we don't display process which doesn't have any state with Receive or ReceiveAndWrite right*/
    private removeProcessesWithoutDisplayedStates() {
        const toRemove = [];
        this.processGroupsAndLabels.forEach((processGroupData) => {
            processGroupData.processes = processGroupData.processes.filter(
                (processData) => !!this.processesStatesLabels.get(processData.processId)
            );
            if (processGroupData.processes.length === 0)  toRemove.push(processGroupData.groupId);
        });
        this.processGroupsAndLabels = this.processGroupsAndLabels.filter(group => !toRemove.includes(group.groupId));
        this.processesWithoutGroup = this.processesWithoutGroup.filter(
            (processData) => !!this.processesStatesLabels.get(processData.idProcess)
        );
    }

    private initForm() {
        this.feedConfigurationForm = new FormGroup({
            processesStates: new FormArray([])
        });
    }

    ngOnInit() {
        this.currentUserWithPerimeters = this.userService.getCurrentUserWithPerimeters();

        this.processGroupsAndLabels = this.processesService.getProcessGroupsAndLabels();
        this.processGroupsAndLabels.forEach((group) => {
            group.processes.sort((obj1, obj2) => Utilities.compareObj(obj1.processLabel, obj2.processLabel));
        });

        this.processGroupsAndLabels.sort((obj1, obj2) => Utilities.compareObj(obj1.groupLabel, obj2.groupLabel));

        this.initIsAllProcessesCheckboxDisabledPerProcessGroup();

        if (this.processesDefinition) {
            this.initIsAllStatesCheckboxDisabledPerProcessId();
            this.computePreparedListOfProcessesStatesAndProcessesStatesLabels();
        }

        this.makeProcessesWithoutGroup();
        this.addCheckboxesInFormArray();
        this.removeProcessesWithoutDisplayedStates();
        this.loadIsAllStatesSelected();
        this.makeProcessIdsByProcessGroup();
        this.loadIsAllProcessesSelected();

        this.isThereProcessStateToDisplay = this.processesService.getStatesListPerProcess(false, true).size > 0;
    }

    ngAfterViewInit() {
        if (this.statesUnsubscribedButWithFilteringNotificationNotAllowed.length) {
            this.openStatesUnsubscribedButWithFilteringNotificationNotAllowedModal();
        }
    }

    initIsAllProcessesCheckboxDisabledPerProcessGroup() {
        if (!! this.processGroupsAndLabels) {
            this.processGroupsAndLabels.forEach(processGroupAndLabel => {
                this.isAllProcessesCheckboxDisabledPerProcessGroup.set(processGroupAndLabel.groupId, true);
            });
        }
    }

    initIsAllStatesCheckboxDisabledPerProcessId() {
        for (const process of this.processesDefinition) {
            this.isAllStatesCheckboxDisabledPerProcessId.set(process.id, true);
        }
    }

    makeProcessIdsByProcessGroup() {
        this.processGroupsAndLabels.forEach((element) => {
            const processIds = [];
            element.processes.forEach((process) => processIds.push(process.processId));
            this.processIdsByProcessGroup.set(element.groupId, processIds);
        });
    }

    confirmSaveSettings() {
        if (this.saveSettingsInProgress) return; // avoid multiple clicks
        this.saveSettingsInProgress = true;
        const processesStatesNotNotifiedUpdate = new Map<string, string[]>();
        this.feedConfigurationForm.value.processesStates.map((checked, i) => {
            if (!checked) {
                const currentProcessId = this.preparedListOfProcessesStates[i].processId;
                const currentStateId = this.preparedListOfProcessesStates[i].stateId;

                const statesNotNotifiedUpdate = processesStatesNotNotifiedUpdate.get(currentProcessId);
                if (!!statesNotNotifiedUpdate)
                    statesNotNotifiedUpdate.push(this.preparedListOfProcessesStates[i].stateId);
                else processesStatesNotNotifiedUpdate.set(currentProcessId, [currentStateId]);
            }
        });

        this.settingsService
            .patchUserSettings({
                login: this.currentUserWithPerimeters.userData.login,
                processesStatesNotNotified: Object.fromEntries(processesStatesNotNotifiedUpdate)
            })
            .subscribe({
                next: (resp) => {
                    this.saveSettingsInProgress = false;
                    this.messageAfterSavingSettings = '';
                    const msg = resp.message;
                    if (!!msg && msg.includes('unable')) {
                        console.log('Impossible to save settings, error message from service : ', msg);
                        this.messageAfterSavingSettings = 'shared.error.impossibleToSaveSettings';
                        this.displaySendResultError = true;
                    } else {
                        this.cardService.removeAllLightCardFromMemory();
                        this.userService.loadUserWithPerimetersData().subscribe();
                    }
                    this.modalRef.close();
                },
                error: (err) => {
                    console.error('Error when saving settings :', err);
                    this.modalRef.close();
                    this.messageAfterSavingSettings = 'shared.error.impossibleToSaveSettings';
                    this.displaySendResultError = true;
                }
            });
    }

    doNotConfirmSaveSettings() {
        // The modal must not be closed until the settings has been saved in the back
        // If not, with  slow network, when user go to the feed before the end of the request
        // it ends up with nothing in the feed
        // This happens because method this.cardService.removeAllLightCardFromMemory()
        // is called too late (in method confirmSaveSettings)
        if (!this.saveSettingsInProgress) this.modalRef.close();
    }

    openStatesUnsubscribedButWithFilteringNotificationNotAllowedModal() {
        this.modalRef = this.modalService.open(this.statesUnsubscribedTemplate, {centered: true, backdrop: 'static'});
    }

    openConfirmSaveSettingsModal(content) {
        this.modalRef = this.modalService.open(content, {centered: true, backdrop: 'static'});
    }
}
