/* Copyright (c) 2021-2022, RTE (http://www.rte-france.com)
 * See AUTHORS.txt
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 * SPDX-License-Identifier: MPL-2.0
 * This file is part of the OperatorFabric project.
 */
package org.opfab.users.services;

import org.opfab.springtools.error.model.ApiErrorException;
import org.opfab.users.model.*;

import java.util.List;
import java.util.Set;

public interface UserService {
    User createUser(User user) ;
    UserData retrieveUser(String login);
    List<GroupData> retrieveGroups(List<String> groupIds);
    List<PerimeterData> retrievePerimeters(List<String> perimeterIds);
    Set<Perimeter> findPerimetersAttachedToGroups(List<String> groups);
    boolean checkFilteringNotificationIsAllowedForAllProcessesStates(String login, UserSettings userSettings);
    void publishUpdatedUserMessage(String userLogin);
    void publishUpdatedConfigMessage();
    void checkFormatOfIdField(String id) throws ApiErrorException;
    void checkFormatOfLoginField(String login) throws ApiErrorException;
}
