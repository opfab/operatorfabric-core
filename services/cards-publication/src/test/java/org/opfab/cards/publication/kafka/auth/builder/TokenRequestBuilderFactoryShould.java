/* Copyright (c) 2023, Alliander N.V. (https://www.alliander.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.cards.publication.kafka.auth.builder;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.env.Environment;
import org.springframework.test.context.ActiveProfiles;

import static java.util.Collections.EMPTY_MAP;
import static org.junit.jupiter.api.Assertions.assertThrows;
@ExtendWith(MockitoExtension.class)
@ActiveProfiles(profiles = "test")
class TokenRequestBuilderFactoryShould {

	private TokenRequestBuilderFactory tokenRequestBuilderFactory;
	@Mock
	private Environment environment;
	@ParameterizedTest
	@NullSource
	void constructor_environment_notNull(final Environment environment) {
		assertThrows(NullPointerException.class, () -> new TokenRequestBuilderFactory(environment));
	}

	@Test
	void createTokenRequestBuilder() {
		tokenRequestBuilderFactory = new TokenRequestBuilderFactory(environment);
		assertThrows(IllegalStateException.class, () -> tokenRequestBuilderFactory.createTokenRequestBuilder(EMPTY_MAP));
	}
}
