/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ProcessesService} from '@ofServices/processes/ProcessesService';
import {
    NotificationConfigurationPage,
    ProcessForNotification,
    ProcessGroupForNotification,
    StateForNotification
} from './notificationConfigurationPage';
import {Process} from '@ofServices/processes/model/Processes';
import {UserService} from 'app/business/services/users/user.service';
import {ConfigService} from 'app/services/config/ConfigService';
import {SettingsService} from 'app/business/services/users/settings.service';
import {ModalService} from 'app/business/services/modal.service';
import {I18n} from '@ofModel/i18n.model';
import {OpfabStore} from 'app/business/store/opfabStore';
import {ServerResponseStatus} from 'app/business/server/serverResponse';
import {firstValueFrom} from 'rxjs';
import _ from 'lodash';
import {TranslationService} from '@ofServices/translation/TranslationService';

export class NotificationConfigurationView {
    private setProcessStateCheckBoxValue: Function = () => {};
    private setProcessCheckBoxValue: Function = () => {};
    private setProcessGroupCheckBoxValue: Function = () => {};
    private setEmailEnabled: Function = () => {};
    private notificationConfigurationPage: NotificationConfigurationPage;
    private processList: ProcessForNotification[] = [];
    private lastProcessesStatesNotNotifiedSaved;
    private lastProcessesStatesNotifiedByEmailSaved;

    public constructor() {
        this.computeNotificationConfigurationPage();
    }

    private computeNotificationConfigurationPage(): void {
        this.notificationConfigurationPage = new NotificationConfigurationPage();
        this.processList = this.getProcessList();
        this.notificationConfigurationPage.processGroups = this.getProcessGroups(this.processList);

        this.notificationConfigurationPage.processesWithNoProcessGroup = this.getProcessesNotInProcessGroups(
            this.processList,
            this.notificationConfigurationPage.processGroups
        );

        this.notificationConfigurationPage.isEmailEnabled =
            (ConfigService.getConfigValue('settings.sendDailyEmail', false) ||
                ConfigService.getConfigValue('settings.sendWeeklyEmail', false) ||
                ConfigService.getConfigValue('settings.sendCardsByEmail', false)) &&
            ConfigService.getConfigValue('settings.email')?.length > 0;

        this.notificationConfigurationPage.isThereProcessStatesToDisplay =
            this.notificationConfigurationPage.processGroups.length > 0 ||
            this.notificationConfigurationPage.processesWithNoProcessGroup.length > 0;
        this.lastProcessesStatesNotNotifiedSaved = this.getUncheckedStatesPerProcesses();
        this.lastProcessesStatesNotifiedByEmailSaved = this.getCheckedStatesForEmailNotificationPerProcesses();
    }

    private getProcessList(): ProcessForNotification[] {
        const processesForNotification: ProcessForNotification[] = [];
        ProcessesService.getAllProcesses().forEach((process) => {
            const states = this.getStateForNotification(process);
            if (states.length > 0) {
                processesForNotification.push({
                    id: process.id,
                    label: process.name || process.id,
                    checked: states.every((state) => state.checked),
                    filteringNotificationAllowed: states.some((state) => state.filteringNotificationAllowed),
                    states
                });
            }
        });
        processesForNotification.sort((a, b) => a.label.localeCompare(b.label));
        return processesForNotification;
    }

    private getStateForNotification(process: Process): StateForNotification[] {
        if (!process.states) return [];

        return Array.from(process.states.entries())
            .filter(
                ([stateId, state]) =>
                    !state.isOnlyAChildState && UserService.isReceiveRightsForProcessAndState(process.id, stateId)
            )
            .map(([stateId, state]) => ({
                id: stateId,
                label: state.name,
                checked: this.isProcessStateNotified(process.id, stateId),
                filteringNotificationAllowed: UserService.isFilteringNotificationAllowedForProcessAndState(
                    process.id,
                    stateId
                ),
                notificationByEmail: this.isProcessStateNotifiedByEmail(process.id, stateId)
            }));
    }

