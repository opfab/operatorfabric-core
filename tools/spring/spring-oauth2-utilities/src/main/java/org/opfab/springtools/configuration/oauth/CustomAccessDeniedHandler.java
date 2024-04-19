/* Copyright (c) 2024, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
package org.opfab.springtools.configuration.oauth;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.server.authorization.ServerAccessDeniedHandler;
import org.springframework.web.server.ServerWebExchange;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Slf4j
public class CustomAccessDeniedHandler  implements AccessDeniedHandler, ServerAccessDeniedHandler {

    private static final String ACCESS_DENIED_WARNING = "SECURITY : user {} try to access resource {} without the required authorization";

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException exc) throws IOException {
        
        log.warn(ACCESS_DENIED_WARNING, request.getUserPrincipal().getName(), request.getRequestURI());
        response.sendError(HttpServletResponse.SC_FORBIDDEN, "Access Denied");
    }

    @Override
    public Mono<Void> handle(ServerWebExchange serverWebExchange, AccessDeniedException accessDeniedException) {
        return serverWebExchange.getPrincipal()
                .map(principal -> {
                    log.warn(ACCESS_DENIED_WARNING,
                            principal.getName(), serverWebExchange.getRequest().getURI());
                    ServerHttpResponse response = serverWebExchange.getResponse();
                    response.setStatusCode(HttpStatus.FORBIDDEN);
                    String responseBody = accessDeniedException.getLocalizedMessage();
                    byte[] bytes = responseBody.getBytes(StandardCharsets.UTF_8);
                    DataBuffer buffer = response.bufferFactory().wrap(bytes);
                    return response.writeWith(Mono.just(buffer));
                }).then();
    }
}
