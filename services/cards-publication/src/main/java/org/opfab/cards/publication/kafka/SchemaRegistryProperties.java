/* Copyright (c) 2020, Alliander (http://www.alliander.com)
 * Copyright (c) 2021-2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.publication.kafka;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "opfab.kafka.schema.registry")
@SuppressWarnings("java:S1104") // it is just a data object , we choose to have all fields public for simplicity
public class SchemaRegistryProperties {

    public String url;

}
