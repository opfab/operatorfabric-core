/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.cards.consultation.configuration.mongo;

import org.opfab.springtools.configuration.mongo.AbstractLocalMongoConfiguration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Configures mongo {@link org.bson.Document} to Business objects converters
 *
 */
@Component
public class LocalMongoConfiguration extends AbstractLocalMongoConfiguration {

    public List<Converter> converterList() {

        List<Converter> converterList = new ArrayList<>();
        converterList.add(new I18nReadConverter());
        converterList.add(new LightCardReadConverter());
        converterList.add(new TimeSpanReadConverter());

        return converterList;
    }
}
