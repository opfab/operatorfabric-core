/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 *  See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, OnInit} from "@angular/core";
import {UserActionLog} from "@ofModel/user-action-log.model";
import {UserActionsService} from "@ofServices/user-action-logs.service";


@Component({
    selector: 'of-useractionlogs',
    templateUrl: './useractionlogs.component.html',
    styleUrls: ['./useractionlogs.component.scss']
})
export class UserActionLogsComponent implements OnInit {

    public userActions: UserActionLog[];


    constructor(private userActionsService: UserActionsService) {

    }

    ngOnInit(): void {
        this.query();
    }

    private query() {
        this.userActionsService.queryAllUserActions().subscribe(actions => this.userActions = actions);
    }
}