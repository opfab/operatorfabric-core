/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {UserPreferencesService} from './users/user-preference.service';
import {ConfigService} from 'app/business/services/config.service';
import {MenuService} from 'app/business/services/menu.service';

declare const opfabStyle: any;

@Injectable({
    providedIn: 'root'
})
export class GlobalStyleService {
    public static DAY = 'DAY';
    public static NIGHT = 'NIGHT';

    private static style: string;

    private static styleChangeEvent: BehaviorSubject<string>;

    constructor() {
        opfabStyle.init();
        GlobalStyleService.styleChangeEvent = new BehaviorSubject<string>(GlobalStyleService.NIGHT);
    }

    public loadUserStyle() {
        const visibleCoreMenus = MenuService.computeVisibleCoreMenusForCurrentUser();
        const nightDayMode = visibleCoreMenus.includes('nightdaymode');

        const settings = ConfigService.getConfigValue('settings');
        if (!nightDayMode) {
            if (settings?.styleWhenNightDayModeDesactivated) {
                this.setStyle(settings.styleWhenNightDayModeDesactivated);
            }
        } else {
            this.loadNightModeFromUserPreferences();
        }
    }

    public getStyle(): string {
        return GlobalStyleService.style;
    }

    public setStyle(style: string) {
        GlobalStyleService.style = style;
        opfabStyle.setCss(style === GlobalStyleService.NIGHT ? opfabStyle.NIGHT_STYLE : opfabStyle.DAY_STYLE);
        this.styleChanged();
    }

    private loadNightModeFromUserPreferences() {
        const nightMode = UserPreferencesService.getPreference('opfab.nightMode');
        if (nightMode !== null && nightMode === 'false') {
            this.setStyle(GlobalStyleService.DAY);
        } else {
            this.setStyle(GlobalStyleService.NIGHT);
        }
    }

    public switchToNightMode() {
        this.setStyle(GlobalStyleService.NIGHT);
        UserPreferencesService.setPreference('opfab.nightMode', 'true');
    }

    public switchToDayMode() {
        this.setStyle(GlobalStyleService.DAY);
        UserPreferencesService.setPreference('opfab.nightMode', 'false');
    }

    public getStyleChange(): Observable<string> {
        return GlobalStyleService.styleChangeEvent.asObservable();
    }

    private styleChanged() {
        GlobalStyleService.styleChangeEvent.next(GlobalStyleService.style);
    }
}
