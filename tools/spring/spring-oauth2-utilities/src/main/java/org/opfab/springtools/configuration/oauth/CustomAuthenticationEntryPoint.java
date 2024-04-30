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

import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.server.resource.web.BearerTokenAuthenticationEntryPoint;
import org.springframework.security.oauth2.server.resource.web.server.BearerTokenServerAuthenticationEntryPoint;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.server.ServerAuthenticationEntryPoint;
import org.springframework.web.server.ServerWebExchange;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Slf4j
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint, ServerAuthenticationEntryPoint {

    private static final String AUTH_FAILED_WARNING = "SECURITY : try to access resource {} without a valid token";

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
            AuthenticationException authException) throws IOException, ServletException {
                log.warn(AUTH_FAILED_WARNING, request.getRequestURI());
                BearerTokenAuthenticationEntryPoint delegate = new BearerTokenAuthenticationEntryPoint();
                delegate.commence(request, response, authException);
    }

    @Override
    public Mono<Void> commence(ServerWebExchange exchange, AuthenticationException authException) {
        log.warn(AUTH_FAILED_WARNING, exchange.getRequest().getURI());
        BearerTokenServerAuthenticationEntryPoint delegate = new BearerTokenServerAuthenticationEntryPoint();
        return delegate.commence(exchange, authException);
    }

}
