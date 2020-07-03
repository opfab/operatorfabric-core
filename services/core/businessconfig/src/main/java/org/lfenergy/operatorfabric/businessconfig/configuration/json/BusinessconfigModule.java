/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.lfenergy.operatorfabric.businessconfig.configuration.json;

import com.fasterxml.jackson.databind.module.SimpleModule;
import org.lfenergy.operatorfabric.businessconfig.model.*;
import org.lfenergy.operatorfabric.businessconfig.model.Process;

/**
 * Jackson (JSON) Business Module configuration
 *
 *
 */
public class BusinessconfigModule extends SimpleModule {

    public BusinessconfigModule() {
        addAbstractTypeMapping(MenuEntry.class, MenuEntryData.class);
        addAbstractTypeMapping(Process.class,ProcessData.class);
        addAbstractTypeMapping(ProcessStates.class, ProcessStatesData.class);
        addAbstractTypeMapping(Detail.class,DetailData.class);
        addAbstractTypeMapping(I18n.class,I18nData.class);
        addAbstractTypeMapping(Response.class,ResponseData.class);
    }
}
