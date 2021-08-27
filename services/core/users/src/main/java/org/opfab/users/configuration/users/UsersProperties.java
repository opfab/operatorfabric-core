/* Copyright (c) 2018-2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */



package org.opfab.users.configuration.users;

import lombok.Data;
import org.opfab.users.model.*;
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
 * and {@link org.lfenergy.operatorfabric.users.model.Entity} and {@link org.lfenergy.operatorfabric.users.model.Perimeter}
 * for data structure details</p>
 *
 *
 */
@ConfigurationProperties("operatorfabric.users.default")
@Component
@Data
public class UsersProperties {


    private List<UserData> users = new ArrayList<>();
    private List<GroupData> groups = new ArrayList<>();
    private List<EntityData> entities = new ArrayList<>();
    private List<PerimeterData> perimeters = new ArrayList<>();
    private List<UserSettingsData> userSettings = new ArrayList<>();
}
