/* Copyright (c) 2018-2020, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.users.configuration.json;

import com.fasterxml.jackson.databind.module.SimpleModule;
import org.opfab.users.model.*;
import org.opfab.users.model.*;

/**
 * Jackson (JSON) Business Module configuration
 *
 *
 */
public class UsersModule extends SimpleModule {

    public UsersModule() {

    addAbstractTypeMapping(User.class,UserData.class);
    addAbstractTypeMapping(Group.class,GroupData.class);
    addAbstractTypeMapping(Entity.class,EntityData.class);
    addAbstractTypeMapping(StateRight.class, StateRightData.class);
    addAbstractTypeMapping(Perimeter.class, PerimeterData.class);
    addAbstractTypeMapping(SimpleUser.class, SimpleUserData.class);
    addAbstractTypeMapping(UserSettings.class, UserSettingsData.class);
    addAbstractTypeMapping(CurrentUserWithPerimeters.class,CurrentUserWithPerimetersData.class);
    addAbstractTypeMapping(ComputedPerimeter.class, ComputedPerimeterData.class);
    }
}
