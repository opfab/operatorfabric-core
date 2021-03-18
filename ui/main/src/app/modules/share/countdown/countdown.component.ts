/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, DoCheck, Input, OnChanges, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CountdownComponent, CountdownConfig, CountdownEvent} from 'ngx-countdown';
import {AppService, PageType} from "@ofServices/app.service";
import {ConfigService} from "@ofServices/config.service";
import {Card} from "@ofModel/card.model";
import {LightCard} from "@ofModel/light-card.model";

@Component({
    selector: 'of-countdown',
    templateUrl: './countdown.component.html',
    styleUrls: ['./countdown.component.scss']
})
export class CountDownComponent implements OnInit, DoCheck, OnChanges, OnDestroy {

    @Input() public card: Card | LightCard;

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
                private _appService: AppService) {
    }

    ngOnInit() {
        this.secondsBeforeLttdForClockDisplay = this.configService.getConfigValue('feed.card.secondsBeforeLttdForClockDisplay', false);
        this.startCountdownWhenNecessary();
    }

    ngOnChanges() {
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

        if (this.card.lttd === null) {
            this.enableLastTimeToAct = false;
            this.countdown.stop();
        } else if (this.getSecondsBeforeLttd() <= 0) {
            this.stopCountDown();
        } else {
            this.startCountDownConfigWhenNecessary();
            this.interval = setInterval(() => {
                this.startCountDownConfigWhenNecessary()
            }, this.MILLISECONDS_SECOND);
        }
    }

    startCountDownConfigWhenNecessary() {
        if (this.isTimeToStartCountDown()) {
            this.startCountDownConfig();
            clearInterval(this.interval);
            return;
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

    ngOnDestroy(): void {
        clearInterval(this.interval);
    }

}
