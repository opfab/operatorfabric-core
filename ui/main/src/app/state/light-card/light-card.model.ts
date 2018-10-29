/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface LightCard {
    uid: string;
    id: string;
    mainRecipient: string;
    startDate: number;
    endDate: number;
    severity: string;
    // media?: string;
    // tags?: string[];
    processId?: string;
    lttd?: number;
    title?: I18nData;
    summary?: I18nData;
}

export class LightCard implements LightCard {

    constructor(
        uid: string
        , id: string
        , startDate: number
        , endDate: number
        , severity: Severity
        , mainRecipient: string
        // , media?: string
        // , tags?: string[]
        , processId?: string
        , lttd?: number
        , title?: I18nData
        , summary?: I18nData
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
