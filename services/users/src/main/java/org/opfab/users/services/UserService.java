/* Copyright (c) 2021, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
package org.opfab.users.services;

import org.opfab.users.model.GroupData;
import org.opfab.users.model.PerimeterData;
import org.opfab.users.model.User;

import java.util.List;

public interface UserService {
    User createUser(User user) ;
    List<GroupData> retrieveGroups(List<String> groupIds);
    List<PerimeterData> retrievePerimeters(List<String> perimeterIds);
    void publishUpdatedUserMessage(String userLogin);
}
