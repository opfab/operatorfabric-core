/* Copyright (c) 2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.externalapp.config;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

/**
 * OAuth 2 http authentication configuration and access rules
 *
 *
 */
@Configuration
@EnableWebSecurity
public class WebSecurityConfiguration extends WebSecurityConfigurerAdapter {


    @Value("${authenticationRequired:true}")
    private boolean authenticationRequired;
    
    @Override
    public void configure(final HttpSecurity http) throws Exception {
        configureCommon(http, authenticationRequired);
        http
                .oauth2ResourceServer()
                .jwt();
    }

    public static void configureCommon(final HttpSecurity http, boolean authenticationRequired) throws Exception {
        http.csrf().disable();
        if (authenticationRequired) {
            http
                    .authorizeRequests()
                    .antMatchers("/test").authenticated()
                    .antMatchers("/test/**").authenticated()
                    .antMatchers("/**").permitAll();
        }
             
    }

}
