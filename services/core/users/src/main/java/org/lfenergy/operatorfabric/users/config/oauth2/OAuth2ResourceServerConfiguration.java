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
 * <p></p>
 * Created on 09/08/18
 *
 * @author davibind
 */
@Configuration
@Slf4j
public class OAuth2ResourceServerConfiguration extends WebSecurityConfigurerAdapter {

//    @Autowired
//    private Converter<Jwt, AbstractAuthenticationToken> opfabJwtConverter;

    @Override
    public void configure(final HttpSecurity http) throws Exception {
        http.sessionManagement().sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED.IF_REQUIRED)
           .and()
           .authorizeRequests()
//           .antMatchers(HttpMethod.POST,"/time/**").authenticated()//.access("#oauth2.hasScope('read')")
           .antMatchers("/users/**").authenticated()//.access("#oauth2.hasScope('read')")
           .anyRequest().permitAll()
           .and()
           .oauth2ResourceServer()
           .jwt()
// .jwtAuthenticationConverter(opfabJwtConverter)
        ;
    }

}
