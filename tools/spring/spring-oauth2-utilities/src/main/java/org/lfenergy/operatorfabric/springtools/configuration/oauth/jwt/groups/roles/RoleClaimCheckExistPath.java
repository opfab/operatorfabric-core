/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.springtools.configuration.oauth.jwt.groups.roles;

import java.util.ArrayList;
import java.util.List;

import javax.validation.constraints.NotNull;

import com.fasterxml.jackson.databind.JsonNode;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Define the structure of the RoleClaimCheckExistPath.
 * It is a specific case to retrieve a role through a path value.
 *
 *
 */
@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper=true)
public class RoleClaimCheckExistPath extends RoleClaim {

	@NotNull
	protected String roleValue;
	
	public RoleClaimCheckExistPath(String path) {
		super(path);
	}
	
	public RoleClaimCheckExistPath(String path, String roleValue) {
		this(path);
		this.roleValue = roleValue;
	}
	
	/**
	 * Get the list of role through the computation
	 * No need to check (already check before) 
	 * In this case, return the role value associated.
	 */
	@Override
	public List<String> computeNodeElementRole(JsonNode jsonNodeElement) {
		List<String> listGroupsResult = new ArrayList<>();
		listGroupsResult.add(roleValue);
		return listGroupsResult;
	}
	
	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder();
		sb.append("RoleClaimCheckExistPath(path=")
				.append(path)
				.append(", roleValue=")
				.append(roleValue)
				.append(")");
		return sb.toString();
	}


}
