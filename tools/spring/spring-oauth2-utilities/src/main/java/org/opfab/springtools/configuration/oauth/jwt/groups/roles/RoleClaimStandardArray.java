/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.springtools.configuration.oauth.jwt.groups.roles;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.databind.JsonNode;

/**
 * Define the structure of the RoleClaimStandardArray, the common use case which
 * deals with the case of an array value.
 *
 */
public class RoleClaimStandardArray extends RoleClaimStandard {

    public RoleClaimStandardArray() {
        super();
    }

    public RoleClaimStandardArray(String path) {
        super(path);
    }

    /**
     * Get each element of the JSON array as a role
     */
    @Override
    public List<String> computeNodeElementRole(JsonNode jsonNodeElement) {
        List<String> listGroupsResult = new ArrayList<>();
        if (jsonNodeElement.isArray()) {
            for (final JsonNode roleElement : jsonNodeElement) {
                listGroupsResult.add(roleElement.asText());
            }
        }
        return listGroupsResult;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("RoleClaimStandardArray(path=").append(getPath()).append(")");
        return sb.toString();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        RoleClaimStandardArray that = (RoleClaimStandardArray) o;
        return getPath().equals(that.getPath());
    }

    @Override
    public int hashCode() {
        return getPath().hashCode();
    }
}
