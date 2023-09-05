/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

export class RealtimePage {
    screenOptions: RealtimePageScreenOption[] = [];
    currentScreen: RealtimePageScreen;
}

export class RealtimePageScreenOption {
    value: string;
    label: string;
}

export class RealtimePageScreen {
    name: string;
    onlyDisplayUsersInGroups: string[];
    columns: RealtimePageScreenColumn[] = [];
}

export class RealtimePageScreenColumn {
    entitiesGroups: RealtimePageEntityGroup[] = [];
}

export class RealtimePageEntityGroup {
    name: string;
    lines: RealtimePageLine[] = [];
}

export class RealtimePageLine {
    entityId: string;
    entityName: string;
    connectedUsersCount: number;
    connectedUsers: string;
}
