/* Copyright (c) 2021-2023, RTE (http://www.rte-france.com)
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
import {FilterType} from '@ofModel/feed-filter.model';
import {UserPreferencesService} from 'app/business/services/user-preference.service';
import {DateTimeFormatterService} from 'app/business/services/date-time-formatter.service';
import {FilterService} from 'app/business/services/lightcards/filter.service';
import {LogOption, OpfabLoggerService} from 'app/business/services/logs/opfab-logger.service';

@Component({
    selector: 'of-timeline-buttons',
    templateUrl: './timeline-buttons.component.html',
    styleUrls: ['./timeline-buttons.component.scss']
})
export class TimelineButtonsComponent implements OnInit, OnDestroy {
    private OVERLAP_DURATION_IN_MS = 15 * 60 * 1000;

    public hideTimeLine = false;
    public currentDomain;
    public currentDomainId: string;
    private followClockTick: boolean;
    private overlap = 0;

    public selectedButtonTitle: string;
    public buttonList;

    public startDateForBusinessPeriodDisplay;
    public endDateForBusinessPeriodDisplay;

    @Input()
    public isMonitoringScreen: boolean;

    @Output()
    public domainChange: EventEmitter<any> = new EventEmitter();

    private isDestroyed = false;

    constructor(
        private dateTimeFormatter: DateTimeFormatterService,
        private userPreferences: UserPreferencesService,
        private configService: ConfigService,
        private filterService: FilterService,
        private opfabLogger: OpfabLoggerService
    ) {}

    ngOnInit() {
        this.loadDomainConfiguration();
        const hideTimeLineInStorage = this.userPreferences.getPreference('opfab.hideTimeLine');
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
        const domainsConf = this.configService.getConfigValue('feed.timeline.domains', [
            'TR',
            'J',
            '7D',
            'W',
            'M',
            'Y'
        ]);
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

        const savedDomain = this.userPreferences.getPreference('opfab.timeLine.domain');

        if (!!savedDomain) {
            const savedConf = this.buttonList.find((b) => b.domainId === savedDomain);
            if (!!savedConf) {
                initialGraphConf = savedConf;
            }
        }

        if (!!initialGraphConf) {
            this.changeGraphConf(initialGraphConf);
        }
    }

    /**
     * Call when click on a zoom button
     * @param conf button clicked
     */
    changeGraphConf(conf: any): void {
        this.followClockTick = true;

        if (conf.buttonTitle) {
            this.selectedButtonTitle = conf.buttonTitle;
            this.opfabLogger.info('Set timeline domain to ' + conf.domainId, LogOption.REMOTE);
        }

        this.selectZoomButton(conf.buttonTitle);
        this.currentDomainId = conf.domainId;

        this.setDefaultStartAndEndDomain();
        this.userPreferences.setPreference('opfab.timeLine.domain', this.currentDomainId);
    }

    selectZoomButton(buttonTitle) {
        this.buttonList.forEach((button) => {
            button.selected = button.buttonTitle === buttonTitle;
        });
    }

    setDefaultStartAndEndDomain() {
        let startDomain;
        let endDomain;
        switch (this.currentDomainId) {
            case 'TR': {
                startDomain = this.getRealTimeStartDate();
                endDomain = moment().minutes(0).second(0).millisecond(0).add(10, 'hours');
                break;
            }
            case 'J': {
                startDomain = moment().hours(0).minutes(0).second(0).millisecond(0);
                endDomain = moment().hours(0).minutes(0).second(0).millisecond(0).add(1, 'days');
                break;
            }
            case '7D': {
                startDomain = moment().minutes(0).second(0).millisecond(0).subtract(12, 'hours');
                // set position to a multiple of 4
                for (let i = 0; i < 4; i++) {
                    if ((startDomain.hours() - i) % 4 === 0) {
                        startDomain.subtract(i, 'hours');
                        break;
                    }
                }
                endDomain = moment(startDomain).add(8, 'day');
                break;
            }
            case 'W': {
                startDomain = moment().startOf('week').minutes(0).second(0).millisecond(0);
                endDomain = moment().startOf('week').minutes(0).second(0).millisecond(0).add(1, 'week');
                break;
            }
            case 'M': {
                startDomain = moment().startOf('month').minutes(0).second(0).millisecond(0);
                endDomain = moment().startOf('month').hour(0).minutes(0).second(0).millisecond(0).add(1, 'month');
                break;
            }
            case 'Y': {
                startDomain = moment().startOf('year').hour(0).minutes(0).second(0).millisecond(0);
                endDomain = moment().startOf('year').hour(0).minutes(0).second(0).millisecond(0).add(1, 'year');
                break;
            }
        }
        this.setStartAndEndDomain(startDomain.valueOf(), endDomain.valueOf(), false);
    }

    private getRealTimeStartDate() {
        const currentMinutes = moment().minutes();
        const roundedMinutes = Math.floor(currentMinutes / 15) * 15; // rounds minutes to previous quarter
        return moment().minutes(roundedMinutes).second(0).millisecond(0).subtract(2, 'hours').subtract(15, 'minutes');
    }

    /**
     * apply new timeline domain
     * feed state dispatch a change on filter, provide the new filter start and end
     * @param startDomain new start of domain
     * @param endDomain new end of domain
     */
    setStartAndEndDomain(startDomain: number, endDomain: number, useOverlap = false): void {
        if (this.currentDomainId == 'W') {
            /*
             * In case of 'week' domain reset start and end date to take into account different locale setting for first day of week
             * To compute start day of week add 2 days to startDate to avoid changing week passing from locale with saturday as first day of week
             * to a locale with monday as first day of week
             */
            let startOfWeek = moment(startDomain)
                .add(2, 'day')
                .startOf('week')
                .minutes(0)
                .second(0)
                .millisecond(0)
                .valueOf();
            let endOfWeek = moment(startDomain)
                .add(2, 'day')
                .startOf('week')
                .minutes(0)
                .second(0)
                .millisecond(0)
                .add(1, 'week');
            startDomain = startOfWeek.valueOf();
            endDomain = endOfWeek.valueOf();
        }

        if (useOverlap) {
            this.overlap = this.OVERLAP_DURATION_IN_MS;
            startDomain = startDomain - this.overlap;
        } else this.overlap = 0;

        this.currentDomain = {startDate: startDomain, endDate: endDomain, overlap: this.overlap};
        this.startDateForBusinessPeriodDisplay = this.getDateFormatting(startDomain);
        this.endDateForBusinessPeriodDisplay = this.getDateFormatting(endDomain);

        this.filterService.updateFilter(FilterType.BUSINESSDATE_FILTER, true, {
            start: startDomain,
            end: endDomain,
            domainId: this.currentDomainId
        });
        this.domainChange.emit(true);
    }

    getDateFormatting(value): string {
        const date = moment(value);
        switch (this.currentDomainId) {
            case 'TR':
                return this.dateTimeFormatter.getFormattedDateAndTimeFromEpochDate(value);
            case 'J':
                return this.dateTimeFormatter.getFormattedDateFromEpochDate(value);
            case '7D':
                return this.dateTimeFormatter.getFormattedDateAndTimeFromEpochDate(value);
            case 'W':
                return this.dateTimeFormatter.getFormattedDateFromEpochDate(value);
            case 'M':
                return this.dateTimeFormatter.getFormattedDateFromEpochDate(value);
            case 'Y':
                return date.format('yyyy');
            default:
                return this.dateTimeFormatter.getFormattedDateFromEpochDate(value);
        }
    }

    /**
     * select the movement applied on domain : forward or backward
     * parse the conf object dedicated for movement, parse it two time when end property is present
     * each object's keys add time precision on start or end of domain
     * @param moveForward direction: add or subtract conf object
     */
    moveDomain(moveForward: boolean): void {
        let startDomain = moment(this.currentDomain.startDate);
        let endDomain = moment(this.currentDomain.endDate);

        // Move from main visualisation, now domain stop to move
        this.followClockTick = false;

        if (moveForward) {
            this.opfabLogger.info('Move domain forward', LogOption.REMOTE);
            startDomain = this.goForward(startDomain.add(this.overlap, 'milliseconds'));
            endDomain = this.goForward(endDomain);
        } else {
            this.opfabLogger.info('Move domain backward', LogOption.REMOTE);
            startDomain = this.goBackward(startDomain.add(this.overlap, 'milliseconds'));
            endDomain = this.goBackward(endDomain);
        }

        this.setStartAndEndDomain(startDomain.valueOf(), endDomain.valueOf(), false);
    }

    goForward(dateToMove: moment.Moment) {
        switch (this.currentDomainId) {
            case 'TR':
                return dateToMove.add(2, 'hour');
            case 'J':
                return dateToMove.add(1, 'day');
            case '7D':
                return dateToMove.add(8, 'hour').startOf('day').add(1, 'day'); // the feed is not always at the beginning of the day
            case 'W':
                return dateToMove.add(7, 'day');
            case 'M':
                return dateToMove.add(1, 'month');
            case 'Y':
                return dateToMove.add(1, 'year');
        }
    }

    goBackward(dateToMove: moment.Moment) {
        switch (this.currentDomainId) {
            case 'TR':
                return dateToMove.subtract(2, 'hour');
            case 'J':
                return dateToMove.subtract(1, 'day');
            case '7D':
                return dateToMove.add(8, 'hour').startOf('day').subtract(1, 'day'); // the feed is not always at the beginning of the day
            case 'W':
                return dateToMove.subtract(7, 'day');
            case 'M':
                return dateToMove.subtract(1, 'month');
            case 'Y':
                return dateToMove.subtract(1, 'year');
        }
    }

    showOrHideTimeline() {
        this.hideTimeLine = !this.hideTimeLine;
        this.userPreferences.setPreference('opfab.hideTimeLine', this.hideTimeLine.toString());
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
                        this.changeGraphConf(this.buttonList[i - 1]);
                    }
                } else {
                    if (i !== this.buttonList.length - 1) {
                        this.changeGraphConf(this.buttonList[i + 1]);
                    }
                }
                return;
            }
        }
    }

    isTimelineLocked(): boolean {
        return !this.followClockTick;
    }

    lockTimeline(): void {
        this.opfabLogger.info('Lock timeline', LogOption.REMOTE);
        this.followClockTick = false;
    }

    unlockTimeline(): void {
        this.opfabLogger.info('Unlock timeline', LogOption.REMOTE);
        this.followClockTick = true;

        // Restore default domain when the user unlocks the timeline
        this.setDefaultStartAndEndDomain();
    }

    private shiftTimeLineIfNecessary() {
        if (this.followClockTick) {
            const currentDate = moment().valueOf();

            switch (this.currentDomainId) {
                case 'TR':
                    if (currentDate > 150 * 60 * 1000 + this.currentDomain.startDate) {
                        this.setDefaultStartAndEndDomain();
                    }
                    break;
                case 'J':
                    this.shiftIfNecessaryDomainUsingOverlap('days');
                    break;
                case '7D':
                    if (currentDate > 16 * 60 * 60 * 1000 + this.currentDomain.startDate) {
                        this.setDefaultStartAndEndDomain();
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
            let startDomain = moment(currentDate + 60 * 1000)
                .hours(0)
                .minutes(0)
                .second(0)
                .millisecond(0);
            let endDomain = moment(currentDate + 60 * 1000)
                .hours(0)
                .minutes(0)
                .second(0)
                .millisecond(0)
                .add(1, domainDuration);
            this.setStartAndEndDomain(startDomain.valueOf(), endDomain.valueOf(), true);
        }
    }

    ngOnDestroy() {
        this.isDestroyed = true;
    }
}
