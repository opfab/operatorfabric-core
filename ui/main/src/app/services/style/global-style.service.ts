/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {BehaviorSubject, Observable} from 'rxjs';
import {UserPreferencesService} from '../../business/services/users/user-preference.service';
import {ConfigService} from 'app/services/config/ConfigService';
import {MenuService} from 'app/business/services/menu.service';

declare const opfabStyle: any;

export class GlobalStyleService {
    public static readonly DAY = 'DAY';
    public static readonly NIGHT = 'NIGHT';

    private static style: string;

    private static styleChangeEvent: BehaviorSubject<string>;

    public static init() {
        GlobalStyleService.styleChangeEvent = new BehaviorSubject<string>(GlobalStyleService.NIGHT);
        GlobalStyleService.setStyle('NIGHT');
    }

    public static loadUserStyle() {
        const nightDayMode = MenuService.isNightDayModeMenuVisible();

        const settings = ConfigService.getConfigValue('settings');
        if (!nightDayMode) {
            if (settings?.styleWhenNightDayModeDesactivated) {
                GlobalStyleService.setStyle(settings.styleWhenNightDayModeDesactivated);
            }
        } else {
            GlobalStyleService.loadNightModeFromUserPreferences();
        }
    }

    public static getStyle(): string {
        return GlobalStyleService.style;
    }

    public static setStyle(style: string) {
        GlobalStyleService.style = style;
        opfabStyle.setOpfabTheme(style === GlobalStyleService.NIGHT ? opfabStyle.NIGHT_THEME : opfabStyle.DAY_THEME);
        GlobalStyleService.styleChanged();
    }

    private static loadNightModeFromUserPreferences() {
        const nightMode = UserPreferencesService.getPreference('opfab.nightMode');
        if (nightMode !== null && nightMode === 'false') {
            GlobalStyleService.setStyle(GlobalStyleService.DAY);
        } else {
            GlobalStyleService.setStyle(GlobalStyleService.NIGHT);
        }
    }

    public static switchToNightMode() {
        GlobalStyleService.setStyle(GlobalStyleService.NIGHT);
        UserPreferencesService.setPreference('opfab.nightMode', 'true');
    }

    public static switchToDayMode() {
        GlobalStyleService.setStyle(GlobalStyleService.DAY);
        UserPreferencesService.setPreference('opfab.nightMode', 'false');
    }

    public static getStyleChange(): Observable<string> {
        return GlobalStyleService.styleChangeEvent.asObservable();
    }

    private static styleChanged() {
        GlobalStyleService.styleChangeEvent.next(GlobalStyleService.style);
    }
}
