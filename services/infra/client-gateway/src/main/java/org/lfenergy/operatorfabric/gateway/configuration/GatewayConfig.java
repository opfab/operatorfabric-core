/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


package org.lfenergy.operatorfabric.gateway.configuration;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.filter.reactive.HiddenHttpMethodFilter;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * TODO can't remember the reason of this code, explore and remove if not needed
 *
 *
 */
@Configuration
public class GatewayConfig {

    ObjectMapper om = new ObjectMapper();

    private OperatorFabricGatewayConf conf;

    @Autowired
    public GatewayConfig(OperatorFabricGatewayConf conf){
        if(conf == null){
            this.conf = new OperatorFabricGatewayConf();
            this.conf.setConfigs(new ArrayList<>());

        }else
            this.conf = conf;
        if(!this.conf.getConfigs().contains("web-ui.json")){
            this.conf.getConfigs().add("web-ui.json");
        }
    }

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
                        r -> r.path(conf.getConfigs().stream().map(c->"/config/"+c).collect(Collectors.toList()).toArray(new String[0]))
                        .filters(f -> {
                            return f
                                    .rewritePath("/config/(?<path>.*)", "/$\\{path}")
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
                )
                .build();
    }
}
