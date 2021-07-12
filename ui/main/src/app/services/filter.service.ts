/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {Injectable} from '@angular/core';
import {Filter} from '@ofModel/feed-filter.model';
import {LightCard, Severity} from '@ofModel/light-card.model';
import * as _ from 'lodash-es';

@Injectable({
    providedIn: 'root'
})
export class FilterService {

    readonly _defaultFilters = new Map();

    constructor() {
        this._defaultFilters = this.initFilters(true);
    }

    public defaultFilters(): Map<FilterType, Filter> {
        return this._defaultFilters;
    }

    private initTypeFilter() {
        const alarm = Severity.ALARM;
        const action = Severity.ACTION;
        const compliant = Severity.COMPLIANT;
        const information = Severity.INFORMATION;
        return new Filter(
            (card, status) => {
                return status.alarm && card.severity === alarm ||
                    status.action && card.severity === action ||
                    status.compliant && card.severity === compliant ||
                    status.information && card.severity === information;
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

    private initTagFilter() {
        return new Filter(
            (card, status) => _.intersection(card.tags, status.tags).length > 0,
            false,
            {tags: []}
        );
    }


    public getNewBusinessDateFilter(active: boolean, start: number, end: number) {
        const filter = this.initBusinessDateFilter();
        filter.active = active;
        filter.status.start = start;
        filter.status.end = end;
        return filter;
    }


    private initBusinessDateFilter() {
        return new Filter(
            (card: LightCard, status) => {
                if (!!status.start && !!status.end) {
                    if (!card.endDate) {
                        return status.start <= card.startDate && card.startDate <= status.end;
                    }
                    return status.start <= card.startDate && card.startDate <= status.end
                        || status.start <= card.endDate && card.endDate <= status.end
                        || card.startDate <= status.start && status.end <= card.endDate;
                } else if (!!status.start) {
                    return (!card.endDate && card.startDate >= status.start) || (!!card.endDate && status.start <= card.endDate);
                } else if (!!status.end) {
                    return card.startDate <= status.end;
                }
                console.warn(new Date().toISOString(), 'Unexpected business date filter situation');
                return false;
            },
            false,
            {start: new Date().valueOf() - 2 * 60 * 60 * 1000, end: new Date().valueOf() + 48 * 60 * 60 * 1000});
    }


    private initPublishDateFilter() {
        return new Filter(
            (card: LightCard, status) => {
                if (!!status.start && !!status.end) {
                    return status.start <= card.publishDate && card.publishDate <= status.end;

                } else if (!!status.start) {
                    return status.start <= card.publishDate;
                } else if (!!status.end) {
                    return card.publishDate <= status.end;
                }
                return true;
            },
            false,
            {start: null, end: null});
    }

    private initAcknowledgementFilter() {
        return new Filter(
            (card: LightCard, status) => {
                return status && card.hasBeenAcknowledged ||
                    !status && !card.hasBeenAcknowledged;
            },
            true,
            false
        );
    }

    private initResponseFilter() {
        return new Filter(
            (card: LightCard, status) => {
                return status ||
                    (!status && !card.hasChildCardFromCurrentUserEntity);
            },
            false,
            true
        );
    }

    private initFilters(filterOnAck: boolean): Map<string, Filter> {
        const filters = new Map();
        filters.set(FilterType.TYPE_FILTER, this.initTypeFilter());
        filters.set(FilterType.BUSINESSDATE_FILTER, this.initBusinessDateFilter());
        filters.set(FilterType.PUBLISHDATE_FILTER, this.initPublishDateFilter());
        filters.set(FilterType.TAG_FILTER, this.initTagFilter());

        if (filterOnAck)
            filters.set(FilterType.ACKNOWLEDGEMENT_FILTER, this.initAcknowledgementFilter());

        filters.set(FilterType.RESPONSE_FILTER, this.initResponseFilter());

        return filters;
    }
}

// need a process type ?

export enum FilterType {
    TYPE_FILTER,
    RECIPIENT_FILTER,
    TAG_FILTER,
    BUSINESSDATE_FILTER,
    PUBLISHDATE_FILTER,
    ACKNOWLEDGEMENT_FILTER,
    TEST_FILTER,
    RESPONSE_FILTER
}
export const BUSINESS_DATE_FILTER_INITIALISATION = {
    name: FilterType.BUSINESSDATE_FILTER,
    active: true,
    status: {
        start: new Date().valueOf() - 2 * 60 * 60 * 1000,
        end: new Date().valueOf() + 48 * 60 * 60 * 1000
    }
}
