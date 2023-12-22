/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ConfigService} from 'app/business/services/config.service';
import {UserService} from 'app/business/services/users/user.service';
import {CoreMenuConfig, CustomMenu} from '@ofModel/menu.model';
import {PermissionEnum} from '@ofModel/permission.model';
import {LoggerService as logger} from './logs/logger.service';

export class MenuService {
    private static ADMIN_MENUS = ['admin', 'externaldevicesconfiguration', 'useractionlogs'];


    public static getCurrentUserCustomMenus(menus: CustomMenu[]): CustomMenu[] {
        const filteredMenus = [];
        menus.forEach((m) => {
            const entries = m.entries.filter((e) => MenuService.isMenuVisibleForUserGroups(e));
            if (entries.length > 0) {
                filteredMenus.push(new CustomMenu(m.id, m.label, entries));
            }
        });
        return filteredMenus;
    }

    public static computeVisibleCoreMenusForCurrentUser(): string[] {
        return MenuService.computeVisibleNavigationBarCoreMenusForCurrentUser()
            .concat(MenuService.computeVisibleTopRightIconMenusForCurrentUser())
            .concat(MenuService.computeVisibleTopRightMenusForCurrentUser());
    }

    public static computeVisibleNavigationBarCoreMenusForCurrentUser(): string[] {
        const visibleCoreMenus: string[] = [];
        const navigationBar = ConfigService.getNavigationBar();

        if (navigationBar) {
            navigationBar.forEach((menuConfig: any) => {
                if (menuConfig.opfabCoreMenuId) {
                    if (MenuService.isMenuVisibleForUserGroups(menuConfig)) {
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

    public static computeVisibleTopRightIconMenusForCurrentUser(): string[] {
        const topRightIconMenus = ConfigService.getTopRightIconMenus();

        if (topRightIconMenus) {
            return topRightIconMenus
                .filter((coreMenuConfig: CoreMenuConfig) => {
                    return coreMenuConfig.visible && MenuService.isMenuVisibleForUserGroups(coreMenuConfig);
                })
                .map((coreMenuConfig: CoreMenuConfig) => coreMenuConfig.opfabCoreMenuId);
        } else {
            logger.error('No topRightIconMenus property set in ui-menu.json');
            return [];
        }
    }

    public static computeVisibleTopRightMenusForCurrentUser(): string[] {
        const topRightMenus = ConfigService.getTopRightMenus();

        if (topRightMenus) {
            return topRightMenus
                .filter((coreMenuConfig: CoreMenuConfig) => {
                    return coreMenuConfig.visible && MenuService.isMenuVisibleForUserGroups(coreMenuConfig);
                })
                .map((coreMenuConfig: CoreMenuConfig) => coreMenuConfig.opfabCoreMenuId);
        } else {
            logger.error('No topRightMenus property set in ui-menu.json');
            return [];
        }
    }

    public static isMenuVisibleForUserGroups(menuConfig: any): boolean {
        if (menuConfig.opfabCoreMenuId) {
            if (
                MenuService.ADMIN_MENUS.includes(menuConfig.opfabCoreMenuId) &&
                !UserService.hasCurrentUserAnyPermission([PermissionEnum.ADMIN])
            )
                return false;
        } else if (
            MenuService.ADMIN_MENUS.includes(menuConfig.id) &&
            !UserService.hasCurrentUserAnyPermission([PermissionEnum.ADMIN])
        )
            return false;

        return (
            !menuConfig.showOnlyForGroups ||
            menuConfig.showOnlyForGroups.length === 0 ||
            (menuConfig.showOnlyForGroups && UserService.isCurrentUserInAnyGroup(menuConfig.showOnlyForGroups))
        );
    }
}
