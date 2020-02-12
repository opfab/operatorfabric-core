/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.springtools.configuration.oauth.jwt.groups;

import java.util.ArrayList;
import java.util.List;

import org.lfenergy.operatorfabric.springtools.configuration.oauth.jwt.groups.roles.RoleClaimCheckExistPath;
import org.lfenergy.operatorfabric.springtools.configuration.oauth.jwt.groups.roles.RoleClaimStandard;
import org.lfenergy.operatorfabric.springtools.configuration.oauth.jwt.groups.roles.RoleClaimStandardArray;
import org.lfenergy.operatorfabric.springtools.configuration.oauth.jwt.groups.roles.RoleClaimStandardList;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Contains all type of RoleClaim (RoleClaimStandard, rolesClaimStandardList, rolesClaimStandardArray or RoleClaimCheckExistPath for instance...)
 *
 *
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class RolesClaim {

	private List<RoleClaimStandard> rolesClaimStandard = new ArrayList<>();
	private List<RoleClaimStandardList> rolesClaimStandardList = new ArrayList<>();
	private List<RoleClaimStandardArray> rolesClaimStandardArray = new ArrayList<>();
	private List<RoleClaimCheckExistPath> rolesClaimCheckExistPath = new ArrayList<>();

}
