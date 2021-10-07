/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {Injectable} from '@angular/core';
import { map} from 'rxjs/operators';
import {combineLatest,Observable,Subject, } from 'rxjs';
import {select, Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import * as feedSelectors from '@ofSelectors/feed.selectors';
import {Filter} from '@ofModel/feed-filter.model';
import {LightCard, Severity} from '@ofModel/light-card.model';
import {LightCardsStoreService} from './lightcards-store.service';


@Injectable()
export class LightCardsFeedFilterService {

    private filters: Filter[];
    private filteredAndSortedLightCards = new Subject();
    private filteredLightCards = new Subject();


    constructor(private store: Store<AppState>, private lightCardsStoreService: LightCardsStoreService ) {
        this.store.pipe(select(feedSelectors.selectActiveFiltersArray)).subscribe(filters => this.filters = filters);
        this.computeFilteredAndSortedLightCards();
        this.computeFilteredLightCards();
    }

    private computeFilteredAndSortedLightCards() {
        combineLatest([
            this.store.pipe(select(feedSelectors.selectSortFilter)),
            this.getFilteredLightCards()
        ]
        ).pipe(
            map(results => {
                function compareFn(needToSortBySeverity: boolean, needToSortByRead: boolean) {
                    if (needToSortByRead) {
                        if (needToSortBySeverity) {
                            return compareByReadSeverityPublishDate;
                        } else {
                            return compareByReadPublishDate;
                        }
                    } else if (needToSortBySeverity) {
                        return compareBySeverityPublishDate;
                    }
                    return compareByPublishDate;
                }
                return results[1]
                    .sort(compareFn(results[0].sortBySeverity, results[0].sortByRead));
            }
            )
        ).subscribe((lightCards) => this.filteredAndSortedLightCards.next(lightCards));
    }


    public getFilteredLightCards(): Observable<any> {
        return this.filteredLightCards.asObservable();
    }

    private computeFilteredLightCards() {
        combineLatest([
            this.store.pipe(select(feedSelectors.selectActiveFiltersArray)),
            this.lightCardsStoreService.getLightCards()
        ]
        ).pipe(
            map(results => {
                console.log(new Date().toISOString(), "Number of card in memory ", results[1].length, " cards");
                return this.filterLightCards(results[1], results[0]);
            })
        ).subscribe((lightCards) => this.filteredLightCards.next(lightCards));
    }


    public filterLightCards(lightCards: LightCard[], filters: Filter[]): LightCard[] {
        if (filters && filters.length > 0) {
            return lightCards.filter(card => Filter.chainFilter(card, filters));
        }
        return lightCards;

    }

    public isCardVisibleInFeed(card: LightCard) {
        return this.filterLightCards([card], this.filters).length > 0;
    }

    public getFilteredAndSortedLightCards(): Observable<any> {
        return this.filteredAndSortedLightCards.asObservable();
    }
}

export function severityOrdinal(severity: Severity) {
    let result;
    switch (severity) {
        case Severity.ALARM:
            result = 0;
            break;
        case Severity.ACTION:
            result = 1;
            break;
        case Severity.COMPLIANT:
            result = 2;
            break;
        case Severity.INFORMATION:
            result = 3;
            break;
    }
    return result;
}

export function readOrdinal(flag: boolean) {
    return flag ? 1 : 0;
}


export function compareByStartDate(card1: LightCard, card2: LightCard) {
    return card1.startDate - card2.startDate;
}

export function compareBySeverity(card1: LightCard, card2: LightCard) {
    return severityOrdinal(card1.severity) - severityOrdinal(card2.severity);
}

export function compareByPublishDate(card1: LightCard, card2: LightCard) {
    return card2.publishDate - card1.publishDate;
}

export function compareByRead(card1: LightCard, card2: LightCard) {
    return readOrdinal(card1.hasBeenRead) - readOrdinal(card2.hasBeenRead);
}

export function compareBySeverityPublishDate(card1: LightCard, card2: LightCard) {
    let result = compareBySeverity(card1, card2);
    if (result === 0) {
        result = compareByPublishDate(card1, card2);
    }
    return result;
}

export function compareByReadPublishDate(card1: LightCard, card2: LightCard) {
    let result = compareByRead(card1, card2);
    if (result === 0) {
        result = compareByPublishDate(card1, card2);
    }
    return result;
}

export function compareByReadSeverityPublishDate(card1: LightCard, card2: LightCard) {
    let result = compareByRead(card1, card2);
    if (result === 0) {
        result = compareBySeverityPublishDate(card1, card2);
    }
    return result;
}