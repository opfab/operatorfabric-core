/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
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
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.opfab.springtools.configuration.test.UserServiceCacheTestApplication;
import org.opfab.springtools.configuration.oauth.jwt.JwtProperties;
import org.opfab.springtools.configuration.oauth.jwt.groups.roles.RoleClaim;
import org.opfab.springtools.configuration.oauth.jwt.groups.roles.RoleClaimCheckExistPath;
import org.opfab.springtools.configuration.oauth.jwt.groups.roles.RoleClaimStandard;
import org.opfab.springtools.configuration.oauth.jwt.groups.roles.RoleClaimStandardArray;
import org.opfab.springtools.configuration.oauth.jwt.groups.roles.RoleClaimStandardList;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.context.web.WebAppConfiguration;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = UserServiceCacheTestApplication.class)
@ActiveProfiles(profiles = {"test"})
@WebAppConfiguration
public class GroupsUtilsShould {
	
	@Autowired
	private GroupsUtils groupsUtils;
	
	@MockBean
	private GroupsProperties groupsProperties;
	
	@MockBean
	private JwtProperties jwtProperties;
	
	@BeforeEach
	public void setUp() {
	    Mockito.when(jwtProperties.getLoginClaim()).thenReturn("sub");
	    
	    Mockito.when(groupsProperties.getMode()).thenReturn(GroupsMode.JWT);
	    
	    List<RoleClaim> listRoleClaim = new ArrayList<RoleClaim>();

	    // set singleValue = true
	    RoleClaim rolesClaim1 = new RoleClaimStandard("roleClaim");
	    RoleClaim rolesClaim2 = new RoleClaimStandard("pathA1/pathA2/roleClaim");
	    
	 	// set singleValue = false;
	    RoleClaim rolesClaim3 = new RoleClaimStandardArray("pathF1/pathF2/listRoleClaim");
	    // set singleValue = false; with separator ";" and ","
	    RoleClaim rolesClaim4 = new RoleClaimStandardList("pathB1/pathB2/pathB3/listRoleClaim", ";");
	    RoleClaim rolesClaim5 = new RoleClaimStandardList("pathC1/listRoleClaim", ",");
	    
	    // set checkExistPath = true, default value which is implicit value
	    RoleClaim rolesClaim6 = new RoleClaimCheckExistPath("pathD1/RoleClaimOptionalD1", "RoleClaimOptionalD1");
	    // set checkExistPath = true, roleValue = "RoleClaimOptionalE1"
	    RoleClaim rolesClaim7 = new RoleClaimCheckExistPath("pathE1/pathE2/RoleClaimOptionalE1", "RoleClaimOptionalE1");
	    
	    listRoleClaim.add(rolesClaim1);
	    listRoleClaim.add(rolesClaim2);
	    listRoleClaim.add(rolesClaim3);
	    listRoleClaim.add(rolesClaim4);
	    listRoleClaim.add(rolesClaim5);
	    listRoleClaim.add(rolesClaim6);
	    listRoleClaim.add(rolesClaim7);
	    
	    Mockito.when(groupsProperties.getListRoleClaim()).thenReturn(listRoleClaim);
	}
	
