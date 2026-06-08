/* Copyright (c) 2018-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Filter, FilterType} from '@ofStore/lightcards/model/Filter';
import {Card} from 'app/model/Card';
import {Severity} from 'app/model/Severity';
import {LogOption, LoggerService as logger} from '@ofServices/logs/LoggerService';
import {Observable, ReplaySubject, filter} from 'rxjs';

export class LightCardsFilter {
    private static readonly TWO_HOURS_IN_MILLIS = 2 * 60 * 60 * 1000;
    private static readonly TWO_DAYS_IN_MILLIS = 48 * 60 * 60 * 1000;

    private readonly filters = new Array();
    private readonly filterChanges = new ReplaySubject(1);

    constructor() {
        this.initFilterList();
    }

    private initFilterList() {
        this.filters[FilterType.TYPE_FILTER] = this.typeFilter;
        this.filters[FilterType.PUBLISHDATE_FILTER] = this.publishDateFilter;
        this.filters[FilterType.ACKNOWLEDGEMENT_FILTER] = this.acknowledgementFilter;
        this.filters[FilterType.RESPONSE_FILTER] = this.responseFilter;
        this.filters[FilterType.PROCESS_FILTER] = this.processFilter;
        this.filters[FilterType.NOTIFICATION_FILTER] = this.isNotificationFilter;
        this.filters[FilterType.BUSINESSANDPUBLISHDATE_FILTER] = this.businessAndPublishDateFilter;
    }

    public updateFilter(filterType: FilterType, active: boolean, status: any) {
        const filterToUpdate = this.filters[filterType];
        if (filterToUpdate) {
            filterToUpdate.active = active;
            filterToUpdate.status = status;
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
        this.filterChanges.next(filterType);
    }

    public filterLightCards(cards: Card[]) {
        return cards.filter((card) => Filter.chainFilter(card, this.filters));
    }

    public filterLightCardsOnlyByBusinessDateAndIsNotification(cards: Card[]) {
        return cards.filter((card) =>
            Filter.chainFilter(card, [this.businessAndPublishDateFilter, this.isNotificationFilter])
        );
    }

    public filterLightCardsExcludingBusinessDateAndIsNotificationFilters(cards: Card[]) {
        return cards.filter((card) =>
            Filter.chainFilter(card, [
                this.typeFilter,
                this.publishDateFilter,
                this.acknowledgementFilter,
                this.responseFilter,
                this.processFilter
            ])
        );
    }

    public getFiltersChanges() {
        return this.filterChanges.asObservable();
    }

    public getBusinessAndPublishDateFilter(): Filter {
        return this.businessAndPublishDateFilter;
    }

    public getBusinessDateFilterChanges(): Observable<any> {
        return this.filterChanges
            .asObservable()
            .pipe(filter((filterType) => filterType === FilterType.BUSINESSANDPUBLISHDATE_FILTER));
    }

    private readonly typeFilter = new Filter(
        (card, status) => {
            return (
                (status.alarm && card.severity === Severity.ALARM) ||
                (status.action && card.severity === Severity.ACTION) ||
                (status.compliant && card.severity === Severity.COMPLIANT) ||
                (status.information && card.severity === Severity.INFORMATION)
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

    private readonly businessAndPublishDateFilter = new Filter(
        (card: Card, status) => {
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
            start: Date.now() - LightCardsFilter.TWO_HOURS_IN_MILLIS,
            end: Date.now() + LightCardsFilter.TWO_DAYS_IN_MILLIS
        }
    );

    private checkCardVisibilityinRange(card: Card, start, end) {
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

    private readonly publishDateFilter = new Filter(
        (card: Card, status) => {
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

    private readonly acknowledgementFilter = new Filter(
        (card: Card, status) => {
            if (status == null) return false;
            return (status && card.hasBeenAcknowledged) || (!status && !card.hasBeenAcknowledged);
        },
        true,
        false
    );

    private readonly responseFilter = new Filter(
        (card: Card, status) => {
            return status || (!status && !card.hasChildCardFromCurrentUserEntity);
        },
        false,
        true
    );

    private readonly processFilter = new Filter(
        (card: Card, status) => {
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

    private readonly isNotificationFilter = new Filter(
        (card: Card, status) => {
            if (status) return !card.isNotificationFiltered;
            return true;
        },
        true,
        true
    );
}
