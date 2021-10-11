/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

import {I18n} from '@ofModel/i18n.model';
import { TimeSpan } from './card.model';

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
        public hasChildCardFromCurrentUserEntity: boolean = false,
        readonly processInstanceId?: string,
        readonly lttd?: number,
        readonly title?: I18n,
        readonly summary?: I18n,
        readonly titleTranslated?: string,
        readonly summaryTranslated?: string,
        readonly tags?: string[],
        readonly timeSpans?: TimeSpan[],
        readonly process?: string,
        readonly state?: string,
        readonly parentCardId?: string,
        readonly initialParentCardUid?: string,
        readonly keepChildCards?: boolean,
        readonly representative?: string,
        readonly representativeType?: PublisherType | string,
        readonly entitiesAllowedToRespond?: string[],
        readonly entitiesRequiredToRespond?: string[],
        readonly publisherType?: PublisherType | string,
        readonly secondsBeforeTimeSpanForReminder?: number
    ) {
    }
}

export enum Severity {
    ALARM = 'ALARM', ACTION = 'ACTION', COMPLIANT = 'COMPLIANT', INFORMATION = 'INFORMATION'
}

export enum Sound {
    INFORMATION, COMPLIANT
}

export enum PublisherType {
    EXTERNAL,
    ENTITY
}
