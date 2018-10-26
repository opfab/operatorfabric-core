/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {Card} from "@state/card/card.model";

export interface CardOperation {
  number: number;
  publicationDate: number;
  type: CardOperationType;
  cards?: LightCard[];
}

export class CardOperation {
  number: number;
  publicationDate: number;
  type: CardOperationType;
  cards?: LightCard[];


  constructor(data?: string) {
    if (data) {

      const parsedData = JSON.parse(data);
      Object.assign(this, parsedData)
    }

  }
}

export class LightCard {
  uid: string;
  id: string;
  processId?: string;
  lttd?: number;
  startDate?: number;
  endDate?: number;
  severity?: string;
  title?: i18n;
  summary?: i18n;
  mainRecipient?: string;
}

export enum CardOperationType {
  ADD, UPDATE, DELETE
}

export class i18n {
  key?: string;
  parameters?: object;
}

export enum Severity {
  ALARM, ACTION, NOTIFICATION, QUESTION
}
