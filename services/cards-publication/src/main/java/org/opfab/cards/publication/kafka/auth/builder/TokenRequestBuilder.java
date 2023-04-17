/* Copyright (c) 2023, Alliander N.V. (https://www.alliander.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.cards.publication.kafka.auth.builder;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.env.Environment;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static java.util.Optional.ofNullable;
import static org.springframework.util.StringUtils.hasText;

@Getter
@Slf4j
public class TokenRequestBuilder {

	private static final String TYPE_JWT_BEARER = "urn:ietf:params:oauth:client-assertion-type:jwt-bearer";

	private final String clientId;

	private final URI tokenEndpoint;

	private final Path clientAssertionLocation;

	private final String scope;

	public TokenRequestBuilder(final Environment environment, final Map<String, ?> properties) {
		clientId = buildClientId(environment);
		tokenEndpoint = buildTokenEndpoint(environment);
		clientAssertionLocation = buildClientAssertionLocation(environment);
		scope = buildScope(properties, environment);

		log.debug("Configured to use {} as endpoint to acquire token with scope {} based on the client assertion token located at {}", tokenEndpoint, scope, clientAssertionLocation);
	}

	private String buildClientId(final Environment environment) {
		return getEnvironmentVariable("AZURE_CLIENT_ID", environment);
	}

	private String buildScope(final Map<String, ?> properties, final Environment environment) {
		return ofNullable(environment.getProperty("OAUTH_SCOPE"))
				.orElseGet(() -> ofNullable((List<String>) properties.get("bootstrap.servers"))
						.map(servers -> servers.get(0))
						.map(this::mapServersToScope)
						.orElseThrow(() -> new IllegalStateException("config properties does not contain any broker addresses (bootstrap.servers)")));

	}

	private String mapServersToScope(final String brokerAddress) {
		final var mappedScope = brokerAddress.replaceAll("[a-z0-9-]{1,50}.kafka.kafka([a-z-]{0,4}).aws.alliander.(local|com):\\d{4}", "api://broker.alb.kafka$1.aws.alliander.com/.default");
		if (mappedScope.equals(brokerAddress)) {
			throw new IllegalArgumentException(String.format("Automatic scope mapping is not supported for broker address: '%s', use OAUTH_SCOPE environment variable to manually set a scope", brokerAddress));
		}
		return mappedScope;
	}

	private URI buildTokenEndpoint(final Environment environment) {
		final String endpoint = getEnvironmentVariable("AZURE_AUTHORITY_HOST", environment) + "/" + getEnvironmentVariable("AZURE_TENANT_ID", environment) + "/oauth2/v2.0/token";
		try {
			return new URI(endpoint);
		} catch (URISyntaxException e) {
			throw new IllegalArgumentException("Invalid token endpoint: " + endpoint, e);
		}
	}

	private Path buildClientAssertionLocation(final Environment environment) {
		final var filePath = Paths.get(getEnvironmentVariable("AZURE_FEDERATED_TOKEN_FILE", environment));

		if (!filePath.toFile().exists()) {
			throw new IllegalArgumentException("AZURE_FEDERATED_TOKEN_FILE: '" + filePath + "' does not exist!");
		}
		if (!filePath.toFile().isFile()) {
			throw new IllegalArgumentException("AZURE_FEDERATED_TOKEN_FILE: '" + filePath + "' does not point to a file!");
		}
		return filePath;
	}

	private String getEnvironmentVariable(final String environmentVariable, final Environment environment) {
		final var value = environment.getProperty(environmentVariable);
		if (!hasText(value)) {
			throw new IllegalStateException(
					String.format("Missing environment variable %s for OAuth2 authentication.", environmentVariable));
		}
		return value;
	}

	public HttpRequest buildAuthTokenRequest() throws IOException {
		return HttpRequest.newBuilder()
				.uri(tokenEndpoint)
				.version(HttpClient.Version.HTTP_2)
				.header("Content-Type", "application/x-www-form-urlencoded")
				.header("Accept", "application/json")
				.POST(HttpRequest.BodyPublishers.ofString(buildAuthTokenBody()))
				.build();
	}

	private String buildAuthTokenBody() throws IOException {
		final var parameters = Map.of("grant_type", "client_credentials",
				"client_id", clientId,
				"client_assertion_type", TYPE_JWT_BEARER,
				"client_assertion", Files.readString(clientAssertionLocation),
				"scope", scope);
		return parameters.entrySet()
				.stream()
				.sorted(Map.Entry.comparingByKey())
				.map(e -> e.getKey() + "=" + URLEncoder.encode(e.getValue(), StandardCharsets.UTF_8))
				.collect(Collectors.joining("&"));
	}
}
