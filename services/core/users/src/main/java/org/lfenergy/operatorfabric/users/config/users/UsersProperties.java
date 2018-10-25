/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.lfenergy.operatorfabric.users.config.users;

import lombok.Data;
import org.lfenergy.operatorfabric.users.model.GroupData;
import org.lfenergy.operatorfabric.users.model.UserData;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * <p></p>
 * Created on 26/07/18
 *
 * @author davibind
 */
//@Configuration
@ConfigurationProperties("operatorfabric.users.default")
@Component
@Data
public class UsersProperties {


    private List<UserData> users = new ArrayList<>();
    private List<GroupData> groups = new ArrayList<>();
}
