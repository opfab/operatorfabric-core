/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, Input, OnChanges, OnDestroy, OnInit} from '@angular/core';
import {ConfigService} from "@ofServices/config.service";
import { CountDown} from './countdown';

@Component({
    selector: 'of-countdown',
    templateUrl: './countdown.component.html',
    styleUrls: ['./countdown.component.scss']
})
export class CountDownComponent implements OnInit, OnDestroy , OnChanges {

    @Input() public lttd: number;

    public countDown;
    secondsBeforeLttdForClockDisplay: number;

    constructor(private configService: ConfigService) {
    }

    ngOnInit() {
        this.secondsBeforeLttdForClockDisplay = this.configService.getConfigValue('feed.card.secondsBeforeLttdForClockDisplay', false);
        this.countDown = new CountDown(this.lttd,this.secondsBeforeLttdForClockDisplay);
    }

    ngOnChanges()
    {
        if (this.countDown)  {
            this.countDown.stopCountDown();
            this.countDown = new CountDown(this.lttd,this.secondsBeforeLttdForClockDisplay);
        }
    }
    ngOnDestroy(): void {
        this.countDown.stopCountDown();
    }

}
