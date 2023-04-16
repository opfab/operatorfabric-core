/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

export class ActivityAreaLine {
    constructor() {
        this.entityId = '';
        this.entityName = '';
        this.isUserConnected = false;
        this.connectedUsers = [];
        this.connectedUsersText = '';
    }
    entityId: string;
    entityName: string;
    isUserConnected: boolean;
    connectedUsers: string[];
    connectedUsersText: string;
}

export class ActivityAreaPage {
    constructor() {
        this.lines = [];
    }

    lines: ActivityAreaLine[];
}
