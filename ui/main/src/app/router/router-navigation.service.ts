/* Copyright (c) 2023-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from '@angular/core';
import {NavigationEnd, NavigationStart, Router} from '@angular/router';
import {LogOption, LoggerService as logger} from 'app/business/services/logs/logger.service';
import {SelectedCardStore} from 'app/business/store/selectedCard.store';
import {filter} from 'rxjs';
import {RouterStore} from 'app/business/store/router.store';

@Injectable({
    providedIn: 'root'
})
export class RouterNavigationService {
    constructor(private router: Router) {
        this.logNavigation();
        this.updateRouterStore();
        this.clearSelectedCardWhenUserNavigateAwayFromTheFeed();
        this.loadCardWhenUserNavigateToFeedCardDetail();
    }

    logNavigation() {
        this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
            logger.info('Navigate to ' + event.url, LogOption.REMOTE);
        });
    }

    updateRouterStore() {
        // Store the current route as soon as the navigation starts and not at the end
        // otherwise it may cause issues with lazy loading when accessing a module direclty
        // via the url (e.g. /#/archives), see issue #7632
        this.router.events
            .pipe(filter((event) => event instanceof NavigationStart))
            .subscribe((event: NavigationStart) => {
                RouterStore.setCurrentRoute(event.url);
            });
    }

    clearSelectedCardWhenUserNavigateAwayFromTheFeed() {
        this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
            if (!event.url.startsWith('/feed/cards')) {
                SelectedCardStore.clearSelectedCardId();
            }
        });
    }

    loadCardWhenUserNavigateToFeedCardDetail() {
        this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
            if (event.url.startsWith('/feed/cards/')) {
                const cardId = event.url.split('cards/')[1];
                SelectedCardStore.setSelectedCardId(decodeURI(cardId));
            }
        });
    }
}
