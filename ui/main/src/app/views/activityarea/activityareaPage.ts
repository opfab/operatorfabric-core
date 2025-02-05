/* Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

export class ActivityAreaLine {
    entityId: string;
    entityName: string;
    isUserConnected: boolean;
    connectedUsers: string[];
    connectedUsersText: string;
    constructor() {
        this.entityId = '';
        this.entityName = '';
        this.isUserConnected = false;
        this.connectedUsers = [];
        this.connectedUsersText = '';
    }
}

export class ActivityAreaPage {
    activityAreaClusters: ActivityAreaEntityCluster[];

    constructor() {
        this.activityAreaClusters = [];
    }
}

export class ActivityAreaEntityCluster {
    id: string;
    name: string;
    lines: ActivityAreaLine[];
    checked: boolean;

    constructor(id, name, line) {
        this.id = id;
        this.name = name;
        this.lines = line;
    }
}
