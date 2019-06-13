/* Copyright (c) 2018, RTE (http://www.rte-france.com)
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.lfenergy.operatorfabric.users.configuration.users;

import lombok.Data;
import org.lfenergy.operatorfabric.users.model.GroupData;
import org.lfenergy.operatorfabric.users.model.UserData;
import org.lfenergy.operatorfabric.users.model.UserSettingsData;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * <p>User and groups property definition.</p>
 *
 * <p>The properties are prefixed by "operatorfabric.users.default"</p>
 *
 * <p>See {@link org.lfenergy.operatorfabric.users.model.User} and {@link org.lfenergy.operatorfabric.users.model.Group}
 * for data structure details</p>
 *
 * @author David Binder
 */
@ConfigurationProperties("operatorfabric.users.default")
@Component
@Data
public class UsersProperties {


    private List<UserData> users = new ArrayList<>();
    private List<GroupData> groups = new ArrayList<>();
    private List<UserSettingsData> userSettings = new ArrayList<>();
}
