/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {LogOption, OpfabLoggerService} from 'app/business/services/logs/opfab-logger.service';
import {SelectedCardService} from 'app/business/services/card/selectedCard.service';
import {filter} from 'rxjs';
import {RouterStore} from 'app/business/store/router.store';

@Injectable({
    providedIn: 'root'
})
export class RouterNavigationService {
    constructor(
        private router: Router,
        private logger: OpfabLoggerService,
        private selectedCardService: SelectedCardService
    ) {
        this.logNavigation();
        this.updateRouterStore();
        this.clearSelectedCardWhenUserNavigateAwayFromTheFeed();
        this.loadCardWhenUserNavigateToFeedCardDetail();
    }

    logNavigation() {
        this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
            this.logger.info('Navigate to ' + event.url, LogOption.REMOTE);
        });
    }

    updateRouterStore() {
        this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
            RouterStore.getInstance().setCurrentRoute(event.url);
        });
    }

    clearSelectedCardWhenUserNavigateAwayFromTheFeed() {
        this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
            if (!event.url.startsWith('/feed/cards')) {
                this.selectedCardService.clearSelectedCardId();
            }
        });
    }

    loadCardWhenUserNavigateToFeedCardDetail() {
        this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
            if (event.url.startsWith('/feed/cards/')) {
                const cardId = event.url.split('cards/')[1];
                this.selectedCardService.setSelectedCardId(decodeURI(cardId));
            }
        });
    }
}
