/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

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

@Configuration
@Order(1)
public class ServerSecurityConfig extends WebSecurityConfigurerAdapter {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    protected void configure(AuthenticationManagerBuilder auth)
       throws Exception {
        auth.inMemoryAuthentication()
//           .passwordEncoder(NoOpPasswordEncoder.getInstance())
           .withUser("john").password(passwordEncoder.encode("123")).roles("USER").and()
           .withUser("admin").password(passwordEncoder.encode("test")).roles("USER","ADMIN").and()
           .withUser("rte-operator").password(passwordEncoder.encode("test")).roles("USER").and()
           .withUser("elia-operator").password(passwordEncoder.encode("test")).roles("USER").and()
           .withUser("coreso-operator").password(passwordEncoder.encode("test")).roles("USER").and()
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
//        http.authorizeRequests()
//           .antMatchers("/login").permitAll()
//           .antMatchers("/oauth/authorize").permitAll()
////           .antMatchers("/oauth/token").permitAll()
//           .antMatchers("/oauth/token/revokeById/**").permitAll()
//           .antMatchers("/tokens/**").permitAll()
//           .anyRequest().authenticated()
//           .and()
//           .formLogin().permitAll().and().csrf().disable();
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
