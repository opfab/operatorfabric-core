/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

export class Card {
    entityRecipients?: string[];
    entityRecipientsForInformation?: string[];
    uid: string;
    id: string;
    publisher: string;
    process: string;
    state: string;
    processInstanceId: string;
    processVersion?: string;
    severity?: string;
    startDate: number;
    userRecipients?: string[];
    entitiesAcks?: string[];
    publishDate: number;
    publisherType?: string;
    data?: any;
    title?: any;
    titleTranslated?: any;
    summary?: any;
    summaryTranslated?: any;
}
