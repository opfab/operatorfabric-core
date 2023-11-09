/* Copyright (c) 2021-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from '@angular/core';
import {debounceTime, map} from 'rxjs/operators';
import {combineLatest, Observable, ReplaySubject, Subject} from 'rxjs';
import {LightCard} from '@ofModel/light-card.model';
import {LightCardsStoreService} from './lightcards-store.service';
import {LightCardsFilter} from './lightcards-filter';
import {LightCardsSorter} from './lightcards-sorter';
import {GroupedCardsService} from 'app/business/services/lightcards/grouped-cards.service';
import {ConfigService} from 'app/business/services/config.service';
import {LogOption, LoggerService as logger} from 'app/business/services/logs/logger.service';
import {LightCardsTextFilter} from './lightcards-text-filter';
import {Filter, FilterType} from '@ofModel/feed-filter.model';
import {OpfabEventStreamService} from '../events/opfabEventStream.service';

@Injectable({
    providedIn: 'root'
})
export class LightCardsFeedFilterService {

    private filteredAndSortedLightCards = new Subject();
    private filteredLightCards = new Subject();
    private filteredAndSearchedLightCards = new ReplaySubject(1);
    private filteredLightCardsForTimeLine = new Subject();
    private onlyBusinessFilterForTimeLine = new Subject();
    private lightCardFilter: LightCardsFilter;
    private lightCardsSorter: LightCardsSorter;
    private lightCardTextFilter: LightCardsTextFilter;

    constructor(
        private lightCardsStoreService: LightCardsStoreService,
        private opfabEventStreamService: OpfabEventStreamService,
        private groupedCardsService: GroupedCardsService
    ) {
        this.lightCardFilter = new LightCardsFilter();
        this.lightCardsSorter = new LightCardsSorter();
        this.lightCardTextFilter = new LightCardsTextFilter();
        this.computeFilteredAndSortedLightCards();
        this.computeFilteredAndSearchedLightCards();
        this.computeFilteredLightCards();
        this.onlyBusinessFilterForTimeLine.next(false);
    }

    private computeFilteredAndSortedLightCards() {
        combineLatest([this.lightCardsSorter.getSortFunctionChanges(), this.getFilteredAndSearchedLightCards()])
            .pipe(
                map((results) => {
                    results[1] = results[1].sort(results[0]);
                    if (this.isGroupedCardsEnabled()) {
                        this.groupedCardsService.computeGroupedCards(results[1]);
                        results[1] = this.groupedCardsService.filterGroupedChilds(results[1]);
                    }
                    return results[1];
                })
            )
            .subscribe((lightCards) => this.filteredAndSortedLightCards.next(lightCards));
    }

    public getFilteredLightCards(): Observable<any> {
        return this.filteredLightCards.asObservable();
    }

    public getFilteredLightCardsForTimeLine(): Observable<any> {
        return this.filteredLightCardsForTimeLine.asObservable();
    }

    public getFilteredAndSearchedLightCards() : Observable<any> {
        return this.filteredAndSearchedLightCards.asObservable();
    }


    private computeFilteredLightCards() {
        combineLatest([
            this.lightCardFilter.getFiltersChanges(),
            this.lightCardsStoreService.getLightCards(),
            this.onlyBusinessFilterForTimeLine.asObservable()
        ])
            .pipe(
                debounceTime(50), // When resetting components it can happen that we have more than one filter change
                // with debounceTime, we avoid processing intermediate states
                map((results) => {
                    const lightCards = results[1];
                    const onlyBusinessFitlerForTimeLine = results[2];

                    logger.debug('Number of cards in memory : ' +  results[1].length ,LogOption.LOCAL_AND_REMOTE);

                    if (onlyBusinessFitlerForTimeLine) {
                        const cardFilteredByBusinessDate =
                            this.lightCardFilter.filterLightCardsOnlyByBusinessDate(lightCards);
                        this.filteredLightCardsForTimeLine.next(cardFilteredByBusinessDate);
                        return this.lightCardFilter.filterLightCardsWithoutBusinessDate(cardFilteredByBusinessDate);
                    }

                    const cardFilter = this.lightCardFilter.filterLightCards(lightCards);
                    this.filteredLightCardsForTimeLine.next(cardFilter);
                    return cardFilter;
                })
            )
            .subscribe((lightCards) => {
                this.filteredLightCards.next(lightCards);
            });
    }

    private computeFilteredAndSearchedLightCards() {
        combineLatest([this.lightCardTextFilter.getSearchChanges(), this.getFilteredLightCards()])
            .pipe(map((results) => {
                return this.lightCardTextFilter.searchLightCards(results[1]);
            }))
            .subscribe((lightCards) => {
                logger.debug('Number of cards visible after filtering and searching : ' +  lightCards.length, LogOption.LOCAL_AND_REMOTE);
                this.filteredAndSearchedLightCards.next(lightCards);
            });
    }

    private isGroupedCardsEnabled(): boolean {
        return ConfigService.getConfigValue('feed.enableGroupedCards', false);
    }

    public isCardVisibleInFeed(card: LightCard) {
        return this.lightCardTextFilter.searchLightCards(this.lightCardFilter.filterLightCards([card])).length > 0;
    }

    public getFilteredAndSortedLightCards(): Observable<any> {
        return this.filteredAndSortedLightCards.asObservable();
    }

    public setOnlyBusinessFilterForTimeLine(onlyBusinessFilterForTimeLine: boolean) {
        this.onlyBusinessFilterForTimeLine.next(onlyBusinessFilterForTimeLine);
    }

    public updateFilter(filterType: FilterType, active: boolean, status: any) {
        if (filterType === FilterType.BUSINESSDATE_FILTER) this.opfabEventStreamService.setSubscriptionDates(status.start, status.end);
        this.lightCardFilter.updateFilter(filterType,active,status);
    }

    public getBusinessDateFilter(): Filter {
        return this.lightCardFilter.getBusinessDateFilter();
    }

    public getBusinessDateFilterChanges(): Observable<any> {
        return this.lightCardFilter.getBusinessDateFilterChanges();
    }

    public setSortBy(sortBy: string) {
        return this.lightCardsSorter.setSortBy(sortBy);
    }

    public setSearchTermForTextFilter(searchTerm:string) {
        return this.lightCardTextFilter.setSearchTerm(searchTerm);
    }
}
