/* Copyright (c) 2020-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {UserService} from 'app/business/services/users/user.service';
import {Process, State} from '@ofModel/processes.model';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {NgbModalRef} from '@ng-bootstrap/ng-bootstrap/modal/modal-ref';
import {UserWithPerimeters} from '@ofModel/userWithPerimeters.model';
import {ProcessesService} from 'app/business/services/businessconfig/processes.service';
import {FormArray, FormControl, FormGroup} from '@angular/forms';
import {SettingsService} from 'app/business/services/users/settings.service';
import {TranslateService} from '@ngx-translate/core';
import {Utilities} from '../../business/common/utilities';
import {ConfigService} from '../../business/services/config.service';
import {OpfabStore} from 'app/business/store/opfabStore';
import {LoggerService} from 'app/business/services/logs/logger.service';
import {Subject, Subscription} from 'rxjs';

@Component({
    selector: 'of-feedconfiguration',
    templateUrl: './feedconfiguration.component.html',
    styleUrls: ['./feedconfiguration.component.scss']
})
export class FeedconfigurationComponent implements OnInit, AfterViewInit, OnDestroy {
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
    userSettings: any;
    processesStatesLabels: Map<
        string,
        {
            processLabel: string;
            states: {
                stateId: string;
                stateLabel: string;
                stateControlIndex: number;
                filteringNotificationAllowed: boolean;
            }[];
        }
    >;
    statesUnsubscribedButWithFilteringNotificationNotAllowed = '';
    @ViewChild('statesUnsubscribedButWithFilteringNotificationNotAllowedPopup') statesUnsubscribedTemplate: ElementRef;
    @ViewChild('exitConfirmationPopup') exitConfirmationPopup: ElementRef;
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

    processesStatesNotifiedByEmail: Map<string, boolean>;
    changeSubscription: Subscription;
    canDeactivateSubject = new Subject<boolean>();
    pendingModification: boolean;

    constructor(
        private modalService: NgbModal,
        private translateService: TranslateService
    ) {
        this.processesStatesLabels = new Map();
        this.processIdsByProcessGroup = new Map();
        this.preparedListOfProcessesStates = [];
        this.processesWithoutGroup = [];
        this.processesDefinition = ProcessesService.getAllProcesses();
        this.isAllStatesSelectedPerProcess = new Map();
        this.isAllProcessesSelectedPerProcessGroup = new Map();
        this.isAllProcessesCheckboxDisabledPerProcessGroup = new Map();
        this.isAllStatesCheckboxDisabledPerProcessId = new Map();
        this.processesStatesNotifiedByEmail = new Map();
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

    private selectStateForMailNotif(processId: string, stateId: string, stateControlIndex: number) {
        if (this.feedConfigurationForm.controls.processesStates.controls[stateControlIndex].value) {
            this.processesStatesNotifiedByEmail.set(processId + '.' + stateId, true);
            this.pendingModification = true;
        }
    }

    private unselectStateForMailNotif(processId: string, stateId: string) {
        if (this.processesStatesNotifiedByEmail.has(processId + '.' + stateId)) {
            this.processesStatesNotifiedByEmail.delete(processId + '.' + stateId);
            this.pendingModification = true;
        }
    }

    private toggleSelectAllStates(idProcess: string) {
        if (this.isAllStatesSelectedPerProcess.get(idProcess)) {
            for (const state of this.processesStatesLabels.get(idProcess).states)
                if (this.feedConfigurationForm.controls.processesStates.controls[state.stateControlIndex].value)
                    document.getElementById('' + state.stateControlIndex).click();
        } else {
            for (const state of this.processesStatesLabels.get(idProcess).states)
                if (!this.feedConfigurationForm.controls.processesStates.controls[state.stateControlIndex].value)
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

    private isAllStatesSelected(idProcess: string): boolean {
        for (const state of this.processesStatesLabels.get(idProcess).states) {
            if (!this.feedConfigurationForm.controls.processesStates.controls[state.stateControlIndex].value)
                return false;
        }
        return true;
    }

    private isAllProcessesSelected(idProcessGroup: string): boolean {
        for (const processId of this.processIdsByProcessGroup.get(idProcessGroup)) {
            if (!this.isAllStatesSelectedPerProcess.get(processId)) return false;
        }
        return true;
    }

    private updateIsAllStatesSelected(idProcess: string, idProcessGroup: string) {
        this.isAllStatesSelectedPerProcess.set(idProcess, this.isAllStatesSelected(idProcess));

        if (idProcessGroup !== '') {
            this.isAllProcessesSelectedPerProcessGroup.set(idProcessGroup, this.isAllProcessesSelected(idProcessGroup));
        }
    }

    private checkIfMailNotifMustBeDeleted(idProcess: string, idState: string, stateControlIndex: number) {
        if (!this.feedConfigurationForm.controls.processesStates.controls[stateControlIndex].value) {
            this.processesStatesNotifiedByEmail.delete(idProcess + '.' + idState);
        }
    }

    private makeProcessesWithoutGroup() {
        this.processesDefinition.forEach((process) => {
            if (!this.findInProcessGroups(process.id)) {
                let processLabel = process.name ? process.name : process.id;

                this.translateService.get(processLabel).subscribe((translate) => {
                    processLabel = translate;
                });
                this.processesWithoutGroup.push({idProcess: process.id, processLabel: processLabel});
            }
        });
        this.processesWithoutGroup.sort((obj1, obj2) => Utilities.compareObj(obj1.processLabel, obj2.processLabel));
    }

    private addCheckboxesInFormArray() {
        const processesStatesNotNotified = this.currentUserWithPerimeters.processesStatesNotNotified
            ? this.currentUserWithPerimeters.processesStatesNotNotified
            : null;

        this.preparedListOfProcessesStates.forEach((processState) => {
            const notNotifiedStatesForThisProcess = processesStatesNotNotified
                ? processesStatesNotNotified.get(processState.processId)
                : null;

            let isChecked = true;

            if (notNotifiedStatesForThisProcess?.includes(processState.stateId)) {
                isChecked = false;
                if (
                    this.checkStateUnsubscribedButWithFilteringNotificationNotAllowed(
                        processState.processId,
                        processState.stateId
                    )
                ) {
                    isChecked = true; // We force the subscription to this state
                }
            }
            const filteringNotificationAllowed = UserService.isFilteringNotificationAllowedForProcessAndState(
                processState.processId,
                processState.stateId
            );
            this.processesStatesFormArray.push(
                new FormControl({value: isChecked, disabled: !filteringNotificationAllowed})
            );
        });
    }

    private checkStateUnsubscribedButWithFilteringNotificationNotAllowed(processId: string, stateId: string): boolean {
        const processInfo = this.processesStatesLabels.get(processId);
        const stateInfo = processInfo.states.find((stateInfo) => stateInfo.stateId === stateId);

        if (!stateInfo.filteringNotificationAllowed) {
            this.statesUnsubscribedButWithFilteringNotificationNotAllowed +=
                '\n' + processInfo.processLabel + ' / ' + stateInfo.stateLabel;
            return true;
        }
        return false;
    }

    private computePreparedListOfProcessesStatesAndProcessesStatesLabels() {
        let stateControlIndex = 0;

        for (const process of this.processesDefinition) {
            const states: {
                stateId: string;
                stateLabel: string;
                stateControlIndex: number;
                filteringNotificationAllowed: boolean;
            }[] = [];

            const processLabel = process.name ? process.name : process.id;

            for (const stateId of process.states.keys()) {
                const state = process.states.get(stateId);

                if (this.checkIfStateMustBeDisplayed(state, process, stateId)) {
                    const stateLabel = state.name ? state.name : stateId;

                    const filteringNotificationAllowed = UserService.isFilteringNotificationAllowedForProcessAndState(
                        process.id,
                        stateId
                    );
                    if (filteringNotificationAllowed) this.setProcessAndProcessGroupCheckboxesEnabled(process.id);

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

    private setProcessAndProcessGroupCheckboxesEnabled(processId: string) {
        this.isAllStatesCheckboxDisabledPerProcessId.set(processId, false);
        const processGroupId = ProcessesService.findProcessGroupIdForProcessId(processId);
        if (processGroupId) {
            this.isAllProcessesCheckboxDisabledPerProcessGroup.set(processGroupId, false);
        }
    }

    private checkIfStateMustBeDisplayed(state: State, process: Process, stateId: string): boolean {
        return !state.isOnlyAChildState && UserService.isReceiveRightsForProcessAndState(process.id, stateId);
    }

    /** cleaning of the two arrays : processGroupsAndLabels and processesWithoutGroup
     * processGroupsAndLabels : we don't display process which doesn't have any displayed state (a state is not displayed
     *                          if user doesn't have received right on it, or if the state is 'isOnlyAChildState'
     *                          and we don't display process group which doesn't have any process
     * processesWithoutGroup : we don't display process which doesn't have any state with Receive or ReceiveAndWrite right*/
    private removeProcessesWithoutDisplayedStates() {
        const toRemove = [];
        this.processGroupsAndLabels.forEach((processGroupData) => {
            processGroupData.processes = processGroupData.processes.filter((processData) =>
                this.processesStatesLabels.has(processData.processId)
            );
            if (processGroupData.processes.length === 0) toRemove.push(processGroupData.groupId);
        });
        this.processGroupsAndLabels = this.processGroupsAndLabels.filter((group) => !toRemove.includes(group.groupId));
        this.processesWithoutGroup = this.processesWithoutGroup.filter((processData) =>
            this.processesStatesLabels.has(processData.idProcess)
        );
    }

    private initForm() {
        this.feedConfigurationForm = new FormGroup({
            processesStates: new FormArray([])
        });
    }

    ngOnInit() {
        this.currentUserWithPerimeters = UserService.getCurrentUserWithPerimeters();

        this.userSettings = ConfigService.getConfigValue('settings');

        this.processGroupsAndLabels = ProcessesService.getProcessGroupsAndLabels();
        this.processGroupsAndLabels.forEach((group) => {
            group.processes.sort((obj1, obj2) => Utilities.compareObj(obj1.processLabel, obj2.processLabel));
        });

        this.processGroupsAndLabels.sort((obj1, obj2) => Utilities.compareObj(obj1.groupLabel, obj2.groupLabel));

        this.initIsAllProcessesCheckboxDisabledPerProcessGroup();
        this.initIsAllStatesCheckboxDisabledPerProcessId();
        this.computePreparedListOfProcessesStatesAndProcessesStatesLabels();
        this.makeProcessesWithoutGroup();
        this.addCheckboxesInFormArray();
        this.removeProcessesWithoutDisplayedStates();
        this.loadIsAllStatesSelected();
        this.makeProcessIdsByProcessGroup();
        this.loadIsAllProcessesSelected();
        this.computeProcessesStatesNotifiedByEmail();

        this.isThereProcessStateToDisplay = ProcessesService.getStatesListPerProcess(false, true).size > 0;
        this.changeSubscription = this.feedConfigurationForm.valueChanges.subscribe(() => {
            this.pendingModification = true;
        });
    }

    canDeactivate() {
        if (this.pendingModification) {
            this.modalRef = this.modalService.open(this.exitConfirmationPopup, {centered: true, backdrop: 'static'});
            return this.canDeactivateSubject;
        }
        return true;
    }

    ngAfterViewInit() {
        if (this.statesUnsubscribedButWithFilteringNotificationNotAllowed.length) {
            this.openStatesUnsubscribedButWithFilteringNotificationNotAllowedModal();
        }
    }

    initIsAllProcessesCheckboxDisabledPerProcessGroup() {
        if (this.processGroupsAndLabels) {
            this.processGroupsAndLabels.forEach((processGroupAndLabel) => {
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

    computeProcessesStatesNotifiedByEmail() {
        this.currentUserWithPerimeters.processesStatesNotifiedByEmail?.forEach((listOfStateIds, processId) => {
            listOfStateIds.forEach((stateId) => {
                this.processesStatesNotifiedByEmail.set(processId + '.' + stateId, true);
            });
        });
    }

    computeMapOfProcessesNotifiedByMail(): Map<string, string[]> {
        const processesStatesNotifiedUpdate = new Map<string, string[]>();

        this.processesStatesNotifiedByEmail.forEach((value, processState) => {
            const currentProcessId = processState.split('.').shift();
            const currentStateId = processState.split('.').pop();

            const statesNotifiedUpdate = processesStatesNotifiedUpdate.get(currentProcessId);
            if (statesNotifiedUpdate) {
                statesNotifiedUpdate.push(currentStateId);
            } else {
                processesStatesNotifiedUpdate.set(currentProcessId, [currentStateId]);
            }
        });
        return processesStatesNotifiedUpdate;
    }

    confirmSaveSettings() {
        if (this.saveSettingsInProgress) return; // avoid multiple clicks

        this.saveSettingsInProgress = true;

        const processesStatesNotNotifiedUpdate = new Map<string, string[]>();
        this.feedConfigurationForm.controls.processesStates.controls.forEach((control, i) => {
            if (!control.value) {
                const currentProcessId = this.preparedListOfProcessesStates[i].processId;
                const currentStateId = this.preparedListOfProcessesStates[i].stateId;

                const statesNotNotifiedUpdate = processesStatesNotNotifiedUpdate.get(currentProcessId);
                if (statesNotNotifiedUpdate) statesNotNotifiedUpdate.push(currentStateId);
                else processesStatesNotNotifiedUpdate.set(currentProcessId, [currentStateId]);
            }
        });

        const processesStatesNotifiedByEmail = this.computeMapOfProcessesNotifiedByMail();

        SettingsService.patchUserSettings({
            login: this.currentUserWithPerimeters.userData.login,
            processesStatesNotNotified: Object.fromEntries(processesStatesNotNotifiedUpdate),
            processesStatesNotifiedByEmail: Object.fromEntries(processesStatesNotifiedByEmail)
        }).subscribe({
            next: (resp) => {
                this.saveSettingsInProgress = false;
                this.pendingModification = false;
                this.canDeactivateSubject.next(true);
                this.messageAfterSavingSettings = '';
                const msg = resp.message;
                if (msg?.includes('unable')) {
                    LoggerService.error('Impossible to save settings, error message from service : ' + msg);
                    this.messageAfterSavingSettings = 'shared.error.impossibleToSaveSettings';
                    this.displaySendResultError = true;
                } else {
                    OpfabStore.getLightCardStore().removeAllLightCards();
                    UserService.loadUserWithPerimetersData().subscribe();
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

    cancelNavigation() {
        if (!this.saveSettingsInProgress) {
            this.modalRef.close();
        }
        this.canDeactivateSubject.next(false);
    }

    doNotConfirmSaveSettings() {
        // The modal must not be closed until the settings has been saved in the back
        // If not, with  slow network, when user go to the feed before the end of the request
        // it ends up with nothing in the feed
        // This happens because method LightCardsStoreService.removeAllLightCards();
        // is called too late (in method confirmSaveSettings)
        if (!this.saveSettingsInProgress) {
            this.modalRef.close();
        }
        this.canDeactivateSubject.next(true);
    }

    openStatesUnsubscribedButWithFilteringNotificationNotAllowedModal() {
        this.modalRef = this.modalService.open(this.statesUnsubscribedTemplate, {centered: true, backdrop: 'static'});
    }

    openConfirmSaveSettingsModal(content: TemplateRef<any>) {
        this.modalRef = this.modalService.open(content, {centered: true, backdrop: 'static'});
    }

    ngOnDestroy(): void {
        this.changeSubscription.unsubscribe();
    }
}
