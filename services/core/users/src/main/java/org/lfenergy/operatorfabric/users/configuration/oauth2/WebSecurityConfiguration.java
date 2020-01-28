
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

    public static final String USER_PATH = "/users/{login}";
    public static final String USERS_SETTINGS_PATH = "/users/{login}/settings";
    public static final String USERS_PATH = "/users/**";
    public static final String GROUPS_PATH = "/groups/**";
    public static final String ADMIN_ROLE = "ADMIN";
    public static final String IS_ADMIN_OR_OWNER = "hasRole('ADMIN') or @webSecurityChecks.checkUserLogin(authentication,#login)";
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

    /**This method handles the configuration to be shared with the test WebSecurityConfiguration class (access rules to be tested)
     * */
    public static void configureCommon(final HttpSecurity http) throws Exception {
        http.sessionManagement().sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                .and()
                .authorizeRequests()
                .antMatchers(HttpMethod.GET, USER_PATH).access(IS_ADMIN_OR_OWNER)
                .antMatchers(HttpMethod.PUT, USER_PATH).access(IS_ADMIN_OR_OWNER)
                .antMatchers(HttpMethod.GET, USERS_SETTINGS_PATH).access(IS_ADMIN_OR_OWNER)
                .antMatchers(HttpMethod.PUT, USERS_SETTINGS_PATH).access(IS_ADMIN_OR_OWNER)
                .antMatchers(HttpMethod.PATCH, USERS_SETTINGS_PATH).access(IS_ADMIN_OR_OWNER)
                .antMatchers(USERS_PATH).hasRole(ADMIN_ROLE)
                .antMatchers(GROUPS_PATH).hasRole(ADMIN_ROLE)
                .anyRequest().authenticated();
    }

}
