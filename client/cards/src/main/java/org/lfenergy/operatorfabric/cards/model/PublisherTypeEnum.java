/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.lfenergy.operatorfabric.cards.model;

/**
 * Define the kind of the card sender
 * <dl>
 *     <dt>THIRD_PARTY</dt><dd>The sender is an external service</dd>
 *     <dt>SYSTEM</dt><dd>The sender of the card is OperatorFabric itself</dd>
 * </dl>
 * Note : This enum is created by hand because Swagger can't handle enums. It should match the corresponding enum definition in the Cards API.
 *
 */
public enum PublisherTypeEnum {
    EXTERNAL,
    SYSTEM
}
