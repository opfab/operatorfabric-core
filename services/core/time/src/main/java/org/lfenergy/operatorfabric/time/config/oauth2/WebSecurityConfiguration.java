package org.lfenergy.operatorfabric.time.config.oauth2;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
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
    private Converter<Jwt, AbstractAuthenticationToken> opfabJwtConverter;

    @Override
    public void configure(final HttpSecurity http) throws Exception {
        http
           .authorizeRequests()
           .antMatchers(HttpMethod.POST,"/time/**").hasRole("ADMIN")
           .antMatchers(HttpMethod.PUT,"/time/**").hasRole("ADMIN")
           .anyRequest().permitAll()
           .and()
           .oauth2ResourceServer()
           .jwt().jwtAuthenticationConverter(opfabJwtConverter);
    }


}
