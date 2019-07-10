/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {I18n} from "@ofModel/i18n.model";

export interface LightCard {
    readonly uid: string;
    readonly id: string;
    readonly publisher: string;
    readonly publisherVersion: string;
    readonly mainRecipient: string;
    readonly publishDate: number;
    readonly startDate: number;
    readonly endDate: number;
    readonly severity: Severity;
    readonly processId?: string;
    readonly lttd?: number;
    readonly title?: I18n;
    readonly summary?: I18n;
    readonly tags?: string[];
    readonly timeSpans?: TimeSpan[];

}

export class LightCard implements LightCard {
    /* istanbul ignore next */
    constructor(
        readonly uid: string,
        readonly id: string,
        readonly publisher: string,
        readonly publisherVersion: string,
        readonly publishDate: number,
        readonly startDate: number,
        readonly endDate: number,
        readonly severity: Severity,
        readonly mainRecipient: string,
        readonly processId?: string,
        readonly lttd?: number,
        readonly title?: I18n,
        readonly summary?: I18n,
        readonly tags?: string[],
        readonly timeSpans?: TimeSpan[]
    ) {
    }
}

export enum Severity {
    ALARM = "ALARM", ACTION = "ACTION", NOTIFICATION = "NOTIFICATION", QUESTION = "QUESTION"
}

export function severityOrdinal(severity: Severity) {
    let result;
    switch (severity) {
        case Severity.ALARM:
            result = 0;
            break;
        case Severity.ACTION:
            result = 1;
            break;
        case Severity.QUESTION:
            result = 2;
            break;
        case Severity.NOTIFICATION:
            result = 3;
            break;
    }
    return result;
}

export enum Sound {
    NOTIFICATION, QUESTION
}

export enum Display {
    BUBBLE, LINE
}

export class TimeSpan {
    constructor(
        readonly start: number,
        readonly end?: number,
        readonly display = Display.BUBBLE) {
    }
}