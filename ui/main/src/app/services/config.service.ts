/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {Injectable} from '@angular/core';
import {map, mergeMap} from 'rxjs/operators';
import * as _ from 'lodash-es';
import {Observable, of, throwError} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {environment} from '@env/environment';
import {Locale, Menu, MenuConfig} from '@ofModel/menu.model';

@Injectable()
export class ConfigService {
    private configUrl: string;
    private config;
    private customMenus: Menu[] = [];

    constructor(private httpClient: HttpClient,
                private store: Store<AppState>) {
        this.configUrl = `${environment.urls.config}`;
        this.customMenus = [];
    }

    fetchConfiguration(): Observable<any> {
        return this.httpClient.get(`${this.configUrl}`).pipe(
            map(
            config => this.config = config));
    }

    getConfigValue(path:string, fallback: any = null)
    {
        const result = _.get(this.config, path, null);
        if (!result && fallback) {
            return fallback;
        }
        return result;
    }

    loadMenuTranslations(): Observable<Locale[]> {
        return this.httpClient.get<MenuConfig>(`${environment.urls.menuConfig}`).pipe(
            map(config => config.locales)
        );
    }

    computeMenu(): Observable<Menu[]> {
        return this.httpClient.get<MenuConfig>(`${environment.urls.menuConfig}`).pipe(
            map(config => this.processMenuConfig(config)
            )
        );
    }

    queryMenuEntryURL(id: string, menuEntryId: string): Observable<string> {
        if (this.customMenus.length === 0) {
            return this.computeMenu().pipe(mergeMap(menus => this.getMenuEntryURL(menus, id, menuEntryId)));
        } else {
            return this.getMenuEntryURL(this.customMenus, id, menuEntryId);
        }

    }

    private getMenuEntryURL(menus: Menu[], id: string, menuEntryId: string): Observable<string> {
        const menu = menus.find(m => m.id === id);
        if (menu) {
            const entry = menu.entries.filter(e => e.id === menuEntryId);
            if (entry.length === 1) {
                return of(entry[0].url);
            } else {
                return throwError(new Error('No such menu entry.'));
            }
        } else {
            return throwError(new Error('No such menu entry.'));
        }
    }

    private processMenuConfig(config: MenuConfig): Menu[]{
        this.customMenus = [];
        return config.menus.map(menu => new Menu(menu.id, menu.label, menu.entries)).reduce((menus: Menu[], menu: Menu) => {         
            this.customMenus.push(menu);
            return this.customMenus;
        }, []);
    }
}
