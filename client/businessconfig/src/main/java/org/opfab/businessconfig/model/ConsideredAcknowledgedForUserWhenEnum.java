/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.businessconfig.model;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Define how a card is considered as acknowledged in the feed
 * <dl>
 *     <dt>USER_HAS_ACKNOWLEDGED</dt><dd>For the card to appear acknowledged in the feed, it suffices that the user acknowledges it</dd>
 *     <dt>ONE_ENTITY_OF_USER_HAS_ACKNOWLEDGED</dt><dd>For the card to appear acknowledged in the feed, one (or more) entity(ies) of the user must acknowledge it</dd>
 *     <dt>ALL_ENTITIES_OF_USER_HAVE_ACKNOWLEDGED</dt><dd>For the card to appear acknowledged in the feed, all the entities of the user must acknowledge it</dd>
 * </dl>
 * Note : This enum is created by hand because Swagger can't handle enums. It should match the corresponding
 * enum definition in the Cards API.
 *
 *
 */
@Getter
@AllArgsConstructor
public enum ConsideredAcknowledgedForUserWhenEnum {
    USER_HAS_ACKNOWLEDGED("UserHasAcknowledged"),
    ONE_ENTITY_OF_USER_HAS_ACKNOWLEDGED("OneEntityOfUserHasAcknowledged"),
    ALL_ENTITIES_OF_USER_HAVE_ACKNOWLEDGED("AllEntitiesOfUserHaveAcknowledged");

    String value;
}