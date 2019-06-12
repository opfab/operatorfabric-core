/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.users.configuration.oauth2;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.Jwt;

/**
 * OAuth 2 http authentication configuration and access rules
 *
 * @author David Binder
 */
@Configuration
@Slf4j
public class WebSecurityConfiguration extends WebSecurityConfigurerAdapter {

    @Autowired
    WebSecurityChecks webSecurityChecks;

    @Autowired
    private Converter<Jwt, AbstractAuthenticationToken> opfabJwtConverter;

    @Override
    public void configure(final HttpSecurity http) throws Exception {
        configureCommon(http);
        http
                .oauth2ResourceServer()
                .jwt()
                .jwtAuthenticationConverter(opfabJwtConverter)
        ;
    }

    public static void configureCommon(final HttpSecurity http) throws Exception {
        http.sessionManagement().sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                .and()
                .authorizeRequests()
                .antMatchers(HttpMethod.GET,"/users/{login}").access("hasRole('ADMIN') or @webSecurityChecks.checkUserLogin(authentication,#login)")
                .antMatchers(HttpMethod.PUT,"/users/{login}").access("hasRole('ADMIN') or @webSecurityChecks.checkUserLogin(authentication,#login)")
                .antMatchers(HttpMethod.GET,"/users/{login}/settings").access("hasRole('ADMIN') or @webSecurityChecks.checkUserLogin(authentication,#login)")
                .antMatchers(HttpMethod.PUT,"/users/{login}/settings").access("hasRole('ADMIN') or @webSecurityChecks.checkUserLogin(authentication,#login)")
                .antMatchers(HttpMethod.PATCH,"/users/{login}/settings").access("hasRole('ADMIN') or @webSecurityChecks.checkUserLogin(authentication,#login)")
                .antMatchers("/users/**").hasRole("ADMIN")
                .antMatchers("/groups/**").hasRole("ADMIN")
                .anyRequest().permitAll();
    }

}
