
package org.lfenergy.operatorfabric.actions.application.configuration;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;


/**
 * Configures web security

 * The following changes to the main WebSecurityConfiguration are necessary for tests
 *  - Disable csrf
 *  - Remove configuration of OAuth2ResourceServer
 *
 * @author David Binder
 */
@Configuration
@Slf4j
@EnableWebFluxSecurity
public class WebSecurityConfiguration extends org.lfenergy.operatorfabric.actions.configuration.webflux.WebSecurityConfiguration {

    /**
     * Secures access (all uris are secured)
     *
     * @param http
     *    http security configuration
     * @return http security filter chain
     */
    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        configureCommon(http);
        http.csrf().disable();
        return http.build();
    }

}
