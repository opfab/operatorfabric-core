/* Copyright (c) 2024-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {FilteredLightCardsStore} from '../../store/lightcards/FilteredLightcardsStore';
import {OpfabStore} from '../../store/OpfabStore';
import {UserPreferencesService} from '../userPreferences/UserPreferencesService';
import {LogOption, LoggerService as logger} from 'app/services/logs/LoggerService';
import {FilterType} from '@ofStore/lightcards/model/Filter';
import {add, addMilliseconds, startOfDay, startOfHour, startOfMonth, startOfWeek, startOfYear, sub} from 'date-fns';
import {DateTimeFormatterService} from '../dateTimeFormatter/DateTimeFormatterService';
import {ConfigService} from '../config/ConfigService';
import {NearestDomainId} from './NearestDomainId';

export class RealTimeDomainService {
    private static readonly OVERLAP_DURATION_IN_MS = 15 * 60 * 1000;

    private static currentDomainId: string;
    private static currentDomain: {startDate: number; endDate: number; overlap: number};
    private static filteredLightCardStore: FilteredLightCardsStore;
    private static overlap = 0;
    private static followClockTick: boolean = true;
    private static domains = [];

    public static init() {
        RealTimeDomainService.filteredLightCardStore = OpfabStore.getFilteredLightCardStore();

        // Needed for compatibility with versions prior to 4.6.0
        if (UserPreferencesService.getPreference('opfab.timeLine.domain') === 'TR') {
            UserPreferencesService.setPreference('opfab.timeLine.domain', 'RT');
        }
        // Needed for compatibility with versions prior to 4.10.0
        if (UserPreferencesService.getPreference('opfab.timeLine.domain') === 'J') {
            UserPreferencesService.setPreference('opfab.timeLine.domain', 'D');
        }
        RealTimeDomainService.domains = ConfigService.getConfigValue('feed.timeline.domains', [
            'RT',
            'D',
            '7D',
            'W',
            'M',
            'Y'
        ]);

        RealTimeDomainService.currentDomainId =
            UserPreferencesService.getPreference('opfab.timeLine.domain') ?? RealTimeDomainService.getDefaultDomainId();
        RealTimeDomainService.computeStartAndEndDomainDates(RealTimeDomainService.currentDomainId, true);
        RealTimeDomainService.followClockTick = true;
    }

    public static getDefaultDomainId() {
        return RealTimeDomainService.domains[0];
    }

    public static getDomainId() {
        return RealTimeDomainService.currentDomainId;
    }

    public static setDomainId(domainId: string) {
        // If the domain didn't change, the timeline is reset to follow real time
        // The only way to stop following real time is by navigating with the arrows or clicking the lock
        const anchorToNow =
            RealTimeDomainService.currentDomainId === domainId || !RealTimeDomainService.isTimelineLocked();
        RealTimeDomainService.currentDomainId = domainId;
        RealTimeDomainService.computeStartAndEndDomainDates(RealTimeDomainService.currentDomainId, anchorToNow);

        UserPreferencesService.setPreference('opfab.timeLine.domain', RealTimeDomainService.currentDomainId);
    }

    public static getCurrentDomain() {
        return RealTimeDomainService.currentDomain;
    }

    public static computeStartAndEndDomainDates(targetDomainId: string, anchorToNow: boolean) {
        let startDomain;
        let endDomain;
        const referenceDate =
            anchorToNow || !RealTimeDomainService.currentDomain
                ? new Date()
                : new Date(RealTimeDomainService.currentDomain.startDate);

        switch (targetDomainId) {
            case 'RT': {
                startDomain = RealTimeDomainService.getRealTimeStartDate();
                endDomain = startOfHour(add(new Date(), {hours: 10}));
                break;
            }
            case 'D': {
                startDomain = startOfDay(referenceDate);
                endDomain = startOfDay(add(referenceDate, {days: 1}));
                break;
            }
            case '7D': {
                startDomain = startOfDay(referenceDate);
                endDomain = add(startDomain, {days: 7});
                break;
            }
            case 'W': {
                startDomain = startOfWeek(referenceDate, DateTimeFormatterService.getDateFnsLocaleOption());
                endDomain = add(startOfWeek(referenceDate, DateTimeFormatterService.getDateFnsLocaleOption()), {
                    weeks: 1
                });
                break;
            }
            case 'M': {
                startDomain = startOfMonth(referenceDate);
                endDomain = add(startOfMonth(referenceDate), {months: 1});
                break;
            }
            case 'Y': {
                startDomain = startOfYear(referenceDate);
                endDomain = add(startOfYear(referenceDate), {years: 1});
                break;
            }
        }
        if (anchorToNow) {
            RealTimeDomainService.unlockTimeline();
        }
        return RealTimeDomainService.setStartAndEndDomain(startDomain.getTime(), endDomain.getTime(), false);
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

    public static saveUserPreferenceAsNearestDomain() {
        const nearestDomainId = new NearestDomainId();
        nearestDomainId.setDomainList(RealTimeDomainService.domains);

        UserPreferencesService.setPreference(
            'opfab.timeLine.domain',
            nearestDomainId.getNearestDomainId(
                RealTimeDomainService.currentDomain.startDate,
                RealTimeDomainService.currentDomain.endDate
            )
        );
    }

    private static setStartAndEndDomain(startDomain: number, endDomain: number, useOverlap = false) {
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
            case 'D':
                return add(dateToMove, {days: 1});
            case '7D':
                return add(dateToMove, {days: 1});
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
            case 'D':
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
        const currentDate = Date.now();
        // shift domain one minute before change of cycle
        let domainDuration = {};
        if (currentDate > RealTimeDomainService.currentDomain.endDate - 60 * 1000) {
            switch (RealTimeDomainService.currentDomainId) {
                case 'D':
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
                    RealTimeDomainService.currentDomain = RealTimeDomainService.computeStartAndEndDomainDates(
                        RealTimeDomainService.currentDomainId,
                        true
                    );
                }
                break;
            case '7D':
                if (currentDate > RealTimeDomainService.currentDomain.startDate + 16 * 60 * 60 * 1000) {
                    RealTimeDomainService.currentDomain = RealTimeDomainService.computeStartAndEndDomainDates(
                        RealTimeDomainService.currentDomainId,
                        true
                    );
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
