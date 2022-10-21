/* Copyright (c) 2022, RTE (http://www.rte-france.com)
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
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Define the condition for displaying or not the acknowledgment footer of the card
 * <dl>
 *     <dt>ONLY_FOR_EMITTING_ENTITY</dt>
 *     <dt>ONLY_FOR_ENTITIES_ALLOWED_TO_EDIT</dt>
 *     <dt>FOR_ALL_USERS</dt>
 * </dl>
 * Note : This enum is created by hand because Swagger can't handle enums. It should match the corresponding
 * enum definition in the Cards API.
 *
 *
 */
@Getter
@AllArgsConstructor
public enum ShowAcknowledgmentFooterEnum {
    ONLY_FOR_EMITTING_ENTITY("OnlyForEmittingEntity"),
    ONLY_FOR_ENTITIES_ALLOWED_TO_EDIT("OnlyForEntitiesAllowedToEdit"),
    FOR_ALL_USERS("ForAllUsers");

    String value;

    @Override
    @JsonValue
    public String toString() {
        return String.valueOf(value);
    }

    @JsonCreator
    public static ShowAcknowledgmentFooterEnum fromValue(String text) {
        for (ShowAcknowledgmentFooterEnum b : ShowAcknowledgmentFooterEnum.values()) {
            if (String.valueOf(b.value).equals(text)) {
                return b;
            }
        }
        return null;
    }
}