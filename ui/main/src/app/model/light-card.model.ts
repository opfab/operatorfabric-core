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

}

export class LightCard implements LightCard {

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
    ) {}
}

export enum Severity {
    ALARM, ACTION, NOTIFICATION, QUESTION

}

export enum Sound {
    NOTIFICATION, QUESTION
}

