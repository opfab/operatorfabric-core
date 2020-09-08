/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {Component, Input, OnDestroy, OnInit,ViewChild} from '@angular/core';
import {LightCard} from '@ofModel/light-card.model';
import {Router} from '@angular/router';
import {selectCurrentUrl} from '@ofStore/selectors/router.selectors';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {takeUntil} from 'rxjs/operators';
import {TimeService} from '@ofServices/time.service';
import {Subject} from 'rxjs';
import {ConfigService} from "@ofServices/config.service";
import {AppService, PageType} from '@ofServices/app.service';
import { CountdownComponent,CountdownConfig,CountdownEvent} from 'ngx-countdown';
import { UserService } from '@ofServices/user.service';

@Component({
    selector: 'of-card',
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit, OnDestroy {

    @ViewChild('countdown', { static: true })
    private countdown: CountdownComponent;

    @Input() public open = false;
    @Input() public lightCard: LightCard;
    @Input() public displayUnreadIcon = true;
    currentPath: any;
    protected _i18nPrefix: string;
    dateToDisplay: string;

    prettyConfig: CountdownConfig;
    enableLastTimeToAct = false;
    stopTime = false;
    secondsBeforeLttdForClockDisplay: number;
    interval: any;
    

    private ngUnsubscribe: Subject<void> = new Subject<void>();

    /* istanbul ignore next */
    constructor(
        private router: Router,
        private store: Store<AppState>,
        private time: TimeService,
        private configService: ConfigService,
        private _appService: AppService,
        private userService: UserService
    ) { }

    ngOnInit() {
        this.secondsBeforeLttdForClockDisplay = this.configService.getConfigValue(
            'feed.card.secondsBeforeLttdForClockDisplay',
            false
        );

        this._i18nPrefix = `${this.lightCard.process}.${this.lightCard.processVersion}.`;
        this.store
            .select(selectCurrentUrl)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((url) => {
                if (url) {
                    const urlParts = url.split('/');
                    this.currentPath = urlParts[1];
                }
            });

        this.computeDisplayedDate();
        this.startCountdownWhenNecessary();
    }

    public isValidatelttd(): boolean {
        const entityUser = this.userService.getCurrentUserWithPerimeters().userData.entities[0];
        return !this.isArchivePageType() && this.lightCard.entitiesAllowedToRespond.includes(entityUser);
    }

    isTimeToStartCountDown(): boolean {
        const delta = this.getSecondsBeforeLttd();
        return delta > 0 && delta <= this.secondsBeforeLttdForClockDisplay;
    }

    startCountDownConfig() {
        const leftTimeSeconds = this.getSecondsBeforeLttd();
        this.prettyConfig = {
            leftTime: leftTimeSeconds,
            format: 'mm:ss',
        };
        this.enableLastTimeToAct = true;
        this.stopTime = false;
        this.countdown.begin();
    }

    getSecondsBeforeLttd(): number {
        return Math.floor((this.lightCard.lttd - new Date().getTime()) / 1000);
    }

    startCountdownWhenNecessary() {

        if (this.lightCard.lttd === null || !this.isValidatelttd()) {
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
            }, 1000);
        }


    }

    stopCountDown() {
        this.enableLastTimeToAct = true;
        this.stopTime = true;
        this.countdown.stop();
    }

    onTimerFinished($event: CountdownEvent) {
        if ($event.action === 'done') {
            if (this.lightCard.lttd != null && this.getSecondsBeforeLttd() <= 0) {
                this.stopCountDown();
            }
        }
    }

    computeDisplayedDate() {
        switch (this.configService.getConfigValue('feed.card.time.display', 'BUSINESS')) {
            case 'NONE':
                this.dateToDisplay = '';
                break;
            case 'LTTD':
                this.dateToDisplay = this.handleDate(this.lightCard.lttd);
                break;
            case 'PUBLICATION':
                this.dateToDisplay = this.handleDate(this.lightCard.publishDate);
                break;
            case 'BUSINESS_START':
                this.dateToDisplay = this.handleDate(this.lightCard.startDate);
                break;
            default:
                this.dateToDisplay = `${this.handleDate(this.lightCard.startDate)} - ${this.handleDate(this.lightCard.endDate)}`;
        }
    }

    handleDate(timeStamp: number): string {
        return this.time.formatDateTime(timeStamp);
    }

    public select() {
        this.router.navigate(['/' + this.currentPath, 'cards', this.lightCard.id]);
    }

    get i18nPrefix(): string {
        return this._i18nPrefix;
    }

    isArchivePageType(): boolean {
        return this._appService.pageType == PageType.ARCHIVE;
    }

    ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
        clearInterval(this.interval);
    }
}
