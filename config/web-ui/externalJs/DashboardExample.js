/* Copyright (c) 2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

{
    console.log(new Date().toISOString(), 'INFO Dashboard example loaded');

    const dashboardExample = {
        "id": "dashboard",
        "name": "Dashboard",
        "type": "DASHBOARD",
        "initialBusinessPeriod": "FROM_TODAY_TO_YEAR_END"
    };

    const dashboardExample2 = {
        "id": "dashboard2",
        "name": "Dashboard 2",
        "type": "DASHBOARD",
        processList: ["defaultProcess"],
        "customTiles": [
            {
                "title": "My custom tile 1",
                "cells": [
                    {
                        "label": "Custom screen",
                        "customScreenId": "testId"
                    },
                    {
                        "label": "Custom screen 2",
                        "customScreenId": "testId2"
                    }
                ]
            },
            {
                "title": "My custom tile 2",
                "cells": [
                    {
                        "label": "Custom screen",
                        "customScreenId": "testId"
                    }
                ]
            }
        ]
    };

    opfab.businessconfig.registerCustomScreen(dashboardExample);
    opfab.businessconfig.registerCustomScreen(dashboardExample2);
}