/* Copyright (c) 2024-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
import {Severity} from 'app/model/Severity';
import {UserCardUIControl, MultiselectItem, InputFieldName} from 'app/views/userCard/UserCardModel';

export class UserCardUIControlMock implements UserCardUIControl {
    inputVisibility_FctCalls: {[key: string]: boolean} = {};
    processAndProcessGroupLocked: boolean;
    userNotAllowedToSendCard: boolean = false;
    recipients: MultiselectItem[];
    selectedRecipients: string[];
    recipientsForInformation: MultiselectItem[];
    selectedRecipientsForInformation: string[];
    setDate_FctCalls: {[key: string]: number} = {};
    publishers: MultiselectItem[];
    selectedPublisher: string;
    processGroups: MultiselectItem[];
    selectedProcessGroup: string;
    processes: MultiselectItem[];
    selectedProcess: string;
    selectedState: string;
    severity: Severity;
    keepChildCards: boolean;
    states: MultiselectItem[];
    template: string;
    fctToRenderTemplate: (html: string) => Promise<void> = async (html) => {
        this.template = html;
    };

    initMock() {
        this.inputVisibility_FctCalls = {};
        this.processGroups = undefined;
        this.processes = undefined;
        this.publishers = undefined;
        this.recipients = undefined;
        this.recipientsForInformation = undefined;
        this.setDate_FctCalls = {};
        this.selectedProcessGroup = undefined;
        this.selectedPublisher = undefined;
        this.selectedProcess = undefined;
        this.selectedRecipients = undefined;
        this.selectedRecipientsForInformation = undefined;
        this.selectedState = undefined;
        this.severity = undefined;
        this.states = undefined;
        this.template = undefined;
        this.userNotAllowedToSendCard = false;
    }
    lockProcessAndProcessGroupSelection(lock: boolean): void {
        this.processAndProcessGroupLocked = lock;
    }
    async renderTemplate(html: string) {
        this.fctToRenderTemplate(html);
    }
    setDate(dateType: InputFieldName, value: number) {
        this.setDate_FctCalls[dateType] = value;
    }
    setFunctionToRenderTemplate(fct: (html: string) => Promise<void>) {
        this.fctToRenderTemplate = fct;
    }
    setInputVisibility(inputName: InputFieldName, visible: boolean): void {
        this.inputVisibility_FctCalls[inputName] = visible;
    }
    setLoadingTemplateInProgress(loading: boolean) {
        // implementation not needed for tests
    }

    setProcessGroupList(processGroups: MultiselectItem[], selected: string) {
        this.processGroups = processGroups;
        this.selectedProcessGroup = selected;
    }
    setProcessList(processes: MultiselectItem[], selected: string) {
        this.processes = processes;
        this.selectedProcess = selected;
    }
    setPublisherList(publishers: MultiselectItem[], selected: string) {
        this.publishers = publishers;
        this.selectedPublisher = selected;
    }
    setRecipientsForInformationList(recipients: MultiselectItem[]) {
        this.recipientsForInformation = recipients;
    }
    setRecipientsList(recipients: MultiselectItem[]) {
        this.recipients = recipients;
    }
    setSelectedRecipients(selected: string[]) {
        this.selectedRecipients = selected;
    }
    setSelectedRecipientsForInformation(selected: string[]) {
        this.selectedRecipientsForInformation = selected;
    }
    setSeverity(severity: Severity): void {
        this.severity = severity;
    }
    setKeepChildCards(keepChildCards: boolean): void {
        this.keepChildCards = keepChildCards;
    }
    setStatesList(states: MultiselectItem[], selected: string) {
        this.states = states;
        this.selectedState = selected;
    }
    setUserNotAllowedToSendCard(): void {
        this.userNotAllowedToSendCard = true;
    }
}
