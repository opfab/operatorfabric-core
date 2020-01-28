
package org.lfenergy.operatorfabric.users.configuration.json;

import com.fasterxml.jackson.databind.module.SimpleModule;
import org.lfenergy.operatorfabric.users.model.*;

/**
 * Jackson (JSON) Business Module configuration
 *
 * @author David Binder
 */
public class UsersModule extends SimpleModule {

    public UsersModule() {

    addAbstractTypeMapping(User.class,UserData.class);
    addAbstractTypeMapping(Group.class,GroupData.class);
    addAbstractTypeMapping(SimpleUser.class,SimpleUserData.class);
    addAbstractTypeMapping(UserSettings.class,UserSettingsData.class);
    }
}
