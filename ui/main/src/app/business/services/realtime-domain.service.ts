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
import {LogOption, LoggerService as logger} from 'app/business/services/logs/logger.service';
import {FilterType} from '@ofModel/feed-filter.model';
import {add, addMilliseconds, startOfDay, startOfHour, startOfMonth, startOfWeek, startOfYear, sub} from 'date-fns';
import {I18nService} from './translation/i18n.service';

export class RealtimeDomainService {
    private static OVERLAP_DURATION_IN_MS = 15 * 60 * 1000;

    private static currentDomainId: string;
    private static currentDomain: {startDate: number; endDate: number; overlap: number};
    private static filteredLightCardStore: FilteredLightCardsStore;
    private static overlap = 0;
    private static followClockTick: boolean = true;
    private static localeOption;

    public static init() {
        this.filteredLightCardStore = OpfabStore.getFilteredLightCardStore();
        this.localeOption = I18nService.getDateFnsLocaleOption();
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
                endDomain = startOfHour(add(new Date(), {hours: 10}));
                break;
            }
            case 'J': {
                startDomain = startOfDay(new Date());
                endDomain = startOfDay(add(new Date(), {days: 1}));
                break;
            }
            case '7D': {
                startDomain = sub(startOfHour(new Date()), {hours: 12});
                // set position to a multiple of 4
                for (let i = 0; i < 4; i++) {
                    if ((startDomain.getHours() - i) % 4 === 0) {
                        startDomain = sub(startDomain, {hours: i});
                        break;
                    }
                }
                endDomain = add(startDomain, {days: 8});
                break;
            }
            case 'W': {
                startDomain = startOfWeek(new Date(), this.localeOption);
                endDomain = add(startOfWeek(new Date(), this.localeOption), {weeks: 1});
                break;
            }
            case 'M': {
                startDomain = startOfMonth(new Date());
                endDomain = add(startOfMonth(new Date()), {months: 1});
                break;
            }
            case 'Y': {
                startDomain = startOfYear(new Date());
                endDomain = add(startOfYear(new Date()), {years: 1});
                break;
            }
        }
        return this.setStartAndEndDomain(startDomain.valueOf(), endDomain.valueOf(), false);
    }

    private static getRealTimeStartDate() {
        const currentMinutes = new Date().getMinutes();
        const roundedMinutes = Math.floor(currentMinutes / 15) * 15; // rounds minutes to previous quarter
        const realStartDate = new Date();
        realStartDate.setMinutes(roundedMinutes);
        realStartDate.setSeconds(0);
        realStartDate.setMilliseconds(0);
        return sub(sub(realStartDate, {hours: 2}), {minutes: 15});
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
            const startOfWeekTime = startOfWeek(add(new Date(startDomain), {days: 2}), this.localeOption).getTime();
            const endOfWeekTime = add(startOfWeekTime, {weeks: 1}).getTime();
            startDomain = startOfWeekTime;
            endDomain = endOfWeekTime;
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
        let startDomain = new Date(this.currentDomain.startDate);
        let endDomain = new Date(this.currentDomain.endDate);

        if (moveForward) {
            logger.info('Move domain forward', LogOption.REMOTE);
            startDomain = this.goForward(addMilliseconds(startDomain, this.overlap));
            endDomain = this.goForward(endDomain);
        } else {
            logger.info('Move domain backward', LogOption.REMOTE);
            startDomain = this.goBackward(addMilliseconds(startDomain, this.overlap));
            endDomain = this.goBackward(endDomain);
        }

        return this.setStartAndEndDomain(startDomain.valueOf(), endDomain.valueOf(), false);
    }

    private static goForward(dateToMove: Date) {
        switch (this.currentDomainId) {
            case 'TR':
                return add(dateToMove, {hours: 2});
            case 'J':
                return add(dateToMove, {days: 1});
            case '7D':
                return add(startOfDay(add(dateToMove, {hours: 8})), {days: 1}); // the feed is not always at the beginning of the day
            case 'W':
                return add(dateToMove, {days: 7});
            case 'M':
                return add(dateToMove, {months: 1});
            case 'Y':
                return add(dateToMove, {years: 1});
        }
    }

    private static goBackward(dateToMove: Date) {
        switch (this.currentDomainId) {
            case 'TR':
                return sub(dateToMove, {hours: 2});
            case 'J':
                return sub(dateToMove, {days: 1});
            case '7D':
                return sub(startOfDay(add(dateToMove, {hours: 8})), {days: 1}); // the feed is not always at the beginning of the day
            case 'W':
                return sub(dateToMove, {days: 7});
            case 'M':
                return sub(dateToMove, {months: 1});
            case 'Y':
                return sub(dateToMove, {years: 1});
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
