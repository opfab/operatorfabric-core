/* Copyright (c) 2023-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
import {Card} from 'app/model/Card';

export class SelectedCard {
    public readonly card: Card;
    public readonly childCards: Card[];
    public readonly notFound: boolean;

    constructor(card: Card, childCards: Card[], notFound: boolean) {
        this.card = card;
        this.childCards = childCards;
        this.notFound = notFound;
    }
}
