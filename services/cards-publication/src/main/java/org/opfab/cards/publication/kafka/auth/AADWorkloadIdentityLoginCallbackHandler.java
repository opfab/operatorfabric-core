/* Copyright (c) 2023, Alliander N.V. (https://www.alliander.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.cards.publication.kafka.auth;

import org.opfab.cards.publication.kafka.auth.builder.TokenRequestBuilder;
import org.opfab.cards.publication.kafka.auth.builder.TokenRequestBuilderFactory;
import org.opfab.cards.publication.kafka.auth.dto.OAuthBearerTokenImpl;
import org.opfab.cards.publication.kafka.util.BeanUtil;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.common.security.auth.AuthenticateCallbackHandler;
import org.apache.kafka.common.security.oauthbearer.OAuthBearerToken;
import org.apache.kafka.common.security.oauthbearer.OAuthBearerTokenCallback;
import org.springframework.core.env.Environment;
import org.springframework.core.env.StandardEnvironment;

import javax.security.auth.callback.Callback;
import javax.security.auth.callback.UnsupportedCallbackException;
import javax.security.auth.login.AppConfigurationEntry;
import java.io.IOException;
import java.io.InterruptedIOException;
import java.net.http.HttpClient;
import java.net.http.HttpResponse;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static java.util.Optional.ofNullable;
import static org.apache.kafka.common.security.oauthbearer.OAuthBearerLoginModule.OAUTHBEARER_MECHANISM;

/**
 * This class can be configured as Login callback for Kafka Client's JAAS based OAuth support
 * to use the Azure AD Workload Identity injected environment variables and token on the filesystem
 * to properly authenticate towards Kafka clusters
 * <br><br>
 * The following configuration must be set:
 * <ul>
 *     <li><code>bootstrap.servers</code>: kafka-tst-cluster-kafka-...</li>
 *     <li><code>sasl.mechanism</code>: OAUTHBEARER</li>
 *     <li><code>sasl.jaas.config</code>: org.apache.kafka.common.security.oauthbearer.OAuthBearerLoginModule required ;</li>
 *     <li><code>sasl.login.callback.handler.class</code>: org.opfab.cards.publication.kafka.auth.AADWorkloadIdentityLoginCallbackHandler</li>
 * </ul>
 * <br>
 * A typical way would be to use Spring Kafka's environment variables.
 * <br>
 * Apart from the required configuration above the rest is automatically picked up based on the injected AZURE_... environment variables
 */
@Slf4j
public class AADWorkloadIdentityLoginCallbackHandler implements AuthenticateCallbackHandler {

    private final HttpClient httpClient;

    private final ObjectMapper objectMapper;

    private final TokenRequestBuilderFactory tokenRequestBuilderFactory;

    private TokenRequestBuilder tokenRequestBuilder;

    public AADWorkloadIdentityLoginCallbackHandler() {
        this(new TokenRequestBuilderFactory(BeanUtil.isContextSet() ? BeanUtil.getBean(Environment.class) : new StandardEnvironment()), HttpClient.newHttpClient(), new ObjectMapper());
    }

    protected AADWorkloadIdentityLoginCallbackHandler(final TokenRequestBuilderFactory tokenRequestBuilderFactory, final HttpClient httpClient, final ObjectMapper objectMapper) {
        this.tokenRequestBuilderFactory = tokenRequestBuilderFactory;
        this.httpClient = httpClient;
        this.objectMapper = objectMapper;
    }

    @Override
    public void configure(final Map<String, ?> properties, final String saslMechanism, final List<AppConfigurationEntry> list) {
        if (!OAUTHBEARER_MECHANISM.equals(saslMechanism)) {
            throw new IllegalArgumentException(String.format("SASL mechanism MUST be %s but found: %s", OAUTHBEARER_MECHANISM, saslMechanism));
        }
        tokenRequestBuilder = tokenRequestBuilderFactory.createTokenRequestBuilder(properties);
    }

    @Override
    public void close() {
        // nothing to close
    }

    @Override
    public void handle(final Callback[] callbacks) throws IOException, UnsupportedCallbackException {
        for (final var callback : callbacks) {
            if (callback instanceof OAuthBearerTokenCallback oAuthBearerTokenCallback) {
                try {
                    handleOAuthBearerTokenCallback(oAuthBearerTokenCallback);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    throw new InterruptedIOException(e.getMessage());
                }
            } else {
                throw new UnsupportedCallbackException(callback, "wrong callback type: " + callback.getClass().getName());
            }
        }
    }

    TokenRequestBuilder getTokenRequestBuilder() {
        return tokenRequestBuilder;
    }

    private void handleOAuthBearerTokenCallback(final OAuthBearerTokenCallback callback) throws IOException, InterruptedException {
        final var token = acquireTokenFromIdp();
        log.debug("acquired token '{}' for principal '{}'", token.value(), token.principalName());
        callback.token(token);
    }

    private OAuthBearerToken acquireTokenFromIdp() throws IOException, InterruptedException {
        final var request = tokenRequestBuilder.buildAuthTokenRequest();
        final var response = httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());
        final var result = objectMapper.readValue(response.body(), JsonNode.class);
        return toOAuthBearerToken(result);
    }

    private OAuthBearerTokenImpl toOAuthBearerToken(final JsonNode result) {
        final var now = System.currentTimeMillis();
        final var token = ofNullable(result.get("access_token"))
                .map(JsonNode::asText)
                .orElseThrow(() -> new IllegalStateException("Invalid response from authorization server: no access_token"));

        final var expiresIn = ofNullable(result.get("expires_in"))
                .map(JsonNode::asLong)
                .orElseThrow(() -> new IllegalStateException("Invalid response from authorization server: no expires_in"));

        final var scopes = ofNullable(result.get("scope"))
                .map(JsonNode::asText)
                .map(scopeText -> scopeText.split(" "))
                .map(Arrays::asList)
                .map(HashSet::new)
                .map(hs -> (Set<String>) hs)
                .orElse(Collections.emptySet());

        return new OAuthBearerTokenImpl(tokenRequestBuilder.getClientId(), token, now, now + expiresIn * 1000, scopes);
    }
}

