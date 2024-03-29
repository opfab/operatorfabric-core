/* Copyright (c) 2018-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.springtools.configuration.oauth.jwt;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Data;


@ConfigurationProperties("operatorfabric.security.jwt")
@Component
@Data
public class JwtProperties {
	
	// mandatory claim, default value
	private String loginClaim = "sub";
	
	// optional claims
	private String givenNameClaim = "given_name";
	private String familyNameClaim = "family_name";
	private String nameClaim = "name";

	
	private String entitiesIdClaim = "entitiesId";
	private boolean gettingEntitiesFromToken = false;

}
