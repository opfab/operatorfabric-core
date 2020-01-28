
package org.lfenergy.operatorfabric.thirds.application;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;


/**
 * WebSecurity test configuration
 * The following changes to the main WebSecurityConfiguration are necessary for tests
 *  - Disable csrf
 *  - Remove configuration of OAuth2ResourceServer
 *
 * @author Alexandra Guironnet
 */
@Configuration
@Slf4j
public class WebSecurityConfiguration extends WebSecurityConfigurerAdapter {

    private static final String[] AUTH_WHITELIST = {

            // -- swagger ui
            "/swagger-resources/**",
            "/swagger-ui.html",
            "/swagger.json",
            "/v2/api-docs",
            "/webjars/**"
    };

    @Override
    public void configure(final HttpSecurity http) throws Exception {
        org.lfenergy.operatorfabric.thirds.configuration.oauth2.WebSecurityConfiguration.configureCommon(http);
        http.csrf().disable();
    }


}
