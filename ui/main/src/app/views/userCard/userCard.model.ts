/* Copyright (c) 2024-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
import {Severity} from 'app/model/Severity';

export enum InputFieldName {
    EndDate = 'endDate',
    ExpirationDate = 'expirationDate',
    Lttd = 'lttd',
    Process = 'process',
    ProcessGroup = 'processGroup',
    Publisher = 'publisher',
    Recipients = 'recipients',
    RecipientsForInformation = 'recipientsForInformation',
    Severity = 'severity',
    KeepChildCards = 'keepChildCards',
    StartDate = 'startDate',
    State = 'state'
}

export enum EditionMode {
    COPY = 'COPY',
    CREATE = 'CREATE',
    EDITION = 'EDITION'
}

export class MultiselectItem {
    id: string;
    label: string;
}

export interface UserCardUIControl {
    lockProcessAndProcessGroupSelection(lock: boolean);
    renderTemplate(html: string);
    setDate(inputName: InputFieldName, value: number);
    setInputVisibility(inputName: InputFieldName, visible: boolean);
    setLoadingTemplateInProgress(loading: boolean);
    setPublisherList(publishers: MultiselectItem[], selected: string);
    setProcessGroupList(processGroups: MultiselectItem[], selected: string);
    setProcessList(processes: MultiselectItem[], selected: string);
    setRecipientsForInformationList(recipients: MultiselectItem[]);
    setRecipientsList(recipients: MultiselectItem[]);
    setSelectedRecipients(selected: string[]);
    setSelectedRecipientsForInformation(selected: string[]);
    setSeverity(severity: Severity);
    setKeepChildCards(keepChildCards: boolean);
    setStatesList(states: MultiselectItem[], selected: string);
    setUserNotAllowedToSendCard();
}
