/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {FilteredLightCardsStore} from '../../store/lightcards/lightcards-feed-filter-store';
import {OpfabStore} from '../../store/opfabStore';
import {UserPreferencesService} from '../userPreferences/UserPreferencesService';
import {LogOption, LoggerService as logger} from 'app/services/logs/LoggerService';
import {FilterType} from '@ofModel/feed-filter.model';
import {add, addMilliseconds, startOfDay, startOfHour, startOfMonth, startOfWeek, startOfYear, sub} from 'date-fns';
import {DateTimeFormatterService} from '../dateTimeFormatter/DateTimeFormatterService';
import {ConfigService} from '../config/ConfigService';

export class RealTimeDomainService {
    private static readonly OVERLAP_DURATION_IN_MS = 15 * 60 * 1000;

    private static currentDomainId: string;
    private static currentDomain: {startDate: number; endDate: number; overlap: number};
    private static filteredLightCardStore: FilteredLightCardsStore;
    private static overlap = 0;
    private static followClockTick: boolean = true;

    public static init() {
        RealTimeDomainService.filteredLightCardStore = OpfabStore.getFilteredLightCardStore();

        // Needed for compatibility with versions prior to 4.6.0
        if (UserPreferencesService.getPreference('opfab.timeLine.domain') === 'TR') {
            UserPreferencesService.setPreference('opfab.timeLine.domain', 'RT');
        }

        RealTimeDomainService.currentDomainId =
            UserPreferencesService.getPreference('opfab.timeLine.domain') ?? RealTimeDomainService.getDefaultDomainId();
        RealTimeDomainService.setDefaultStartAndEndDomain();
        RealTimeDomainService.followClockTick = true;
    }

    public static getDefaultDomainId() {
        const domains = ConfigService.getConfigValue('feed.timeline.domains', ['RT', 'J', '7D', 'W', 'M', 'Y']);
        return domains[0];
    }

    public static getDomainId() {
        return RealTimeDomainService.currentDomainId;
    }

    public static setDomainId(domainId: string, reset: boolean) {
        RealTimeDomainService.currentDomainId = domainId;
        if (!RealTimeDomainService.currentDomain || reset) {
            RealTimeDomainService.setDefaultStartAndEndDomain();
        } else {
            RealTimeDomainService.updateCardFilter();
        }

        UserPreferencesService.setPreference('opfab.timeLine.domain', RealTimeDomainService.currentDomainId);
    }

    public static getCurrentDomain() {
        return RealTimeDomainService.currentDomain;
    }

