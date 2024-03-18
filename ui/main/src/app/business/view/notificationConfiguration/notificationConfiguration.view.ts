/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ProcessesService} from 'app/business/services/businessconfig/processes.service';
import {
    NotificationConfigurationPage,
    ProcessForNotification,
    ProcessGroupForNotification,
    StateForNotification
} from './notificationConfigurationPage';
import {Process} from '@ofModel/processes.model';
import {UserService} from 'app/business/services/users/user.service';
import {ConfigService} from 'app/business/services/config.service';
import {SettingsService} from 'app/business/services/users/settings.service';
import {ModalService} from 'app/business/services/modal.service';
import {I18n} from '@ofModel/i18n.model';
import {TranslationService} from 'app/business/services/translation/translation.service';

export class NotificationConfigurationView {
    private setProcessStateCheckBoxValue: Function = () => {};
    private setProcessCheckBoxValue: Function = () => {};
    private setProcessGroupCheckBoxValue: Function = () => {};
    private notificationConfigurationPage: NotificationConfigurationPage;
    private processList: ProcessForNotification[] = [];
    private translationService: TranslationService;

    public constructor(translationService: TranslationService) {
        this.translationService = translationService;
        this.computeNotificationConfigurationPage();
    }

    public setFunctionToSetProcessStateCheckBoxValue(setProcessStateCheckBoxValue: Function) {
        this.setProcessStateCheckBoxValue = setProcessStateCheckBoxValue;
    }

    public setFunctionToSetProcessCheckBoxValue(setProcessCheckBoxValue: Function) {
        this.setProcessCheckBoxValue = setProcessCheckBoxValue;
    }

    public setFunctionToSetProcessGroupCheckBoxValue(setProcessGroupCheckBoxValue: Function) {
        this.setProcessGroupCheckBoxValue = setProcessGroupCheckBoxValue;
    }

    private computeNotificationConfigurationPage(): void {
        this.notificationConfigurationPage = new NotificationConfigurationPage();
        this.processList = this.getProcessList();
        this.notificationConfigurationPage.processGroups = this.getProcessGroups(this.processList);

        // Assign processes not in any group
        this.notificationConfigurationPage.processWithNoProcessGroup =
            this.notificationConfigurationPage.processGroups.length > 0
                ? this.getProcessesNotInProcessGroups(
                      this.processList,
                      this.notificationConfigurationPage.processGroups
                  )
                : this.processList;
        this.notificationConfigurationPage.isMailEnabled =
            ConfigService.getConfigValue('settings.sendCardsByEmail', false) &&
            ConfigService.getConfigValue('settings.email')?.length > 0;
    }

    public getNotificationConfigurationPage(): NotificationConfigurationPage {
        return this.notificationConfigurationPage;
    }

    public async manageNotNotifiedStatesWithFilteringNotificationNotAllowed() {
        let processStatesThatShouldBeNotified = '';
        this.processList.forEach((process) => {
            process.states.forEach((state) => {
                if (!state.filteringNotificationAllowed && !state.checked) {
                    processStatesThatShouldBeNotified += process.label + ' / ' + state.label + '\n';
                    this.clickOnState(process.id, state.id);
                }
            });
        });
        if (processStatesThatShouldBeNotified !== '') {
            let message = this.translationService.getTranslation('feedConfiguration.youAreUnsubscribedFrom');
            message += '\n';
            message += processStatesThatShouldBeNotified;
            message += this.translationService.getTranslation('feedConfiguration.youWillBeSubscribedAgain');
            console.log(new Date().toISOString() + ' before openInformationModal *************** ');
            await ModalService.openInformationModal(message);
            console.log(new Date().toISOString() + ' after openInformationModal ***************');
            await this.clickOnSaveButton();
            return;
        }
        return;
    }

    private getProcessGroups(Process: ProcessForNotification[]): ProcessGroupForNotification[] {
        const processGroups: ProcessGroupForNotification[] = [];
        for (const [id, processGroup] of ProcessesService.getProcessGroups().entries()) {
            const filteredProcesses = Process.filter((process) => processGroup.processes.includes(process.id));
            if (filteredProcesses.length > 0) {
                const processGroupChecked = filteredProcesses.every((process) => process.checked);
                processGroups.push({
                    id: id,
                    label: processGroup.name,
                    checked: processGroupChecked,
                    processes: filteredProcesses
                });
            }
        }
        return processGroups;
    }

    private getProcessesNotInProcessGroups(
        processList: ProcessForNotification[],
        processGroups: ProcessGroupForNotification[]
    ): ProcessForNotification[] {
        const processIdsInProcessGroups = processGroups.flatMap((processGroup) =>
            processGroup.processes.map((process) => process.id)
        );
        return processList.filter((process) => !processIdsInProcessGroups.includes(process.id));
    }

    private getProcessList(): ProcessForNotification[] {
        const processesForNotification: ProcessForNotification[] = [];
        ProcessesService.getAllProcesses().forEach((process) => {
            const statesForNotification = this.getStateForNotification(process);
            const processChecked = statesForNotification.every((state) => state.checked);
            if (statesForNotification.length > 0) {
                processesForNotification.push({
                    id: process.id,
                    label: process.name ? process.name : process.id,
                    checked: processChecked,
                    states: statesForNotification
                });
            }
        });
        processesForNotification.sort((a, b) => a.label.localeCompare(b.label));
        return processesForNotification;
    }

