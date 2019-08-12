/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.cards.consultation.configuration.json;

import com.fasterxml.jackson.databind.module.SimpleModule;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Sort;


/**
 * Jackson (JSON) Module configuration to handle (de)serialization of objects involved in returning paged results
 *
 * @author Alexandra Guironnet
 */
public class PagedResultsModule extends SimpleModule {

    public PagedResultsModule() {

        addSerializer(PageImpl.class, new PageImplSerializer());
    }
}
