/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from '@angular/core';
import * as moment from 'moment';
import {AppState} from '@ofStore/index';
import {Store} from '@ngrx/store';
import {buildSettingsOrConfigSelector} from '@ofSelectors/settings.x.config.selectors';


@Injectable({
    providedIn: 'root'
})
export class DateTimeFormatterService {
    private timeFormat;
    private dateFormat;
    private dateTimeFormat;

    constructor(private store: Store<AppState>) {
        this.loadFormatterServiceConfiguration();
    }

    private loadFormatterServiceConfiguration() {
        this.store
            .select(buildSettingsOrConfigSelector('timeFormat', 'LT'))
            .subscribe((next) => (this.timeFormat = next));
        this.store
            .select(buildSettingsOrConfigSelector('dateFormat', 'L'))
            .subscribe((next) => (this.dateFormat = next));
        this.store
            .select(buildSettingsOrConfigSelector('dateTimeFormat'))
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
