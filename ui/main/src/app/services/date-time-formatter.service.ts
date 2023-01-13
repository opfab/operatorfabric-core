/* Copyright (c) 2022-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from '@angular/core';
import * as moment from 'moment';
import {ConfigService} from '../business/config/config.service';

@Injectable({
    providedIn: 'root'
})
export class DateTimeFormatterService {
    private timeFormat;
    private dateFormat;
    private dateTimeFormat;

    constructor( private configService: ConfigService) {
        this.loadFormatterServiceConfiguration();
    }

    private loadFormatterServiceConfiguration() {
        this.configService
            .getConfigValueAsObservable('settings.timeFormat', 'LT')
            .subscribe((next) => (this.timeFormat = next));
        this.configService
            .getConfigValueAsObservable('settings.dateFormat', 'L')
            .subscribe((next) => (this.dateFormat = next));
        this.configService
            .getConfigValueAsObservable('settings.dateTimeFormat')
            .subscribe((next) => (this.dateTimeFormat = next));
    }

    public getFormattedDateFromEpochDate(epochDate: number): string {
        if (!epochDate) return '';
        return moment(epochDate).format(this.dateFormat);
    }

    public getFormattedDateAndTimeFromEpochDate(epochDate: number): string {
        if (!epochDate) return '';
        return moment(epochDate).format(
            this.dateTimeFormat ? this.dateTimeFormat : `${this.dateFormat} ${this.timeFormat}`
        );
    }

    public getFormattedTimeFromEpochDate(epochDate: number): string {
        if (!epochDate) return '';
        return moment(epochDate).format(this.timeFormat);
    }
}
