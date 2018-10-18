/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.springtools.config.mongo;

import org.springframework.core.convert.converter.Converter;

import java.util.List;

public abstract class AbstractLocalMongoConfiguration {

    public abstract List<Converter<?, ?>> converterList();
}
