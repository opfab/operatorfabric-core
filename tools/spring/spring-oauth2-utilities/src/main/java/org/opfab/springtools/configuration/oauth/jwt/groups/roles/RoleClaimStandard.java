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
 * Define the structure of the RoleClaimStandard, the most common use case,
 * which is a key/value system.
 *
 */
public class RoleClaimStandard extends RoleClaim {

    public RoleClaimStandard() {
        super();
    }

    public RoleClaimStandard(String path) {
        super(path);
    }

    /**
     * Retrieve the value of the node element
     */
    @Override
    public List<String> computeNodeElementRole(JsonNode jsonNodeElement) {
        List<String> listGroupsResult = new ArrayList<>();
        listGroupsResult.add(jsonNodeElement.asText());
        return listGroupsResult;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("RoleClaimStandard(path=").append(getPath()).append(")");
        return sb.toString();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        RoleClaimStandard that = (RoleClaimStandard) o;
        return getPath().equals(that.getPath());
    }

    @Override
    public int hashCode() {
        return getPath().hashCode();
    }
}
