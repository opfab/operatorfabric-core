/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, Input, OnInit} from '@angular/core';
import {LineOfLoggingResult} from '@ofModel/line-of-logging-result.model';
import {TimeService} from '@ofServices/time.service';
import {Moment} from 'moment-timezone';

@Component({
    selector: 'of-logging-table',
    templateUrl: './logging-table.component.html',
    styleUrls: ['./logging-table.component.scss']
})
export class LoggingTableComponent implements OnInit {


    @Input() results: LineOfLoggingResult[];
    displayedResult: string;

    constructor(public timeService: TimeService) {
    }

    ngOnInit() {
        this.displayedResult = JSON.stringify(this.results);
    }

    displayTime(moment: Moment) {
        return this.timeService.formatDateTime(moment);
    }
}
