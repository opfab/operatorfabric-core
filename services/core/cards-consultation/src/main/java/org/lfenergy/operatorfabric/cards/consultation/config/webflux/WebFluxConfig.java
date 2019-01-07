/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.cards.consultation.config.webflux;

import lombok.extern.slf4j.Slf4j;
import org.lfenergy.operatorfabric.cards.consultation.controllers.CardOperationsController;
import org.lfenergy.operatorfabric.cards.consultation.controllers.CardOperationsGetParameters;
import org.lfenergy.operatorfabric.cards.consultation.repositories.CardRepository;
import org.lfenergy.operatorfabric.springtools.config.oauth.OpFabJwtAuthenticationToken;
import org.lfenergy.operatorfabric.users.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.config.WebFluxConfigurer;
import org.springframework.web.reactive.config.WebFluxConfigurerComposite;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.server.*;
import reactor.core.publisher.Mono;

import static org.springframework.web.reactive.function.BodyInserters.fromObject;
import static org.springframework.web.reactive.function.server.ServerResponse.notFound;
import static org.springframework.web.reactive.function.server.ServerResponse.ok;

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

    private final CardRepository cardRepository;

    /**
     * Controller injection
     */
    @Autowired
    public WebFluxConfig(CardRepository cardRepository) {
        this.cardRepository = cardRepository;
    }

    /**
     * CORS configuration
     * @return
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
