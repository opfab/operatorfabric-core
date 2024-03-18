/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

export class NotificationConfigurationPage {
    processGroups: ProcessGroupForNotification[];
    processesWithNoProcessGroup: ProcessForNotification[];
    isEmailEnabled: boolean;
    isThereProcessStatesToDisplay: boolean;
}

export class ProcessGroupForNotification {
    id: string;
    label: string;
    checked: boolean;
    processes: ProcessForNotification[];
}

export class ProcessForNotification {
    id: string;
    label: string;
    checked: boolean;
    filteringNotificationAllowed: boolean;
    states: StateForNotification[];
}

export class StateForNotification {
    id: string;
    label: string;
    checked: boolean;
    filteringNotificationAllowed: boolean;
    notificationByEmail: boolean;
}
