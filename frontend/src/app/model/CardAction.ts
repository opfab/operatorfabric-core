/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

export enum CardAction {
    PROPAGATE_READ_ACK_TO_PARENT_CARD = 'PROPAGATE_READ_ACK_TO_PARENT_CARD',
    KEEP_CHILD_CARDS = 'KEEP_CHILD_CARDS',
    KEEP_EXISTING_ACKS_AND_READS = 'KEEP_EXISTING_ACKS_AND_READS',
    KEEP_EXISTING_PUBLISH_DATE = 'KEEP_EXISTING_PUBLISH_DATE',
    STORE_ONLY_IN_ARCHIVES = 'STORE_ONLY_IN_ARCHIVES',
    NOT_NOTIFIED = 'NOT_NOTIFIED'
}
