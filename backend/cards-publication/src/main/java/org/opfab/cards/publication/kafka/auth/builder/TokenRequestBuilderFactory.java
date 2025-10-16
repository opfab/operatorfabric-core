/* Copyright (c) 2023, Alliander N.V. (https://www.alliander.com)
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.publication.kafka.auth.builder;

import org.springframework.core.env.Environment;

import java.util.Map;

public class TokenRequestBuilderFactory {

    private final Environment environment;

    public TokenRequestBuilderFactory(final Environment environment) {
        if (environment == null) {
            throw new NullPointerException("Environment must not be null");
        }
        this.environment = environment;
    }

    public TokenRequestBuilder createTokenRequestBuilder(final Map<String, ?> properties) {
        return new TokenRequestBuilder(environment, properties);
    }
}
