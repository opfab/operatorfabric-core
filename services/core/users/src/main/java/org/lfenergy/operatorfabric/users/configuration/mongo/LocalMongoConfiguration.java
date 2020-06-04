/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.lfenergy.operatorfabric.users.configuration.mongo;

import org.lfenergy.operatorfabric.springtools.configuration.mongo.AbstractLocalMongoConfiguration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Specific mongo converter declaration configuration
 *
 *
 */
@Component
public class LocalMongoConfiguration extends AbstractLocalMongoConfiguration {

    @Override
    public List<Converter> converterList() {

        List<Converter> converterList = new ArrayList<>();
        converterList.add(new StateRightReadConverter());
        converterList.add(new StateRightWriteConverter());

        return converterList;
    }
}
