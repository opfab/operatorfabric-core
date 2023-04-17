/* Copyright (c) 2023, Alliander N.V. (https://www.alliander.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */


package org.opfab.cards.publication.kafka.auth.dto;

import org.apache.kafka.common.security.oauthbearer.OAuthBearerToken;

import java.util.Set;

import static java.util.Collections.unmodifiableSet;

public class OAuthBearerTokenImpl implements OAuthBearerToken {

	private final String principalName;

	private final String value;

	private final long startTimeMs;

	private final long lifetimeMs;

	private final Set<String> scopes;

	public OAuthBearerTokenImpl(final String principalName, final String value, final long startTimeMs, final long lifetimeMs, final Set<String> scopes) {
		this.principalName = principalName;
		this.value = value;
		this.startTimeMs = startTimeMs;
		this.lifetimeMs = lifetimeMs;
		this.scopes = unmodifiableSet(scopes);
	}

	@Override
	public String principalName() {
		return principalName;
	}

	@Override
	public String value() {
		return value;
	}

	@Override
	public long lifetimeMs() {
		return lifetimeMs;
	}

	@Override
	public Long startTimeMs() {
		return startTimeMs;
	}

	@Override
	public Set<String> scope() {
		return scopes;
	}
}
