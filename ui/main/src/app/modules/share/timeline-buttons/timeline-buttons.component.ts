/* Copyright (c) 2021-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ConfigService} from 'app/business/services/config.service';
import moment from 'moment';
import {UserPreferencesService} from 'app/business/services/users/user-preference.service';
import {DateTimeFormatterService} from 'app/business/services/date-time-formatter.service';
import {LogOption, LoggerService as logger} from 'app/business/services/logs/logger.service';
import {RealtimeDomainService} from 'app/business/services/realtime-domain.service';

@Component({
    selector: 'of-timeline-buttons',
    templateUrl: './timeline-buttons.component.html',
    styleUrls: ['./timeline-buttons.component.scss']
})
export class TimelineButtonsComponent implements OnInit, OnDestroy {
    public hideTimeLine = false;
    public currentDomain;
    public currentDomainId: string;

    public selectedButtonTitle: string;
    public buttonList;

    public startDateForBusinessPeriodDisplay;
    public endDateForBusinessPeriodDisplay;

    @Input()
    public isMonitoringScreen: boolean;

    @Output()
    public domainChange: EventEmitter<any> = new EventEmitter();

    private isDestroyed = false;

    ngOnInit() {
        this.loadDomainConfiguration();
        const hideTimeLineInStorage = UserPreferencesService.getPreference('opfab.hideTimeLine');
        this.hideTimeLine = hideTimeLineInStorage === 'true';
        this.setInitialDomain();
        this.shiftTimeLineIfNecessary();
    }

    loadDomainConfiguration() {
        const domains = {
            J: {
                buttonTitle: 'timeline.buttonTitle.J',
                domainId: 'J'
            },
            TR: {
                buttonTitle: 'timeline.buttonTitle.TR',
                domainId: 'TR'
            },
            '7D': {
                buttonTitle: 'timeline.buttonTitle.7D',
                domainId: '7D'
            },
            W: {
                buttonTitle: 'timeline.buttonTitle.W',
                domainId: 'W'
            },
            M: {
                buttonTitle: 'timeline.buttonTitle.M',
                domainId: 'M'
            },
            Y: {
                buttonTitle: 'timeline.buttonTitle.Y',
                domainId: 'Y'
            }
        };
        const domainsConf = ConfigService.getConfigValue('feed.timeline.domains', ['TR', 'J', '7D', 'W', 'M', 'Y']);
        this.buttonList = [];
        domainsConf.map((domain) => {
            if (Object.keys(domains).includes(domain)) {
                this.buttonList.push(domains[domain]);
            }
        });
    }

    setInitialDomain(): void {
        // Set the zoom activated
        let initialGraphConf = this.buttonList.length > 0 ? this.buttonList[0] : null;

        const savedDomain = RealtimeDomainService.getDomainId();

        if (savedDomain) {
            const savedConf = this.buttonList.find((b) => b.domainId === savedDomain);
            if (savedConf) {
                initialGraphConf = savedConf;
            }
        }

        if (initialGraphConf) {
            this.changeGraphConf(initialGraphConf, false);
        }
    }

    /**
     * Call when click on a zoom button
     * @param conf button clicked
     */
    changeGraphConf(conf: any, reset: boolean): void {
        if (reset) RealtimeDomainService.unlockTimeline();

        if (conf.buttonTitle) {
            this.selectedButtonTitle = conf.buttonTitle;
            logger.info('Set timeline domain to ' + conf.domainId, LogOption.REMOTE);
        }

        this.selectZoomButton(conf.buttonTitle);
        this.currentDomainId = conf.domainId;
        RealtimeDomainService.setDomainId(this.currentDomainId, reset);
        this.currentDomain = RealtimeDomainService.getCurrentDomain();
        this.startDateForBusinessPeriodDisplay = this.getDateFormatting(this.currentDomain.startDate);
        this.endDateForBusinessPeriodDisplay = this.getDateFormatting(this.currentDomain.endDate);
        this.domainChange.emit(true);
    }

    selectZoomButton(buttonTitle) {
        this.buttonList.forEach((button) => {
            button.selected = button.buttonTitle === buttonTitle;
        });
    }

    getDateFormatting(value): string {
        const date = moment(value);
        switch (this.currentDomainId) {
            case 'TR':
                return DateTimeFormatterService.getFormattedDateAndTimeFromEpochDate(value);
            case 'J':
                return DateTimeFormatterService.getFormattedDateFromEpochDate(value);
            case '7D':
                return DateTimeFormatterService.getFormattedDateAndTimeFromEpochDate(value);
            case 'W':
                return DateTimeFormatterService.getFormattedDateFromEpochDate(value);
            case 'M':
                return DateTimeFormatterService.getFormattedDateFromEpochDate(value);
            case 'Y':
                return date.format('yyyy');
            default:
                return DateTimeFormatterService.getFormattedDateFromEpochDate(value);
        }
    }

    showOrHideTimeline() {
        this.hideTimeLine = !this.hideTimeLine;
        UserPreferencesService.setPreference('opfab.hideTimeLine', this.hideTimeLine.toString());
    }

    /**
     :
     * apply arrow button clicked : switch the graph context with the zoom level configured
     * at the left or right of our actual button selected
     * @param direction receive by child component custom-timeline-chart
     */
    applyNewZoom(direction: string): void {
        for (let i = 0; i < this.buttonList.length; i++) {
            if (this.buttonList[i].buttonTitle === this.selectedButtonTitle) {
                if (direction === 'in') {
                    if (i !== 0) {
                        this.changeGraphConf(this.buttonList[i - 1], true);
                    }
                } else {
                    if (i !== this.buttonList.length - 1) {
                        this.changeGraphConf(this.buttonList[i + 1], true);
                    }
                }
                return;
            }
        }
    }

    isTimelineLocked(): boolean {
        return RealtimeDomainService.isTimelineLocked();
    }

    lockTimeline(): void {
        RealtimeDomainService.lockTimeline();
    }

    unlockTimeline(): void {
        RealtimeDomainService.unlockTimeline();
        // Restore default domain when the user unlocks the timeline
        this.currentDomain = RealtimeDomainService.setDefaultStartAndEndDomain();
    }

    moveDomain(moveForward: boolean): void {
        this.currentDomain = RealtimeDomainService.moveDomain(moveForward);
        this.startDateForBusinessPeriodDisplay = this.getDateFormatting(this.currentDomain.startDate);
        this.endDateForBusinessPeriodDisplay = this.getDateFormatting(this.currentDomain.endDate);
        this.domainChange.emit(true);
    }

    private shiftTimeLineIfNecessary() {
        if (!RealtimeDomainService.isTimelineLocked()) {
            const currentDate = moment().valueOf();

            switch (this.currentDomainId) {
                case 'TR':
                    if (currentDate > 150 * 60 * 1000 + this.currentDomain.startDate) {
                        this.currentDomain = RealtimeDomainService.setDefaultStartAndEndDomain();
                    }
                    break;
                case 'J':
                    this.shiftIfNecessaryDomainUsingOverlap('days');
                    break;
                case '7D':
                    if (currentDate > 16 * 60 * 60 * 1000 + this.currentDomain.startDate) {
                        this.currentDomain = RealtimeDomainService.setDefaultStartAndEndDomain();
                    }
                    break;
                case 'W':
                    this.shiftIfNecessaryDomainUsingOverlap('week');
                    break;
                case 'M':
                    this.shiftIfNecessaryDomainUsingOverlap('months');
                    break;
                case 'Y':
                    this.shiftIfNecessaryDomainUsingOverlap('years');
                    break;
            }
        }
        if (!this.isDestroyed) setTimeout(() => this.shiftTimeLineIfNecessary(), 10000);
    }

    private shiftIfNecessaryDomainUsingOverlap(domainDuration: moment.unitOfTime.DurationConstructor): void {
        const currentDate = moment().valueOf();

        // shift domain one minute before change of cycle
        if (currentDate > this.currentDomain.endDate - 60 * 1000) {
            const startDomain = moment(currentDate + 60 * 1000)
                .hours(0)
                .minutes(0)
                .second(0)
                .millisecond(0);
            const endDomain = moment(currentDate + 60 * 1000)
                .hours(0)
                .minutes(0)
                .second(0)
                .millisecond(0)
                .add(1, domainDuration);
            this.currentDomain = RealtimeDomainService.setStartAndEndDomain(
                startDomain.valueOf(),
                endDomain.valueOf(),
                true
            );
            this.startDateForBusinessPeriodDisplay = this.getDateFormatting(this.currentDomain.startDate);
            this.endDateForBusinessPeriodDisplay = this.getDateFormatting(this.currentDomain.endDate);
        }
    }

    ngOnDestroy() {
        this.isDestroyed = true;
    }
}