    private getStateForNotification(process: Process): StateForNotification[] {
        const statesForNotification: StateForNotification[] = [];
        if (process.states != null)
            for (const stateId of process.states.keys()) {
                const state = process.states.get(stateId);
                if (!state.isOnlyAChildState && UserService.isReceiveRightsForProcessAndState(process.id, stateId)) {
                    statesForNotification.push({
                        id: stateId,
                        label: state.name,
                        checked: this.isProcessStateNotified(process.id, stateId),
                        filteringNotificationAllowed: UserService.isFilteringNotificationAllowedForProcessAndState(
                            process.id,
                            stateId
                        ),
                        notificationByEmail: this.isProcessStateNotifiedByEmail(process.id, stateId)
                    });
                }
            }
        return statesForNotification;
    }

    private isProcessStateNotifiedByEmail(processId: string, stateId: string): boolean {
        const processStatesNotifiedByEmail = UserService.getCurrentUserWithPerimeters().processesStatesNotifiedByEmail;
        if (processStatesNotifiedByEmail == null) return false;
        const statesNotifiedByEmail = processStatesNotifiedByEmail.get(processId);
        if (statesNotifiedByEmail == null) return false;
        return statesNotifiedByEmail.includes(stateId);
    }

    private isProcessStateNotified(processId: string, stateId: string): boolean {
        const processStatesNotNotified = UserService.getCurrentUserWithPerimeters().processesStatesNotNotified;
        if (processStatesNotNotified == null) return true;
        const statesNotNotified = processStatesNotNotified.get(processId);
        if (statesNotNotified == null) return true;
        return !statesNotNotified.includes(stateId);
    }

    public clickOnProcess(processId: string): void {
        const process = this.processList.find((process) => process.id === processId);
        if (process) {
            process.checked = !process.checked;
            process.states.forEach((state) => {
                if (state.filteringNotificationAllowed) {
                    state.checked = process.checked;
                    this.setProcessStateCheckBoxValue(processId, state.id, state.checked);
                }
            });
            this.setProcessGroupCheckboxForProcess(process);
        }
    }

    private setProcessGroupCheckboxForProcess(process: ProcessForNotification): void {
        const processGroup = this.notificationConfigurationPage.processGroups.find((group) =>
            group.processes.includes(process)
        );
        if (processGroup) {
            if (processGroup.processes.every((otherProcess) => (otherProcess.checked = process.checked))) {
                processGroup.checked = process.checked;
            } else {
                processGroup.checked = false;
            }
            this.setProcessGroupCheckBoxValue(processGroup.id, processGroup.checked);
        }
    }

    public clickOnState(processId: string, stateId: string): void {
        const process = this.processList.find((process) => process.id === processId);
        if (process) {
            const state = process.states.find((state) => state.id === stateId);
            if (state) {
                state.checked = !state.checked;
                if (
                    process.states
                        .filter((otherState) => otherState.filteringNotificationAllowed)
                        .every((otherState) => otherState.checked === state.checked)
                ) {
                    process.checked = state.checked;
                } else {
                    process.checked = false;
                }
                this.setProcessCheckBoxValue(processId, process.checked);
                this.setProcessGroupCheckboxForProcess(process);
            }
        }
    }

    public clickOnProcessGroup(processGroupId: string): void {
        const processGroup = this.notificationConfigurationPage.processGroups.find(
            (group) => group.id === processGroupId
        );
        if (processGroup) {
            processGroup.checked = !processGroup.checked;
            processGroup.processes.forEach((process) => {
                process.checked = processGroup.checked;
                this.setProcessCheckBoxValue(process.id, process.checked);
                process.states.forEach((state) => {
                    if (state.filteringNotificationAllowed) {
                        state.checked = processGroup.checked;
                        this.setProcessStateCheckBoxValue(process.id, state.id, state.checked);
                    }
                });
            });
        }
    }

    public clickOnStateNotificationByEmail(processId: string, stateId: string): void {
        const process = this.processList.find((process) => process.id === processId);
        if (process) {
            const state = process.states.find((state) => state.id === stateId);
            if (state) {
                state.notificationByEmail = !state.notificationByEmail;
            }
        }
    }

    public async clickOnSaveButton(): Promise<void> {
        const result = await SettingsService.patchUserSettings({
            processesStatesNotNotified: this.getUncheckedStatesPerProcesses(),
            processesStatesNotifiedByEmail: this.getCheckedStatesForMailNotificationPerProcesses()
        });
        await ModalService.openInformationModal(new I18n('settings.settingsSaved'));
    }

    private getUncheckedStatesPerProcesses(): any {
        const uncheckedStatesPerProcesses = {};
        this.processList.forEach((process) => {
            const uncheckedStates = process.states.filter((state) => !state.checked).map((state) => state.id);
            if (uncheckedStates.length > 0) {
                uncheckedStatesPerProcesses[process.id] = uncheckedStates;
            }
        });
        return uncheckedStatesPerProcesses;
    }

    private getCheckedStatesForMailNotificationPerProcesses() {
        const checkedStatesPerProcesses = {};
        this.processList.forEach((process) => {
            const checkedStates = process.states.filter((state) => state.notificationByEmail).map((state) => state.id);
            if (checkedStates.length > 0) {
                checkedStatesPerProcesses[process.id] = checkedStates;
            }
        });
        return checkedStatesPerProcesses;
    }
}