	@Test 
	public void createAuthorityListFromRoleStandardClaims() {
		String jwtHeader = "{\"alg\":\"HS256\",\"typ\":\"JWT\",\"kid\":\"RmqNU3K7LxrNRFkHU2qq6Yq12kTCismFL9ScpnCOx0c\"}";
		String jwtBody = "{ \n" + 
				"    \"jti\": \"ebf36450-e18c-490b-9a68-feef8dfab1c1\",\n" + 
				"    \"exp\": 1571170078,\n" + 
				"    \"nbf\": 0,\n" + 
				"    \"iat\": 1571152078,\n" + 
				"    \"iss\": \"http://localhost:89/auth/realms/dev\",\n" + 
				"    \"aud\": \"account\",\n" + 
				"    \"sub\": \"user_not_opfab\",\n" + 
				"    \"typ\": \"Bearer\",\n" + 
				"    \"azp\": \"opfab-client\",\n" + 
				"    \"acr\": \"1\",\n" + 
				"    \n" + 
				"    \"roleClaim\":\"RoleClaimValue\",\n" + 
				"    \"pathA1\": {\n" + 
				"        \"pathA2\": {\n" + 
				"            \"roleClaim\":\"ADMIN\"    \n" + 
				"        }\n" + 
				"    }"+
				"}";
				
		// Given
		String tokenValueEncoded = ToolsGeneratorTokenHelper.getTokenEncoded(jwtHeader, jwtBody);
		
		// headers and claims can't be null or empty
		// set dummy values, all matter is the token value
		Map<String, Object> headers = new HashMap<String, Object>();
		headers.put("dummy1", null);
		Map<String, Object> claims = new HashMap<String, Object>();
		claims.put("dummy2", null);
		
		Jwt jwt = new Jwt(tokenValueEncoded, Instant.ofEpochMilli(0), Instant.now(), headers, claims);
		
		// Test
		List<GrantedAuthority> listGrantedAuthorityActual = groupsUtils.createAuthorityList(jwt);
		
		// Result
        assertThat(listGrantedAuthorityActual, hasSize(2));
        assertThat("must contains the ROLE_RoleClaimValue", listGrantedAuthorityActual.contains(new SimpleGrantedAuthority("ROLE_RoleClaimValue")));
        assertThat("must contains the ROLE_ADMIN", listGrantedAuthorityActual.contains(new SimpleGrantedAuthority("ROLE_ADMIN")));
	}
	
	@Test 
	public void createAuthorityListFromRoleStandardList() {
		String jwtHeader = "{\"alg\":\"HS256\",\"typ\":\"JWT\",\"kid\":\"RmqNU3K7LxrNRFkHU2qq6Yq12kTCismFL9ScpnCOx0c\"}";
		String jwtBody = "{ \n" + 
				"    \"jti\": \"ebf36450-e18c-490b-9a68-feef8dfab1c1\",\n" + 
				"    \"exp\": 1571170078,\n" + 
				"    \"nbf\": 0,\n" + 
				"    \"iat\": 1571152078,\n" + 
				"    \"iss\": \"http://localhost:89/auth/realms/dev\",\n" + 
				"    \"aud\": \"account\",\n" + 
				"    \"sub\": \"user_not_opfab\",\n" + 
				"    \"typ\": \"Bearer\",\n" + 
				"    \"azp\": \"opfab-client\",\n" + 
				"    \"acr\": \"1\",\n" + 
				"    \n" + 
				"    \"pathB1\": {\n" + 
				"        \"pathB2\": {\n" + 
				"            \"pathB3\": {\n" + 
				"                \"listRoleClaim\":\"RoleB1;RoleB2;RoleB3\"    \n" + 
				"            }   \n" + 
				"        }\n" + 
				"    },\n" + 
				"    \"pathC1\": {\n" + 
				"        \"listRoleClaim\":\"RoleC1,RoleC2\"\n" + 
				"    }\n" + 
				"}";
				
		// Given
		String tokenValueEncoded = ToolsGeneratorTokenHelper.getTokenEncoded(jwtHeader, jwtBody);
		
		// headers and claims can't be null or empty
		// set dummy values, all matter is the token value
		Map<String, Object> headers = new HashMap<String, Object>();
		headers.put("dummy1", null);
		Map<String, Object> claims = new HashMap<String, Object>();
		claims.put("dummy2", null);
		
		Jwt jwt = new Jwt(tokenValueEncoded, Instant.ofEpochMilli(0), Instant.now(), headers, claims);
		
		// Test
		List<GrantedAuthority> listGrantedAuthorityActual = groupsUtils.createAuthorityList(jwt);
		
		// Result
        assertThat(listGrantedAuthorityActual, hasSize(5));
        assertThat("must contains the ROLE_RoleB1", listGrantedAuthorityActual.contains(new SimpleGrantedAuthority("ROLE_RoleB1")));
        assertThat("must contains the ROLE_RoleB2", listGrantedAuthorityActual.contains(new SimpleGrantedAuthority("ROLE_RoleB2")));
        assertThat("must contains the ROLE_RoleB3", listGrantedAuthorityActual.contains(new SimpleGrantedAuthority("ROLE_RoleB3")));
        assertThat("must contains the ROLE_RoleC1", listGrantedAuthorityActual.contains(new SimpleGrantedAuthority("ROLE_RoleC1")));
        assertThat("must contains the ROLE_RoleC2", listGrantedAuthorityActual.contains(new SimpleGrantedAuthority("ROLE_RoleC2")));
	}
	
