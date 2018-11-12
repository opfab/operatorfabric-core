/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.springtools.config.mongo;

import org.springframework.core.convert.converter.Converter;

import java.util.List;

/**
 * <p>Class to implement locally for specific mongo configuration</p>
 * <p>Includes</p>
 * <ul>
 *     <li>Define converter list throught {@link #converterList}</li>
 * </ul>
 */
public abstract class AbstractLocalMongoConfiguration {

    /**
     * generate a specific local mongo converter list
     * @return The mongo converter list (empty)
     */
    public abstract List<Converter> converterList();
}
