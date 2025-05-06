/* Copyright (c) 2025, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.cards.publication.configuration.mongo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.convert.MappingMongoConverter;

/**
 * Configuration class to authorize the dot in the field names when using
 * MongoDB. By default, Spring Data MongoDB does not authorize the use of dots
 * in field names. This configuration is necessary to allow the use of dots in
 * the business data (field card.data)
 */
@Configuration
public class MappingConfiguration {

    @Autowired
    public void keepDotInFieldsName(MappingMongoConverter mappingMongoConverter) {
        mappingMongoConverter.preserveMapKeys(true);
    }

}
