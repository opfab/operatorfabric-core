/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, OnDestroy, OnInit} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {LightCard} from '@ofModel/light-card.model';
import {delay, map} from 'rxjs/operators';
import {FilteredLightCardsStore} from 'app/business/store/lightcards/lightcards-feed-filter-store';
import {ConfigService} from 'app/business/services/config.service';
import {ActivatedRoute, Router} from '@angular/router';
import {UserService} from 'app/business/services/users/user.service';
import {SelectedCardService} from 'app/business/services/card/selectedCard.service';
import {OpfabStore} from 'app/business/store/opfabStore';
import {LoggerService} from 'app/business/services/logs/logger.service';

@Component({
    selector: 'of-cards',
    templateUrl: './feed.component.html',
    styleUrls: ['./feed.component.scss']
})
export class FeedComponent implements OnInit, OnDestroy {
    processFilter: string;
    stateFilter: string;

    lightCards$: Observable<LightCard[]>;
    selection$: Observable<string>;
    totalNumberOfLightsCards = 0;
    maxNbOfCardsToDisplay = 100;
    private ngUnsubscribe$ = new Subject<void>();
    private hallwayMode = false;
    filtersVisible = false;
    private filteredLightCardStore: FilteredLightCardsStore;

    constructor(
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.route.queryParams.subscribe((params) => {
            this.processFilter = params.processFilter;
            this.stateFilter = params.stateFilter;
        });
        this.filteredLightCardStore = OpfabStore.getFilteredLightCardStore();
        this.maxNbOfCardsToDisplay = ConfigService.getConfigValue('feed.card.maxNbOfCardsToDisplay', 100);
        this.configureExperimentalHallwayMode();
    }

    configureExperimentalHallwayMode() {
        const usersInHallwayMode = ConfigService.getConfigValue('settings.usersInHallwayMode', null);
        if (usersInHallwayMode?.includes(UserService.getCurrentUserWithPerimeters().userData.login)) {
            this.hallwayMode = true;
            LoggerService.info('User in hallwayMode');
        }
    }

    ngOnInit() {
        this.selection$ = SelectedCardService.getSelectCardIdChanges();

        this.lightCards$ = this.filteredLightCardStore.getFilteredAndSortedLightCards().pipe(
            delay(0), // Solve error: 'Expression has changed after it was checked' --> See https://blog.angular-university.io/angular-debugging/
            map((cards) => {
                this.totalNumberOfLightsCards = cards.length;
                // Experimental hallway feature
                if (cards.length && this.hallwayMode) this.router.navigate(['/feed', 'cards', cards[0].id]);
                return cards.slice(0, this.maxNbOfCardsToDisplay);
            })
        );
    }

    public enoughSpaceForTimeLine() {
        return window.innerWidth > 1000 && window.innerHeight > 700;
    }

    public enoughSpaceForCardDetail() {
        return window.innerWidth > 1000;
    }

    showFilters(visible: boolean) {
        this.filtersVisible = visible;
    }

    ngOnDestroy() {
        this.ngUnsubscribe$.next();
        this.ngUnsubscribe$.complete();
    }
}
