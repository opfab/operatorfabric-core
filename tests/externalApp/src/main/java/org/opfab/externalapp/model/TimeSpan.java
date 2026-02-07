/* Copyright (c) 2018-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.externalapp.model;

import java.time.Instant;

import org.springframework.validation.annotation.Validated;

import tools.jackson.databind.annotation.JsonDeserialize;
import tools.jackson.databind.annotation.JsonSerialize;

import org.opfab.externalapp.config.InstantDeserializer;
import org.opfab.externalapp.config.InstantSerializer;

@Validated
public record TimeSpan(
        @JsonDeserialize(using = InstantDeserializer.class) @JsonSerialize(using = InstantSerializer.class) Instant start,
        @JsonDeserialize(using = InstantDeserializer.class) @JsonSerialize(using = InstantSerializer.class) Instant end) {
}
