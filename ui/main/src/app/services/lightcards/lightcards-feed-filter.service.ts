/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {Injectable} from '@angular/core';
import {map} from 'rxjs/operators';
import {combineLatest, Observable, Subject, } from 'rxjs';
import {LightCard} from '@ofModel/light-card.model';
import {LightCardsStoreService} from './lightcards-store.service';
import {FilterService} from './filter.service';
import {SortService} from './sort.service';


@Injectable()
export class LightCardsFeedFilterService {

    private filteredAndSortedLightCards = new Subject();
    private filteredLightCards = new Subject();
    private filteredLightCardsForTimeLine = new Subject();
    private onlyBusinessFilterForTimeLine = new Subject();


    constructor(
        private lightCardsStoreService: LightCardsStoreService,
        private filterService: FilterService,
        private sortService: SortService) {
        this.computeFilteredAndSortedLightCards();
        this.computeFilteredLightCards();
        this.onlyBusinessFilterForTimeLine.next(false);
    }

    private computeFilteredAndSortedLightCards() {
        combineLatest([
            this.sortService.getSortFunctionChanges(),
            this.getFilteredLightCards()
        ]
        ).pipe(
            map(results => {

                return results[1].sort(results[0]);
            }
            )
        ).subscribe((lightCards) => this.filteredAndSortedLightCards.next(lightCards));
    }


    public getFilteredLightCards(): Observable<any> {
        return this.filteredLightCards.asObservable();
    }

    public getFilteredLightCardsForTimeLine(): Observable<any> {
        return this.filteredLightCardsForTimeLine.asObservable();
    }

    private computeFilteredLightCards() {
        combineLatest([
            this.filterService.getFiltersChanges(),
            this.lightCardsStoreService.getLightCards(),
            this.onlyBusinessFilterForTimeLine.asObservable(),
        ]
        ).pipe(
            map(results => {
                const lightCards = results[1];
                const onlyBusinessFitlerForTimeLine = results[2];

                console.log(new Date().toISOString(), 'Number of card in memory ', results[1].length, ' cards');

                if (onlyBusinessFitlerForTimeLine) {
                    const cardFilteredByBusinessDate = this.filterService.filterLightCardsOnlyByBusinessDate(lightCards);
                    this.filteredLightCardsForTimeLine.next(cardFilteredByBusinessDate);
                    return this.filterService.filterLightCardsWithoutBusinessDate(cardFilteredByBusinessDate);
                }

                const cardFilter = this.filterService.filterLightCards(lightCards);
                this.filteredLightCardsForTimeLine.next(cardFilter);
                return cardFilter
            })
        ).subscribe((lightCards) => this.filteredLightCards.next(lightCards));
    }


    public isCardVisibleInFeed(card: LightCard) {
        return this.filterService.filterLightCards([card]).length > 0;
    }

    public getFilteredAndSortedLightCards(): Observable<any> {
        return this.filteredAndSortedLightCards.asObservable();
    }

    public setOnlyBusinessFilterForTimeLine(onlyBusinessFilterForTimeLine: boolean) {
        this.onlyBusinessFilterForTimeLine.next(onlyBusinessFilterForTimeLine);
    }
}
