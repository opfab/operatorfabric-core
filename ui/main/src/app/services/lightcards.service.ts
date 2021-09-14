/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {Injectable} from '@angular/core';
import {debounceTime, filter, map, sample, tap} from 'rxjs/operators';
import {combineLatest, interval, merge, Observable, Subject, } from 'rxjs';
import {select, Store} from '@ngrx/store';
import {AppState} from '@ofStore/index';
import * as feedSelectors from '@ofSelectors/feed.selectors';
import {Filter} from '@ofModel/feed-filter.model';
import {LightCard, Severity} from '@ofModel/light-card.model';


@Injectable()
export class LightCardsService {

    private filters: Filter[];

    private timeOfLastDebounce: number = 0;
    private timeOfLastCardReception: number = 0;
    private numberOfCardProcessedByPreviousDebounce: number = 0;
    private numberOfCardUpdatesInARowNotComingFromDebounce: number=0;

    private filteredAndSortedLightCards = new Subject();
    private filteredLightCards = new Subject();
    private loadingInProgress = new Subject();
   

    constructor(private store: Store<AppState>) {
        this.store.pipe(select(feedSelectors.selectActiveFiltersArray)).subscribe(filters => this.filters = filters);
        this.computeFilteredAndSortedLightCards();
        this.computeFilteredLightCards();
        this.checkForLoadingInProgress();
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
            this.getLightCards()
        ]
        ).pipe(
            map(results => {
                console.log(new Date().toISOString(), "Number of card in memory ", results[1].length, " cards");
                return this.filterLightCards(results[1], results[0]);
            })
        ).subscribe((lightCards) => this.filteredLightCards.next(lightCards));
    }

 // --------------------
 // When an flow of card is coming, for performance reasons , we do not want to update the card list 
 // every time  a card is arriving so we wait for the end of the flow of cards.
 //
 // But if it takes too long, we want to show something . 
 // So every second we make a rendering even if the flow is still continuing except  if  there is less than 20 new cards received in between 
 // In this case it means the browser is slow so we wait 1 s more to avoid adding unnecessary load ot the browser 
 // This situation can arise for example when the browser is busy rendering the monitoring screen with the previous list of card
 // 
 // To do that we combine a debounce waiting for the end of the flow and an interval to get the card list every second 

    public getLightCards(): Observable<any> {
        return merge(this.getLightCardsInterval(), this.getLightCardDebounce());
    }

    private getLightCardsInterval(): Observable<any> {
        return this.store.pipe(
            select(feedSelectors.selectFeed),
            sample(interval(1000)),
            filter((results) => ((
                (new Date().valueOf()) - this.timeOfLastDebounce) > 1000)   // we only need to get cards if no debounce arise in 1 seconds 
                && ( results.length - this.numberOfCardProcessedByPreviousDebounce > 20 )  ), //and if there is enough new card 
                                                                                    
            tap( (results)=> {
                console.log(new Date().toISOString(),"Cards flow in progress : " + (results.length - this.numberOfCardProcessedByPreviousDebounce) + " new cards  ");
                this.numberOfCardProcessedByPreviousDebounce  = results.length; 
            }),
        );
    }

    private getLightCardDebounce(): Observable<any> {
        return this.store.pipe(
            select(feedSelectors.selectFeed),
            tap(() => this.timeOfLastCardReception = new Date().valueOf()),
            debounceTime(200),
            tap(() => this.timeOfLastDebounce = (new Date()).valueOf())
        );
    }

    public getLoadingInProgress() {
        return this.loadingInProgress.asObservable();
    }

    // check every 500ms if we are in a loading card process
    // we consider we are in a loading card process if 3 updates in a row 
    // came from the "interval" observable rather than the debounce.   
    private checkForLoadingInProgress()
    {
        if (this.timeOfLastCardReception > this.timeOfLastDebounce) // at least one card list update has been received that came from the "interval" stream not the "debounce", meaning there is a steady flow of card updates.
                  {
                    this.numberOfCardUpdatesInARowNotComingFromDebounce++;
                    if (this.numberOfCardUpdatesInARowNotComingFromDebounce > 2) this.loadingInProgress.next(true);
                  }
        else  {
            this.loadingInProgress.next(false);
            this.numberOfCardUpdatesInARowNotComingFromDebounce = 0;
        }
        setTimeout(() => this.checkForLoadingInProgress(), 500);
    }

// --------------------

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