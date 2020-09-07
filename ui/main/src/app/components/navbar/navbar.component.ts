/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {Component, OnInit} from '@angular/core';
import {navigationRoutes} from '../../app-routing.module';
import {Store} from '@ngrx/store';
import {TryToLogOut} from '@ofActions/authentication.actions';
import {AppState} from '@ofStore/index';
import {selectCurrentUrl} from '@ofSelectors/router.selectors';
import {LoadMenu} from '@ofActions/menu.actions';
import {selectMenuStateMenu} from '@ofSelectors/menu.selectors';
import {BehaviorSubject, Observable} from 'rxjs';
import {Menu} from '@ofModel/processes.model';
import {tap} from 'rxjs/operators';
import * as _ from 'lodash';
import {GlobalStyleService} from '@ofServices/global-style.service';
import {Route} from '@angular/router';
import {ConfigService} from '@ofServices/config.service';
import {QueryAllProcesses} from '@ofActions/process.action';
import {QueryAllEntities} from "@ofActions/user.actions";

@Component({
    selector: 'of-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
    private static nightMode: BehaviorSubject<boolean>;

    navbarCollapsed = true;
    navigationRoutes: Route[];
    currentPath: string[];
    private _businessconfigMenus: Observable<Menu[]>;
    expandedMenu: boolean[] = [];
    expandedUserMenu = false;

    customLogo: string;
    height: number;
    width: number;
    limitSize: boolean;

    nightDayMode = false;

    constructor(private store: Store<AppState>, private globalStyleService: GlobalStyleService, private  configService: ConfigService) {
    }

    ngOnInit() {
        this.store.select(selectCurrentUrl).subscribe(url => {
            if (url) {
                this.currentPath = url.split('/');
            }
        });
        this._businessconfigMenus = this.store.select(selectMenuStateMenu)
            .pipe(tap(menus => {
                this.expandedMenu = new Array<boolean>(menus.length);
                _.fill(this.expandedMenu, false);
            }));
        this.store.dispatch(new LoadMenu());
        this.store.dispatch(new QueryAllProcesses());
        this.store.dispatch(new QueryAllEntities());


        const logo = this.configService.getConfigValue('logo.base64');
        if (!!logo) {
            this.customLogo = `data:image/svg+xml;base64,${logo}`;
        }
        const logo_height = this.configService.getConfigValue('logo.height');
        if (!!logo_height) {
            this.height = logo_height;
        }

        const logo_width = this.configService.getConfigValue('logo.width');
        if (!!logo_width) {
            this.width = logo_width;
        }

        const logo_limitSize = this.configService.getConfigValue('logo.limitSize');
        this.limitSize = (logo_limitSize === true);


        const settings = this.configService.getConfigValue('settings');
        if (settings) {
            if (settings.nightDayMode) {
                this.nightDayMode = <boolean>settings.nightDayMode;
            }
            if (!this.nightDayMode) {
                if (settings.styleWhenNightDayModeDesactivated) {
                    this.globalStyleService.setStyle(settings.styleWhenNightDayModeDesactivated);
                }
            } else {
                this.loadNightModeFromLocalStorage();
            }
        }

        const hiddenMenus = this.configService.getConfigValue('navbar.hidden', []);
        this.navigationRoutes = navigationRoutes.filter(route => !hiddenMenus.includes(route.path));
    }

    logOut() {
        this.store.dispatch(new TryToLogOut());
    }

    get businessconfigMenus() {
        return this._businessconfigMenus;
    }

    toggleMenu(index: number) {
        this.expandedMenu[index] = !this.expandedMenu[index];
        if (this.expandedMenu[index]) {
            setTimeout(() => this.expandedMenu[index] = false, 5000);
        }
    }

    toggleUserMenu() {
        this.expandedUserMenu = !this.expandedUserMenu;
        if (this.expandedUserMenu) {
            setTimeout(() => this.expandedUserMenu = false, 5000);
        }
    }

    private loadNightModeFromLocalStorage() {
        NavbarComponent.nightMode = new BehaviorSubject<boolean>(true);
        const nightMode = localStorage.getItem('opfab.nightMode');
        if ((nightMode !== null) && (nightMode === 'false')) {
            NavbarComponent.nightMode.next(false);
            this.globalStyleService.setStyle('DAY');
        } else {
            this.globalStyleService.setStyle('NIGHT');
        }

    }

    switchToNightMode() {
        this.globalStyleService.setStyle('NIGHT');
        NavbarComponent.nightMode.next(true);
        localStorage.setItem('opfab.nightMode', 'true');
    }

    switchToDayMode() {
        this.globalStyleService.setStyle('DAY');
        NavbarComponent.nightMode.next(false);
        localStorage.setItem('opfab.nightMode', 'false');

    }

    getNightMode(): Observable<boolean> {
        return NavbarComponent.nightMode.asObservable();
    }
}



