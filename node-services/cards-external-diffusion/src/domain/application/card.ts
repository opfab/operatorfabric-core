/* Copyright (c) 2024; RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla readonly
 * License; v. 2.0. If a copy of the MPL was not distributed with this
 * file; You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

export class Card {
    readonly uid: string;
    readonly id: string;
    readonly publisher?: string;
    readonly processVersion: string;
    readonly publishDate: number;
    readonly startDate?: number;
    readonly endDate?: number;
    readonly expirationDate?: number;
    readonly severity?: string;
    readonly process: string;
    readonly processInstanceId?: string;
    readonly state: string;
    readonly lttd?: number;
    readonly titleTranslated?: string;
    readonly summaryTranslated?: string;
    readonly data?: any;
    readonly userRecipients?: string[];
    readonly groupRecipients?: string[];
    readonly entityRecipients?: string[];
    readonly entityRecipientsForInformation?: string[];
    readonly externalRecipients?: string[];
    readonly entitiesAllowedToRespond?: string[];
    readonly entitiesRequiredToRespond?: string[];
    readonly entitiesAllowedToEdit?: string[];
    readonly parentCardId?: string;
    readonly initialParentCardUid?: string;
    readonly publisherType?: string;
    readonly representative?: string;
    readonly representativeType?: string;
    readonly tags?: string[];
    readonly wktGeometry?: string;
    readonly wktProjection?: string;
    readonly secondsBeforeTimeSpanForReminder?: number;
    readonly timeSpans?: any[];
    readonly entitiesAcks?: string[];
    readonly deletionDate?: number;
    readonly rRule?: any;
    readonly actions?: any[];
    readonly usersReads?: string[];
}
