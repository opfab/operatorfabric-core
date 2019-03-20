/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.cards.consultation.configuration.webflux;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.config.WebFluxConfigurer;
import org.springframework.web.reactive.config.WebFluxConfigurerComposite;

/**
 * Webflux configuration. configures:
 * <ul>
 *     <li>CORS</li>
 * </ul>
 *
 * See *Routes configuration classes for route configuration
 * @author David Binder
 */
@Slf4j
@Configuration
public class WebFluxConfig {

    /**
     * CORS configuration
     * @return CORS Webflux configurer
     */
    @Bean
    @ConditionalOnProperty(prefix = "opfab", value = "cors.activate")
    public WebFluxConfigurer corsConfigurer() {
        return new WebFluxConfigurerComposite() {

            @Override
            public void addCorsMappings(org.springframework.web.reactive.config.CorsRegistry registry) {
                registry
                   .addMapping("/**")
                   .allowedOrigins("*")
                   .allowedMethods("*")
                   .allowedHeaders("*");
            }
        };
    }

}
