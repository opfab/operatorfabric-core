/* Copyright (c) 2023, Alliander N.V. (https://www.alliander.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.cards.publication.kafka.auth.dto;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.ActiveProfiles;

import java.util.HashSet;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@ActiveProfiles(profiles = "test")
class OAuthBearerTokenImplShould {
	private OAuthBearerTokenImpl oAuthBearerToken;
	@BeforeEach
	void setUp() {
		oAuthBearerToken = new OAuthBearerTokenImpl("principalName", "tokenString", 1L, 2L, new HashSet<>(Set.of("api://kafka-scope/.default")));
	}

	@Test
	void principalName() {
		assertThat(oAuthBearerToken.principalName()).isEqualTo("principalName");
	}

	@Test
	void value() {
		assertThat(oAuthBearerToken.value()).isEqualTo("tokenString");
	}

	@Test
	void scope() {
		final var scope = oAuthBearerToken.scope();
		assertThat(scope).containsExactly("api://kafka-scope/.default");
		assertThrows(UnsupportedOperationException.class, () -> scope.add("not-allowed!"));
	}

	@Test
	void startTimeMs() {
		assertThat(oAuthBearerToken.startTimeMs()).isEqualTo(1L);
	}

	@Test
	void lifetimeMs() {
		assertThat(oAuthBearerToken.lifetimeMs()).isEqualTo(2L);
	}
}
