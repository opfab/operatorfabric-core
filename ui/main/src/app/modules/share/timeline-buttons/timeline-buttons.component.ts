/* Copyright (c) 2021-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { TimelineModel } from '@ofModel/timeline-domains.model';    
import {ConfigService} from "@ofServices/config.service";
import moment from "moment";
import {FilterType} from '@ofModel/feed-filter.model';
import * as _ from 'lodash-es';
import {UserPreferencesService} from '@ofServices/user-preference.service';
import {TimeService} from "@ofServices/time.service";
import {FilterService} from '@ofServices/lightcards/filter.service';

@Component({
    selector: 'of-timeline-buttons',
    templateUrl: './timeline-buttons.component.html',
    styleUrls: ['./timeline-buttons.component.scss']
})
export class TimelineButtonsComponent implements OnInit {

    // required by Timeline
    private currentDomain ;
    public domainId: string;

    // required for domain movements specifications
    public followClockTick: boolean;
    public followClockTickMode: boolean;
    isTimelineLockDisabled: boolean;

    public overlap = 0;

    // buttons
    public buttonTitle: string;
    public buttonList;

    public startDate;
    public endDate;

    public confDomain = [];
    public domains: any;

    @Input()
    public isMonitoringScreen: boolean;

    @Output()
    public domainChange : EventEmitter<any> = new EventEmitter();

    public hideTimeLine = false;

    constructor(private time: TimeService,
                private userPreferences : UserPreferencesService,
                private configService: ConfigService,
                private filterService: FilterService) {

    }

    ngOnInit() {
        this.loadConfiguration();
        this.loadDomainsListFromConfiguration();

        const hideTimeLineInStorage = this.userPreferences.getPreference('opfab.hideTimeLine');
        this.hideTimeLine = (hideTimeLineInStorage === 'true');
        this.isTimelineLockDisabled = false;

        this.initDomains();
        this.shiftTimeLineIfNecessary();

    }


    loadConfiguration() {
        this.domains = TimelineModel.getDomains();
    }

    loadDomainsListFromConfiguration() {

        const domainsConf = this.configService.getConfigValue('feed.timeline.domains', ["TR", "J", "7D", "W", "M", "Y"]);
        domainsConf.map(domain => {
            if (Object.keys(this.domains).includes(domain)) {
                this.confDomain.push(this.domains[domain]);
            }
        });

    }

    /**
     * if it was given on confDomain, set the list of zoom buttons and use first zoom of list
     * else default zoom is weekly
     */
    initDomains(): void {
        this.buttonList = [];
        if (this.confDomain && this.confDomain.length > 0) {
            for (const elem of this.confDomain) {
                const tmp = _.cloneDeep(elem);
                this.buttonList.push(tmp);
            }
        } else {
            const defaultConfig = {buttonTitle: 'W', domainId: 'W'};
            this.buttonList.push(defaultConfig);
        }
        // Set the zoom activated
        let initialGraphConf = this.buttonList.length > 0 ? this.buttonList[0] : null;

        const savedDomain = this.userPreferences.getPreference('opfab.timeLine.domain');

        if (!!savedDomain) {
            const savedConf = this.buttonList.find(b => b.domainId === savedDomain);
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

        this.followClockTick = false;
        this.followClockTickMode = false;

        if (conf.followClockTick) {
            this.followClockTick = true;
            this.followClockTickMode = true;
        }
        if (conf.buttonTitle) {
            this.buttonTitle = conf.buttonTitle;
        }

        this.selectZoomButton(conf.buttonTitle);
        this.domainId = conf.domainId;

        this.setDefaultStartAndEndDomain();
        this.userPreferences.setPreference('opfab.timeLine.domain', this.domainId);
    }

    selectZoomButton(buttonTitle) {
        this.buttonList.forEach(button => {
            button.selected = button.buttonTitle === buttonTitle;
        });
    }

    setDefaultStartAndEndDomain() {
        let startDomain;
        let endDomain;
        switch (this.domainId) {

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
                    if (((startDomain.hours() - i) % 4) === 0) {
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
        this.setStartAndEndDomain(startDomain.valueOf(), endDomain.valueOf(),false);
    }

    private getRealTimeStartDate() {
        let currentMinutes = moment().minutes();
        let roundedMinutes = Math.floor(currentMinutes/15)*15; // rounds minutes to previous quarter
        let startDate = moment().minutes(roundedMinutes).second(0).millisecond(0).subtract(2, 'hours').subtract(15, 'minutes');

        return startDate;
    }

    /**
     * apply new timeline domain
     * feed state dispatch a change on filter, provide the new filter start and end
     * @param startDomain new start of domain
     * @param endDomain new end of domain
     */
    setStartAndEndDomain(startDomain: number, endDomain: number , useOverlap = false ): void {

        if (this.domainId == 'W') {
            /*
            * In case of 'week' domain reset start and end date to take into account different locale setting for first day of week
            * To compute start day of week add 2 days to startDate to avoid changing week passing from locale with saturday as first day of week
            * to a locale with monday as first day of week
            */
            let startOfWeek = moment(startDomain).add(2,'day').startOf('week').minutes(0).second(0).millisecond(0).valueOf();
            let endOfWeek = moment(startDomain).add(2,'day').startOf('week').minutes(0).second(0).millisecond(0).add(1, 'week');
            startDomain = startOfWeek.valueOf();
            endDomain = endOfWeek.valueOf();
        }

        if (useOverlap) {
            this.overlap = TimelineModel.OVERLAP_DURATION_IN_MS;
            startDomain = startDomain - this.overlap;
        }
        else this.overlap = 0;   
        
        this.currentDomain = {startDate : startDomain, endDate : endDomain ,overlap : this.overlap};
        this.startDate = this.getDateFormatting(startDomain);
        this.endDate = this.getDateFormatting(endDomain);

        this.filterService.updateFilter(
            FilterType.BUSINESSDATE_FILTER,
            true,
            {start: startDomain, end: endDomain, domainId: this.domainId}
        );
        this.domainChange.emit(true);
    }

    getDateFormatting(value): string {
        const date = moment(value);
        switch (this.domainId) {
            case 'TR':
                return this.time.formatDateTime(value);
            case 'J':
                return this.time.formatDate(value);
            case '7D':
                return this.time.formatDateTime(value);
            case 'W':
                return this.time.formatDate(value);
            case 'M':
                return this.time.formatDate(value);
            case 'Y':
                return date.format('yyyy');
            default:
                return this.time.formatDate(value);
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
        if (this.followClockTick) {
            this.followClockTick = false;
            this.isTimelineLockDisabled = true;
        }


        if (moveForward) {
            startDomain = this.goForward(startDomain.add(this.overlap, "milliseconds"));
            endDomain = this.goForward(endDomain);
        } else {
            startDomain = this.goBackward(startDomain.add(this.overlap, "milliseconds"));
            endDomain = this.goBackward(endDomain);
        }

        this.setStartAndEndDomain(startDomain.valueOf(), endDomain.valueOf(),false);
    }

    goForward(dateToMove: moment.Moment) {
        switch (this.domainId) {
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
        switch (this.domainId) {
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
            if (this.buttonList[i].buttonTitle === this.buttonTitle) {
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

    lockTimeline() : void {
        this.followClockTick = false;
    }

    unlockTimeline() : void {
        this.followClockTick = true;

        // Restore default domain when the user unlocks the timeline
        this.setDefaultStartAndEndDomain(); 
    }

    private shiftTimeLineIfNecessary() {
        if (this.followClockTick) {
            const currentDate = moment().valueOf();
            let startDomain;
            let endDomain;

            switch (this.domainId) {
                case 'TR':
                    if (currentDate > 150 * 60 * 1000 + this.currentDomain.startDate) {
                        this.setDefaultStartAndEndDomain();
                    }
                    break;
                case 'J':
                    // shift day  one minute before change of day 
                    if (currentDate > this.currentDomain.endDate - 60 * 1000) {
                        startDomain = moment(currentDate + 60 * 1000).hours(0).minutes(0).second(0).millisecond(0);
                        endDomain = moment(currentDate + 60 * 1000).hours(0).minutes(0).second(0).millisecond(0).add(1, 'days');
                        this.setStartAndEndDomain(startDomain.valueOf(), endDomain.valueOf(),true);
                        break;
                    }
                    break;
                case '7D':
                    if (currentDate > 16 * 60 * 60 * 1000 + this.currentDomain.startDate) {
                        this.setDefaultStartAndEndDomain();
                    }
                    break;
                case 'W':
                     // shift day  one minute before change of week 
                    if (currentDate > this.currentDomain.endDate - 60 * 1000) {
                        startDomain = moment(currentDate + 60 * 1000).hours(0).minutes(0).second(0).millisecond(0);
                        endDomain = moment(currentDate + 60 * 1000).hours(0).minutes(0).second(0).millisecond(0).add(1, 'week');
                        this.setStartAndEndDomain(startDomain.valueOf(), endDomain.valueOf(),true);
                    }
                    break;
                case 'M':
                    // shift day  one minute before change of month 
                    if (currentDate > this.currentDomain.endDate - 60 * 1000) {
                        startDomain = moment(currentDate + 60 * 1000).hours(0).minutes(0).second(0).millisecond(0);
                        endDomain = moment(currentDate + 60 * 1000).hours(0).minutes(0).second(0).millisecond(0).add(1, 'months');
                        this.setStartAndEndDomain(startDomain.valueOf(), endDomain.valueOf(),true);
                    }
                    break;

                case 'Y':
                    // shift day  one minute before change of year 
                    if (currentDate > this.currentDomain.endDate - 60 * 1000) {
                        startDomain = moment(currentDate + 60 * 1000).hours(0).minutes(0).second(0).millisecond(0);
                        endDomain = moment(currentDate + 60 * 1000).hours(0).minutes(0).second(0).millisecond(0).add(1, 'years');
                        this.setStartAndEndDomain(startDomain.valueOf(), endDomain.valueOf(),true);
                    }
                    break;
            }
        }
        setTimeout(() => this.shiftTimeLineIfNecessary(), 10000);
    }


}
