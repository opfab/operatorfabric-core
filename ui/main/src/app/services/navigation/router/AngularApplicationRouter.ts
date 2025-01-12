/* Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
 *  See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from '@angular/core';
import {ApplicationRouter} from '@ofServices/navigation/router/ApplicationRouter';
import {NavigationEnd, NavigationStart, Router} from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AngularApplicationRouter extends ApplicationRouter {
    constructor(private readonly router: Router) {
        super();
    }

    public navigateTo(url: string, queryParams?: any) {
        if (queryParams) this.router.navigate([url], {queryParams: queryParams});
        else this.router.navigate([url]);
    }

    public getCurrentRoute(): string {
        return this.router.url;
    }

    public listenForNavigationStart(callback: (route: string) => void) {
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationStart) {
                callback(event.url);
            }
        });
    }

    public listenForNavigationEnd(callback: (route: string) => void) {
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                callback(event.url);
            }
        });
    }
}
