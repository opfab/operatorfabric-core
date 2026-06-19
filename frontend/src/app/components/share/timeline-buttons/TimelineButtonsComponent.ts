/* Copyright (c) 2021-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ConfigService} from 'app/services/config/ConfigService';
import {UserPreferencesService} from '@ofServices/userPreferences/UserPreferencesService';
import {DateTimeFormatterService} from 'app/services/dateTimeFormatter/DateTimeFormatterService';
import {LogOption, LoggerService as logger} from 'app/services/logs/LoggerService';
import {RealTimeDomainService} from '@ofServices/realTimeDomain/RealTimeDomainService';
import {NgClass} from '@angular/common';
import {TranslateDirective} from '@ngx-translate/core';

@Component({
    selector: 'of-timeline-buttons',
    templateUrl: './TimelineButtonsComponent.html',
    styleUrls: ['./TimelineButtonsComponent.scss'],
    imports: [TranslateDirective, NgClass]
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
    public displayBusinessPeriodAndArrows: boolean;

    // in rest of year mode , when user click on year button, we set the domain from current day to end of year
    @Input()
    public restOfYearMode: boolean;
    public restOfYear: boolean = false;

    @Output()
    public domainChange: EventEmitter<any> = new EventEmitter();

    private isDestroyed = false;
    private timeoutId: any;

    ngOnInit() {
        this.loadDomainConfiguration();
        const hideTimeLineInStorage = UserPreferencesService.getPreference('opfab.hideTimeLine');
        this.hideTimeLine = hideTimeLineInStorage === 'true';
        this.setInitialDomain();
        this.shiftTimeLineIfNecessary();
    }

    loadDomainConfiguration() {
        const domains = {
            D: {
                buttonTitle: 'timeline.buttonTitle.D',
                domainId: 'D'
            },
            RT: {
                buttonTitle: 'timeline.buttonTitle.RT',
                domainId: 'RT'
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
        const domainsConf = ConfigService.getConfigValue('feed.timeline.domains', ['RT', 'D', '7D', 'W', 'M', 'Y']);
        this.buttonList = [];
        domainsConf.map((domain) => {
            if (Object.keys(domains).includes(domain)) {
                this.buttonList.push(domains[domain]);
            }
        });
    }

    setInitialDomain(): void {
        let currentDomain: string = RealTimeDomainService.getDomainId();

        if (!currentDomain) {
            // the domain can be undefined when coming back from calendar
            // as calendar is not using timeline domains
            RealTimeDomainService.init();
            currentDomain = RealTimeDomainService.getDomainId();
        }

        const buttonToActivate = this.buttonList.find((b) => b.domainId === currentDomain);
        if (buttonToActivate.domainId === 'Y' && this.restOfYearMode) this.setDomainInRestOfYearMode();
        else this.setDomain(buttonToActivate);
    }

    setDomainInRestOfYearMode() {
        this.restOfYear = true;

        logger.info('Set timeline domain to restOfYearMode', LogOption.REMOTE);
        this.selectedButtonTitle = 'timeline.buttonTitle.Y';
        this.selectZoomButton(this.selectedButtonTitle);
        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date();
        endDate.setMonth(11, 31);
        endDate.setHours(23, 59, 59, 999);
        RealTimeDomainService.setStartAndEndPeriod(startDate.valueOf(), endDate.valueOf());
        this.currentDomain = RealTimeDomainService.getCurrentDomain();
        this.currentDomainId = 'Y';
        this.startDateForBusinessPeriodDisplay = DateTimeFormatterService.getFormattedDate(
            this.currentDomain.startDate
        );
        this.endDateForBusinessPeriodDisplay = DateTimeFormatterService.getFormattedDate(this.currentDomain.endDate);
        this.domainChange.emit(true);
    }

    setDomain(conf: any): void {
        this.restOfYear = false;
        if (conf.buttonTitle) {
            this.selectedButtonTitle = conf.buttonTitle;
            logger.info('Set timeline domain to ' + conf.domainId, LogOption.REMOTE);
        }

        this.selectZoomButton(conf.buttonTitle);
        this.currentDomainId = conf.domainId;
        RealTimeDomainService.setDomainId(conf.domainId);
        this.currentDomain = RealTimeDomainService.getCurrentDomain();
        this.startDateForBusinessPeriodDisplay = this.getDateFormatting(this.currentDomain.startDate);
        this.endDateForBusinessPeriodDisplay = this.getDateFormatting(this.currentDomain.endDate);
        this.domainChange.emit(true);
    }

    userClickOnDomainButton(conf: any): void {
        if (conf.domainId === 'Y' && this.restOfYearMode) {
            this.setDomainInRestOfYearMode();
        } else {
            this.setDomain(conf);
        }
    }

    selectZoomButton(buttonTitle) {
        this.buttonList.forEach((button) => {
            button.selected = button.buttonTitle === buttonTitle;
        });
    }

    getDateFormatting(value): string {
        switch (this.currentDomainId) {
            case 'RT':
                return DateTimeFormatterService.getFormattedDateAndTime(value);
            case 'D':
                return DateTimeFormatterService.getFormattedDate(value);
            case '7D':
                return DateTimeFormatterService.getFormattedDateAndTime(value);
            case 'W':
                return DateTimeFormatterService.getFormattedDate(value);
            case 'M':
                return DateTimeFormatterService.getFormattedDate(value);
            case 'Y':
                return DateTimeFormatterService.getFormattedDate(value, 'yyyy');
            default:
                return DateTimeFormatterService.getFormattedDate(value);
        }
    }

    showOrHideTimeline() {
        this.hideTimeLine = !this.hideTimeLine;
        UserPreferencesService.setPreference('opfab.hideTimeLine', this.hideTimeLine.toString());
    }

    /**
     :
     * apply arrow button clicked: switch the graph context with the zoom level configured
     * at the left or right of our actual button selected
     * @param direction receive by child component custom-timeline-chart
     */
    applyNewZoom(direction: string): void {
        for (let i = 0; i < this.buttonList.length; i++) {
            if (this.buttonList[i].buttonTitle === this.selectedButtonTitle) {
                if (direction === 'in') {
                    if (i !== 0) {
                        this.setDomain(this.buttonList[i - 1]);
                    }
                } else if (i !== this.buttonList.length - 1) {
                    this.setDomain(this.buttonList[i + 1]);
                }
                return;
            }
        }
    }

    isTimelineLocked(): boolean {
        return RealTimeDomainService.isTimelineLocked();
    }

    lockTimeline(): void {
        RealTimeDomainService.lockTimeline();
    }

    unlockTimeline(): void {
        RealTimeDomainService.unlockTimeline();
        // Restore default domain when the user unlocks the timeline
        this.currentDomain = RealTimeDomainService.computeStartAndEndDomainDates(
            RealTimeDomainService.getDomainId(),
            true
        );
        this.startDateForBusinessPeriodDisplay = this.getDateFormatting(this.currentDomain.startDate);
        this.endDateForBusinessPeriodDisplay = this.getDateFormatting(this.currentDomain.endDate);
        this.domainChange.emit(true);
    }

    moveDomain(moveForward: boolean): void {
        if (this.restOfYear) {
            // In rest of year mode
            // if going forward, we go form  period "today - end of current year" to "start of next year - end of next year"
            // if going backward , we go form  period "today - end of current year" to "start of current year - end of current year"

            this.setDomain(this.buttonList.find((b) => b.domainId === 'Y')); // set domain to Year
            if (!moveForward) return;
        }

        this.currentDomain = RealTimeDomainService.moveDomain(moveForward);
        this.startDateForBusinessPeriodDisplay = this.getDateFormatting(this.currentDomain.startDate);
        this.endDateForBusinessPeriodDisplay = this.getDateFormatting(this.currentDomain.endDate);
        this.domainChange.emit(true);
    }

    private shiftTimeLineIfNecessary() {
        if (!RealTimeDomainService.isTimelineLocked() && !this.restOfYear) {
            RealTimeDomainService.shiftIfNecessaryDomainUsingOverlap();

            this.currentDomain = RealTimeDomainService.getCurrentDomain();
            this.startDateForBusinessPeriodDisplay = this.getDateFormatting(this.currentDomain.startDate);
            this.endDateForBusinessPeriodDisplay = this.getDateFormatting(this.currentDomain.endDate);
        }
        if (!this.isDestroyed) {
            this.timeoutId = setTimeout(() => this.shiftTimeLineIfNecessary(), 10000);
        }
    }

    ngOnDestroy() {
        this.isDestroyed = true;
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
    }
}
