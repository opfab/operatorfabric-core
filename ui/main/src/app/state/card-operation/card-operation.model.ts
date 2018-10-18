/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface CardOperation{
 id: string | number;
 number: number;
 publicationDate: number;
 type: CardOperationType;
 cardIds?: string[];
 cards?: LightCard[];

}

export class LightCard {
  id: number;
  processId?: string;
  ittd?: Date;
  startDate?: Date;
  endDate?: Date;
  severity?: Severity;
  media?: string;
  tags?: string[];
  title?: i18n;
  summary?:i18n;
  mainRecipient?:string;
}

export enum CardOperationType{
  ADD, UPDATE, DELETE
}

export class i18n {
  key?: string;
  parameters?: Map<string,string>;
}

export enum Severity {
  ALARM, ACTION, NOTIFICATION, QUESTION
}
