/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, OnInit} from '@angular/core';
import {LogOption, OpfabLoggerService} from 'app/business/services/logs/opfab-logger.service';
import {OpfabEventStreamService} from 'app/business/services/events/opfabEventStream.service';


@Component({
    selector: 'of-reload-required',
    styleUrls: ['./reload-required.component.scss'],
    templateUrl: './reload-required.component.html'
})
export class ReloadRequiredComponent implements OnInit {
    displayReloadRequired: boolean;

    constructor(
        private opfabEventStreamService: OpfabEventStreamService,
        private logger: OpfabLoggerService
    ) {}

    ngOnInit(): void {
        this.detectReloadRequested();
    }

    private detectReloadRequested() {
        this.opfabEventStreamService.getReloadRequests().subscribe(() => {
                this.logger.info('Application reload requested', LogOption.LOCAL_AND_REMOTE);
                this.displayReloadRequired = true;
        });
    }

    public hide() {
        this.displayReloadRequired = false;
    }

    public reload() {
        location.reload();
    }

}