    public static setDefaultStartAndEndDomain() {
        let startDomain;
        let endDomain;
        switch (RealTimeDomainService.currentDomainId) {
            case 'RT': {
                startDomain = RealTimeDomainService.getRealTimeStartDate();
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
                startDomain = startOfWeek(new Date(), DateTimeFormatterService.getDateFnsLocaleOption());
                endDomain = add(startOfWeek(new Date(), DateTimeFormatterService.getDateFnsLocaleOption()), {weeks: 1});
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
        return RealTimeDomainService.setStartAndEndDomain(startDomain.valueOf(), endDomain.valueOf(), false);
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
     * @param startPeriod new start of domain
     * @param endPeriod new end of domain
     */
    public static setStartAndEndPeriod(startPeriod: number, endPeriod: number) {
        RealTimeDomainService.currentDomainId = undefined;
        RealTimeDomainService.setStartAndEndDomain(startPeriod, endPeriod);
    }

    private static setStartAndEndDomain(startDomain: number, endDomain: number, useOverlap = false) {
        if (RealTimeDomainService.currentDomainId === 'W') {
            /*
             * In case of 'week' domain reset start and end date to take into account different locale setting for first day of week
             * To compute start day of week add 2 days to startDate to avoid changing week passing from locale with saturday as first day of week
             * to a locale with monday as first day of week
             */
            const startOfWeekTime = startOfWeek(
                add(new Date(startDomain), {days: 2}),
                DateTimeFormatterService.getDateFnsLocaleOption()
            ).getTime();
            const endOfWeekTime = add(startOfWeekTime, {weeks: 1}).getTime();
            startDomain = startOfWeekTime;
            endDomain = endOfWeekTime;
        }

        if (useOverlap) {
            RealTimeDomainService.overlap = RealTimeDomainService.OVERLAP_DURATION_IN_MS;
            startDomain = startDomain - RealTimeDomainService.overlap;
        } else RealTimeDomainService.overlap = 0;

        RealTimeDomainService.currentDomain = {
            startDate: startDomain,
            endDate: endDomain,
            overlap: RealTimeDomainService.overlap
        };
        RealTimeDomainService.updateCardFilter();
        return RealTimeDomainService.currentDomain;
    }

    public static updateCardFilter() {
        RealTimeDomainService.filteredLightCardStore.updateFilter(FilterType.BUSINESSDATE_FILTER, true, {
            start: RealTimeDomainService.currentDomain.startDate,
            end: RealTimeDomainService.currentDomain.endDate,
            domainId: RealTimeDomainService.currentDomainId
        });
    }

    /**
     * select the movement applied on domain : forward or backward
     * parse the conf object dedicated for movement, parse it two time when end property is present
     * each object's keys add time precision on start or end of domain
     * @param moveForward direction: add or subtract conf object
     */
    public static moveDomain(moveForward: boolean) {
        RealTimeDomainService.followClockTick = false;
        let startDomain = new Date(RealTimeDomainService.currentDomain.startDate);
        let endDomain = new Date(RealTimeDomainService.currentDomain.endDate);

        if (moveForward) {
            logger.info('Move domain forward', LogOption.REMOTE);
            startDomain = RealTimeDomainService.goForward(addMilliseconds(startDomain, RealTimeDomainService.overlap));
            endDomain = RealTimeDomainService.goForward(endDomain);
        } else {
            logger.info('Move domain backward', LogOption.REMOTE);
            startDomain = RealTimeDomainService.goBackward(addMilliseconds(startDomain, RealTimeDomainService.overlap));
            endDomain = RealTimeDomainService.goBackward(endDomain);
        }

        return RealTimeDomainService.setStartAndEndDomain(startDomain.valueOf(), endDomain.valueOf(), false);
    }

    private static goForward(dateToMove: Date) {
        switch (RealTimeDomainService.currentDomainId) {
            case 'RT':
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
        switch (RealTimeDomainService.currentDomainId) {
            case 'RT':
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

    public static shiftIfNecessaryDomainUsingOverlap(): void {
        const currentDate = new Date().valueOf();
        // shift domain one minute before change of cycle
        let domainDuration = {};
        if (currentDate > RealTimeDomainService.currentDomain.endDate - 60 * 1000) {
            switch (RealTimeDomainService.currentDomainId) {
                case 'J':
                    domainDuration = {days: 1};
                    break;
                case 'W':
                    domainDuration = {weeks: 1};
                    break;
                case 'M':
                    domainDuration = {months: 1};
                    break;
                case 'Y':
                    domainDuration = {years: 1};
                    break;
            }
            const startDomain = startOfDay(new Date(currentDate + 60 * 1000));

            let endDomain = startOfDay(new Date(currentDate + 60 * 1000));

            endDomain = add(endDomain, domainDuration);
            RealTimeDomainService.currentDomain = RealTimeDomainService.setStartAndEndDomain(
                startDomain.valueOf(),
                endDomain.valueOf(),
                true
            );
        }
        switch (RealTimeDomainService.currentDomainId) {
            case 'RT':
                if (currentDate > RealTimeDomainService.currentDomain.startDate + 150 * 60 * 1000) {
                    RealTimeDomainService.currentDomain = RealTimeDomainService.setDefaultStartAndEndDomain();
                }
                break;
            case '7D':
                if (currentDate > RealTimeDomainService.currentDomain.startDate + 16 * 60 * 60 * 1000) {
                    RealTimeDomainService.currentDomain = RealTimeDomainService.setDefaultStartAndEndDomain();
                }
                break;
        }
    }

    public static isTimelineLocked(): boolean {
        return !RealTimeDomainService.followClockTick;
    }

    public static lockTimeline(): void {
        logger.info('Lock timeline', LogOption.REMOTE);
        RealTimeDomainService.followClockTick = false;
    }

    public static unlockTimeline(): void {
        logger.info('Unlock timeline', LogOption.REMOTE);
        RealTimeDomainService.followClockTick = true;
    }
}
