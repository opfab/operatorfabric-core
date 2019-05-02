/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.gateway.configuration;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.filter.reactive.HiddenHttpMethodFilter;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import java.util.Map;

/**
 * TODO can't remember the reason of this code, explore and remove if not needed
 *
 * @author David Binder
 */
@Configuration
public class GatewayConfig {

    ObjectMapper om = new ObjectMapper();

    @Bean
    public HiddenHttpMethodFilter hiddenHttpMethodFilter() {
        return new HiddenHttpMethodFilter() {
            @Override
            public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
                return chain.filter(exchange);
            }
        };
    }

    @Bean
    public RouteLocator routes(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("config",
                        r -> r.path("/config")
                        .filters(f -> {
                            return f
                                    .rewritePath("/config", "/web-ui.json")
                                    .modifyResponseBody(String.class, String.class,
                                            (exchange, s) -> {
                                                try {
                                                    Map map = om.readValue(s, Map.class);
                                                    return Mono.just(om.writeValueAsString(map.get("operatorfabric")));
                                                } catch (Exception ex) {
                                                    return Mono.just(s);
                                                }
                                            })
                                    ;
                        })
                        .uri("lb://CONFIG")
                ).build();
    }
}
