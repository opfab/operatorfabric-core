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
import {buildConfigSelector} from '@ofStore/selectors/config.selectors';
import {GlobalStyleService} from '@ofServices/global-style.service';
import {Route} from '@angular/router';

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

    constructor(private store: Store<AppState>, private globalStyleService: GlobalStyleService) {
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

        this.store.select(buildConfigSelector('logo.base64')).subscribe(
            data => {
                if (data) {
                    this.customLogo = `data:image/svg+xml;base64,${data}`;
                }
            }
        );

        this.store.select(buildConfigSelector('logo.height')).subscribe(
            height => {
                if (height) {
                    this.height = height;
                }
            }
        );

        this.store.select(buildConfigSelector('logo.width')).subscribe(
            width => {
                if (width) {
                    this.width = width;
                }
            }
        );
        this.store.select(buildConfigSelector('logo.limitSize')).subscribe(
            (limitSize: boolean) => {
                // BE CAREFUL, as a boolean it has to be test with undefined value to know if it has been set.
                if (limitSize !== undefined && typeof (limitSize) === 'boolean') {
                    this.limitSize = limitSize;
                }
            }
        );
        this.store.select(buildConfigSelector('settings')).subscribe(
            (settings) => {
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
        );

        this.store.select(buildConfigSelector('navbar.hidden')).subscribe(
            (hiddenMenus: string[]) => {
                if (!!hiddenMenus) {
                    this.navigationRoutes = navigationRoutes.filter(route => !hiddenMenus.includes(route.path));
                }
            }
        );
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



