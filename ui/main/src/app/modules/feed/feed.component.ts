/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {LightCard} from '@ofModel/light-card.model';
import {delay, map, takeUntil} from 'rxjs/operators';
import {FilteredLightCardsStore} from 'app/business/store/lightcards/lightcards-feed-filter-store';
import {ConfigService} from 'app/business/services/config.service';
import {ActivatedRoute, Router, RouterOutlet} from '@angular/router';
import {SelectedCardStore} from 'app/business/store/selectedCard.store';
import {OpfabStore} from 'app/business/store/opfabStore';
import {TimeLineComponent} from './components/time-line/time-line.component';
import {NgIf, AsyncPipe} from '@angular/common';
import {PinnedCardsComponent} from './components/pinned-cards/pinned-cards.component';
import {CardListComponent} from './components/card-list/card-list.component';

@Component({
    selector: 'of-cards',
    templateUrl: './feed.component.html',
    styleUrls: ['./feed.component.scss'],
    standalone: true,
    imports: [TimeLineComponent, NgIf, PinnedCardsComponent, CardListComponent, RouterOutlet, AsyncPipe]
})
export class FeedComponent implements OnInit, OnDestroy, AfterViewInit {
    processFilter: string;
    stateFilter: string;

    lightCards$: Observable<LightCard[]>;
    selection$: Observable<string>;
    hallwayModeSelectedCardUid: string;
    totalNumberOfLightsCards = 0;
    maxNbOfCardsToDisplay = 100;
    private ngUnsubscribe$ = new Subject<void>();
    private readonly hallwayMode: boolean;
    filtersVisible = false;
    private filteredLightCardStore: FilteredLightCardsStore;
    isAssistantVisible = false;
    rightPanelComponent;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private renderer: Renderer2,
        private el: ElementRef
    ) {
        this.route.queryParams.pipe(takeUntil(this.ngUnsubscribe$)).subscribe((params) => {
            this.processFilter = params.processFilter;
            this.stateFilter = params.stateFilter;
        });
        this.filteredLightCardStore = OpfabStore.getFilteredLightCardStore();
        this.maxNbOfCardsToDisplay = ConfigService.getConfigValue('feed.card.maxNbOfCardsToDisplay', 100);
        this.hallwayMode = ConfigService.getConfigValue('settings.hallwayMode');
        this.rightPanelComponent = ConfigService.getConfigValue('rightPanelComponent');
        if (this.rightPanelComponent) {
            this.isAssistantVisible = true;
        }
    }

    private setRightPanelContent() {
        const rightPanelContent = this.el.nativeElement.querySelector('#opfab-right-panel-content');
        if (rightPanelContent) {
            const componentElement = this.renderer.createElement(this.rightPanelComponent);
            this.renderer.appendChild(rightPanelContent, componentElement);
        }
    }

    ngOnInit() {
        this.selection$ = SelectedCardStore.getSelectCardIdChanges();

        this.lightCards$ = this.filteredLightCardStore.getFilteredAndSortedLightCards().pipe(
            delay(0), // Solve error: 'Expression has changed after it was checked' --> See https://blog.angular-university.io/angular-debugging/
            map((cards) => {
                this.totalNumberOfLightsCards = cards.length;
                // hallway feature
                if (this.hallwayMode) {
                    if (cards.length > 0) {
                        if (this.hallwayModeSelectedCardUid !== cards[0].uid) {
                            this.router.navigate(['/feed', 'cards', cards[0].id]);
                            this.hallwayModeSelectedCardUid = cards[0].uid;
                        }
                    } else this.router.navigate(['/feed']);
                }
                return cards.slice(0, this.maxNbOfCardsToDisplay);
            })
        );
    }

    ngAfterViewInit() {
        if (this.rightPanelComponent) {
            this.setRightPanelContent();
        }
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
