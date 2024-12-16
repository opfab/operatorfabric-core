/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ConfigService} from 'app/services/config/ConfigService';
import {UserService} from 'app/business/services/users/user.service';
import {LoggerService as logger} from 'app/services/logs/LoggerService';

export class MenuService {
    public static queryMenuEntryURL(id: string): string {
        for (const menuConfig of ConfigService.getMenuConfig().navigationBar) {
            if (menuConfig.entries) {
                for (const entry of menuConfig.entries) {
                    if (entry.customMenuId === id) return entry.url;
                }
            } else if (menuConfig.customMenuId === id) return menuConfig.url;
        }
        return '';
    }

    public static isNightDayModeMenuVisible(): boolean {
        const topRightMenus = ConfigService.getMenuConfig().topRightMenus;
        if (topRightMenus) {
            for (const coreMenuConfig of topRightMenus) {
                if (coreMenuConfig.opfabCoreMenuId === 'nightdaymode') {
                    return coreMenuConfig.visible && MenuService.isMenuVisibleForUserGroups(coreMenuConfig);
                }
            }
        } else {
            logger.error('No topRightMenus property set in ui-menu.json');
        }
        return false;
    }

    private static isMenuVisibleForUserGroups(menuConfig: any): boolean {
        return (
            !menuConfig.showOnlyForGroups ||
            menuConfig.showOnlyForGroups.length === 0 ||
            (menuConfig.showOnlyForGroups && UserService.isCurrentUserInAnyGroup(menuConfig.showOnlyForGroups))
        );
    }
}
