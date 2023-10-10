/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {filter, map, mergeMap, mergeWith} from 'rxjs/operators';
import * as _ from 'lodash-es';
import {Observable, of, Subject, throwError} from 'rxjs';
import {CoreMenuConfig, Locale, CustomMenu, UIMenuFile} from '@ofModel/menu.model';
import {ConfigServer} from '../server/config.server';

export class ConfigService {
    private static configServer: ConfigServer;
    private static config;
    private static customMenus: CustomMenu[] = [];

    private static navigationBar: (CoreMenuConfig | CustomMenu)[];
    private static topRightIconMenus: CoreMenuConfig[];
    private static topRightMenus: CoreMenuConfig[];
    private static showDropdownMenuEvenIfOnlyOneEntry = false;

    private static configChangeEvent = new Subject<any>();
    private static settingsOverrideEvent = new Subject<any>();

    public static reset() {
        ConfigService.customMenus = [];
        ConfigService.navigationBar = null;
        ConfigService.topRightIconMenus = null;
        ConfigService.topRightMenus = null;
        ConfigService.config = null;
    }

    public static setConfigServer(configServer: ConfigServer) {
        this.configServer = configServer;
    }

    public static loadWebUIConfiguration(): Observable<any> {
        return this.configServer.getWebUiConfiguration().pipe(
            map((serverResponse) => {
                this.config = serverResponse.data;
                return this.config;
            })
        );
    }

    public static overrideConfigSettingsWithUserSettings(settings: any) {
        const newConfig = {...this.config};
        newConfig.settings = {...this.config.settings, ...settings};
        this.config = newConfig;
        this.settingsOverrideEvent.next(null);
    }

    public static getConfigValue(path: string, fallback: any = null): any {
        return _.get(this.config, path, fallback);
    }

    public static setConfigValue(path: string, value: any) {
        _.set(this.config, path, value);
        this.configChangeEvent.next({path: path, value: value});
    }

    public static getConfigValueAsObservable(path: string, fallback: any = null): Observable<any> {
        return of(this.getConfigValue(path, fallback)).pipe(
            mergeWith(
                this.settingsOverrideEvent.asObservable().pipe(map(() => this.getConfigValue(path, fallback))),
                this.configChangeEvent.asObservable().pipe(
                    filter((config) => config.path === path),
                    map((config) => {
                        return config.value;
                    })
                )
            )
        );
    }

    public static loadUiMenuConfig(): Observable<(CoreMenuConfig | CustomMenu)[]> {
        return this.configServer.getMenuConfiguration().pipe(
            map((serverResponse) => {
                this.navigationBar = serverResponse.data.navigationBar;
                this.topRightIconMenus = serverResponse.data.topRightIconMenus;
                this.topRightMenus = serverResponse.data.topRightMenus;

                if (serverResponse.data.showDropdownMenuEvenIfOnlyOneEntry !== undefined) {
                    this.showDropdownMenuEvenIfOnlyOneEntry = serverResponse.data.showDropdownMenuEvenIfOnlyOneEntry;
                }
                this.computeCustomMenuList(serverResponse.data);
                return this.navigationBar;
            })
        );
    }

    public static getShowDropdownMenuEvenIfOnlyOneEntry(): boolean {
        return this.showDropdownMenuEvenIfOnlyOneEntry;
    }

    public static getMenus(): CustomMenu[] {
        return this.customMenus;
    }

    public static getNavigationBar(): any[] {
        return this.navigationBar;
    }

    public static getTopRightIconMenus(): CoreMenuConfig[] {
        return this.topRightIconMenus;
    }

    public static getTopRightMenus(): CoreMenuConfig[] {
        return this.topRightMenus;
    }

    /* Configuration for custom menus */

    public static fetchMenuTranslations(): Observable<Locale[]> {
        return ConfigService.configServer.getMenuConfiguration().pipe(map((serverResponse) => serverResponse.data?.locales));
    }

    public static computeMenu(): Observable<CustomMenu[]> {
        return ConfigService.configServer
            .getMenuConfiguration()
            .pipe(map((serverResponse) => this.computeCustomMenuList(serverResponse.data)));
    }

    public static queryMenuEntryURL(id: string, menuEntryId: string): Observable<string> {
        if (ConfigService.customMenus.length === 0) {
            return this.computeMenu().pipe(mergeMap((menus) => this.getMenuEntryURL(menus, id, menuEntryId)));
        } else {
            return this.getMenuEntryURL(ConfigService.customMenus, id, menuEntryId);
        }
    }

    private static getMenuEntryURL(menus: CustomMenu[], id: string, menuEntryId: string): Observable<string> {
        const menu = menus.find((m) => m.id === id);
        if (menu) {
            const entry: any = menu.entries.filter((e: any) => {
                if (e.customMenuId) {
                    return e.customMenuId === menuEntryId;
                }
                return false;
            });

            if (entry.length === 1) {
                return of(entry[0].url);
            } else {
                return throwError(() => new Error('No such menu entry.'));
            }
        } else {
            return throwError(() => new Error('No such menu entry.'));
        }
    }

    private static computeCustomMenuList(config: UIMenuFile): CustomMenu[] {
        this.customMenus = [];

        config.navigationBar.forEach((menuConfig: any) => {
            if (menuConfig.id)
                this.customMenus.push(new CustomMenu(menuConfig.id, menuConfig.label, menuConfig.entries));
        });
        return this.customMenus;
    }
}
