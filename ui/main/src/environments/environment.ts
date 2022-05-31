/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    production: false,
    urls: {
        authentication: '',
        auth: 'http://localhost:2002/auth',
        cards: 'http://localhost:2002/cards',
        cardspub: 'http://localhost:2002/cardspub',
        users: 'http://localhost:2002/users',
        groups: 'http://localhost:2002/users/groups',
        entities: 'http://localhost:2002/users/entities',
        perimeters: 'http://localhost:2002/users/perimeters',
        archives: '',
        processes: 'http://localhost:2002/businessconfig/processes',
        processGroups: 'http://localhost:2002/businessconfig/processgroups',
        realTimeScreens: 'http://localhost:2002/businessconfig/realtimescreens',
        monitoringConfig: 'http://localhost:2002/businessconfig/monitoring',
        config: 'http://localhost:2002/config/web-ui.json',
        menuConfig: 'http://localhost:2002/config/ui-menu.json',
        externalDevices: 'http://localhost:2002/externaldevices',
        remoteLogs: 'http://localhost:2002/cards/logs'
    },
    paths: {
        i18n: '/assets/i18n/'
    }
};

/*
 * In development mode, to ignore zone related message stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw message
 */
// import 'zone.js/plugins/zone-message';  // Included with Angular CLI.
