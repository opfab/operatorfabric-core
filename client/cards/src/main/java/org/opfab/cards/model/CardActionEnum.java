/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.model;

/**
 * Defines the actions to be done when card is received
 * <dl>
 *    <dt>PROPAGATE_READ_ACK_TO_PARENT_CARD</dt>
 *    <dt>KEEP_CHILD_CARDS</dt>
 *    <dt>KEEP_EXISTING_ACKS_AND_READS</dt>
 *    <dt>KEEP_EXISTING_PUBLISH_DATE</dt>
 *    <dt>STORE_ONLY_IN_ARCHIVES</dt>
 * </dl>
 * Note : This enum is created by hand because Swagger can't handle enums. It should match the corresponding enum definition in the Cards API.
 *
 */
public enum CardActionEnum {
   PROPAGATE_READ_ACK_TO_PARENT_CARD,
   KEEP_CHILD_CARDS,
   KEEP_EXISTING_ACKS_AND_READS,
   KEEP_EXISTING_PUBLISH_DATE,
   STORE_ONLY_IN_ARCHIVES
}
