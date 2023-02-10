/* Copyright (c) 2021-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {Injectable} from '@angular/core';
import {LightCard, Severity} from '@ofModel/light-card.model';
import {Subject, Observable} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SortService {
    private sortChanges = new Subject();
    private sortBy = 'unread';

    public setSortBy(sortBy: string) {
        this.sortBy = sortBy;
        this.sortChanges.next(this.getSortFunction());
    }

    public getSortBy() {
        return this.sortBy;
    }

    public getSortFunction() {
        switch (this.sortBy) {
            case 'unread':
                return compareByReadPublishDate;
            case 'severity':
                return compareBySeverityPublishDate;
            case 'startDate':
                return compareByStartDate;
            case 'endDate':
                return compareByEndDate;
            default:
                return compareByPublishDate;
        }
    }

    public getSortFunctionChanges(): Observable<any> {
        return this.sortChanges.asObservable();
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

export function compareByStartDate(card1: LightCard, card2: LightCard) {
    return card1.startDate - card2.startDate;
}

export function compareByEndDate(card1: LightCard, card2: LightCard) {
    const date1 = !!card1.endDate ? card1.endDate: card1.startDate;
    const date2 = !!card2.endDate ? card2.endDate: card2.startDate;
    return date1 - date2;
}