/* Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {TranslationService} from '@ofServices/translation/TranslationService';
import {sub} from 'date-fns';

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
        const startCurrentMonth = new Date(y, m, 1);
        const endCurrentMonth = new Date(y, m + 1, 1);
        const startPreviousMonth = new Date(y, m - 1, 1);

        const todayTranslation = TranslationService.getTranslation('datePicker.today');
        const yesterdayTranslation = TranslationService.getTranslation('datePicker.yesterday');
        const last7DaysTranslation = TranslationService.getTranslation('datePicker.last7Days');
        const last30DaysTranslation = TranslationService.getTranslation('datePicker.last30Days');
        const thisMonthTranslation = TranslationService.getTranslation('datePicker.thisMonth');
        const lastMonthTranslation = TranslationService.getTranslation('datePicker.lastMonth');
        return {
            [todayTranslation]: [new Date().setHours(0, 0, 0, 0), new Date().setHours(24, 0, 0, 0)],
            [yesterdayTranslation]: [sub(new Date().setHours(0, 0, 0, 0), {days: 1}), new Date().setHours(0, 0, 0, 0)],
            [last7DaysTranslation]: [sub(new Date(), {days: 7}).setHours(0, 0, 0, 0), new Date().setHours(24, 0, 0, 0)],
            [last30DaysTranslation]: [
                sub(new Date(), {days: 30}).setHours(0, 0, 0, 0),
                new Date().setHours(24, 0, 0, 0)
            ],
            [thisMonthTranslation]: [startCurrentMonth, endCurrentMonth],
            [lastMonthTranslation]: [startPreviousMonth, startCurrentMonth]
        };
    }
}
