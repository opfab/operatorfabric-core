/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.users.config.mongo;

import org.lfenergy.operatorfabric.springtools.config.mongo.AbstractLocalMongoConfiguration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

/**
 * <p></p>
 * Created on 13/09/18
 *
 * @author davibind
 */
@Component
public class LocalMongoConfig extends AbstractLocalMongoConfiguration {
    @Override
    public List<Converter<?, ?>> converterList() {
        return Collections.emptyList();
    }
}
