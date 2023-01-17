/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import {Observable, Subject} from 'rxjs';
import {LightCard} from '@ofModel/light-card.model';
import * as feedSelectors from '@ofSelectors/feed.selectors';
import {delay, map,takeUntil} from 'rxjs/operators';
import * as moment from 'moment';
import {LightCardsFeedFilterService} from '@ofServices/lightcards/lightcards-feed-filter.service';
import {ConfigService} from 'app/business/services/config.service';
import {Router} from '@angular/router';
import {selectCurrentUrl} from '@ofStore/selectors/router.selectors';
import {UserService} from '@ofServices/user.service';

@Component({
    selector: 'of-cards',
    templateUrl: './feed.component.html',
    styleUrls: ['./feed.component.scss']
})
export class FeedComponent implements OnInit,OnDestroy {
    lightCards$: Observable<LightCard[]>;
    selection$: Observable<string>;
    totalNumberOfLightsCards = 0;
    maxNbOfCardsToDisplay = 100;
    private currentPath: string;
    private ngUnsubscribe$ = new Subject<void>();
    private hallwayMode = false;
    maxPinnedCards: number;

    constructor(
        private store: Store<AppState>,
        private lightCardsFeedFilterService: LightCardsFeedFilterService,
        private configService: ConfigService,
        private router: Router,
        private user : UserService
    ) {
        this.maxNbOfCardsToDisplay = this.configService.getConfigValue('feed.card.maxNbOfCardsToDisplay', 100);
        this.configureExperimentalHallwayMode();
    }

    configureExperimentalHallwayMode() {
        const usersInHallwayMode = this.configService.getConfigValue('settings.usersInHallwayMode',null);
        if ((!!usersInHallwayMode) && (usersInHallwayMode.includes(this.user.getCurrentUserWithPerimeters().userData.login))) {
            this.hallwayMode = true;
            console.log("User in hallwayMode");
        }
    }

    ngOnInit() {
        this.selection$ = this.store.select(feedSelectors.selectLightCardSelection);

        moment.updateLocale('en', {
            week: {
                dow: 6, // First day of week is Saturday
                doy: 12 // First week of year must contain 1 January (7 + 6 - 1)
            }
        });

        this.lightCards$ = this.lightCardsFeedFilterService.getFilteredAndSortedLightCards().pipe(
            delay(0), // Solve error: 'Expression has changed after it was checked' --> See https://blog.angular-university.io/angular-debugging/
            map((cards) => {
                this.totalNumberOfLightsCards = cards.length;
                // Experimental hallway feature
                if ((cards.length)&&(this.hallwayMode)) this.router.navigate(['/' + this.currentPath, 'cards', cards[0].id]);
                return cards.slice(0, this.maxNbOfCardsToDisplay);
            })
        );

        this.store
        .select(selectCurrentUrl)
        .pipe(takeUntil(this.ngUnsubscribe$))
        .subscribe((url) => {
            if (url) {
                const urlParts = url.split('/');
                this.currentPath = urlParts[1];
            }
        });

        this.maxPinnedCards = Math.floor(window.innerWidth / 250);
    }

    public enoughSpaceForTimeLine() {
        this.maxPinnedCards = Math.floor(window.innerWidth / 250);
        return window.innerWidth > 1000 && window.innerHeight > 700;
    }

    public enoughSpaceForCardDetail() {
        return window.innerWidth > 1000;
    }

    ngOnDestroy() {
        this.ngUnsubscribe$.next();
        this.ngUnsubscribe$.complete();
    }
}
