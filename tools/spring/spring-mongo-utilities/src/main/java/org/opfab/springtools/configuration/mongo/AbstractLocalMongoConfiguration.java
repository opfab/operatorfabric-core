/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.springtools.configuration.mongo;

import org.springframework.core.convert.converter.Converter;

import java.util.List;

/**
 * <p>Class to implement locally for specific mongo configuration</p>
 * <p>Includes</p>
 * <ul>
 *     <li>Define converter list through {@link #converterList}</li>
 * </ul>
 */
public abstract class AbstractLocalMongoConfiguration {

    /**
     * generate a specific local mongo converter list
     * @return The mongo converter list (empty)
     */
    public abstract List<Converter> converterList();
}
