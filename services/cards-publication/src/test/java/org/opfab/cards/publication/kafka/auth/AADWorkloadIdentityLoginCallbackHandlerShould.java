/* Copyright (c) 2023, Alliander N.V. (https://www.alliander.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.cards.publication.kafka.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.kafka.common.security.oauthbearer.OAuthBearerTokenCallback;
import org.assertj.core.data.Offset;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.opfab.cards.publication.kafka.auth.builder.TokenRequestBuilder;
import org.opfab.cards.publication.kafka.auth.builder.TokenRequestBuilderFactory;
import org.opfab.cards.publication.kafka.util.BeanUtil;
import org.springframework.context.ApplicationContext;
import org.springframework.core.env.Environment;
import org.springframework.test.context.ActiveProfiles;

import javax.security.auth.callback.Callback;
import javax.security.auth.callback.PasswordCallback;
import javax.security.auth.callback.UnsupportedCallbackException;
import java.io.IOException;
import java.io.InterruptedIOException;
import java.net.http.HttpClient;
import java.net.http.HttpResponse;
import java.util.Map;

import static java.nio.charset.StandardCharsets.UTF_8;
import static java.util.Collections.EMPTY_LIST;
import static java.util.Collections.EMPTY_MAP;
import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@ActiveProfiles(profiles = "test")
class AADWorkloadIdentityLoginCallbackHandlerShould {

	private AADWorkloadIdentityLoginCallbackHandler aadWorkloadIdentityLoginCallbackHandler;

	@Mock
	private TokenRequestBuilderFactory tokenRequestBuilderFactory;

	@Mock
	private HttpClient httpClient;

	private final BeanUtil beanUtil = new BeanUtil();

	@BeforeEach
	void setUp() {
		beanUtil.setApplicationContext(null);
		Mockito.reset(tokenRequestBuilderFactory, httpClient);
		aadWorkloadIdentityLoginCallbackHandler = new AADWorkloadIdentityLoginCallbackHandler(tokenRequestBuilderFactory, httpClient, new ObjectMapper());
	}

	@AfterEach
	void tearDown() {
		aadWorkloadIdentityLoginCallbackHandler.close();
	}

	@Test
	void constructor_without_springContext() {
		final var handler = new AADWorkloadIdentityLoginCallbackHandler();
		assertThat(handler).isNotNull();
	}

	@Test
	void constructor_with_springContext() {
		final var applicationContext = mock(ApplicationContext.class);
		beanUtil.setApplicationContext(applicationContext);
		when(applicationContext.getBean(Environment.class)).thenReturn(Mockito.mock(Environment.class));
		final var handler = new AADWorkloadIdentityLoginCallbackHandler();
		assertThat(handler).isNotNull();
	}

	@Test
	void configure_validConfig() {
		final var properties = Map.of("a", "b");
		final var tokenRequestBuilderMock = mock(TokenRequestBuilder.class);
		when(tokenRequestBuilderFactory.createTokenRequestBuilder(properties)).thenReturn(tokenRequestBuilderMock);
		aadWorkloadIdentityLoginCallbackHandler.configure(properties, "OAUTHBEARER", EMPTY_LIST);
		assertThat(aadWorkloadIdentityLoginCallbackHandler.getTokenRequestBuilder()).isEqualTo(tokenRequestBuilderMock);
	}

	@Test
	void configure_saslMechanism_wrong() {
		final var exception = assertThrows(IllegalArgumentException.class, () -> aadWorkloadIdentityLoginCallbackHandler.configure(EMPTY_MAP, "TLS", EMPTY_LIST));
		assertThat(exception.getMessage()).isEqualTo("SASL mechanism MUST be OAUTHBEARER but found: TLS");
	}


	@Test
	void handle_properCallbackType() throws IOException, UnsupportedCallbackException, InterruptedException {
		final var oAuthBearerTokenCallback = new OAuthBearerTokenCallback();
		final var httpResponse = mock(HttpResponse.class);
		final var tokenRequestBuilder = mock(TokenRequestBuilder.class);

		when(tokenRequestBuilderFactory.createTokenRequestBuilder(any())).thenReturn(tokenRequestBuilder);
		when(httpClient.send(any(), any(HttpResponse.BodyHandler.class))).thenReturn(httpResponse);
		when(httpResponse.body()).thenReturn("{\"access_token\":\"mocked-token\",\"expires_in\": 1234}".getBytes(UTF_8));
		when(tokenRequestBuilder.getClientId()).thenReturn("12345");
		aadWorkloadIdentityLoginCallbackHandler.configure(EMPTY_MAP, "OAUTHBEARER", EMPTY_LIST);

		aadWorkloadIdentityLoginCallbackHandler.handle(new Callback[]{oAuthBearerTokenCallback});

		final var token = oAuthBearerTokenCallback.token();

		assertThat(token).isNotNull();
		assertThat(token.principalName()).isEqualTo("12345");
		assertThat(token.value()).isEqualTo("mocked-token");
		assertThat(token.lifetimeMs()).isCloseTo(System.currentTimeMillis() + 1234 * 1000, Offset.offset(5000L));
		assertThat(token.scope()).isNotNull();
	}

	@Test
	void handle_wrongCallbackType() {
		final var passwordCallback = new PasswordCallback("pw", false);
		final var exception = assertThrows(UnsupportedCallbackException.class, () -> aadWorkloadIdentityLoginCallbackHandler.handle(new Callback[]{passwordCallback}));

		assertThat(exception.getMessage()).isEqualTo("wrong callback type: javax.security.auth.callback.PasswordCallback");
	}

	@Test
	void handle_interrupt() throws IOException, InterruptedException {
		configure_validConfig();

		final var httpResponse = mock(HttpResponse.class);
		when(httpClient.send(any(), any(HttpResponse.BodyHandler.class))).thenThrow(new InterruptedException("interrupted"));
		when(httpResponse.body()).thenReturn("{\"access_token\":\"mocked-token\",\"expires_in\": 1234}".getBytes(UTF_8));

		final var exception = assertThrows(InterruptedIOException.class, () -> aadWorkloadIdentityLoginCallbackHandler.handle(new Callback[]{new OAuthBearerTokenCallback()}));

		assertThat(exception.getMessage()).isEqualTo("interrupted");
		assertThat(Thread.interrupted()).isTrue();
		assertThat(Thread.interrupted()).isFalse();
	}
}
