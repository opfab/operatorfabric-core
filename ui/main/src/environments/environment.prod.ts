/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
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
        archives : '',
        processes: '/businessconfig/processes',
        processGroups: '/businessconfig/processgroups',
        config: '/config/web-ui.json',
        menuConfig: '/config/ui-menu.json',
        time: '/time'

    },
    paths: {
        i18n: '/ui/assets/i18n/'
    }
};
