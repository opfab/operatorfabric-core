/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {LightCard} from '@state/light-card/light-card.model';

export interface CardOperation {
  number: number;
  publicationDate: number;
  type: CardOperationType;
  cards?: LightCard[];
}

export class CardOperation implements  CardOperation{
  number: number;
  publicationDate: number;
  type: CardOperationType;
  cards?: LightCard[];

  constructor(data?: string) {
    if (data) {
      const parsedData = JSON.parse(data);
      Object.assign(this, parsedData);
    }

  }
}

export enum CardOperationType {
  ADD, UPDATE, DELETE
}
