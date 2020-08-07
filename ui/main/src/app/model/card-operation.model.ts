/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


import {LightCard} from './light-card.model';

export class CardOperation implements CardOperation {
    /* istanbul ignore next */
    constructor(
        readonly number: number,
        readonly publicationDate: number,
        readonly type: CardOperationType,
        readonly cards?: LightCard[],
        readonly cardIds?: string[]
    ) {
    }

    static convertTypeIntoEnum(key: string, value: string) {
        if (key === 'type') {
            return CardOperationType[value];
        }
        return value;
    }

}

export enum CardOperationType {
    ADD, UPDATE, DELETE
}
