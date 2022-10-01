/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {LightCard} from '@ofModel/light-card.model';

export class Filter {

    constructor(readonly filteringFunction: (LightCard, any) => boolean, public active: boolean, public status: any) {}

     static chainFilter(card: LightCard, next: Filter[]) {
        return !next || next.length === 0 || next[0].chainFilter(card, next.slice(1));
    }

    /**
     * Apply this filter to a card, then a chain of filter recursively.
     * The recursion stops when the card is filtered out
     */
     chainFilter(card: LightCard, next: Filter[]) {
        if (this.applyFilter(card)) {
            return !next || next.length === 0 || next[0].chainFilter(card, next.slice(1));
        }
        return false;
    }

    /**
     * Returns true if the card passes the filter, false otherwise
     */
    applyFilter(card: LightCard): boolean {
        if (this.active) {
            return this.filteringFunction(card, this.status);
        }
        return true;
    }
}

export enum FilterType {
    TYPE_FILTER,
    PUBLISHDATE_FILTER,
    ACKNOWLEDGEMENT_FILTER,
    RESPONSE_FILTER,
    BUSINESSDATE_FILTER
}