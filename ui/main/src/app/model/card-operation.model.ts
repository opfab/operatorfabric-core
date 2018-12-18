/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {LightCard} from './light-card.model';

export interface CardOperation {
    readonly number: number;
    readonly publicationDate: number;
    readonly type: CardOperationType;
    readonly cards?: LightCard[];
}

export class CardOperation implements CardOperation {

    constructor(
        readonly number: number,
        readonly publicationDate: number,
        readonly type: CardOperationType,
        readonly cards?: LightCard[],
    ) {
    }

}

export enum CardOperationType {
    ADD = 'ADD'
    , UPDATE = 'UPDATE'
    , DELETE = 'DELETE'
}
