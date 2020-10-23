/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {I18n} from '@ofModel/i18n.model';

export class LightCard {
    /* istanbul ignore next */
    constructor(
        readonly uid: string,
        readonly id: string,
        readonly publisher: string,
        readonly processVersion: string,
        readonly publishDate: number,
        readonly startDate: number,
        readonly endDate: number,
        readonly severity: Severity,
        readonly hasBeenAcknowledged: boolean = false,
        readonly hasBeenRead: boolean = false,
        readonly processInstanceId?: string,
        readonly lttd?: number,
        readonly title?: I18n,
        readonly summary?: I18n,
        readonly tags?: string[],
        readonly timeSpans?: TimeSpan[],
        readonly process?: string,
        readonly state?: string,
        readonly parentCardUid?: string,
        readonly entitiesAllowedToRespond?: string[],
        readonly publisherType?: PublisherType | string
    ) {
    }
}

export enum Severity {
    ALARM = 'ALARM', ACTION = 'ACTION', COMPLIANT = 'COMPLIANT', INFORMATION = 'INFORMATION'
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
        case Severity.COMPLIANT:
            result = 2;
            break;
        case Severity.INFORMATION:
            result = 3;
            break;
    }
    return result;
}

export function readOrdinal(flag: boolean) {
    return flag ? 1 : 0;
}

export enum Sound {
    INFORMATION, COMPLIANT
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

export enum PublisherType {
    EXTERNAL,
    ENTITY
}
