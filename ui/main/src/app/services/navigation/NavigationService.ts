/* Copyright (c) 2024-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {SelectedCardService} from '@ofServices/selectedCard/SelectedCardService';
import {ApplicationRouter} from './router/ApplicationRouter';
import {LogOption, LoggerService as logger} from 'app/services/logs/LoggerService';
import {Observable, ReplaySubject} from 'rxjs';
export enum PageType {
    UNKNOWN,
    FEED,
    ARCHIVE,
    THIRDPARTY,
    SETTING,
    ABOUT,
    CALENDAR,
    MONITORING,
    USERCARD,
    DASHBOARD,
    CUSTOMSCREEN
}
export class NavigationService {
    private static router: ApplicationRouter;
    private static currentRoute: string;
    private static readonly currentRouteEvent: ReplaySubject<string> = new ReplaySubject<string>(1);
    private static readonly pageConf = new Map([
        ['feed', PageType.FEED],
        ['archives', PageType.ARCHIVE],
        ['businessconfigparty', PageType.THIRDPARTY],
        ['setting', PageType.SETTING],
        ['about', PageType.ABOUT],
        ['calendar', PageType.CALENDAR],
        ['monitoring', PageType.MONITORING],
        ['usercard', PageType.USERCARD],
        ['dashboard', PageType.DASHBOARD],
        ['customscreen', PageType.CUSTOMSCREEN]
    ]);

    public static setApplicationRouter(router: ApplicationRouter) {
        NavigationService.router = router;
        NavigationService.logNavigation();
        NavigationService.loadCardWhenUserNavigatesToFeedCardDetail();
        NavigationService.clearSelectedCardWhenUserNavigatesAwayFromTheFeed();
        NavigationService.listenForCurrentRouteUpdate();
    }

    private static logNavigation() {
        NavigationService.router.listenForNavigationStart((route: string) => {
            logger.info('Navigate to ' + route, LogOption.REMOTE);
        });
    }

    private static loadCardWhenUserNavigatesToFeedCardDetail() {
        NavigationService.router.listenForNavigationEnd((route: string) => {
            if (route.startsWith('/feed/cards/')) {
                const cardId = route.split('cards/')[1];
                SelectedCardService.setSelectedCardId(decodeURI(cardId));
            }
        });
    }

    private static clearSelectedCardWhenUserNavigatesAwayFromTheFeed() {
        NavigationService.router.listenForNavigationEnd((route: string) => {
            if (!route.startsWith('/feed/cards')) {
                SelectedCardService.clearSelectedCardId();
            }
        });
    }

    private static listenForCurrentRouteUpdate() {
        // Store the current route as soon as the navigation starts and not at the end
        // otherwise it may cause issues with lazy loading when accessing a module direclty
        // via the url (e.g. /#/archives), see issue #7632
        NavigationService.router.listenForNavigationStart((route: string) => {
            NavigationService.setCurrentRoute(route);
        });
    }

    private static setCurrentRoute(route: string) {
        NavigationService.currentRoute = route;
        NavigationService.currentRouteEvent.next(NavigationService.currentRoute);
    }

    public static navigateTo(url: string) {
        NavigationService.router.navigateTo(url);
    }

    public static navigateToCard(cardId: string) {
        NavigationService.navigateTo('/feed/cards/' + encodeURIComponent(cardId));
    }

    public static navigateToFeedWithProcessStateFilter(processFilter: string, stateFilter: string) {
        NavigationService.router.navigateTo('/feed', {processFilter: processFilter, stateFilter: stateFilter});
    }

    public static navigateToGeoMapLocation(cardId: string) {
        NavigationService.router.navigateTo('/feed', {zoomToLocation: cardId});
    }

    public static getCurrentRoute(): string {
        return NavigationService.currentRoute;
    }

    public static getCurrentRouteEvent(): Observable<string> {
        return NavigationService.currentRouteEvent.asObservable();
    }

    public static getCurrentPageType(): PageType {
        const pageName = NavigationService.getCurrentRoute().split('/')[1];
        const currentPageType = NavigationService.pageConf.get(pageName);
        return currentPageType || PageType.UNKNOWN;
    }

    public static redirectToBusinessMenu(menuId: string, urlExtension: string) {
        const urlSplit = document.location.href.split('#');
        // WARNING : HACK
        //
        // When user makes a reload (for example via F5) or use a bookmark link, the browser encodes what is after #
        // if user makes a second reload, the browser encodes again the encoded link
        // and after if user reload again, this time it is not encoded anymore by the browser
        // So it ends up with 3 possible links: a none encoded link, an encoded link or a twice encoding link
        // and we have no way to know which one it is when processing the url
        //
        // To solve the problem we encode two times the url before giving it to the browser
        // so we always have a unique case : a double encoded url
        let newUrl = urlSplit[0] + '#/businessconfigparty/' + encodeURIComponent(encodeURIComponent(menuId)) + '/';

        if (urlExtension) newUrl += encodeURIComponent(encodeURIComponent(urlExtension));
        document.location.href = newUrl;
    }
}
