/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import * as moment from 'moment';
import {ConfigService} from './config.service';

export class DateTimeFormatterService {
    private static timeFormat;
    private static dateFormat;
    private static dateTimeFormat;


    public static  init() {
        DateTimeFormatterService.timeFormat  = ConfigService.getConfigValue('settings.timeFormat', 'LT');
        DateTimeFormatterService.dateFormat = ConfigService.getConfigValue('settings.dateFormat', 'L');
        DateTimeFormatterService.dateTimeFormat = ConfigService.getConfigValue('settings.dateTimeFormat')
    }

    public static getFormattedDateFromEpochDate(epochDate: number): string {
        if (!epochDate) return '';
        return moment(epochDate).format(DateTimeFormatterService.dateFormat);
    }

    public static getFormattedDateAndTimeFromEpochDate(epochDate: number): string {
        if (!epochDate) return '';
        return moment(epochDate).format(
            DateTimeFormatterService.dateTimeFormat ? DateTimeFormatterService.dateTimeFormat : `${DateTimeFormatterService.dateFormat} ${DateTimeFormatterService.timeFormat}`
        );
    }

    public static getFormattedTimeFromEpochDate(epochDate: number): string {
        if (!epochDate) return '';
        return moment(epochDate).format(DateTimeFormatterService.timeFormat);
    }
}
