/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable} from '@angular/core';
import {Filter} from "@ofModel/feed-filter.model";
import {Severity} from "@ofModel/light-card.model";

@Injectable({
    providedIn: 'root'
})
export class FilterService {

    private _defaultFilters = new Map();

    constructor() {
        this._defaultFilters = this.initFilters();
    }

    get defaultFilters(): Map<string, Filter> {
        return this._defaultFilters;
    }


    private initTypeFilter() {
        const alarm = Severity.ALARM;
        const action = Severity.ACTION;
        const question = Severity.QUESTION;
        const notification = Severity.NOTIFICATION;
        return new Filter(
            (card, status) => {
                const result =
                    status.alarm && card.severity == alarm ||
                    status.action && card.severity == action ||
                    status.question && card.severity == question ||
                    status.notification && card.severity == notification;
                return result;
            },
            true,
            {
                alarm: true,
                action: true,
                question: true,
                notification: false
            }
        );
    }

    private initRecipientFilter() {
        return new Filter(
            (card, status) => false,
            false,
            {}
        );
    }

    private initFilters(): Map<string, Filter> {
        const filters = new Map();
        filters.set(TYPE_FILTER, this.initTypeFilter());
        filters.set(RECIPIENT_FILTER, this.initRecipientFilter());
        return filters;
    }
}

export const TYPE_FILTER = 'type';
export const RECIPIENT_FILTER = 'recipient';