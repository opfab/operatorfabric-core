/* Copyright (c) 2022-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {fr, enUS, nl} from 'date-fns/locale';
import {ConfigService} from '../config/ConfigService';
import {format} from 'date-fns';
import {Subject, takeUntil} from 'rxjs';

export class DateTimeFormatterService {
    private static timeFormat;
    private static defaultDateFormat;
    private static dateTimeFormat;
    private static dateFnsLocaleOption: {locale: any};
    private static readonly destroy$ = new Subject<void>();

    public static init() {
        DateTimeFormatterService.timeFormat = ConfigService.getConfigValue('settings.timeFormat', 'p');
        DateTimeFormatterService.defaultDateFormat = ConfigService.getConfigValue('settings.dateFormat', 'P');
        DateTimeFormatterService.dateTimeFormat = ConfigService.getConfigValue('settings.dateTimeFormat');
        DateTimeFormatterService.destroy$.next(); // unsubscribe from previous subscription , only useful for unit tests as they call init more than one time
        ConfigService.getConfigValueAsObservable('settings.locale', 'en')
            .pipe(takeUntil(DateTimeFormatterService.destroy$))
            .subscribe((locale) => DateTimeFormatterService.setDateFnsLocaleOption(locale));
    }

    private static setDateFnsLocaleOption(locale) {
        let fnsLocale;
        switch (locale) {
            case 'fr':
                fnsLocale = fr;
                break;
            case 'nl':
                fnsLocale = nl;
                break;
            default:
                fnsLocale = {...enUS, options: {...enUS.options, weekStartsOn: 6}};
                break;
        }
        DateTimeFormatterService.dateFnsLocaleOption = {locale: fnsLocale};
    }

    public static getDateFnsLocaleOption(): {locale: any} {
        return DateTimeFormatterService.dateFnsLocaleOption;
    }

    public static getFormattedDate(
        date: number | Date,
        dateFormat: string = DateTimeFormatterService.defaultDateFormat
    ): string {
        if (!date) {
            return '';
        }
        return format(date, dateFormat, DateTimeFormatterService.dateFnsLocaleOption);
    }

    public static getFormattedDateAndTime(epochDate: number): string {
        const formatToUse = DateTimeFormatterService.dateTimeFormat
            ? DateTimeFormatterService.dateTimeFormat
            : `${DateTimeFormatterService.defaultDateFormat} ${DateTimeFormatterService.timeFormat}`;

        if (!epochDate) {
            return '';
        }
        return format(epochDate, formatToUse, DateTimeFormatterService.dateFnsLocaleOption);
    }

    public static getFormattedTime(epochDate: number): string {
        if (!epochDate) {
            return '';
        }
        return format(epochDate, DateTimeFormatterService.timeFormat, DateTimeFormatterService.dateFnsLocaleOption);
    }
}
