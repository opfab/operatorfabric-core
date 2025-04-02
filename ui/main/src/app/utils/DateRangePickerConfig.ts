/* Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {DateTimeFormatterService} from '@ofServices/dateTimeFormatter/DateTimeFormatterService';
import {TranslationService} from '@ofServices/translation/TranslationService';
import {startOfWeek, sub} from 'date-fns';

export class DateRangePickerConfig {
    public static getLocale() {
        return {
            format: 'YYYY-MM-DD HH:mm',
            applyLabel: TranslationService.getTranslation('datePicker.applyLabel'),
            daysOfWeek: TranslationService.getTranslation('datePicker.daysOfWeek'),
            monthNames: TranslationService.getTranslation('datePicker.monthNames')
        };
    }

    public static getCustomRanges() {
        const currentDate = new Date(),
            y = currentDate.getFullYear(),
            m = currentDate.getMonth();

        const startCurrentWeek = startOfWeek(new Date(currentDate), DateTimeFormatterService.getDateFnsLocaleOption());
        const endCurrentWeek = new Date(startCurrentWeek);
        endCurrentWeek.setDate(startCurrentWeek.getDate() + 6);
        endCurrentWeek.setHours(23, 59, 59, 999);

        const startPreviousWeek = new Date(startCurrentWeek);
        startPreviousWeek.setDate(startCurrentWeek.getDate() - 7);
        const endPreviousWeek = new Date(startPreviousWeek);
        endPreviousWeek.setDate(startPreviousWeek.getDate() + 6);
        endPreviousWeek.setHours(23, 59, 59, 999);

        const startCurrentMonth = new Date(y, m, 1);
        const endCurrentMonth = new Date(y, m + 1, 0);
        endCurrentMonth.setHours(23, 59, 59, 999);
        const startPreviousMonth = new Date(y, m - 1, 1);
        const endPreviousMonth = new Date(y, m, 0);
        endPreviousMonth.setHours(23, 59, 59, 999);

        const startCurrentYear = new Date(y, 0, 1);
        const endCurrentYear = new Date(y, 11, 31);
        endCurrentYear.setHours(23, 59, 59, 999);

        const startPreviousYear = new Date(y - 1, 0, 1);
        startPreviousYear.setHours(0, 0, 0, 0);
        const endPreviousYear = new Date(y - 1, 11, 31);
        endPreviousYear.setHours(23, 59, 59, 999);

        const todayTranslation = TranslationService.getTranslation('datePicker.today');
        const last7DaysTranslation = TranslationService.getTranslation('datePicker.last7Days');
        const thisWeekTranslation = TranslationService.getTranslation('datePicker.thisWeek');
        const lastWeekTranslation = TranslationService.getTranslation('datePicker.lastWeek');
        const thisMonthTranslation = TranslationService.getTranslation('datePicker.thisMonth');
        const lastMonthTranslation = TranslationService.getTranslation('datePicker.lastMonth');
        const thisYearTranslation = TranslationService.getTranslation('datePicker.thisYear');
        const lastYearTranslation = TranslationService.getTranslation('datePicker.lastYear');
        return {
            [todayTranslation]: [new Date().setHours(0, 0, 0, 0), new Date().setHours(23, 59, 59, 999)],
            [last7DaysTranslation]: [
                sub(new Date(), {days: 6}).setHours(0, 0, 0, 0),
                new Date().setHours(23, 59, 59, 999)
            ],
            [thisWeekTranslation]: [startCurrentWeek, endCurrentWeek],
            [lastWeekTranslation]: [startPreviousWeek, endPreviousWeek],
            [thisMonthTranslation]: [startCurrentMonth, endCurrentMonth],
            [lastMonthTranslation]: [startPreviousMonth, endPreviousMonth],
            [thisYearTranslation]: [startCurrentYear, endCurrentYear],
            [lastYearTranslation]: [startPreviousYear, endPreviousYear]
        };
    }
}
