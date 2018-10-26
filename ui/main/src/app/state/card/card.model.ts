/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {i18n} from "@state/card-operation/card-operation.model";

export interface Card {
  uid: string;
  id: string;
  processId?: string;
  lttd?: number;
  startDate: number;
  endDate: number;
  severity: string;
  // media?: string;
  // tags?: string[];
  title?: i18n;
  summary?: i18n

}

export class Card {

  constructor(
    uid: string
,    id: string
    , startDate: number
    , endDate: number
    , severity: Severity
    , lttd?: number
    , processId?: string
    // , media?: string
    // , tags?: string[]
    , title?: i18n
    , summary?: i18n
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
