/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.cards.consultation.configuration.json;

import com.fasterxml.jackson.databind.module.SimpleModule;
import org.springframework.data.domain.PageImpl;


/**
 * Jackson (JSON) Module configuration to handle (de)serialization of objects involved in returning paged results
 */
public class PagedResultsModule extends SimpleModule {

    public PagedResultsModule() {

        addSerializer(PageImpl.class, new PageImplSerializer());
    }
}
