/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.springtools.configuration.oauth.jwt.groups;

import java.util.ArrayList;
import java.util.List;

import org.opfab.springtools.configuration.oauth.jwt.groups.roles.RoleClaimCheckExistPath;
import org.opfab.springtools.configuration.oauth.jwt.groups.roles.RoleClaimStandard;
import org.opfab.springtools.configuration.oauth.jwt.groups.roles.RoleClaimStandardArray;
import org.opfab.springtools.configuration.oauth.jwt.groups.roles.RoleClaimStandardList;

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
