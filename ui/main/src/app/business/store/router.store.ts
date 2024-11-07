/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {ReplaySubject, Observable} from 'rxjs';

export enum PageType {
    UNKNOWN,
    FEED,
    ARCHIVE,
    THIRPARTY,
    SETTING,
    ABOUT,
    CALENDAR,
    MONITORING,
    USERCARD,
    DASHBOARD
}
export class RouterStore {
    private static readonly pageConf = new Map([
        ['feed', PageType.FEED],
        ['archives', PageType.ARCHIVE],
        ['businessconfigparty', PageType.THIRPARTY],
        ['setting', PageType.SETTING],
        ['about', PageType.ABOUT],
        ['calendar', PageType.CALENDAR],
        ['monitoring', PageType.MONITORING],
        ['usercard', PageType.USERCARD],
        ['dashboard', PageType.DASHBOARD]
    ]);

    private static readonly currentRouteEvent = new ReplaySubject<string>(1);
    private static currentRoute = 'feed';

    public static getCurrentRoute() {
        return RouterStore.currentRoute;
    }

    public static getCurrentRouteEvent(): Observable<string> {
        return RouterStore.currentRouteEvent.asObservable();
    }

    public static setCurrentRoute(route: string) {
        if (RouterStore.isRouteUrlAfterImplicitAuth(route)) RouterStore.currentRoute = '/feed';
        else RouterStore.currentRoute = route;
        RouterStore.currentRouteEvent.next(route);
    }

    private static isRouteUrlAfterImplicitAuth(route: string): boolean {
        return route.startsWith('/state');
    }

    public static getCurrentPageType(): PageType {
        const pageName = RouterStore.getCurrentRoute().split('/')[1];
        const currentPageType = RouterStore.pageConf.get(pageName);
        return currentPageType ? currentPageType : PageType.UNKNOWN;
    }
}
