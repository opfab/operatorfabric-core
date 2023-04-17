/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

export const environment = {
    production: true,
    urls: {
        authentication: '/ui/',
        auth: '/auth',
        cards: '/cards',
        cardspub: '/cardspub',
        users: '/users',
        groups: '/users/groups',
        entities: '/users/entities',
        perimeters: '/users/perimeters',
        archives: '',
        processes: '/businessconfig/processes',
        businessData: '/businessconfig/businessData',
        processGroups: '/businessconfig/processgroups',
        realTimeScreens: '/businessconfig/realtimescreens',
        monitoringConfig: '/businessconfig/monitoring',
        config: '/config/web-ui.json',
        menuConfig: '/config/ui-menu.json',
        externalDevices: '/externaldevices',
        remoteLogs: '/cards/logs',
        userActionLogs: '/users/userActionLogs'
    },
    paths: {
        i18n: '/ui/assets/i18n/'
    }
};
