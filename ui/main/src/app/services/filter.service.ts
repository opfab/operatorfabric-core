/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
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
import * as _ from 'lodash';

@Injectable({
    providedIn: 'root'
})
export class FilterService {

    readonly _defaultFilters = new Map();
    readonly _defaultFiltersForMonitoring = new Map();

    constructor() {
        this._defaultFilters = this.initFilters(true);
        this._defaultFiltersForMonitoring = this.initFilters(false);
    }

    public defaultFilters(): Map<FilterType, Filter> {
        return this._defaultFilters;
    }

    public defaultFiltersForMonitoring(): Map<FilterType, Filter> {
        return this._defaultFiltersForMonitoring;
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


    private initBusinessDateFilter() {
        return new Filter(
            (card: LightCard, status) => {
                if (!!status.start && !!status.end) {
                    if (!card.endDate) {
                        return card.startDate <= status.end;
                    }
                    return status.start <= card.startDate && card.startDate <= status.end
                        || status.start <= card.endDate && card.endDate <= status.end
                        || card.startDate <= status.start && status.end <= card.endDate;
                } else if (!!status.start) {
                    return !card.endDate || status.start <= card.endDate;
                } else if (!!status.end) {
                    return card.startDate <= status.end;
                }
                console.warn(new Date().toISOString(), 'Unexpected business date filter situation');
                return false;
            },
            false,
            {start: new Date().valueOf() - 2 * 60 * 60 * 1000, end: new Date().valueOf() + 48 * 60 * 60 * 1000});
    }

    private initMonitorDateFilter() {
        return new Filter(
            (card: LightCard, status) => {
                if (!!status.start && !!status.end) {
                    const isCardStartOk = card.startDate >= status.start && card.startDate <= status.end;
                    if (!card.endDate) {
                        return card.startDate <= status.end;
                    }
                    const isCardEndOk = card.endDate >= status.start && card.endDate <= status.end;
                    
                    return isCardStartOk || isCardEndOk;
                } else if (!!status.start) {
                    return card.startDate >= status.start;
                } else if (!!status.end) {
                    return (!! card.endDate && card.endDate <= status.end ) || card.startDate <= status.end;
                }
                console.warn(new Date().toISOString(), 'Unexpected business date filter situation');
                return false;
            },
            false,
            {start: new Date().valueOf() - 2 * 60 * 60 * 1000});
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

    private initProcessFilter()  {
        return new Filter(
            (card: LightCard, status) => {
                const processList = status.processes;
                if (!! processList) {
                    return processList.includes(card.process);
                }
                // permissive filter
                return true;
            },
            false,
            {processes: null}
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

        filters.set(FilterType.PROCESS_FILTER, this.initProcessFilter());
        filters.set(FilterType.MONITOR_DATE_FILTER, this.initMonitorDateFilter());
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
    PROCESS_FILTER,
    MONITOR_DATE_FILTER
}
export const BUSINESS_DATE_FILTER_INITIALISATION = {
    name: FilterType.BUSINESSDATE_FILTER,
    active: true,
    status: {
        start: new Date().valueOf() - 2 * 60 * 60 * 1000,
        end: new Date().valueOf() + 48 * 60 * 60 * 1000
    }
}
