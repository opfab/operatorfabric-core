/* Copyright (c) 2018-2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.springtools.configuration.oauth.jwt.groups;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.collection.IsCollectionWithSize.hasSize;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.context.web.WebAppConfiguration;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = TestApplication.class)
@WebAppConfiguration
class GroupsUtilsWithApplicationFileConfigShould {
	
	@Autowired
	private GroupsUtils groupsUtils;
	
	public String tokenEncoded = null;
	
	@BeforeEach
	public void before() {
		String jwtHeader = "{\"alg\":\"HS256\",\"typ\":\"JWT\",\"kid\":\"RmqNU3K7LxrNRFkHU2qq6Yq12kTCismFL9ScpnCOx0c\"}";
		String jwtBody = """
                    { 
                        "jti": "ebf36450-e18c-490b-9a68-feef8dfab1c1",
                        "exp": 1571170078,
                        "nbf": 0,
                        "iat": 1571152078,
                        "iss": "http://localhost:89/auth/realms/dev",
                        "aud": "account",
                        "sub": "user_not_opfab", 
                        "typ": "Bearer",
                        "azp": "opfab-client", 
                        "acr": "1",
                        "roleClaim":"RoleClaimValue", 
                        "pathA1": { 
                            "pathA2": {
                                "roleClaim":"ADMIN"     
                            } 
                        },
                        "pathB1": { 
                            "pathB2": { 
                                "pathB3": {
                                    "listRoleClaim":"RoleB1;RoleB2;RoleB3"     
                                }    
                            } 
                        },
                        "pathC1": {
                            "listRoleClaim":"RoleC1,RoleC2" 
                        },
                        "pathF1": { 
                            "pathF2": {
                                "listRoleClaim": [ 
                                    "F1",  
                                    "F2",  
                                    "F3" 
                                ] 
                            } 
                        },
                        "pathD1": {
                            "RoleClaimOptionalD1": {
                                "othersD2": "Value not important" 
                            } 
                        },
                        "pathE1": { 
                            "pathE2": {
                                "RoleClaimOptionalE1": "Value not important" 
                            } 
                        }
                    }""";

		tokenEncoded = ToolsGeneratorTokenHelper.getTokenEncoded(jwtHeader, jwtBody);
	}
	
	@Test
    void createAuthorityListFromListRolesClaim(){
		
		// Given
		String tokenValue = tokenEncoded;
		
		// headers and claims can't be null or empty
		// set dummy values, all matter is the token value
		Map<String, Object> headers = new HashMap<String, Object>();
		headers.put("dummy1", null);
		Map<String, Object> claims = new HashMap<String, Object>();
		claims.put("dummy2", null);
				
		Jwt jwt = new Jwt(tokenValue, Instant.ofEpochMilli(0), Instant.now(), headers, claims);
		
		// Test
		List<GrantedAuthority> listGrantedAuthorityActual = groupsUtils.createAuthorityList(jwt);
		
		// Result
        assertThat(listGrantedAuthorityActual, hasSize(12));
        // check Standard claims
        assertThat("must contains the ROLE_RoleClaimValue", listGrantedAuthorityActual.contains(new SimpleGrantedAuthority("ROLE_RoleClaimValue")));
        assertThat("must contains the ROLE_ADMIN", listGrantedAuthorityActual.contains(new SimpleGrantedAuthority("ROLE_ADMIN")));
        // check Standard list claims 
        assertThat("must contains the ROLE_RoleB1", listGrantedAuthorityActual.contains(new SimpleGrantedAuthority("ROLE_RoleB1")));
        assertThat("must contains the ROLE_RoleB2", listGrantedAuthorityActual.contains(new SimpleGrantedAuthority("ROLE_RoleB2")));
        assertThat("must contains the ROLE_RoleB3", listGrantedAuthorityActual.contains(new SimpleGrantedAuthority("ROLE_RoleB3")));
        assertThat("must contains the ROLE_RoleC1", listGrantedAuthorityActual.contains(new SimpleGrantedAuthority("ROLE_RoleC1")));
        assertThat("must contains the ROLE_RoleC2", listGrantedAuthorityActual.contains(new SimpleGrantedAuthority("ROLE_RoleC2")));
        // check Standard Array claims
        assertThat("must contains the ROLE_F1", listGrantedAuthorityActual.contains(new SimpleGrantedAuthority("ROLE_F1")));
        assertThat("must contains the ROLE_F2", listGrantedAuthorityActual.contains(new SimpleGrantedAuthority("ROLE_F2")));
        assertThat("must contains the ROLE_F3", listGrantedAuthorityActual.contains(new SimpleGrantedAuthority("ROLE_F3")));
        // check CheckExistPath claims 
        assertThat("must contains the ROLE_RoleClaimOptionalD1", listGrantedAuthorityActual.contains(new SimpleGrantedAuthority("ROLE_RoleClaimOptionalD1")));
        assertThat("must contains the ROLE_RoleClaimOptionalE1", listGrantedAuthorityActual.contains(new SimpleGrantedAuthority("ROLE_RoleClaimOptionalE1")));
	}
		
}
