/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.lfenergy.operatorfabric.springtools.configuration.oauth.jwt.groups.roles;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import javax.validation.constraints.NotNull;

import com.fasterxml.jackson.databind.JsonNode;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Define the structure of the RoleClaimStandardList, an extension of RoleClaimStandard 
 * that dealts the case of key/value whose the value is a list of roles separated by a separator.
 *
 *
 */
@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper=true)
public class RoleClaimStandardList extends RoleClaimStandard {
	
	@NotNull
	protected String separator;
	
	public RoleClaimStandardList(String path, String separator) {
		this(path);
		this.separator = separator;
	}
	
	public RoleClaimStandardList(String path) {
		super(path);
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
		sb.append("RoleClaimStandardList(path=").append(path).append(", separator=").append(separator).append(")");
		return sb.toString();
	}
	 
}
