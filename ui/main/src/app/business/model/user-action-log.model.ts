/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

export class UserActionLog {
    public constructor(
        readonly date: number,
        readonly action: ActionTypeEnum,
        readonly login?: string,
        readonly entities?: string[],
        readonly cardUid?: string,
        readonly comment?: string
    ) {}
}

export enum ActionTypeEnum {

    ACK_CARD = 'ACK_CARD',
    UNACK_CARD = 'UNACK_CARD',
    READ_CARD = 'READ_CARD',
    UNREAD_CARD = 'UNREAD_CARD',
    SEND_CARD = 'SEND_CARD',
    SEND_RESPONSE = 'SEND_RESPONSE',
    OPEN_SUBSCRIPTION = 'OPEN_SUBSCRIPTION',
    CLOSE_SUBSCRIPTION = 'CLOSE_SUBSCRIPTION'
}
