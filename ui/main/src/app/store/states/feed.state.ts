/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {createEntityAdapter, EntityAdapter, EntityState} from '@ngrx/entity';
import {readOrdinal, LightCard, severityOrdinal} from '@ofModel/light-card.model';
import {Filter} from '@ofModel/feed-filter.model';
import {FilterService, FilterType} from '@ofServices/filter.service';

/**
 * The Feed State consist of:
 *  * EntityState of LightCard
 *  * selectedCardId: the currently selected card id
 *  * lastCardLoaded the last card added / updated to the feed
 *  * message: last message during state processing
 *  * filters: a collection of filter to apply to the rendered feed
 *  * sortBySeverity: Indicates whether the cards in the feed should be sorted by severity before being sorted by
 *    publishDate (desc = latest first)
 */
export interface CardFeedState extends EntityState<LightCard> {
    selectedCardId: string;
    lastCardLoaded: LightCard;
    filters: Map<FilterType, Filter>;
    sortBySeverity: boolean;
    sortByRead: boolean;
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

export const LightCardAdapter: EntityAdapter<LightCard> = createEntityAdapter<LightCard>({
    /* The sortComparer property can only be defined statically for performance optimization reasons.
    * See https://github.com/ngrx/platform/issues/898
    * So to implement a sort criteria chosen by the user, I switched to an unsorted EntityAdapter and did the sorting
    * in the selectors (see selectSortedFilterLightCardIds) */
});

/**
 * Hack to solve OC-604
 * Init is done using a service , to be refactor
 */
function getDefaultFilter() {
    const filterService = new FilterService();
    return filterService.defaultFilters();
}

export const feedInitialState: CardFeedState = LightCardAdapter.getInitialState(
    {
        selectedCardId: null,
        lastCardLoaded: null,
        filters: getDefaultFilter(),
        sortBySeverity: false,
        sortByRead: true
    });
