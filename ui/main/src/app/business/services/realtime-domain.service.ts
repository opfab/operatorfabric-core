/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {FilteredLightCardsStore} from '../store/lightcards/lightcards-feed-filter-store';
import {OpfabStore} from '../store/opfabStore';
import {UserPreferencesService} from './users/user-preference.service';
import moment from 'moment';
import {LogOption, LoggerService as logger} from 'app/business/services/logs/logger.service';
import {FilterType} from '@ofModel/feed-filter.model';

export class RealtimeDomainService {
    private static OVERLAP_DURATION_IN_MS = 15 * 60 * 1000;

    private static currentDomainId: string;
    private static currentDomain: {startDate: number; endDate: number; overlap: number};
    private static filteredLightCardStore: FilteredLightCardsStore;
    private static overlap = 0;
    private static followClockTick: boolean = true;

    public static init() {
        moment.updateLocale('en', {
            week: {
                dow: 6, // First day of week is Saturday
                doy: 12 // First week of year must contain 1 January (7 + 6 - 1)
            }
        });
        this.filteredLightCardStore = OpfabStore.getFilteredLightCardStore();
        this.currentDomainId = UserPreferencesService.getPreference('opfab.timeLine.domain');
        if (this.currentDomainId) {
            this.setDefaultStartAndEndDomain();
        }
    }

    public static getDomainId() {
        return this.currentDomainId;
    }

    public static setDomainId(domainId: string, reset: boolean) {
        this.currentDomainId = domainId;
        if (!this.currentDomain || reset) {
            this.setDefaultStartAndEndDomain();
        } else {
            this.updateCardFilter();
        }

        UserPreferencesService.setPreference('opfab.timeLine.domain', this.currentDomainId);
    }

    public static getCurrentDomain() {
        return this.currentDomain;
    }

    public static setDefaultStartAndEndDomain() {
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
        return this.setStartAndEndDomain(startDomain.valueOf(), endDomain.valueOf(), false);
    }

    private static getRealTimeStartDate() {
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
    public static setStartAndEndDomain(startDomain: number, endDomain: number, useOverlap = false) {
        if (this.currentDomainId === 'W') {
            /*
             * In case of 'week' domain reset start and end date to take into account different locale setting for first day of week
             * To compute start day of week add 2 days to startDate to avoid changing week passing from locale with saturday as first day of week
             * to a locale with monday as first day of week
             */
            const startOfWeek = moment(startDomain)
                .add(2, 'day')
                .startOf('week')
                .minutes(0)
                .second(0)
                .millisecond(0)
                .valueOf();
            const endOfWeek = moment(startDomain)
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
        this.updateCardFilter();
        return this.currentDomain;
    }

    public static updateCardFilter() {
        this.filteredLightCardStore.updateFilter(FilterType.BUSINESSDATE_FILTER, true, {
            start: this.currentDomain.startDate,
            end: this.currentDomain.endDate,
            domainId: this.currentDomainId
        });
    }

    /**
     * select the movement applied on domain : forward or backward
     * parse the conf object dedicated for movement, parse it two time when end property is present
     * each object's keys add time precision on start or end of domain
     * @param moveForward direction: add or subtract conf object
     */
    public static moveDomain(moveForward: boolean) {
        this.followClockTick = false;
        let startDomain = moment(this.currentDomain.startDate);
        let endDomain = moment(this.currentDomain.endDate);

        if (moveForward) {
            logger.info('Move domain forward', LogOption.REMOTE);
            startDomain = this.goForward(startDomain.add(this.overlap, 'milliseconds'));
            endDomain = this.goForward(endDomain);
        } else {
            logger.info('Move domain backward', LogOption.REMOTE);
            startDomain = this.goBackward(startDomain.add(this.overlap, 'milliseconds'));
            endDomain = this.goBackward(endDomain);
        }

        return this.setStartAndEndDomain(startDomain.valueOf(), endDomain.valueOf(), false);
    }

    private static goForward(dateToMove: moment.Moment) {
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

    private static goBackward(dateToMove: moment.Moment) {
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

    public static isTimelineLocked(): boolean {
        return !this.followClockTick;
    }

    public static lockTimeline(): void {
        logger.info('Lock timeline', LogOption.REMOTE);
        this.followClockTick = false;
    }

    public static unlockTimeline(): void {
        logger.info('Unlock timeline', LogOption.REMOTE);
        this.followClockTick = true;
    }
}
