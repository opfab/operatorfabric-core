/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.users.configuration.jwt.groups.roles;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import jakarta.validation.constraints.NotNull;

import com.fasterxml.jackson.databind.JsonNode;

/**
 * Define the structure of the RoleClaimStandardList, an extension of
 * RoleClaimStandard
 * that deals the case of key/value whose value is a list of roles separated by
 * a separator.
 *
 */
public class RoleClaimStandardList extends RoleClaimStandard {

    @NotNull
    protected String separator;

    public RoleClaimStandardList() {
        super();
    }

    public RoleClaimStandardList(String path, String separator) {
        this(path);
        this.separator = separator;
    }

    public RoleClaimStandardList(String path) {
        super(path);
    }

    public String getSeparator() {
        return separator;
    }

    public void setSeparator(String separator) {
        this.separator = separator;
    }

    /**
     * The value is a list of roles separated by a separator.
     */
    @Override
    public List<String> computeNodeElementRole(JsonNode jsonNodeElement) {
        List<String> listGroupsResult = new ArrayList<>();
        listGroupsResult.addAll(Arrays.asList((jsonNodeElement.asText()).split(separator)));
        return listGroupsResult;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("RoleClaimStandardList(path=").append(getPath()).append(", separator=").append(separator).append(")");
        return sb.toString();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        RoleClaimStandardList that = (RoleClaimStandardList) o;
        return getPath().equals(that.getPath()) && separator.equals(that.separator);
    }

    @Override
    public int hashCode() {
        int result = getPath().hashCode();
        result = 31 * result + separator.hashCode();
        return result;
    }
}
