/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


package org.lfenergy.operatorfabric.cards.publication.configuration.mongo;

import org.lfenergy.operatorfabric.springtools.configuration.mongo.AbstractLocalMongoConfiguration;
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
        converterList.add(new DetailReadConverter());
        converterList.add(new RecipientReadConverter());
        converterList.add(new TimeSpanReadConverter());

        converterList.add(new DetailWriterConverter());
        converterList.add(new I18nWriterConverter());
        converterList.add(new TimeSpanWriterConverter());
        converterList.add(new RecipientWriterConverter());
        return converterList;
    }
}
