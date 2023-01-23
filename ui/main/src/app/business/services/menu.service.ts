/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from '@angular/core';
import {ConfigService} from 'app/business/services/config.service';
import {UserService} from '../../services/user.service';
import {CoreMenuConfig, Menu, MenuEntry} from '@ofModel/menu.model';
import {PermissionEnum} from '@ofModel/permission.model';

@Injectable({
    providedIn: 'root'
})
export class MenuService {

    private ADMIN_MENUS = ['admin', 'externaldevicesconfiguration', 'useractionlogs'];

    constructor(private configService: ConfigService, private userService: UserService) {
    }

    public getCurrentUserCustomMenus(menus: Menu[]): Menu[] {
        const filteredMenus = [];
        menus.forEach((m) => {
            const entries = m.entries.filter((e) => this.isMenuVisibleForUserGroups(e));
            if (entries.length > 0) {
                filteredMenus.push(new Menu(m.id, m.label, entries));
            }
        });
        return filteredMenus;
    }

    public computeVisibleCoreMenusForCurrentUser(): string[] {
        const coreMenuConfiguration = this.configService.getCoreMenuConfiguration();

        if (coreMenuConfiguration) {
            return coreMenuConfiguration
                .filter((coreMenuConfig: CoreMenuConfig) => {
                    return coreMenuConfig.visible && this.isMenuVisibleForUserGroups(coreMenuConfig);
                })
                .map((coreMenuConfig: CoreMenuConfig) => coreMenuConfig.id);
        } else {
            console.log('No coreMenusConfiguration property set in ui-menu.json');
            return [];
        }
    }

    public isMenuVisibleForUserGroups(menuConfig: CoreMenuConfig | MenuEntry): boolean {
        if (this.ADMIN_MENUS.includes(menuConfig.id) && !this.userService.hasCurrentUserAnyPermission([PermissionEnum.ADMIN]))
            return false;

        return (!menuConfig.showOnlyForGroups || menuConfig.showOnlyForGroups.length === 0) ||
            (menuConfig.showOnlyForGroups && this.userService.isCurrentUserInAnyGroup(menuConfig.showOnlyForGroups));
    }
}
