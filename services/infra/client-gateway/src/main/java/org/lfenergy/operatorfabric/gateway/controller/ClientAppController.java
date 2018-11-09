/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.gateway.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

/**
 * configures some forward to client pp
 *
 * @author David Binder
 */
@Controller
public class ClientAppController {
    /**
     * Forward to home/index.html file
     *
     * @param exchange http request/response
     * @return nothing asside from completion
     */
    @RequestMapping(value = "/home")
    public Mono<Void> index(ServerWebExchange exchange) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.SEE_OTHER);
        response.getHeaders().add(HttpHeaders.LOCATION, "/home/index.html");
        return response.setComplete();
    }

    /**
     * Forward to login/index.html file
     *
     * @param exchange http request/response
     * @return nothing asside from completion
     */
    @RequestMapping(value = "/login")
    public Mono<Void> login(ServerWebExchange exchange) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.SEE_OTHER);
        response.getHeaders().add(HttpHeaders.LOCATION, "/login/index.html");
        return response.setComplete();
    }
}
