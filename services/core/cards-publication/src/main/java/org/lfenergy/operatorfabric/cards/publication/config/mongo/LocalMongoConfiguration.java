/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.cards.publication.config.mongo;

import org.lfenergy.operatorfabric.springtools.config.mongo.AbstractLocalMongoConfiguration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class LocalMongoConfiguration extends AbstractLocalMongoConfiguration {

    public List<Converter> converterList() {
        List<Converter> converterList = new ArrayList<>();
        converterList.add(new I18nReadConverter());
        converterList.add(new DetailReadConverter());
        converterList.add(new RecipientReadConverter());
        converterList.add(new ActionReadConverter());
        return converterList;
    }
}
