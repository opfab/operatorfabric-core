/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.businessconfig.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum AcknowledgmentAllowedEnum {
    ALWAYS("Always"),
    NEVER("Never"),
    ONLY_WHEN_RESPONSE_DISABLED_FOR_USER("OnlyWhenResponseDisabledForUser");

    String value;

    private AcknowledgmentAllowedEnum(String value) {
        this.value = value;
    }

    @Override
    @JsonValue
    public String toString() {
        return String.valueOf(value);
    }

    @JsonCreator
    public static AcknowledgmentAllowedEnum fromValue(String text) {
        for (AcknowledgmentAllowedEnum b : AcknowledgmentAllowedEnum.values()) {
            if (String.valueOf(b.value).equals(text)) {
                return b;
            }
        }
        return null;
    }
}
