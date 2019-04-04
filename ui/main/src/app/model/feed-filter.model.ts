/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {LightCard, Severity} from "@ofModel/light-card.model";
import {I18n} from "@ofModel/i18n.model";
import {Map} from "@ofModel/map";

/**
 * A Filter gather both the feed filtering behaviour and the filter status for
 * filtering parametrization and component state
 */
export abstract class Filter {

    constructor(
        readonly funktion: (LightCard,any) => boolean,
        readonly active:boolean,
        readonly status: any
    ) {
    }

    /**
     * apply the filter to the card, returns true if the card passes the filter, false otherwise
     * @param card
     */
    applyFilter(card: LightCard):boolean{
        if(this.active){
            return this.funktion(card,this.status);
        }
        return true;
    }

    /**
     * Apply this filter to a card, then a chain of filter recursively.
     * The recursion stops when the card is filtered out
     * @param card
     * @param next
     */
    chainFilter(card: LightCard, next: Filter[]){
        if(this.applyFilter(card))
            return !next || next[0].chainFilter(card,next.slice(1));
        return false
    }

    /**
     * Sequentially applies a chain of filters to a card
     * @param card
     * @param next
     */
    static chainFilter(card: LightCard, next: Filter[]){
        return !next || next[0].chainFilter(card,next.slice(1));
    }
}