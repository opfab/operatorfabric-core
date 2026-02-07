/* Copyright (c) 2018-2026, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.publication.model;

import java.time.Instant;

import org.opfab.json.InstantDeserializer;
import org.opfab.json.InstantSerializer;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.NotNull;
import tools.jackson.databind.annotation.JsonDeserialize;
import tools.jackson.databind.annotation.JsonSerialize;

@Validated
public record TimeSpan(
        @NotNull @JsonDeserialize(using = InstantDeserializer.class) @JsonSerialize(using = InstantSerializer.class) Instant start,
        @JsonDeserialize(using = InstantDeserializer.class) @JsonSerialize(using = InstantSerializer.class) Instant end) {

}
