
package org.lfenergy.operatorfabric.time.configuration.oauth2;

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

    public static final String TIME_PATH = "/time/**";
    public static final String ADMIN_ROLE = "ADMIN";
    @Autowired
    private Converter<Jwt, AbstractAuthenticationToken> opfabJwtConverter;

    private static final String[] AUTH_WHITELIST = {

            // -- swagger ui
            "/swagger-resources/**",
            "/swagger-ui.html",
            "/swagger.json",
            "/v2/api-docs",
            "/webjars/**"
    };

    /**This method handles the configuration to be shared with the test WebSecurityConfiguration class (access rules to be tested)
     * */
    public static void configureCommon(final HttpSecurity http) throws Exception {
        http
                .authorizeRequests()
                .antMatchers(AUTH_WHITELIST).permitAll()
                .antMatchers(HttpMethod.POST, TIME_PATH).hasRole(ADMIN_ROLE)
                .antMatchers(HttpMethod.PUT, TIME_PATH).hasRole(ADMIN_ROLE)
                .antMatchers(HttpMethod.DELETE, TIME_PATH).hasRole(ADMIN_ROLE)
                .anyRequest().authenticated();
    }

    @Override
    public void configure(final HttpSecurity http) throws Exception {
        configureCommon(http);
        http
                .oauth2ResourceServer()
                .jwt().jwtAuthenticationConverter(opfabJwtConverter);
    }


}
