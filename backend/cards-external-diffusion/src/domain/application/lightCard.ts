/* Copyright (c) 2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

export class LightCard {
    readonly id: string;
    readonly uid: string;
    readonly processVersion: string;
    readonly process: string;
    readonly state: string;
    readonly titleTranslated?: string;
    readonly summaryTranslated?: string;
    readonly publishDate: number;
    readonly usersReads?: string[];
    readonly startDate?: number;
    readonly endDate?: number;
    readonly userRecipients?: string[];
    readonly groupRecipients?: string[];
    readonly entityRecipients?: string[];
    readonly publisher?: string;
    readonly publisherType?: string;
    readonly severity?: string;
}
