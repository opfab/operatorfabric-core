/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from '@angular/core';
import {filter, map, mergeMap, mergeWith} from 'rxjs/operators';
import * as _ from 'lodash-es';
import {Observable, of, Subject, throwError} from 'rxjs';
import {CoreMenuConfig, Locale, Menu, UIMenuFile} from '@ofModel/menu.model';
import {ConfigServer} from './config.server';
@Injectable({
    providedIn: 'root'
})
export class ConfigService {
    private config;
    private customMenus: Menu[] = [];
    private coreMenuConfigurations: CoreMenuConfig[] = [];

    private configChangeEvent =  new Subject<any>();
    private settingsOverrideEvent = new Subject<any>();

    constructor(private configServer: ConfigServer) {
        this.customMenus = [];
    }

    public loadWebUIConfiguration(): Observable<any> {
        return this.configServer.getWebUiConfiguration().pipe(( map((config) => {this.config = config; return config})));
    }

    public overrideConfigSettingsWithUserSettings(settings: any) {
        const newConfig = {...this.config};
        newConfig.settings = {...this.config.settings, ...settings};
        this.config = newConfig;
        this.settingsOverrideEvent.next(null);
    }

    public getConfigValue(path: string, fallback: any = null) : any {
        return _.get(this.config, path, fallback);
    }

    public setConfigValue(path: string, value :any) {
        _.set(this.config,path,value);
        this.configChangeEvent.next({path:path , value:value});
    }

    public getConfigValueAsObservable(path: string, fallback: any = null):Observable<any> {
        return of(this.getConfigValue(path,fallback)).pipe(mergeWith (
            this.settingsOverrideEvent.asObservable().pipe(map ( () => this.getConfigValue(path,fallback) )),
            this.configChangeEvent.asObservable().pipe(
                filter(config => config.path === path),
                map( (config) => {
                    return config.value
                }))
            ));
    }

    /* Configuration for core menus */

    public loadCoreMenuConfigurations(): Observable<CoreMenuConfig[]> {
        return this.configServer.getMenuConfiguration()
            .pipe(map((config) => {
                this.coreMenuConfigurations = config.coreMenusConfiguration;
                this.processMenuConfig(config);
                return config.coreMenuConfiguration;
            }));
    }

    public getMenus(): Menu[] {
        return this.customMenus;
    }

    public getCoreMenuConfiguration(): CoreMenuConfig[] {
        return this.coreMenuConfigurations;
    }

    /* Configuration for custom menus */

    public fetchMenuTranslations(): Observable<Locale[]> {
        return this.configServer.getMenuConfiguration().pipe(map((config) => config.locales));
    }

    public computeMenu(): Observable<Menu[]> {
        return this.configServer.getMenuConfiguration()
            .pipe(map((config) => this.processMenuConfig(config)));
    }

    public queryMenuEntryURL(id: string, menuEntryId: string): Observable<string> {
        if (this.customMenus.length === 0) {
            return this.computeMenu().pipe(mergeMap((menus) => this.getMenuEntryURL(menus, id, menuEntryId)));
        } else {
            return this.getMenuEntryURL(this.customMenus, id, menuEntryId);
        }
    }

    private getMenuEntryURL(menus: Menu[], id: string, menuEntryId: string): Observable<string> {
        const menu = menus.find((m) => m.id === id);
        if (menu) {
            const entry = menu.entries.filter((e) => e.id === menuEntryId);
            if (entry.length === 1) {
                return of(entry[0].url);
            } else {
                return throwError(() => new Error('No such menu entry.'));
            }
        } else {
            return throwError(() => new Error('No such menu entry.'));
        }
    }

    private processMenuConfig(config: UIMenuFile): Menu[] {
        this.customMenus = [];
        return config.menus
            .map((menu) => new Menu(menu.id, menu.label, menu.entries))
            .reduce((menus: Menu[], menu: Menu) => {
                this.customMenus.push(menu);
                return this.customMenus;
            }, []);
    }
}
