/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.lfenergy.operatorfabric.thirds.configuration.json;

import com.fasterxml.jackson.databind.module.SimpleModule;
import org.lfenergy.operatorfabric.thirds.model.*;

/**
 * Jackson (JSON) Business Module configuration
 *
 *
 */
public class ThirdsModule extends SimpleModule {

    public ThirdsModule() {
        addAbstractTypeMapping(ThirdMenuEntry.class, ThirdMenuEntryData.class);
        addAbstractTypeMapping(ThirdProcesses.class,ThirdProcessesData.class);
        addAbstractTypeMapping(ThirdStates.class,ThirdStatesData.class);
        addAbstractTypeMapping(Detail.class,DetailData.class);
        addAbstractTypeMapping(I18n.class,I18nData.class);
        addAbstractTypeMapping(Action.class,ActionData.class);
        addAbstractTypeMapping(Response.class,ResponseData.class);
    }
}
