/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.users.config.oauth2;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;

/**
 * OAuth 2 http authentication configuration and access rules
 *
 * @author David Binder
 */
@Configuration
@Slf4j
public class WebSecurityConfiguration extends WebSecurityConfigurerAdapter {


    @Override
    public void configure(final HttpSecurity http) throws Exception {
        http.sessionManagement().sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
           .and()
           .authorizeRequests()
           .antMatchers("/users/**").authenticated()
           .anyRequest().permitAll()
           .and()
           .oauth2ResourceServer()
           .jwt()
        ;
    }

}
