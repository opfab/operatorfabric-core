/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.lfenergy.operatorfabric.businessconfig.model;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Response associated button color
 * <dl>
 *     <dt>ALWAYS</dt><dd>Acknowledgment always allowed</dd>
 *     <dt>NEVER</dt><dd>Acknowledgment not allowed</dd>
 *     <dt>ONLY_WHEN_RESPONSE_DISABLED_FOR_USER</dt><dd>Acknowledgment allowed only if response is disabled for the user</dd>
 * </dl>
 * Note : This enum is created by hand because Swagger can't handle enums. It should match the corresponding
 * enum definition in the Cards API.
 *
 *
 */
@Getter
@AllArgsConstructor
public enum AcknowledgmentAllowedEnum {
    ALWAYS("Always"), 
    NEVER("Never"), 
    ONLY_WHEN_RESPONSE_DISABLED_FOR_USER("OnlyWhenResponseDisabledForUser");

    String value;
}