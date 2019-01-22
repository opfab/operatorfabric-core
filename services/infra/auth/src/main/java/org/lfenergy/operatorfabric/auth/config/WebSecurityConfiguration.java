/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.auth.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Configures :
 * <ul>
 *     <li>in memory users, password and roles</li>
 *     <li>routing security for REST endpoints</li>
 * </ul>
 */
@Configuration
@Order(1)
public class WebSecurityConfiguration extends WebSecurityConfigurerAdapter {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    protected void configure(AuthenticationManagerBuilder auth)
       throws Exception {
        auth.inMemoryAuthentication()
//           .passwordEncoder(NoOpPasswordEncoder.getInstance())
           .withUser("admin").password(passwordEncoder.encode("test")).roles("USER","ADMIN").and()
           .withUser("rte-operator").password(passwordEncoder.encode("test")).roles("USER").and()
           .withUser("tso1-operator").password(passwordEncoder.encode("test")).roles("USER").and()
           .withUser("tso2-operator").password(passwordEncoder.encode("test")).roles("USER").and()
        ;
    }

    @Override
    @Bean
    public AuthenticationManager authenticationManagerBean()
       throws Exception {
        return super.authenticationManagerBean();
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.requestMatchers()
           .antMatchers("/login", "/oauth/authorize")
           .and()
           .authorizeRequests()
           .anyRequest()
           .authenticated()
           .and()
           .formLogin()
           .permitAll()
           .and()
           .authorizeRequests().mvcMatchers("/jwks.json").permitAll();
    }
}
