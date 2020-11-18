/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.lfenergy.operatorfabric.cards.consultation.configuration.mongo;

import org.lfenergy.operatorfabric.springtools.configuration.mongo.AbstractLocalMongoConfiguration;
import org.lfenergy.operatorfabric.utilities.CollectionUtils;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Configures mongo {@link org.bson.Document} to Business objects converters
 *
 */
@Component
public class LocalMongoConfiguration extends AbstractLocalMongoConfiguration {

    public List<Converter> converterList() {
        return CollectionUtils.createArrayList(
                new I18nReadConverter(),
                new RecipientReadConverter(),
                new LightCardReadConverter(),
                new CardOperationReadConverter(),
                new TimeSpanReadConverter()
        );
    }
}
