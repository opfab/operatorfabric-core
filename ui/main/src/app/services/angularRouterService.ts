/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 *  See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from '@angular/core';
import {ApplicationRouter} from 'app/business/server/application-router';
import {Router} from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AngularRouterService extends ApplicationRouter {
    constructor(private readonly router: Router) {
        super();
    }

    public navigateTo(url: string) {
        this.router.navigate([url]);
    }

    public getCurrentRoute(): string {
        return this.router.url;
    }
}
