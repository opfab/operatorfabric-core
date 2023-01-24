/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {GlobalStyleUpdateAction} from '@ofActions/global-style.actions';
import {BehaviorSubject, Observable} from 'rxjs';
import {UserPreferencesService} from './user-preference.service';
import {ConfigService} from 'app/business/services/config.service';
import {MenuService} from 'app/business/services/menu.service';

declare const opfabStyle: any;

@Injectable({
    providedIn: 'root'
})
export class GlobalStyleService {
    private static style: string;

    private static nightMode: BehaviorSubject<boolean>;


    constructor(private store: Store<AppState>,
        private userPreferences: UserPreferencesService,
        private configService: ConfigService,
        private menuService: MenuService,) {
        opfabStyle.init();
    }

    public loadUserStyle() {
        const visibleCoreMenus = this.menuService.computeVisibleCoreMenusForCurrentUser();
        const nightDayMode = visibleCoreMenus.includes('nightdaymode');


        const settings = this.configService.getConfigValue('settings');
        if (!nightDayMode) {
            if (settings && settings.styleWhenNightDayModeDesactivated) {
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
        switch (style) {
            case 'DAY': {
                opfabStyle.setCss(opfabStyle.DAY_STYLE);
                break;
            }
            case 'NIGHT': {
                opfabStyle.setCss(opfabStyle.NIGHT_STYLE);
                break;
            }
            default:
                opfabStyle.setCss(opfabStyle.DAY_STYLE);
        }
        this.store.dispatch(new GlobalStyleUpdateAction({style: style}));
    }


    private loadNightModeFromUserPreferences() {
        GlobalStyleService.nightMode = new BehaviorSubject<boolean>(true);
        const nightMode = this.userPreferences.getPreference('opfab.nightMode');
        if (nightMode !== null && nightMode === 'false') {
            GlobalStyleService.nightMode.next(false);
            this.setStyle('DAY');
        } else {
            this.setStyle('NIGHT');
        }
    }

    public switchToNightMode() {
        this.setStyle('NIGHT');
        GlobalStyleService.nightMode.next(true);
        this.userPreferences.setPreference('opfab.nightMode', 'true');
    }

    public switchToDayMode() {
        this.setStyle('DAY');
        GlobalStyleService.nightMode.next(false);
        this.userPreferences.setPreference('opfab.nightMode', 'false');
    }

    public getNightMode(): Observable<boolean> {
        return GlobalStyleService.nightMode.asObservable();
    }

}
