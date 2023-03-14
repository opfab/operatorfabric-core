/* Copyright (c) 2023, Alliander N.V. (https://www.alliander.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.cards.publication.kafka.auth.builder;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.core.env.Environment;
import org.springframework.test.context.ActiveProfiles;

import java.io.File;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Flow;

import static java.util.Collections.EMPTY_MAP;
import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@ActiveProfiles(profiles = "test")
class TokenRequestBuilderShould {

	private TokenRequestBuilder tokenRequestBuilder;

	@Mock
	private Environment environment;

	@BeforeEach
	void setUp() {

		tokenRequestBuilder = null;
		Mockito.reset(environment);
	}

	@Test
	void constructor_validConfig() throws IOException {
		final var kafkaConfigs = Map.of("bootstrap.servers", List.of("kafka-tst-cluster-kafka-0.kafka.kafka-tst.aws.alliander.local:9092"));
		final var tempFile = File.createTempFile("azure-identity-token-", ".token");

		Files.writeString(tempFile.getAbsoluteFile().toPath(), "some-awesome-token");
		tempFile.deleteOnExit();
		when(environment.getProperty("AZURE_CLIENT_ID")).thenReturn("12345");
		when(environment.getProperty("AZURE_TENANT_ID")).thenReturn("67890");
		when(environment.getProperty("AZURE_AUTHORITY_HOST")).thenReturn("http://some-url.dummy");
		when(environment.getProperty("AZURE_FEDERATED_TOKEN_FILE")).thenReturn(tempFile.getAbsolutePath());

		tokenRequestBuilder = new TokenRequestBuilder(environment, kafkaConfigs);

		assertThat(tokenRequestBuilder.getScope()).isEqualTo("api://broker.alb.kafka-tst.aws.alliander.com/.default");
		assertThat(tokenRequestBuilder.getClientId()).isEqualTo("12345");
		assertThat(tokenRequestBuilder.getClientAssertionLocation()).hasToString(tempFile.getAbsolutePath());
		assertThat(tokenRequestBuilder.getTokenEndpoint()).hasToString("http://some-url.dummy/67890/oauth2/v2.0/token");
	}

	@Test
	void constructor_validConfig_prdScope() throws IOException {
		final var kafkaConfigs = Map.of("bootstrap.servers", List.of("kafka-prd-cluster-kafka-15.kafka.kafka.aws.alliander.com:9092"));
		final var tempFile = File.createTempFile("azure-identity-token-", ".token");

		Files.writeString(tempFile.getAbsoluteFile().toPath(), "some-awesome-token");
		tempFile.deleteOnExit();
		when(environment.getProperty("AZURE_CLIENT_ID")).thenReturn("12345");
		when(environment.getProperty("AZURE_TENANT_ID")).thenReturn("67890");
		when(environment.getProperty("AZURE_AUTHORITY_HOST")).thenReturn("http://some-url.dummy");
		when(environment.getProperty("AZURE_FEDERATED_TOKEN_FILE")).thenReturn(tempFile.getAbsolutePath());

		tokenRequestBuilder = new TokenRequestBuilder(environment, kafkaConfigs);

		assertThat(tokenRequestBuilder.getScope()).isEqualTo("api://broker.alb.kafka.aws.alliander.com/.default");
	}

	@Test
	void constructor_validConfig_withManualScope() throws IOException {
		final var tempFile = File.createTempFile("azure-identity-token-", ".token");
		Files.writeString(tempFile.getAbsoluteFile().toPath(), "some-awesome-token");
		tempFile.deleteOnExit();
		when(environment.getProperty("OAUTH_SCOPE")).thenReturn("some-scope");
		when(environment.getProperty("AZURE_CLIENT_ID")).thenReturn("12345");
		when(environment.getProperty("AZURE_TENANT_ID")).thenReturn("67890");
		when(environment.getProperty("AZURE_AUTHORITY_HOST")).thenReturn("http://some-url.dummy");
		when(environment.getProperty("AZURE_FEDERATED_TOKEN_FILE")).thenReturn(tempFile.getAbsolutePath());

		tokenRequestBuilder = new TokenRequestBuilder(environment, EMPTY_MAP);

		assertThat(tokenRequestBuilder.getScope()).isEqualTo("some-scope");
	}

	@Test
	void constructor_servers_missing() throws IOException {
		final var tempFile = File.createTempFile("azure-identity-token-", ".token");

		Files.writeString(tempFile.getAbsoluteFile().toPath(), "some-awesome-token");
		tempFile.deleteOnExit();
		when(environment.getProperty("AZURE_CLIENT_ID")).thenReturn("12345");
		when(environment.getProperty("AZURE_AUTHORITY_HOST")).thenReturn("http://some-url.dummy");
		when(environment.getProperty("AZURE_TENANT_ID")).thenReturn("67890");
		when(environment.getProperty("AZURE_FEDERATED_TOKEN_FILE")).thenReturn(tempFile.getAbsolutePath());

		final var exception = assertThrows(IllegalStateException.class, () -> new TokenRequestBuilder(environment, EMPTY_MAP));

		assertThat(exception.getMessage()).isEqualTo("config properties does not contain any broker addresses (bootstrap.servers)");
	}

	@Test
	void constructor_servers_unknown() throws IOException {
		final var kafkaConfigs = Map.of("bootstrap.servers", List.of("some-random-cluster.local:9092"));
		final var tempFile = File.createTempFile("azure-identity-token-", ".token");

		Files.writeString(tempFile.getAbsoluteFile().toPath(), "some-awesome-token");
		tempFile.deleteOnExit();
		when(environment.getProperty("AZURE_CLIENT_ID")).thenReturn("12345");
		when(environment.getProperty("AZURE_AUTHORITY_HOST")).thenReturn("http://some-url.dummy");
		when(environment.getProperty("AZURE_TENANT_ID")).thenReturn("67890");
		when(environment.getProperty("AZURE_FEDERATED_TOKEN_FILE")).thenReturn(tempFile.getAbsolutePath());

		final var exception = assertThrows(IllegalArgumentException.class, () -> new TokenRequestBuilder(environment, kafkaConfigs));

		assertThat(exception.getMessage()).isEqualTo("Automatic scope mapping is not supported for broker address: 'some-random-cluster.local:9092', use OAUTH_SCOPE environment variable to manually set a scope");
	}

	@Test
	void constructor_clientId_missing() {
		final var kafkaConfigs = Map.of("bootstrap.servers", List.of("something"));
		final var exception = assertThrows(IllegalStateException.class, () -> new TokenRequestBuilder(environment, kafkaConfigs));
		assertThat(exception.getMessage()).isEqualTo("Missing environment variable AZURE_CLIENT_ID for OAuth2 authentication.");
	}

	@Test
	void constructor_tokenFile_missing() {
		when(environment.getProperty("AZURE_CLIENT_ID")).thenReturn("12345");
		when(environment.getProperty("AZURE_AUTHORITY_HOST")).thenReturn("http://some-url.dummy");
		when(environment.getProperty("AZURE_TENANT_ID")).thenReturn("67890");

		final var exception = assertThrows(IllegalStateException.class, () -> new TokenRequestBuilder(environment, EMPTY_MAP));

		assertThat(exception.getMessage()).isEqualTo("Missing environment variable AZURE_FEDERATED_TOKEN_FILE for OAuth2 authentication.");
	}

	@Test
	void constructor_tokenFile_notAFile() throws IOException {
		final var tempFile = File.createTempFile("azure-identity-token-", ".token");

		Files.writeString(tempFile.getAbsoluteFile().toPath(), "some-awesome-token");
		tempFile.deleteOnExit();
		when(environment.getProperty("AZURE_FEDERATED_TOKEN_FILE")).thenReturn(tempFile.getParent());
		when(environment.getProperty("AZURE_AUTHORITY_HOST")).thenReturn("http://some-url.dummy");
		when(environment.getProperty("AZURE_CLIENT_ID")).thenReturn("12345");
		when(environment.getProperty("AZURE_TENANT_ID")).thenReturn("67890");

		final var exception = assertThrows(IllegalArgumentException.class, () -> new TokenRequestBuilder(environment, EMPTY_MAP));

		assertThat(exception.getMessage()).contains("AZURE_FEDERATED_TOKEN_FILE");
		assertThat(exception.getMessage()).contains("does not point to a file!");
	}

	@Test
	void constructor_tokenFile_notExist() {
		when(environment.getProperty("AZURE_FEDERATED_TOKEN_FILE")).thenReturn("/some-random/path");
		when(environment.getProperty("AZURE_AUTHORITY_HOST")).thenReturn("http://some-url.dummy");
		when(environment.getProperty("AZURE_CLIENT_ID")).thenReturn("12345");
		when(environment.getProperty("AZURE_TENANT_ID")).thenReturn("67890");

		final var exception = assertThrows(IllegalArgumentException.class, () -> new TokenRequestBuilder(environment, EMPTY_MAP));

		assertThat(exception.getMessage()).contains("AZURE_FEDERATED_TOKEN_FILE");
		assertThat(exception.getMessage()).contains("does not exist!");
	}

	@Test
	void constructor_authorityHost_missing() throws IOException {
		final var tempFile = File.createTempFile("azure-identity-token-", ".token");

		Files.writeString(tempFile.getAbsoluteFile().toPath(), "some-awesome-token");
		tempFile.deleteOnExit();
		when(environment.getProperty("AZURE_FEDERATED_TOKEN_FILE")).thenReturn(tempFile.getAbsolutePath());
		when(environment.getProperty("AZURE_CLIENT_ID")).thenReturn("12345");

		final var exception = assertThrows(IllegalStateException.class, () -> new TokenRequestBuilder(environment, EMPTY_MAP));

		assertThat(exception.getMessage()).isEqualTo("Missing environment variable AZURE_AUTHORITY_HOST for OAuth2 authentication.");
	}

	@Test
	void constructor_authorityHost_invalid() {
		when(environment.getProperty("AZURE_CLIENT_ID")).thenReturn("12345");
		when(environment.getProperty("AZURE_TENANT_ID")).thenReturn("67890");
		when(environment.getProperty("AZURE_AUTHORITY_HOST")).thenReturn("http:\\\\some-url.dummy");

		final var exception = assertThrows(IllegalArgumentException.class, () -> new TokenRequestBuilder(environment, EMPTY_MAP));

		assertThat(exception.getMessage()).isEqualTo("Invalid token endpoint: http:\\\\some-url.dummy/67890/oauth2/v2.0/token");
	}

	@Test
	void constructor_tenantId_missing() {
		when(environment.getProperty("AZURE_CLIENT_ID")).thenReturn("12345");
		when(environment.getProperty("AZURE_AUTHORITY_HOST")).thenReturn("http://some-url.dummy");

		final var exception = assertThrows(IllegalStateException.class, () -> new TokenRequestBuilder(environment, EMPTY_MAP));

		assertThat(exception.getMessage()).isEqualTo("Missing environment variable AZURE_TENANT_ID for OAuth2 authentication.");
	}

	@Test
	void buildAuthTokenRequest() throws IOException {
		constructor_validConfig();

		final var httpRequest = tokenRequestBuilder.buildAuthTokenRequest();
		final var contentType = httpRequest.headers().firstValue("Content-Type");
		final var accept = httpRequest.headers().firstValue("Accept");

		FlowSubscriber<ByteBuffer> flowSubscriber = new FlowSubscriber<>();
		httpRequest.bodyPublisher().get().subscribe(flowSubscriber);
		final var body = new String(flowSubscriber.getBodyItems().get(0).array(), StandardCharsets.UTF_8);

		assertThat(contentType).isNotEmpty();
		assertThat(accept).isNotEmpty();
		assertThat(contentType).contains("application/x-www-form-urlencoded");
		assertThat(accept).contains("application/json");
		assertThat(httpRequest.uri().getHost()).isEqualTo("some-url.dummy");
		assertThat(body).isEqualTo("client_assertion=some-awesome-token&client_assertion_type=urn%3Aietf%3Aparams%3Aoauth%3Aclient-assertion-type%3Ajwt-bearer&client_id=12345&grant_type=client_credentials&scope=api%3A%2F%2Fbroker.alb.kafka-tst.aws.alliander.com%2F.default");
	}

	private class FlowSubscriber<T> implements Flow.Subscriber<T> {
		private final CountDownLatch latch = new CountDownLatch(1);

		private List<T> bodyItems = new ArrayList<>();

		public List<T> getBodyItems() {
			try {
				this.latch.await();
			} catch (InterruptedException e) {
				throw new RuntimeException(e);
			}
			return bodyItems;
		}

		@Override
		public void onSubscribe(Flow.Subscription subscription) {
			//Retrieve all parts
			subscription.request(Long.MAX_VALUE);
		}

		@Override
		public void onNext(T item) {
			this.bodyItems.add(item);
		}

		@Override
		public void onError(Throwable throwable) {
			this.latch.countDown();
		}

		@Override
		public void onComplete() {
			this.latch.countDown();
		}
	}
}
