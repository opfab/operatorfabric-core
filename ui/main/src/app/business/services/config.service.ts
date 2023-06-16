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
import {CoreMenuConfig, Locale, CustomMenu, UIMenuFile} from '@ofModel/menu.model';
import {ConfigServer} from '../server/config.server';
@Injectable({
    providedIn: 'root'
})
export class ConfigService {
    private config;
    private customMenus: CustomMenu[] = [];

    private navigationBar: (CoreMenuConfig | CustomMenu)[];
    private topRightIconMenus: CoreMenuConfig[];
    private topRightMenus: CoreMenuConfig[];
    private showDropdownMenuEvenIfOnlyOneEntry = false;

    private configChangeEvent =  new Subject<any>();
    private settingsOverrideEvent = new Subject<any>();

    constructor(private configServer: ConfigServer) {
        this.customMenus = [];
    }

    public loadWebUIConfiguration(): Observable<any> {
        return this.configServer.getWebUiConfiguration().pipe(( map((serverResponse) => {this.config = serverResponse.data; return this.config})));
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

    public loadUiMenuConfig(): Observable<(CoreMenuConfig | CustomMenu)[]> {
        return this.configServer.getMenuConfiguration()
            .pipe(map((serverResponse) => {
                this.navigationBar = serverResponse.data.navigationBar;
                this.topRightIconMenus = serverResponse.data.topRightIconMenus;
                this.topRightMenus = serverResponse.data.topRightMenus;

                if (serverResponse.data.showDropdownMenuEvenIfOnlyOneEntry !== undefined) {
                    this.showDropdownMenuEvenIfOnlyOneEntry = serverResponse.data.showDropdownMenuEvenIfOnlyOneEntry;
                }
                this.computeCustomMenuList(serverResponse.data);
                return this.navigationBar;
            }));
    }

    public getShowDropdownMenuEvenIfOnlyOneEntry(): boolean {
        return this.showDropdownMenuEvenIfOnlyOneEntry;
    }

    public getMenus(): CustomMenu[] {
        return this.customMenus;
    }

    public getNavigationBar(): any[] {
        return this.navigationBar;
    }

    public getTopRightIconMenus(): CoreMenuConfig[] {
        return this.topRightIconMenus;
    }

    public getTopRightMenus(): CoreMenuConfig[] {
        return this.topRightMenus;
    }

    /* Configuration for custom menus */

    public fetchMenuTranslations(): Observable<Locale[]> {
        return this.configServer.getMenuConfiguration().pipe(map((serverResponse) => serverResponse.data?.locales));
    }

    public computeMenu(): Observable<CustomMenu[]> {
        return this.configServer.getMenuConfiguration()
            .pipe(map((serverResponse) => this.computeCustomMenuList(serverResponse.data)));
    }

    public queryMenuEntryURL(id: string, menuEntryId: string): Observable<string> {
        if (this.customMenus.length === 0) {
            return this.computeMenu().pipe(mergeMap((menus) => this.getMenuEntryURL(menus, id, menuEntryId)));
        } else {
            return this.getMenuEntryURL(this.customMenus, id, menuEntryId);
        }
    }

    private getMenuEntryURL(menus: CustomMenu[], id: string, menuEntryId: string): Observable<string> {
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

    private computeCustomMenuList(config: UIMenuFile): CustomMenu[] {
        this.customMenus = [];

        config.navigationBar.forEach((menuConfig: any) => {
            if (menuConfig.id)
                this.customMenus.push(new CustomMenu(menuConfig.id, menuConfig.label, menuConfig.entries));
        });
        return this.customMenus;
    }
}
