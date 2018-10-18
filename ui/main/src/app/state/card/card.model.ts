/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface Card {
  id: number;
  processId?: string;
  lttd?: Date;
  startDate: Date;
  endDate: Date;
  severity: Severity;
  media?: string;
  tags?: string[];
  // title?: I18nData;
  // summary?: I18nData

}

export class Card {

  constructor(
    id: number
    , startDate: Date
    , endDate: Date
    , severity: Severity
    , lttd?: Date
    , processId?: string
    , media?: string
    , tags?: string[]
    // , title?: I18nData
    // , summary?: I18nData
  ) {
  }
}

export enum Severity {
  ALARM, ACTION, NOTIFICATION, QUESTION

}

export enum Sound {
  NOTIFICATION, QUESTION
}

export interface I18nData {
  key: string;
  parameters: string[];
}

export class I18nData {

  constructor(key: string, parameters: string[]) {
  }
}

// export interface CardAction {
//
// }
// export interface CardDetail{
//
// }
// export interface Recipient{
//
// }
