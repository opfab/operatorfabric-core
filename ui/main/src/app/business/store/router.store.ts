/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from '@angular/core';
import {ReplaySubject, Observable} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class RouterStore {
    private currentRouteEvent = new ReplaySubject<string>(1);
    private currentRoute = 'feed';

    public getCurrentRoute() {
        return this.currentRoute;
    }

    public getCurrentRouteEvent(): Observable<string> {
        return this.currentRouteEvent.asObservable();
    }

    public setCurrentRoute(route: string) {
        if (this.isRouteUrlAfterImplicitAuth(route)) this.currentRoute ='/feed'
        else this.currentRoute = route;
        this.currentRouteEvent.next(route);
    }

    private isRouteUrlAfterImplicitAuth(route: string): boolean {
        return route.startsWith('state');
    }
}
