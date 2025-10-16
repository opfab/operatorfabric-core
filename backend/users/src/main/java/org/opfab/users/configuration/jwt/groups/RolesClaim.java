/* Copyright (c) 2018-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.users.configuration.jwt.groups;

import java.util.ArrayList;
import java.util.List;

import org.opfab.users.configuration.jwt.groups.roles.RoleClaimCheckExistPath;
import org.opfab.users.configuration.jwt.groups.roles.RoleClaimStandard;
import org.opfab.users.configuration.jwt.groups.roles.RoleClaimStandardArray;
import org.opfab.users.configuration.jwt.groups.roles.RoleClaimStandardList;

public class RolesClaim {

    private List<RoleClaimStandard> rolesClaimStandard = new ArrayList<>();
    private List<RoleClaimStandardList> rolesClaimStandardList = new ArrayList<>();
    private List<RoleClaimStandardArray> rolesClaimStandardArray = new ArrayList<>();
    private List<RoleClaimCheckExistPath> rolesClaimCheckExistPath = new ArrayList<>();

    public RolesClaim() {
    }

    public RolesClaim(List<RoleClaimStandard> rolesClaimStandard, List<RoleClaimStandardList> rolesClaimStandardList,
            List<RoleClaimStandardArray> rolesClaimStandardArray,
            List<RoleClaimCheckExistPath> rolesClaimCheckExistPath) {
        this.rolesClaimStandard = rolesClaimStandard;
        this.rolesClaimStandardList = rolesClaimStandardList;
        this.rolesClaimStandardArray = rolesClaimStandardArray;
        this.rolesClaimCheckExistPath = rolesClaimCheckExistPath;
    }

    public List<RoleClaimStandard> getRolesClaimStandard() {
        return rolesClaimStandard;
    }

    public void setRolesClaimStandard(List<RoleClaimStandard> rolesClaimStandard) {
        this.rolesClaimStandard = rolesClaimStandard;
    }

    public List<RoleClaimStandardList> getRolesClaimStandardList() {
        return rolesClaimStandardList;
    }

    public void setRolesClaimStandardList(List<RoleClaimStandardList> rolesClaimStandardList) {
        this.rolesClaimStandardList = rolesClaimStandardList;
    }

    public List<RoleClaimStandardArray> getRolesClaimStandardArray() {
        return rolesClaimStandardArray;
    }

    public void setRolesClaimStandardArray(List<RoleClaimStandardArray> rolesClaimStandardArray) {
        this.rolesClaimStandardArray = rolesClaimStandardArray;
    }

    public List<RoleClaimCheckExistPath> getRolesClaimCheckExistPath() {
        return rolesClaimCheckExistPath;
    }

    public void setRolesClaimCheckExistPath(List<RoleClaimCheckExistPath> rolesClaimCheckExistPath) {
        this.rolesClaimCheckExistPath = rolesClaimCheckExistPath;
    }
}
