/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.users.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Rights for a process/state (process/state/rights then associated to one or more group(s))
 *
 * <dl>
 *     <dt>RECEIVE</dt><dd> The rights for receiving a card </dd>
 *     <dt>WRITE</dt><dd> The rights for writing a card, that is to say respond to a card or create a new card </dd>
 *     <dt>RECEIVEANDWRITE</dt><dd> The rights for receiving and writing a card </dd>
 * </dl>
 * Note : This enum is created by hand because Swagger can't handle enums. It should match the corresponding enum definition in the Users API.
 *
 */
public enum RightsEnum {
    RECEIVE("Receive"),
    WRITE("Write"),
    RECEIVEANDWRITE("ReceiveAndWrite");

    private String value;

    RightsEnum(String value) {
        this.value = value;
    }

    @Override
    @JsonValue
    public String toString() {
        return String.valueOf(value);
    }

    @JsonCreator
    public static RightsEnum fromValue(String text) {
        for (RightsEnum b : RightsEnum.values()) {
            if (String.valueOf(b.value).equals(text)) {
                return b;
            }
        }
        return null;
    }
}