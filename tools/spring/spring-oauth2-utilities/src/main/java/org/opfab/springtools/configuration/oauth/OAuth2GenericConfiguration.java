/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.springtools.configuration.oauth;

import feign.*;
import feign.codec.Decoder;
import feign.codec.Encoder;
import feign.jackson.JacksonDecoder;
import feign.jackson.JacksonEncoder;
import lombok.extern.slf4j.Slf4j;
import org.opfab.springtools.configuration.oauth.jwt.JwtProperties;
import org.opfab.springtools.configuration.oauth.jwt.groups.GroupsMode;
import org.opfab.springtools.configuration.oauth.jwt.groups.GroupsProperties;
import org.opfab.springtools.configuration.oauth.jwt.groups.GroupsUtils;
import org.opfab.users.model.CurrentUserWithPerimeters;
import org.opfab.users.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Common configuration (MVC and Webflux)
 *
 *
 */
@Configuration
@EnableFeignClients
@EnableCaching
@Import({UserServiceCache.class
        ,BusConfiguration.class
        ,UpdateUserEventListener.class
        ,UpdatedUserEvent.class
        , GroupsProperties.class
        , GroupsUtils.class
        , JwtProperties.class})
@Slf4j
public class OAuth2GenericConfiguration {



    @Autowired
    protected UserServiceCache userServiceCache;
    
	@Autowired
	protected GroupsProperties groupsProperties;
	
	@Autowired
	protected JwtProperties jwtProperties;
	
	@Autowired
	protected GroupsUtils groupsUtils;

    /**
     * Generates a converter that converts {@link Jwt} to {@link OpFabJwtAuthenticationToken} whose principal is  a
     * {@link User} model object
     *
     * @return Converter from {@link Jwt} to {@link OpFabJwtAuthenticationToken}
     */
    @Bean
    public Converter<Jwt, AbstractAuthenticationToken> opfabJwtConverter() {

        return new Converter<Jwt, AbstractAuthenticationToken>(){
            @Override
            public AbstractAuthenticationToken convert(Jwt jwt) throws FeignException {
            	AbstractAuthenticationToken authenticationToken = generateOpFabJwtAuthenticationToken(jwt);
                return authenticationToken;
            }
        };
    }


    @Bean
    public Encoder jacksonEncoder() {
        return new JacksonEncoder();
    }

    @Bean
    public Decoder jacksonDecoder() {
        return new JacksonDecoder();
    }



    public AbstractAuthenticationToken generateOpFabJwtAuthenticationToken(Jwt jwt) {
        
        String principalId = jwt.getClaimAsString(jwtProperties.getLoginClaim());
        UserServiceCache.setTokenForUserRequest(principalId,jwt.getTokenValue());
        CurrentUserWithPerimeters currentUserWithPerimeters = userServiceCache.fetchCurrentUserWithPerimetersFromCacheOrProxy(principalId);
        User user = currentUserWithPerimeters.getUserData();

        // override the groups list from JWT mode, otherwise, default mode is OPERATOR_FABRIC
		if (groupsProperties.getMode() == GroupsMode.JWT) user.setGroups(getGroupsList(jwt));
        
        if (jwtProperties.gettingEntitiesFromToken) user.setEntities(getEntitiesFromToken(jwt));

		List<GrantedAuthority> authorities = OAuth2JwtProcessingUtilities.computeAuthorities(user);
		
		log.debug("user [{}] has these roles '{}' through the {} mode and entities {}",principalId,authorities,groupsProperties.getMode(),user.getEntities());
        
        return new OpFabJwtAuthenticationToken(jwt, currentUserWithPerimeters, authorities);
    }

	/**
	 * Creates group list from a jwt
	 * 
	 * @param jwt user's token
	 * @return a group list
	 */
	public List<String> getGroupsList(Jwt jwt) {
		return groupsUtils.createGroupsList(jwt);

    }

    private List<String> getEntitiesFromToken(Jwt jwt){
        String entitiesId = jwt.getClaimAsString(jwtProperties.getEntitiesIdClaim());  
        List<String> enititiesIdList = new ArrayList<>();
		if (entitiesId!=null)  enititiesIdList.addAll(Arrays.asList(entitiesId.split(";")));	
		return enititiesIdList;      

    }

}