    private isProcessStateNotified(processId: string, stateId: string): boolean {
        const processStatesNotNotified = UserService.getCurrentUserWithPerimeters().processesStatesNotNotified;
        const statesNotNotified = processStatesNotNotified?.get(processId);
        if (statesNotNotified == null) return true;
        return !statesNotNotified.includes(stateId);
    }

    private isProcessStateNotifiedByEmail(processId: string, stateId: string): boolean {
        const processStatesNotifiedByEmail = UserService.getCurrentUserWithPerimeters().processesStatesNotifiedByEmail;
        const statesNotifiedByEmail = processStatesNotifiedByEmail?.get(processId);
        if (statesNotifiedByEmail == null) return false;
        return statesNotifiedByEmail.includes(stateId);
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
        const processIdsInProcessGroups = new Set(processGroups.flatMap(({processes}) => processes.map(({id}) => id)));
        return processList.filter(({id}) => !processIdsInProcessGroups.has(id));
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

    private getCheckedStatesForEmailNotificationPerProcesses() {
        const checkedStatesPerProcesses = {};
        this.processList.forEach((process) => {
            const checkedStates = process.states.filter((state) => state.notificationByEmail).map((state) => state.id);
            if (checkedStates.length > 0) {
                checkedStatesPerProcesses[process.id] = checkedStates;
            }
        });
        return checkedStatesPerProcesses;
    }

    public setFunctionToSetProcessStateCheckBoxValue(
        setProcessStateCheckBoxValue: (processId: string, stateId: string, checked: boolean) => void
    ) {
        this.setProcessStateCheckBoxValue = setProcessStateCheckBoxValue;
    }

    public setFunctionToSetProcessCheckBoxValue(setProcessCheckBoxValue: (id: string, checked: boolean) => void) {
        this.setProcessCheckBoxValue = setProcessCheckBoxValue;
    }

    public setFunctionToSetProcessGroupCheckBoxValue(
        setProcessGroupCheckBoxValue: (id: string, checked: boolean) => void
    ) {
        this.setProcessGroupCheckBoxValue = setProcessGroupCheckBoxValue;
    }

    public setFunctionToSetEmailEnabled(
        setEmailEnabled: (processId: string, stateId: string, mailEnabled: boolean) => void
    ) {
        this.setEmailEnabled = setEmailEnabled;
    }

    public getNotificationConfigurationPage(): NotificationConfigurationPage {
        return _.cloneDeep(this.notificationConfigurationPage);
    }

    public clickOnState(processId: string, stateId: string): void {
        const process = this.processList.find(({id}) => id === processId);
        if (!process) return;

        const state = process.states.find(({id}) => id === stateId);
        if (!state) return;

        state.checked = !state.checked;
        if (!state.checked && state.notificationByEmail) {
            state.notificationByEmail = false;
            this.setEmailEnabled(processId, stateId, false);
        }

        process.checked = process.states
            .filter(({filteringNotificationAllowed}) => filteringNotificationAllowed)
            .every(({checked}) => checked);

        this.setProcessCheckBoxValue(processId, process.checked);
        this.setProcessGroupCheckboxForProcess(process);
    }

    private setProcessGroupCheckboxForProcess(process: ProcessForNotification): void {
        const processGroup = this.notificationConfigurationPage.processGroups.find(({processes}) =>
            processes.includes(process)
        );

        if (processGroup) {
            processGroup.checked = processGroup.processes.every(({checked}) => checked);
            this.setProcessGroupCheckBoxValue(processGroup.id, processGroup.checked);
        }
    }

    public clickOnProcess(processId: string): void {
        const process = this.processList.find(({id}) => id === processId);
        if (!process) return;

        process.checked = !process.checked;

        process.states.forEach((state) => {
            if (state.filteringNotificationAllowed) {
                state.checked = process.checked;
                this.setProcessStateCheckBoxValue(processId, state.id, state.checked);
                if (!state.checked && state.notificationByEmail) {
                    state.notificationByEmail = false;
                    this.setEmailEnabled(processId, state.id, false);
                }
            }
        });

        this.setProcessGroupCheckboxForProcess(process);
    }

    public clickOnProcessGroup(processGroupId: string): void {
        const processGroup = this.notificationConfigurationPage.processGroups.find(({id}) => id === processGroupId);
        if (!processGroup) return;

        processGroup.checked = !processGroup.checked;

        processGroup.processes.forEach((process) => {
            process.checked = processGroup.checked;
            this.setProcessCheckBoxValue(process.id, process.checked);

            process.states.forEach((state) => {
                if (state.filteringNotificationAllowed) {
                    state.checked = process.checked;
                    this.setProcessStateCheckBoxValue(process.id, state.id, state.checked);
                    if (!state.checked && state.notificationByEmail) {
                        state.notificationByEmail = false;
                        this.setEmailEnabled(process.id, state.id, false);
                    }
                }
            });
        });
    }

    public clickOnStateNotificationByEmail(processId: string, stateId: string): void {
        const process = this.processList.find(({id}) => id === processId);
        if (!process) {
            return;
        }

        const state = process.states.find(({id}) => id === stateId);
        if (!state) {
            return;
        }
        state.notificationByEmail = !state.notificationByEmail;
        this.setEmailEnabled(processId, stateId, state.notificationByEmail);
    }

    public async clickOnSaveButton(): Promise<void> {
        const processesStatesNotNotified = this.getUncheckedStatesPerProcesses();
        const processesStatesNotifiedByEmail = this.getCheckedStatesForEmailNotificationPerProcesses();

        const {status} = await firstValueFrom(
            SettingsService.patchUserSettings({
                processesStatesNotNotified,
                processesStatesNotifiedByEmail
            })
        );

        if (status !== ServerResponseStatus.OK) {
            await ModalService.openInformationModal(new I18n('shared.error.impossibleToSaveSettings'));
            return;
        }

        this.lastProcessesStatesNotNotifiedSaved = processesStatesNotNotified;
        this.lastProcessesStatesNotifiedByEmailSaved = processesStatesNotifiedByEmail;

        OpfabStore.getLightCardStore().removeAllLightCards();
        UserService.loadUserWithPerimetersData().subscribe();
        await ModalService.openInformationModal(new I18n('settings.settingsSaved'));
    }

    public async manageNotNotifiedStatesWithFilteringNotificationNotAllowed() {
        const processStatesThatShouldBeNotified = this.processList
            .flatMap((process) =>
                process.states
                    .filter((state) => !state.filteringNotificationAllowed && !state.checked)
                    .map((state) => {
                        this.setProcessStateCheckBoxValue(process.id, state.id, true);
                        this.clickOnState(process.id, state.id);
                        return `${process.label} / ${state.label}`;
                    })
            )
            .join('\n');

        if (processStatesThatShouldBeNotified) {
            const message = `
                ${TranslationService.getTranslation('notificationConfiguration.youAreUnsubscribedFrom')}
                ${processStatesThatShouldBeNotified}
                ${TranslationService.getTranslation('notificationConfiguration.youWillBeSubscribedAgain')}
            `;

            await ModalService.openInformationModal(message.trim());
            await this.clickOnSaveButton();
        }
    }

    public async canUserExit() {
        if (!this.isSaveNeeded()) {
            return true;
        }
        const userChoice = await ModalService.openSaveBeforeExitModal();
        switch (userChoice) {
            case 'cancel':
                return false;
            case 'save':
                await this.clickOnSaveButton();
                return true;
            default:
                return true;
        }
    }

    private isSaveNeeded() {
        if (
            _.isEqual(this.lastProcessesStatesNotNotifiedSaved, this.getUncheckedStatesPerProcesses()) &&
            _.isEqual(
                this.lastProcessesStatesNotifiedByEmailSaved,
                this.getCheckedStatesForEmailNotificationPerProcesses()
            )
        )
            return false;
        return true;
    }
}
