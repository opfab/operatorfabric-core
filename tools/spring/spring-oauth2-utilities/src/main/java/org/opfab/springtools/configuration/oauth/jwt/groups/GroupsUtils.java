/* Copyright (c) 2018-2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.springtools.configuration.oauth.jwt.groups;

import java.util.List;

import org.opfab.springtools.configuration.oauth.jwt.groups.roles.RoleClaim;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

/**
 * Utility class to retrieve the GrantedAuthority list through a jwt
 *
 *
 */

@Component
public class GroupsUtils {
	
	public static final String PREFIX_ROLE = "ROLE_";
	
	private GroupsProperties groupsProperties;

	public GroupsUtils(GroupsProperties groupsProperties) {
		this.groupsProperties = groupsProperties;
	}
	
	/**
	 * get a GrantedAuthority list from the Jwt 
	 * @param jwt
	 * @return List {@link GrantedAuthority}
	 */
	public List<GrantedAuthority> createAuthorityList(Jwt jwt) {
		List<String> listGroupsFromListRolesClaim = createGroupsList(jwt);
		return computeAuthorities(listGroupsFromListRolesClaim);
	}
	
	public List<String> createGroupsList(Jwt jwt) {
		
		List<RoleClaim> listRoleClaim = groupsProperties.getListRoleClaim();
		return getGroupsFromListRolesClaim(jwt, listRoleClaim);
	} 
	
	/**
	 * get a groups list from the jwt through a roles claims list defined
	 * @param jwt
	 * @param listRoleClaim
	 * @return a groups list
	 */
	private List<String> getGroupsFromListRolesClaim(Jwt jwt, List<RoleClaim> listRoleClaim) {	
		return listRoleClaim.stream().map(roleClaim -> roleClaim.getListRoles(jwt))
				.flatMap(List::stream)
				.toList();
	}
	
	/**
	 * get a GrantedAuthority list from a groups list
	 * @param listGroups
	 * @return List {@link GrantedAuthority}
	 */
	public List<GrantedAuthority> computeAuthorities(List<String> listGroups) {
		return AuthorityUtils
				.createAuthorityList(listGroups.stream().map(g -> PREFIX_ROLE + g).toArray(size -> new String[size]));
	}
	
}

