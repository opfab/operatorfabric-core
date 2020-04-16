/* Copyright (c) 2020, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


package org.lfenergy.operatorfabric.users.configuration.json;

import com.fasterxml.jackson.databind.module.SimpleModule;
import org.lfenergy.operatorfabric.users.model.*;

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
    addAbstractTypeMapping(SimpleUser.class,SimpleUserData.class);
    addAbstractTypeMapping(UserSettings.class,UserSettingsData.class);
    }
}
