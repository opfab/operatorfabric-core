/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.client.cards.model;

/**
 * Severity of the card content
 *
 * <dl>
 *     <dt>ALARM</dt><dd>Action is needed and the emitter process may be in critical state</dd>
 *     <dt>ACTION</dt><dd>Action is needed</dd>
 *     <dt>INFORMATION </dt><dd>Card content is informational only</dd>
 *     <dt>COMPLIANT </dt><dd> The process related to the card is in a compliant status </dd>
 * </dl>
 * Note : This enum is created by hand because Swagger can't handle enums. It should match the corresponding enum definition in the Cards API.
 *
 * Created on 10/07/18
 *
 */
public enum SeverityEnum {
    ALARM,
    ACTION,
    INFORMATION,
    COMPLIANT
}
