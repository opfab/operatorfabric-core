/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.springtools.configuration.oauth.jwt.groups;

import lombok.Data;
import org.opfab.springtools.configuration.oauth.jwt.groups.roles.RoleClaim;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Define how to get the roles from a JWT mode or from the OPERATOR_FABRIC mode
 */

@ConfigurationProperties("operatorfabric.security.jwt.groups")
@Component
@Data
public class GroupsProperties {

    // mandatory : default mode
    private GroupsMode mode = GroupsMode.OPERATOR_FABRIC;

    private RolesClaim rolesClaim;

    /**
     * retrieve all the RolesClaimStandard and all the RolesClaimCheckExistPath
     * converted into a generic RoleClaim.
     *
     * @return a list of generic roleClaim
     */
    public List<RoleClaim> getListRoleClaim() {

        List<RoleClaim> listRoleClaimResult = new ArrayList<>();
        listRoleClaimResult.addAll(rolesClaim.getRolesClaimStandard());
        listRoleClaimResult.addAll(rolesClaim.getRolesClaimStandardList());
        listRoleClaimResult.addAll(rolesClaim.getRolesClaimStandardArray());
        listRoleClaimResult.addAll(rolesClaim.getRolesClaimCheckExistPath());
        return listRoleClaimResult;
    }

}
