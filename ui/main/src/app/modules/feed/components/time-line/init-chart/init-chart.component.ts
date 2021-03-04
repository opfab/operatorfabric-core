/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {Component, Input, OnInit} from '@angular/core';
import * as _ from 'lodash-es';
import * as moment from 'moment';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {FilterType} from '@ofServices/filter.service';
import {ApplyFilter} from '@ofActions/feed.actions';
import {TimeService} from '@ofServices/time.service';


@Component({
    selector: 'of-init-chart',
    templateUrl: './init-chart.component.html',
    styleUrls: ['./init-chart.component.scss']
})
export class InitChartComponent implements OnInit {

    @Input() confDomain;

    // required by Timeline
    public cardsData: any[];
    public myDomain: number[];
    public domainId: string;


    // required for domain movements specifications
    public followClockTick: boolean;
    public followClockTickMode: boolean;

    // buttons
    public buttonTitle: string;
    public buttonList;

    public hideTimeLine = false;
    public startDate;
    public endDate;


    constructor(private store: Store<AppState>, private time: TimeService) {
    }


    /**
     * set selector on timeline's State
     * and call timeline initialization functions
     */
    ngOnInit() {
        const hideTimeLineInStorage = localStorage.getItem('opfab.hideTimeLine');
        this.hideTimeLine = (hideTimeLineInStorage === 'true');
        this.initDomains();
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
        
        const savedDomain = localStorage.getItem('opfab.timeLine.domain');

        if (!!savedDomain) {
            initialGraphConf = this.buttonList.find(b => b.domainId === savedDomain);
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
        localStorage.setItem('opfab.timeLine.domain', this.domainId);
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
                startDomain = moment().minutes(0).second(0).millisecond(0).subtract(2, 'hours');
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
        this.setStartAndEndDomain(startDomain.valueOf(), endDomain.valueOf());
    }


    /**
     * apply new timeline domain
     * feed state dispatch a change on filter, provide the new filter start and end
     * @param startDomain new start of domain
     * @param endDomain new end of domain
     */
    setStartAndEndDomain(startDomain: number, endDomain: number): void {

        this.myDomain = [startDomain, endDomain];
        this.startDate = this.getDateFormatting(startDomain);
        this.endDate = this.getDateFormatting(endDomain);

        this.store.dispatch(new ApplyFilter({
            name: FilterType.BUSINESSDATE_FILTER, active: true,
            status: {start: startDomain, end: endDomain}
        }));
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

    /**
     * select the movement applied on domain : forward or backward
     * parse the conf object dedicated for movement, parse it two time when end property is present
     * each object's keys add time precision on start or end of domain
     * @param moveForward direction: add or subtract conf object
     */
    moveDomain(moveForward: boolean): void {
        let startDomain = moment(this.myDomain[0]);
        let endDomain = moment(this.myDomain[1]);

        // Move from main visualisation, now domain stop to move
        if (this.followClockTick) {
            this.followClockTick = false;
        }

        if (moveForward) {
            startDomain = this.goForward(startDomain);
            endDomain = this.goForward(endDomain);
        } else {
            startDomain = this.goBackward(startDomain);
            endDomain = this.goBackward(endDomain);
        }

        this.setStartAndEndDomain(startDomain.valueOf(), endDomain.valueOf());
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
        localStorage.setItem('opfab.hideTimeLine', this.hideTimeLine.toString());
    }

}

