/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Filter, FilterType} from '@ofModel/feed-filter.model';
import {LightCard, Severity} from '@ofModel/light-card.model';
import {LogOption, LoggerService as logger} from 'app/services/logs/LoggerService';
import {Observable, Subject, ReplaySubject} from 'rxjs';

export class LightCardsFilter {
    private static readonly TWO_HOURS_IN_MILLIS = 2 * 60 * 60 * 1000;
    private static readonly TWO_DAYS_IN_MILLIS = 48 * 60 * 60 * 1000;

    private readonly filters = new Array();
    private businessDateFilter: Filter;
    private readonly newBusinessDateFilter = new Subject();
    private readonly filterChanges = new ReplaySubject(1);

    constructor() {
        this.initFilter();
    }

    private initFilter() {
        this.filters[FilterType.TYPE_FILTER] = this.initTypeFilter();
        this.filters[FilterType.PUBLISHDATE_FILTER] = this.initPublishDateFilter();
        this.filters[FilterType.ACKNOWLEDGEMENT_FILTER] = this.initAcknowledgementFilter();
        this.filters[FilterType.RESPONSE_FILTER] = this.initResponseFilter();
        this.filters[FilterType.PROCESS_FILTER] = this.initProcessFilter();
        this.businessDateFilter = this.initBusinessDateFilter();
    }

    public updateFilter(filterType: FilterType, active: boolean, status: any) {
        if (filterType === FilterType.BUSINESSDATE_FILTER) {
            this.businessDateFilter.active = active;
            this.businessDateFilter.status = status;
            this.newBusinessDateFilter.next(this.businessDateFilter);
        } else {
            const filterToUpdate = this.filters[filterType];
            if (filterToUpdate) {
                filterToUpdate.active = active;
                filterToUpdate.status = status;
            }
        }
        logger.debug(
            'Filter change : type=' +
                FilterType[filterType] +
                ', active=' +
                active +
                ', value=' +
                JSON.stringify(status),
            LogOption.REMOTE
        );
        this.filterChanges.next(true);
    }

    public filterLightCards(cards: LightCard[]) {
        return cards.filter((card) => Filter.chainFilter(card, [this.businessDateFilter, ...this.filters]));
    }

    public filterLightCardsOnlyByBusinessDate(cards: LightCard[]) {
        return cards.filter((card) => Filter.chainFilter(card, [this.businessDateFilter]));
    }

    public filterLightCardsWithoutBusinessDate(cards: LightCard[]) {
        return cards.filter((card) => Filter.chainFilter(card, this.filters));
    }

    public getFilters(): Array<Filter> {
        return this.filters;
    }

    public getFiltersChanges() {
        return this.filterChanges.asObservable();
    }

    public getBusinessDateFilter(): Filter {
        return this.businessDateFilter;
    }

    public getBusinessDateFilterChanges(): Observable<any> {
        return this.newBusinessDateFilter.asObservable();
    }

    private initTypeFilter(): Filter {
        const alarm = Severity.ALARM;
        const action = Severity.ACTION;
        const compliant = Severity.COMPLIANT;
        const information = Severity.INFORMATION;
        return new Filter(
            (card, status) => {
                return (
                    (status.alarm && card.severity === alarm) ||
                    (status.action && card.severity === action) ||
                    (status.compliant && card.severity === compliant) ||
                    (status.information && card.severity === information)
                );
            },
            true,
            {
                alarm: true,
                action: true,
                compliant: true,
                information: true
            }
        );
    }

    private initBusinessDateFilter() {
        return new Filter(
            (card: LightCard, status) => {
                if (status.start && status.end) {
                    return this.checkCardVisibilityinRange(card, status.start, status.end);
                } else if (status.start) {
                    return (
                        card.publishDate >= status.start ||
                        (!card.endDate && card.startDate >= status.start) ||
                        (card.endDate && status.start <= card.endDate)
                    );
                } else if (status.end) {
                    return card.publishDate <= status.end || card.startDate <= status.end;
                }
                logger.warn('Unexpected business date filter situation');
                return false;
            },
            false,
            {
                start: new Date().valueOf() - LightCardsFilter.TWO_HOURS_IN_MILLIS,
                end: new Date().valueOf() + LightCardsFilter.TWO_DAYS_IN_MILLIS
            }
        );
    }

    private checkCardVisibilityinRange(card: LightCard, start, end) {
        if (start <= card.publishDate && card.publishDate <= end) {
            return true;
        }
        if (!card.endDate) {
            return start <= card.startDate && card.startDate <= end;
        }
        return (
            (start <= card.startDate && card.startDate <= end) ||
            (start <= card.endDate && card.endDate <= end) ||
            (card.startDate <= start && end <= card.endDate)
        );
    }

    private initPublishDateFilter(): Filter {
        return new Filter(
            (card: LightCard, status) => {
                if (status.start && status.end) {
                    return status.start <= card.publishDate && card.publishDate <= status.end;
                } else if (status.start) {
                    return status.start <= card.publishDate;
                } else if (status.end) {
                    return card.publishDate <= status.end;
                }
                return true;
            },
            false,
            {start: null, end: null}
        );
    }

    private initAcknowledgementFilter(): Filter {
        return new Filter(
            (card: LightCard, status) => {
                if (status == null) return false;
                return (status && card.hasBeenAcknowledged) || (!status && !card.hasBeenAcknowledged);
            },
            true,
            false
        );
    }

    private initResponseFilter(): Filter {
        return new Filter(
            (card: LightCard, status) => {
                return status || (!status && !card.hasChildCardFromCurrentUserEntity);
            },
            false,
            true
        );
    }

    private initProcessFilter(): Filter {
        return new Filter(
            (card: LightCard, status) => {
                if (status.process && status.state) {
                    return status.process === card.process && status.state === card.process + '.' + card.state;
                } else if (status.process) {
                    return status.process === card.process;
                }
                return true;
            },
            false,
            {process: null}
        );
    }
}
