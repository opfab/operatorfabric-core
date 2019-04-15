/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.users.configuration.oauth2;

import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.springtools.configuration.oauth.OAuth2GenericConfiguration;
import org.lfenergy.operatorfabric.springtools.configuration.oauth.OAuth2JwtProcessingUtilities;
import org.lfenergy.operatorfabric.springtools.configuration.oauth.OpFabJwtAuthenticationToken;
import org.lfenergy.operatorfabric.springtools.error.model.ApiError;
import org.lfenergy.operatorfabric.springtools.error.model.ApiErrorException;
import org.lfenergy.operatorfabric.users.model.User;
import org.lfenergy.operatorfabric.users.model.UserData;
import org.lfenergy.operatorfabric.users.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.util.List;

/**
 * Specific authentication configuration for the Users service
 * It is necessary because when converting the jwt token the {@link OAuth2GenericConfiguration}
 * relies on a user service cache and proxy to get user details, which is useless in the case of the Users Service itself.
 * Token conversion was made necessary because access depending on roles is now used in the WebSecurityConfiguration of this service.
 *
 * @author Alexandra Guironnet
 */
@Configuration
@Slf4j
public class OAuth2UsersConfiguration {

    /**
     * Generates a converter that converts {@link Jwt} to {@link OpFabJwtAuthenticationToken} whose principal is  a
     * {@link User} model object
     *
     * @return Converter from {@link Jwt} to {@link OpFabJwtAuthenticationToken}
     */
    @Bean
    public Converter<Jwt, AbstractAuthenticationToken> opfabJwtConverter(@Autowired UserRepository userRepository) {

        return new Converter<Jwt, AbstractAuthenticationToken>(){

            @Override
            public AbstractAuthenticationToken convert(Jwt jwt) {
                String principalId = jwt.getClaimAsString("sub");
                OAuth2JwtProcessingUtilities.token.set(jwt);
                UserData user = userRepository.findById(principalId).orElseThrow(() -> new ApiErrorException(
                        ApiError.builder()
                                .status(HttpStatus.BAD_REQUEST)
                                .message("Privileges for current user couldn't be retrieved from Users service (user doesn't exist).")
                                .build()))
                        ;
                OAuth2JwtProcessingUtilities.token.remove();
                List<GrantedAuthority> authorities = computeAuthorities(user);
                return new OpFabJwtAuthenticationToken(jwt, user, authorities);
            }
        };
    }

    /**
     * Creates Authority list from user's groups (ROLE_[group name])
     * @param user user model data
     * @return list of authority
     */
    public static List<GrantedAuthority> computeAuthorities(User user) {
        return AuthorityUtils.createAuthorityList(user.getGroups().stream().map(g -> "ROLE_" + g).toArray(size ->
                new
                        String[size]));
    }
}