	@Test
	public void createAuthorityListFromRoleStandardArray() {
		String jwtHeader = "{\"alg\":\"HS256\",\"typ\":\"JWT\",\"kid\":\"RmqNU3K7LxrNRFkHU2qq6Yq12kTCismFL9ScpnCOx0c\"}";
		String jwtBody = "{ \n" + 
				"    \"jti\": \"ebf36450-e18c-490b-9a68-feef8dfab1c1\",\n" + 
				"    \"exp\": 1571170078,\n" + 
				"    \"nbf\": 0,\n" + 
				"    \"iat\": 1571152078,\n" + 
				"    \"iss\": \"http://localhost:89/auth/realms/dev\",\n" + 
				"    \"aud\": \"account\",\n" + 
				"    \"sub\": \"user_not_opfab\",\n" + 
				"    \"typ\": \"Bearer\",\n" + 
				"    \"azp\": \"opfab-client\",\n" + 
				"    \"acr\": \"1\",\n" + 
				"    \n" + 
				"    \"pathF1\": {\n" + 
				"        \"pathF2\": {\n" + 
				"            \"listRoleClaim\": [\n" + 
				"                \"F1\", \n" + 
				"                \"F2\", \n" + 
				"                \"F3\"\n" + 
				"            ]\n" + 
				"        }\n" + 
				"    }\n" + 
				"}";
		
		// Given
		String tokenValueEncoded = ToolsGeneratorTokenHelper.getTokenEncoded(jwtHeader, jwtBody);
		
		// headers and claims can't be null or empty
		// set dummy values, all matter is the token value
		Map<String, Object> headers = new HashMap<String, Object>();
		headers.put("dummy1", null);
		Map<String, Object> claims = new HashMap<String, Object>();
		claims.put("dummy2", null);
		
		Jwt jwt = new Jwt(tokenValueEncoded, Instant.ofEpochMilli(0), Instant.now(), headers, claims);
		
		// Test
		List<GrantedAuthority> listGrantedAuthorityActual = groupsUtils.createAuthorityList(jwt);
		
		// Result
        assertThat(listGrantedAuthorityActual, hasSize(3));
				
	    assertThat("must contains the ROLE_F1", listGrantedAuthorityActual.contains(new SimpleGrantedAuthority("ROLE_F1")));
        assertThat("must contains the ROLE_F2", listGrantedAuthorityActual.contains(new SimpleGrantedAuthority("ROLE_F2")));
	    assertThat("must contains the ROLE_F3", listGrantedAuthorityActual.contains(new SimpleGrantedAuthority("ROLE_F3"))); 
	}
	
	@Test 
	public void createAuthorityListFromRoleCheckExistPath() {
		String jwtHeader = "{\"alg\":\"HS256\",\"typ\":\"JWT\",\"kid\":\"RmqNU3K7LxrNRFkHU2qq6Yq12kTCismFL9ScpnCOx0c\"}";
		String jwtBody = "{ \n" + 
				"    \"jti\": \"ebf36450-e18c-490b-9a68-feef8dfab1c1\",\n" + 
				"    \"exp\": 1571170078,\n" + 
				"    \"nbf\": 0,\n" + 
				"    \"iat\": 1571152078,\n" + 
				"    \"iss\": \"http://localhost:89/auth/realms/dev\",\n" + 
				"    \"aud\": \"account\",\n" + 
				"    \"sub\": \"user_not_opfab\",\n" + 
				"    \"typ\": \"Bearer\",\n" + 
				"    \"azp\": \"opfab-client\",\n" + 
				"    \"acr\": \"1\",\n" + 
				"    \n" + 
				"    \"pathD1\": {\n" + 
				"        \"RoleClaimOptionalD1\": {\n" + 
				"            \"othersD2\": \"Value not important\"\n" + 
				"        }\n" + 
				"    },\n" + 
				"    \"pathE1\": {\n" + 
				"        \"pathE2\": {\n" + 
				"            \"RoleClaimOptionalE1\": \"Value not important\"\n" + 
				"        }\n" + 
				"    }\n" + 
				"}";
		
		// Given
		String tokenValueEncoded = ToolsGeneratorTokenHelper.getTokenEncoded(jwtHeader, jwtBody);
		
		// headers and claims can't be null or empty
		// set dummy values, all matter is the token value
		Map<String, Object> headers = new HashMap<String, Object>();
		headers.put("dummy1", null);
		Map<String, Object> claims = new HashMap<String, Object>();
		claims.put("dummy2", null);
		
		Jwt jwt = new Jwt(tokenValueEncoded, Instant.ofEpochMilli(0), Instant.now(), headers, claims);
		
		// Test
		List<GrantedAuthority> listGrantedAuthorityActual = groupsUtils.createAuthorityList(jwt);
		
		// Result
        assertThat(listGrantedAuthorityActual, hasSize(2));
        assertThat("must contains the ROLE_RoleClaimOptionalD1", listGrantedAuthorityActual.contains(new SimpleGrantedAuthority("ROLE_RoleClaimOptionalD1")));
        assertThat("must contains the ROLE_RoleClaimOptionalE1", listGrantedAuthorityActual.contains(new SimpleGrantedAuthority("ROLE_RoleClaimOptionalE1")));
	}

