/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {CountdownComponent, CountdownConfig, CountdownEvent} from 'ngx-countdown';
import {AppService, PageType} from "@ofServices/app.service";
import {ConfigService} from "@ofServices/config.service";
import {UserService} from "@ofServices/user.service";
import {Card} from "@ofModel/card.model";

@Component({
    selector: 'of-countdown',
    templateUrl: './countdown.component.html',
    styleUrls: ['./countdown.component.scss']
})
export class CountDownComponent implements OnInit {

    @Input() public card: Card;

    @ViewChild('countdown', { static: true })
    private countdown: CountdownComponent;

    prettyConfig: CountdownConfig;
    enableLastTimeToAct = false;
    stopTime = false;
    secondsBeforeLttdForClockDisplay: number;
    interval: any;
    hideHourInCountDown = false;
    MILLISECONDS_SECOND = 1000;

    constructor(private configService: ConfigService,
                private userService: UserService,
                private _appService: AppService) {
    }

    ngOnInit() {
        this.secondsBeforeLttdForClockDisplay = this.configService.getConfigValue('feed.card.secondsBeforeLttdForClockDisplay', false);
        this.startCountdownWhenNecessary();
    }

    ngDoCheck() {
        if (!!this.card.lttd && !this.hideHourInCountDown) {
            const leftTimeSeconds = this.getSecondsBeforeLttd();
            if (leftTimeSeconds < 3600) {
                this.prettyConfig = {
                    leftTime: leftTimeSeconds,
                    format: 'mm:ss'
                };
                this.hideHourInCountDown = true;
            }
        }
    }

    public isValidatelttd(): boolean {
        const entityUser = this.userService.getCurrentUserWithPerimeters().userData.entities[0];

        if (!this.isArchivePageType()) {
            if (!!this.card.entitiesAllowedToRespond) {
                return this.card.entitiesAllowedToRespond.includes(entityUser);
            } else {
                return true;
            }
        }
        return false;
    }

    isTimeToStartCountDown(): boolean {
        const delta = this.getSecondsBeforeLttd();
        return delta > 0 && delta <= this.secondsBeforeLttdForClockDisplay;
    }

    startCountDownConfig() {
        const leftTimeSeconds = this.getSecondsBeforeLttd();
        this.prettyConfig = {
            leftTime: leftTimeSeconds,
            format: leftTimeSeconds >= 3600 ? 'HH:mm:ss' : 'mm:ss'
        };
        this.enableLastTimeToAct = true;
        this.stopTime = false;
        this.countdown.begin();
    }

    getSecondsBeforeLttd(): number {
        return Math.floor((this.card.lttd - new Date().getTime()) / this.MILLISECONDS_SECOND);
    }

    startCountdownWhenNecessary() {

        if (this.card.lttd === null || !this.isValidatelttd()) {
            this.enableLastTimeToAct = false;
            this.countdown.stop();
        } else if (this.getSecondsBeforeLttd() <= 0) {
            this.stopCountDown();
        } else {
            this.interval = setInterval(() => {
                if (this.isTimeToStartCountDown()) {
                    this.startCountDownConfig();
                    clearInterval(this.interval);
                    return;
                }
            }, this.MILLISECONDS_SECOND);
        }
    }

    stopCountDown() {
        this.enableLastTimeToAct = true;
        this.stopTime = true;
        this.countdown.stop();
    }

    onTimerFinished($event: CountdownEvent) {
        if ($event.action === 'done') {
            if (this.card.lttd != null && this.getSecondsBeforeLttd() <= 0) {
                this.stopCountDown();
            }
        }
    }

    isArchivePageType(): boolean {
        return this._appService.pageType == PageType.ARCHIVE;
    }

}
