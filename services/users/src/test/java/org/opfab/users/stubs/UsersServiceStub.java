/* Copyright (c) 2023, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */

package org.opfab.users.stubs;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.opfab.users.model.OperationResult;
import org.opfab.users.model.Perimeter;
import org.opfab.users.repositories.GroupRepository;
import org.opfab.users.repositories.PerimeterRepository;
import org.opfab.users.repositories.UserRepository;
import org.opfab.users.services.NotificationService;
import org.opfab.users.services.UsersService;

public class UsersServiceStub extends UsersService {

    Map<String,List<Perimeter>> perimetersPerUser = new HashMap<>() ;

    public UsersServiceStub(UserRepository userRepository, GroupRepository groupRepository,
            PerimeterRepository perimeterRepository, NotificationService notificationService) {
        super(userRepository, groupRepository, perimeterRepository, notificationService);
    }

    public void setPerimetersForUser(List<Perimeter> perimeters,String login) {
        perimetersPerUser.put(login,perimeters);
    }

    public void clearPerimetersPerUser() {
        perimetersPerUser.clear();
    }

    @Override
    public OperationResult<List<Perimeter>> fetchUserPerimeters(String login) {
        return  new OperationResult<>(perimetersPerUser.get(login), true, null, null);

    }
    
}
