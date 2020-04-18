/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


package org.lfenergy.operatorfabric.actions.configuration.webflux;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.actions.services.clients.UserClient;
import org.lfenergy.operatorfabric.users.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.config.annotation.method.configuration.EnableReactiveMethodSecurity;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.authorization.AuthorizationContext;
import reactor.core.publisher.Mono;

import java.util.Collection;
import java.util.List;


/**
 * Configures web security
 */
@Configuration
@Slf4j
@EnableWebFluxSecurity
@EnableReactiveMethodSecurity
public class WebSecurityConfiguration {

    @Autowired
    UserClient userClient;

    /**
     * Secures access (all uris are secured)
     *
     * @param http http security configuration
     * @return http security filter chain
     */
    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        configureCommon(http);
        http
                .oauth2ResourceServer()
                .jwt()
                .jwtAuthenticationConverter(this.getOpFabReactiveWebSecurityConverter());

        return http.build();
    }

    /**
     * This method handles the configuration to be shared with the test WebSecurityConfiguration class (access rules to be tested)
     */
    public static void configureCommon(final ServerHttpSecurity http) {
        http.headers()
                .frameOptions()
                .disable()
                .and()
                .authorizeExchange()
                .pathMatchers("/publisher/**")
                .access(WebSecurityConfiguration::currentUserHasAnyRole)
                .anyExchange().authenticated();

    }

    /**
     *
     */
    private static Mono<AuthorizationDecision> currentUserHasAnyRole(Mono<Authentication> authentication, AuthorizationContext context) {
        return authentication
                .filter(Authentication::isAuthenticated)
                .flatMapIterable(Authentication::getAuthorities)
                .hasElements()
                .map(AuthorizationDecision::new)
                .defaultIfEmpty(new AuthorizationDecision(false))
                ;
    }

    /**
     * opfabReactiveJwtConverter OperatorFabric authentication converter
     */

    Converter<Jwt, Mono<AbstractAuthenticationToken>> getOpFabReactiveWebSecurityConverter() {
        return jwt -> {

            String principalId = jwt.getClaimAsString("sub");
            String jwtString = jwt.getTokenValue();
            return userClient.fetchUser(principalId, "Bearer " + jwtString)
                    .map(user -> {
                List<GrantedAuthority> authorities = AuthorityUtils
                        .createAuthorityList(user
                                .getGroups()
                                .stream()
                                .map(group -> "ROLE_" + group)
                                .toArray(size -> new String[size]));
                AbstractAuthenticationToken result = new TransitoryToken(jwt, user, authorities);
                return result;
            });

        };
    }

}

class TransitoryToken extends JwtAuthenticationToken {
    @Getter
    private final Object principal;

    public TransitoryToken(Jwt jwt, User principal, Collection<? extends GrantedAuthority>
            authorities) {
        super(jwt, authorities);
        this.principal = principal;
    }

}