	@Test
    public void createAuthorityListFromListRolesClaim(){
		String jwtHeader = "{\"alg\":\"HS256\",\"typ\":\"JWT\",\"kid\":\"RmqNU3K7LxrNRFkHU2qq6Yq12kTCismFL9ScpnCOx0c\"}";
		String jwtBody = "{ \n" + 
				"    \"jti\": \"ebf36450-e18c-490b-9a68-feef8dfab1c1\",\n" + 
				"    \"exp\": 1571170078,\n" + 
				"    \"nbf\": 0,\n" + 
				"    \"iat\": 1571152078,\n" + 
				"    \"iss\": \"http://localhost:89/auth/realms/dev\",\n" + 
				"    \"aud\": \"account\",\n" + 
				"    \"sub\": \"user_not_opfab\",\n" + 
				"    \"typ\": \"Bearer\",\n" + 
				"    \"azp\": \"opfab-client\",\n" + 
				"    \"acr\": \"1\",\n" + 
				"    \"roleClaim\":\"RoleClaimValue\",\n" + 
				"    \"pathA1\": {\n" + 
				"        \"pathA2\": {\n" + 
				"            \"roleClaim\":\"ADMIN\"    \n" + 
				"        }\n" + 
				"    },\n" + 
				"    \"pathB1\": {\n" + 
				"        \"pathB2\": {\n" + 
				"            \"pathB3\": {\n" + 
				"                \"listRoleClaim\":\"RoleB1;RoleB2;RoleB3\"    \n" + 
				"            }   \n" + 
				"        }\n" + 
				"    },\n" + 
				"    \"pathC1\": {\n" + 
				"        \"listRoleClaim\":\"RoleC1,RoleC2\"\n" + 
				"    },\n" + 
				"    \"pathF1\": {\n" + 
				"        \"pathF2\": {\n" + 
				"            \"listRoleClaim\": [\n" + 
				"                \"F1\", \n" + 
				"                \"F2\", \n" + 
				"                \"F3\"\n" + 
				"            ]\n" + 
				"        }\n" + 
				"    },\n" + 
				"    \"pathD1\": {\n" + 
				"        \"RoleClaimOptionalD1\": {\n" + 
				"            \"othersD2\": \"Value not important\"\n" + 
				"        }\n" + 
				"    },\n" + 
				"    \"pathE1\": {\n" + 
				"        \"pathE2\": {\n" + 
				"            \"RoleClaimOptionalE1\": \"Value not important\"\n" + 
				"        }\n" + 
				"    }\n" + 
				"}";
		
		// Given
		String tokenValueEncoded = ToolsGeneratorTokenHelper.getTokenEncoded(jwtHeader, jwtBody);
		
		// headers and claims can't be null or empty
		// set dummy values, all matter is the token value
		Map<String, Object> headers = new HashMap<String, Object>();
		headers.put("dummy1", null);
		Map<String, Object> claims = new HashMap<String, Object>();
		claims.put("dummy2", null);
		
		Jwt jwt = new Jwt(tokenValueEncoded, Instant.ofEpochMilli(0), Instant.now(), headers, claims);
		
		// Test
		List<GrantedAuthority> listGrantedAuthorityActual = groupsUtils.createAuthorityList(jwt);
		
		// Result
        assertThat(listGrantedAuthorityActual, hasSize(12));
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
