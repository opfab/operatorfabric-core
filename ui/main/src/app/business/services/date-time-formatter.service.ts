/* Copyright (c) 2022-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ConfigService} from './config.service';
import {format} from 'date-fns';
import {I18nService} from './translation/i18n.service';

export class DateTimeFormatterService {
    private static timeFormat;
    private static dateFormat;
    private static dateTimeFormat;

    public static init() {
        DateTimeFormatterService.timeFormat = ConfigService.getConfigValue('settings.timeFormat', 'p');
        DateTimeFormatterService.dateFormat = ConfigService.getConfigValue('settings.dateFormat', 'P');
        DateTimeFormatterService.dateTimeFormat = ConfigService.getConfigValue('settings.dateTimeFormat');
    }

    public static getFormattedDateFromEpochDate(epochDate: number): string {
        if (!epochDate) {
            return '';
        }
        return format(epochDate, DateTimeFormatterService.dateFormat, I18nService.getDateFnsLocaleOption());
    }

    public static getFormattedDateAndTimeFromEpochDate(epochDate: number): string {
        const formatToUse = DateTimeFormatterService.dateTimeFormat
            ? DateTimeFormatterService.dateTimeFormat
            : `${DateTimeFormatterService.dateFormat} ${DateTimeFormatterService.timeFormat}`;

        if (!epochDate) {
            return '';
        }
        return format(epochDate, formatToUse, I18nService.getDateFnsLocaleOption());
    }

    public static getFormattedTimeFromEpochDate(epochDate: number): string {
        if (!epochDate) {
            return '';
        }
        return format(epochDate, DateTimeFormatterService.timeFormat, I18nService.getDateFnsLocaleOption());
    }
}
