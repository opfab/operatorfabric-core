/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.cards.publication.configuration.mongo;

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
	@SuppressWarnings("rawtypes")
    public List<Converter> converterList() {
        List<Converter> converterList = new ArrayList<>();
        converterList.add(new I18nReadConverter());
        converterList.add(new RecipientReadConverter());
        converterList.add(new TimeSpanReadConverter());
        converterList.add(new TraceReadConverter());


        converterList.add(new I18nWriterConverter());
        converterList.add(new TimeSpanWriterConverter());
        converterList.add(new RecipientWriterConverter());
        
        return converterList;
    }
}
