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
import {UserService} from 'app/business/services/users/user.service';
import {CoreMenuConfig, CustomMenu} from '@ofModel/menu.model';
import {PermissionEnum} from '@ofModel/permission.model';
import {LoggerService as logger} from "./logs/logger.service";

@Injectable({
    providedIn: 'root'
})
export class MenuService {

    private ADMIN_MENUS = ['admin', 'externaldevicesconfiguration', 'useractionlogs'];

    constructor(private configService: ConfigService,
                private userService: UserService,
                ) {
    }

    public getCurrentUserCustomMenus(menus: CustomMenu[]): CustomMenu[] {
        const filteredMenus = [];
        menus.forEach((m) => {
            const entries = m.entries.filter((e) => this.isMenuVisibleForUserGroups(e));
            if (entries.length > 0) {
                filteredMenus.push(new CustomMenu(m.id, m.label, entries));
            }
        });
        return filteredMenus;
    }

    public computeVisibleCoreMenusForCurrentUser(): string[] {
        return this.computeVisibleNavigationBarCoreMenusForCurrentUser()
            .concat(this.computeVisibleTopRightIconMenusForCurrentUser())
            .concat(this.computeVisibleTopRightMenusForCurrentUser());
    }

    public computeVisibleNavigationBarCoreMenusForCurrentUser(): string[] {
        const visibleCoreMenus: string[] = [];
        const navigationBar = this.configService.getNavigationBar();

        if (navigationBar) {
            navigationBar.forEach((menuConfig: any) => {
                if (menuConfig.opfabCoreMenuId) {
                    if (this.isMenuVisibleForUserGroups(menuConfig)) {
                        visibleCoreMenus.push(menuConfig.opfabCoreMenuId);
                    }
                }
            });
        } else {
            logger.error('No navigationBar property set in ui-menu.json');
            return [];
        }
        return visibleCoreMenus;
    }

    public computeVisibleTopRightIconMenusForCurrentUser(): string[] {
        const topRightIconMenus = this.configService.getTopRightIconMenus();

        if (topRightIconMenus) {
            return topRightIconMenus
                .filter((coreMenuConfig: CoreMenuConfig) => {
                    return coreMenuConfig.visible && this.isMenuVisibleForUserGroups(coreMenuConfig);
                })
                .map((coreMenuConfig: CoreMenuConfig) => coreMenuConfig.opfabCoreMenuId);
        } else {
            logger.error('No topRightIconMenus property set in ui-menu.json');
            return [];
        }
    }

    public computeVisibleTopRightMenusForCurrentUser(): string[] {
        const topRightMenus = this.configService.getTopRightMenus();

        if (topRightMenus) {
            return topRightMenus
                .filter((coreMenuConfig: CoreMenuConfig) => {
                    return coreMenuConfig.visible && this.isMenuVisibleForUserGroups(coreMenuConfig);
                })
                .map((coreMenuConfig: CoreMenuConfig) => coreMenuConfig.opfabCoreMenuId);
        } else {
            logger.error('No topRightMenus property set in ui-menu.json');
            return [];
        }
    }

    public isMenuVisibleForUserGroups(menuConfig: any): boolean {
        if (menuConfig.opfabCoreMenuId) {
            if (this.ADMIN_MENUS.includes(menuConfig.opfabCoreMenuId) && !this.userService.hasCurrentUserAnyPermission([PermissionEnum.ADMIN]))
                return false;
        } else {
            if (this.ADMIN_MENUS.includes(menuConfig.id) && !this.userService.hasCurrentUserAnyPermission([PermissionEnum.ADMIN]))
                return false;
        }

        return (!menuConfig.showOnlyForGroups || menuConfig.showOnlyForGroups.length === 0) ||
            (menuConfig.showOnlyForGroups && this.userService.isCurrentUserInAnyGroup(menuConfig.showOnlyForGroups));
    }
}
