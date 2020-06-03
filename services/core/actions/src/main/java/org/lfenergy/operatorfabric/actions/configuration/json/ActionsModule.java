/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.lfenergy.operatorfabric.actions.configuration.json;

import com.fasterxml.jackson.databind.module.SimpleModule;
import org.lfenergy.operatorfabric.actions.model.*;

/**
 * Jackson (JSON) Business Module configuration
 *
 *
 */
public class ActionsModule extends SimpleModule {

    public ActionsModule() {

        addAbstractTypeMapping(I18n.class, I18nData.class);
        addAbstractTypeMapping(Action.class, ActionData.class);
        addAbstractTypeMapping(ActionStatus.class, ActionStatusData.class);
    }
}
