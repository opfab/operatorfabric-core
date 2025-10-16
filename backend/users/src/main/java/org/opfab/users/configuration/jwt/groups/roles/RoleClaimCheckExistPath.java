/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.users.configuration.jwt.groups.roles;

import java.util.Collections;
import java.util.List;

import jakarta.validation.constraints.NotNull;

import com.fasterxml.jackson.databind.JsonNode;

/**
 * Define the structure of the RoleClaimCheckExistPath.
 * It is a specific case to retrieve a role through a path value.
 */
public class RoleClaimCheckExistPath extends RoleClaim {

    @NotNull
    private String roleValue;

    public RoleClaimCheckExistPath() {
        super();
    }

    public RoleClaimCheckExistPath(String path) {
        super(path);
    }

    public RoleClaimCheckExistPath(String path, String roleValue) {
        super(path);
        this.roleValue = roleValue;
    }

    public String getRoleValue() {
        return roleValue;
    }

    public void setRoleValue(String roleValue) {
        this.roleValue = roleValue;
    }

    /**
     * Get the list of role through the computation
     * No need to check (already check before)
     * In this case, return the role value associated.
     */
    @Override
    public List<String> computeNodeElementRole(JsonNode jsonNodeElement) {
        return Collections.singletonList(roleValue);
    }

    @Override
    public String toString() {
        return "RoleClaimCheckExistPath(path=" + getPath() + ", roleValue=" + roleValue + ")";
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        RoleClaimCheckExistPath that = (RoleClaimCheckExistPath) o;
        return getPath().equals(that.getPath()) && roleValue.equals(that.roleValue);
    }

    @Override
    public int hashCode() {
        int result = getPath().hashCode();
        result = 31 * result + roleValue.hashCode();
        return result;
    }
}
