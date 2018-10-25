/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.cards.consultation.config.oauth2;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

//import org.springframework.boot.autoconfigure.security.oauth2.client.EnableOAuth2Sso;
//import org.springframework.security.oauth2.config.annotation.web.configuration.EnableResourceServer;
//import org.springframework.security.oauth2.config.annotation.web.configuration.ResourceServerConfigurerAdapter;

/**
 * <p></p>
 * Created on 09/08/18
 *
 * @author davibind
 */
@Configuration
@Slf4j
@EnableWebFluxSecurity
public class OAuth2ResourceServerConfiguration  {

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http,ReactiveAuthenticationManager opfabJwtReactiveAuthenticationManager) {
        http.headers().frameOptions().disable();
        http
                .authorizeExchange()
//                .matchers(PathRequest.toStaticResources().atCommonLocations()).permitAll()
//                .pathMatchers("/cards")
//                .authenticated().and()
                .anyExchange().authenticated().and()
                .oauth2ResourceServer().jwt().authenticationManager(opfabJwtReactiveAuthenticationManager);
                return http.build();
    }


}
