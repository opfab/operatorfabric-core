/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ApplicationRouter} from "../server/application-router";

export class RouterService {

    private static router: ApplicationRouter;

    public static setApplicationRouter(router: ApplicationRouter) {
        RouterService.router = router
    }

    public static navigateTo(url: string) {
        RouterService.router.navigateTo(url);
    }

}