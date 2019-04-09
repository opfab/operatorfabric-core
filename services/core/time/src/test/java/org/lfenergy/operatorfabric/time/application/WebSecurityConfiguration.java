/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.time.application;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

/**
 * WebSecurity test configuration
 * This should match the main WebSecurity configuration for the service, with the following changes:
 *  - Disable csrf
 *  - Remove configuration of OAuth2ResourceServer
 *
 * @author Alexandra Guironnet
 */
@Configuration
@Slf4j
public class WebSecurityConfiguration extends WebSecurityConfigurerAdapter {


    @Override
    public void configure(final HttpSecurity http) throws Exception {
        http
                .csrf().disable()
           .authorizeRequests()
           .antMatchers(HttpMethod.POST,"/time/**").hasRole("ADMIN")
           .antMatchers(HttpMethod.PUT,"/time/**").hasRole("ADMIN")
           .anyRequest().permitAll()
                ;
    }

}
